import { NextResponse } from "next/server";
import axios from "axios";

const KEYCLOAK_GROUPS_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/groups`;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  try {
    const { data } = await axios.get(`${KEYCLOAK_GROUPS_URL}`, {
      headers: { Authorization: authHeader },
    });
    
    const groups = data.map((group: any) => ({
      id: group.id,
      name: group.name,
      path: group.path,
    }));

    return NextResponse.json(groups);
  } catch (err: any) {
    console.error("Error fetching groups:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data || "Failed to fetch groups" },
      { status: err.response?.status || 500 }
    );
  }
}
