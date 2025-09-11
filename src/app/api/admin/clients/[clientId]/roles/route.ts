import { NextResponse } from "next/server";
import axios from "axios";

const KEYCLOAK_ADMIN_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}`;

// Get client roles for a specific client
export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  try {
    const { clientId } = await params;
    
    const response = await axios.get(
      `${KEYCLOAK_ADMIN_URL}/clients/${clientId}/roles`,
      { headers: { Authorization: authHeader } }
    );

    // Format the response
    const roles = response.data.map((role: any) => ({
      id: role.id,
      name: role.name,
      description: role.description || '',
      composite: role.composite,
      clientRole: role.clientRole,
      containerId: role.containerId,
      attributes: role.attributes,
    }));

    return NextResponse.json(roles);
  } catch (err: any) {
    console.error("Error fetching client roles:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data || "Failed to fetch client roles" },
      { status: err.response?.status || 500 }
    );
  }
}
