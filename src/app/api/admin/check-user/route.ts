import { NextResponse } from "next/server";
import axios from "axios";

const KEYCLOAK_USERS_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`;

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  try {
    const { username, email } = await req.json();
    
    if (!username && !email) {
      return NextResponse.json(
        { error: "Username or email is required" },
        { status: 400 }
      );
    }

    let existingUser = null;

    // Check by username if provided (exact match only)
    if (username && username.trim().length >= 3) {
      try {
        const { data: usernameData } = await axios.get(
          `${KEYCLOAK_USERS_URL}?username=${encodeURIComponent(username.trim())}`,
          { headers: { Authorization: authHeader } }
        );
        if (usernameData && usernameData.length > 0) {
          // Check for exact match (case-insensitive)
          const exactMatch = usernameData.find((user: any) => 
            user.username?.toLowerCase() === username.trim().toLowerCase()
          );
          if (exactMatch) {
            existingUser = exactMatch;
          }
        }
      } catch (error) {
        // Username not found, continue checking email
      }
    }

    // Check by email if provided and username not found (exact match only)
    if (email && !existingUser && email.includes('@') && email.includes('.')) {
      try {
        const { data: emailData } = await axios.get(
          `${KEYCLOAK_USERS_URL}?email=${encodeURIComponent(email.trim())}`,
          { headers: { Authorization: authHeader } }
        );
        if (emailData && emailData.length > 0) {
          // Check for exact match (case-insensitive)
          const exactMatch = emailData.find((user: any) => 
            user.email?.toLowerCase() === email.trim().toLowerCase()
          );
          if (exactMatch) {
            existingUser = exactMatch;
          }
        }
      } catch (error) {
        // Email not found
      }
    }

    return NextResponse.json({
      exists: !!existingUser,
      user: existingUser ? {
        username: existingUser.username,
        email: existingUser.email
      } : null
    });

  } catch (err: any) {
    console.error("Error checking user existence:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data || "Failed to check user existence" },
      { status: err.response?.status || 500 }
    );
  }
}
