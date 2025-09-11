// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import jwt from 'jsonwebtoken';


interface DecodedUserToken {
  organization: string[]; 
}

const KEYCLOAK_USERS_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`;


export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  // Get search parameters from URL
  const { searchParams } = new URL(req.url);
  const searchTerm = searchParams.get('search') || '';
  const searchField = searchParams.get('field') || 'username'; // Default to username search

  try {
    let data: any[] = [];

    if (searchTerm) {
      // For comprehensive search, we need to search multiple fields
      // Keycloak doesn't support OR queries, so we'll search each field separately
      const searchFields = searchField === 'all' 
        ? ['username', 'email', 'firstName', 'lastName']
        : [searchField];

      const searchPromises = searchFields.map(field => {
        const fieldUrl = `${KEYCLOAK_USERS_URL}?${field}=${encodeURIComponent(searchTerm)}`;
        
        return axios.get(fieldUrl, {
          headers: { Authorization: authHeader },
        }).then(response => response.data).catch(error => {
          console.warn(`Search failed for ${field}:`, error.message);
          return []; // Return empty array if search fails
        });
      });

      // Wait for all searches to complete
      const searchResults = await Promise.all(searchPromises);
      
      // Combine and deduplicate results
      const allUsers = searchResults.flat();
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );
      
      data = uniqueUsers;
    } else {
      // No search term, get all users
      const response = await axios.get(KEYCLOAK_USERS_URL, {
        headers: { Authorization: authHeader },
      });
      data = response.data;
    }
    const clearUserData = data.map((user: any) => {
      const { id, username, email, firstName, lastName, attributes } = user;
      return {
        id,
        username,
        email,
        firstName,
        lastName,
        organization: Array.isArray(attributes?.organization) ? attributes.organization[0] : (attributes?.organization || ''),
        groups: Array.isArray(attributes?.groups) ? attributes.groups[0] : (attributes?.groups || ''),
      };
    })
    return NextResponse.json(clearUserData);
  } catch (err: any) {
    console.error("Error fetching users:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data || "Failed to fetch users" },
      { status: err.response?.status || 500 }
    );
  }
}
