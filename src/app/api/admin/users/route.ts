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
  const accessToken = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.decode(accessToken) as DecodedUserToken | null;
    if (!decodedToken) {
        throw new Error('Invalid token');
    }
    const orgArray = decodedToken.organization;
    const userOrganization = (orgArray && orgArray.length > 0) ? orgArray[0] : null;

    if (!userOrganization) {
      return NextResponse.json({ message: 'User is not part of an organization.' }, { status: 403 });
    }
    const { data } = await axios.get(`${KEYCLOAK_USERS_URL}?q=organization:${userOrganization}`, {
      headers: { Authorization: authHeader },
    });
    const clearUserData = data.map((user: any) => {
      const { id, username, email, firstName, lastName, attributes } = user;
      return {
        id,
        username,
        email,
        firstName,
        lastName,
        organization: attributes?.organization || [],
        groups: attributes?.groups || [],
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
