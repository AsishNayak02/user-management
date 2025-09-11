import { NextResponse } from "next/server";
import axios from "axios";

const KEYCLOAK_ADMIN_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}`;

// Get all realm roles
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('search');

    // Get realm roles
    const realmRolesResponse = await axios.get(`${KEYCLOAK_ADMIN_URL}/roles`, {
      headers: { Authorization: authHeader },
    });

    // Get all clients to fetch client roles
    const clientsResponse = await axios.get(`${KEYCLOAK_ADMIN_URL}/clients`, {
      headers: { Authorization: authHeader },
    });

    const clients = clientsResponse.data;
    
    // Get client roles for each client
    const clientRolesPromises = clients.map(async (client: any) => {
      try {
        const clientRolesResponse = await axios.get(
          `${KEYCLOAK_ADMIN_URL}/clients/${client.id}/roles`,
          { headers: { Authorization: authHeader } }
        );
        return clientRolesResponse.data.map((role: any) => ({
          ...role,
          clientId: client.id,
          clientName: client.clientId,
        }));
      } catch (error) {
        console.warn(`Failed to fetch roles for client ${client.clientId}:`, error);
        return [];
      }
    });

    const allClientRoles = (await Promise.all(clientRolesPromises)).flat();

    // Transform realm roles to include assigned client roles
    let realmRolesWithAssignments = await Promise.all(
      realmRolesResponse.data.map(async (realmRole: any) => {
        try {
          // Get composite roles (client roles assigned to this realm role)
          const compositeResponse = await axios.get(
            `${KEYCLOAK_ADMIN_URL}/roles/${realmRole.name}/composites`,
            { headers: { Authorization: authHeader } }
          );
          
          const assignedClientRoles = compositeResponse.data
            .filter((role: any) => role.clientRole)
            .map((role: any) => {
              const clientRole = allClientRoles.find(cr => cr.id === role.id);
              return clientRole || role;
            });

          return {
            id: realmRole.id,
            name: realmRole.name,
            description: realmRole.description || '',
            type: 'realm' as const,
            assignedClientRoles,
            composite: realmRole.composite,
            attributes: realmRole.attributes,
          };
        } catch (error) {
          console.warn(`Failed to fetch composites for role ${realmRole.name}:`, error);
          return {
            id: realmRole.id,
            name: realmRole.name,
            description: realmRole.description || '',
            type: 'realm' as const,
            assignedClientRoles: [],
            composite: realmRole.composite,
            attributes: realmRole.attributes,
          };
        }
      })
    );

    // Apply search filter if search term is provided
    if (searchTerm) {
      realmRolesWithAssignments = realmRolesWithAssignments.filter((role: any) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return NextResponse.json(realmRolesWithAssignments);
  } catch (err: any) {
    console.error("Error fetching roles:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data || "Failed to fetch roles" },
      { status: err.response?.status || 500 }
    );
  }
}

// Create a new realm role
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  try {
    const { name, description, type, clientId, clientRoleIds } = await req.json();

    if (type === 'realm') {
      // Create realm role
      await axios.post(
        `${KEYCLOAK_ADMIN_URL}/roles`,
        {
          name,
          description: description || '',
          composite: false,
          clientRole: false,
        },
        { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
      );

      // Assign client roles if provided
      if (clientRoleIds && clientRoleIds.length > 0) {
        try {
          // Get client role details for each client role ID
          const clientsResponse = await axios.get(`${KEYCLOAK_ADMIN_URL}/clients`, {
            headers: { Authorization: authHeader },
          });

          const clientRoles = [];
          for (const clientRoleId of clientRoleIds) {
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
                continue;
              }
            }
          }

          if (clientRoles.length > 0) {
            // Keycloak expects an array of role objects with id and name
            const compositeRoles = clientRoles.map(role => ({
              id: role.id,
              name: role.name
            }));
            
            await axios.post(
              `${KEYCLOAK_ADMIN_URL}/roles/${name}/composites`,
              compositeRoles,
              { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
            );
          }
        } catch (error) {
          console.warn('Failed to assign client roles during creation:', error);
        }
      }
    } else if (type === 'client' && clientId) {
      // Create client role
      await axios.post(
        `${KEYCLOAK_ADMIN_URL}/clients/${clientId}/roles`,
        {
          name,
          description: description || '',
          composite: false,
          clientRole: true,
        },
        { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid role type or missing client ID" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Role created successfully' });
  } catch (err: any) {
    console.error("Error creating role:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data || "Failed to create role" },
      { status: err.response?.status || 500 }
    );
  }
}
