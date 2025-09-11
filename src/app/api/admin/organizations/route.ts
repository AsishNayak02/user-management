import { NextResponse } from "next/server";
import axios from "axios";

const KEYCLOAK_ORGS_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/organizations`;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  try {
    const { data } = await axios.get(`${KEYCLOAK_ORGS_URL}`, {
      headers: { Authorization: authHeader },
    });
    
    const organizations = data.map((org: any) => ({
      id: org.id,
      name: org.name,
      displayName: org.displayName || org.name,
    }));

    return NextResponse.json(organizations);
  } catch (err: any) {
    console.error("Error fetching organizations:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data || "Failed to fetch organizations" },
      { status: err.response?.status || 500 }
    );
  }
}
