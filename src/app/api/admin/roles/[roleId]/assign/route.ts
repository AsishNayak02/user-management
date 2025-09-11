import { NextResponse } from "next/server";
import axios from "axios";

const KEYCLOAK_ADMIN_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}`;

// Assign client roles to a realm role
export async function POST(
  req: Request,
  { params }: { params: { roleId: string } }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  try {
    const { clientRoleIds } = await req.json();
    const { roleId } = params;

    if (!clientRoleIds || !Array.isArray(clientRoleIds) || clientRoleIds.length === 0) {
      return NextResponse.json(
        { error: "Client role IDs are required" },
        { status: 400 }
      );
    }

    // Get the realm role name first
    const realmRoleResponse = await axios.get(
      `${KEYCLOAK_ADMIN_URL}/roles/${roleId}`,
      { headers: { Authorization: authHeader } }
    );
    
    const realmRoleName = realmRoleResponse.data.name;

    // Get client role details for each client role ID
    const clientRoles = [];
    for (const clientRoleId of clientRoleIds) {
      try {
        // Find which client this role belongs to
        const clientsResponse = await axios.get(`${KEYCLOAK_ADMIN_URL}/clients`, {
          headers: { Authorization: authHeader },
        });

        for (const client of clientsResponse.data) {
          try {
            const clientRolesResponse = await axios.get(
              `${KEYCLOAK_ADMIN_URL}/clients/${client.id}/roles`,
              { headers: { Authorization: authHeader } }
            );
            
            const clientRole = clientRolesResponse.data.find((role: any) => role.id === clientRoleId);
            if (clientRole) {
              clientRoles.push({
                ...clientRole,
                clientId: client.id,
                clientName: client.clientId,
              });
              break;
            }
          } catch (error) {
            // Continue to next client
            continue;
          }
        }
      } catch (error) {
        console.warn(`Failed to find client role ${clientRoleId}:`, error);
      }
    }

    if (clientRoles.length === 0) {
      return NextResponse.json(
        { error: "No valid client roles found" },
        { status: 400 }
      );
    }

    // Assign client roles to the realm role
    await axios.post(
      `${KEYCLOAK_ADMIN_URL}/roles/${realmRoleName}/composites`,
      clientRoles,
      { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
    );

    return NextResponse.json({ 
      message: 'Client roles assigned successfully',
      assignedRoles: clientRoles.map(role => ({
        id: role.id,
        name: role.name,
        clientName: role.clientName,
      }))
    });
  } catch (err: any) {
    console.error("Error assigning client roles:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data || "Failed to assign client roles" },
      { status: err.response?.status || 500 }
    );
  }
}

// Remove client role assignments from a realm role
export async function DELETE(
  req: Request,
  { params }: { params: { roleId: string } }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  try {
    const { clientRoleIds } = await req.json();
    const { roleId } = params;

    if (!clientRoleIds || !Array.isArray(clientRoleIds) || clientRoleIds.length === 0) {
      return NextResponse.json(
        { error: "Client role IDs are required" },
        { status: 400 }
      );
    }

    // Get the realm role name first
    const realmRoleResponse = await axios.get(
      `${KEYCLOAK_ADMIN_URL}/roles/${roleId}`,
      { headers: { Authorization: authHeader } }
    );
    
    const realmRoleName = realmRoleResponse.data.name;

    // Get client role details for each client role ID
    const clientRoles = [];
    for (const clientRoleId of clientRoleIds) {
      try {
        // Find which client this role belongs to
        const clientsResponse = await axios.get(`${KEYCLOAK_ADMIN_URL}/clients`, {
          headers: { Authorization: authHeader },
        });

        for (const client of clientsResponse.data) {
          try {
            const clientRolesResponse = await axios.get(
              `${KEYCLOAK_ADMIN_URL}/clients/${client.id}/roles`,
              { headers: { Authorization: authHeader } }
            );
            
            const clientRole = clientRolesResponse.data.find((role: any) => role.id === clientRoleId);
            if (clientRole) {
              clientRoles.push({
                ...clientRole,
                clientId: client.id,
                clientName: client.clientId,
              });
              break;
            }
          } catch (error) {
            // Continue to next client
            continue;
          }
        }
      } catch (error) {
        console.warn(`Failed to find client role ${clientRoleId}:`, error);
      }
    }

    if (clientRoles.length === 0) {
      return NextResponse.json(
        { error: "No valid client roles found" },
        { status: 400 }
      );
    }

    // Remove client roles from the realm role
    await axios.delete(
      `${KEYCLOAK_ADMIN_URL}/roles/${realmRoleName}/composites`,
      {
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        data: clientRoles
      }
    );

    return NextResponse.json({ 
      message: 'Client roles removed successfully',
      removedRoles: clientRoles.map(role => ({
        id: role.id,
        name: role.name,
        clientName: role.clientName,
      }))
    });
  } catch (err: any) {
    console.error("Error removing client roles:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data || "Failed to remove client roles" },
      { status: err.response?.status || 500 }
    );
  }
}
