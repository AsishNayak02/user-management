import { NextResponse } from "next/server";
import axios from "axios";

const KEYCLOAK_ADMIN_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}`;

// Get all clients
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  try {
    const response = await axios.get(`${KEYCLOAK_ADMIN_URL}/clients`, {
      headers: { Authorization: authHeader },
    });

    // Filter out internal clients and format the response
    const clients = response.data
      .filter((client: any) => !client.clientId.startsWith('account-') && !client.clientId.startsWith('broker-'))
      .map((client: any) => ({
        id: client.id,
        clientId: client.clientId,
        name: client.name || client.clientId,
        description: client.description || '',
        enabled: client.enabled !== false,
        protocol: client.protocol,
        publicClient: client.publicClient,
        serviceAccountsEnabled: client.serviceAccountsEnabled,
      }));

    return NextResponse.json(clients);
  } catch (err: any) {
    console.error("Error fetching clients:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data || "Failed to fetch clients" },
      { status: err.response?.status || 500 }
    );
  }
}
