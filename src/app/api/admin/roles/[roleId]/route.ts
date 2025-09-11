import { NextResponse } from "next/server";
import axios from "axios";

const KEYCLOAK_ADMIN_URL = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}`;

// Update a role
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  try {
    const { name, description, clientRoleIds } = await req.json();
    const { roleId } = await params;

    // Get all roles to find the role by ID
    const rolesResponse = await axios.get(
      `${KEYCLOAK_ADMIN_URL}/roles`,
      { headers: { Authorization: authHeader } }
    );
    
    const role = rolesResponse.data.find((r: any) => r.id === roleId);
    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    // Update the role
    await axios.put(
      `${KEYCLOAK_ADMIN_URL}/roles/${role.name}`,
      {
        name,
        description: description || '',
        composite: role.composite,
        clientRole: role.clientRole,
      },
      { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
    );

    // Handle client role assignments if provided
    if (clientRoleIds && clientRoleIds.length >= 0) {
      try {
        // Get current assignments
        const currentAssignments = await axios.get(
          `${KEYCLOAK_ADMIN_URL}/roles/${name}/composites`,
          { headers: { Authorization: authHeader } }
        );
        
        const currentClientRoles = currentAssignments.data
          .filter((r: any) => r.clientRole)
          .map((r: any) => r.id);

        // Find roles to add and remove
        const rolesToAdd = clientRoleIds.filter((id: string) => !currentClientRoles.includes(id));
        const rolesToRemove = currentClientRoles.filter((id: string) => !clientRoleIds.includes(id));

        // Get client role details for additions
        if (rolesToAdd.length > 0) {
          const clientsResponse = await axios.get(`${KEYCLOAK_ADMIN_URL}/clients`, {
            headers: { Authorization: authHeader },
          });

          const clientRoles = [];
          for (const clientRoleId of rolesToAdd) {
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
        }

        // Remove old assignments
        if (rolesToRemove.length > 0) {
          const clientsResponse = await axios.get(`${KEYCLOAK_ADMIN_URL}/clients`, {
            headers: { Authorization: authHeader },
          });

          const clientRolesToRemove = [];
          for (const clientRoleId of rolesToRemove) {
            for (const client of clientsResponse.data) {
              try {
                const clientRolesResponse = await axios.get(
                  `${KEYCLOAK_ADMIN_URL}/clients/${client.id}/roles`,
                  { headers: { Authorization: authHeader } }
                );
                
                const clientRole = clientRolesResponse.data.find((role: any) => role.id === clientRoleId);
                if (clientRole) {
                  clientRolesToRemove.push({
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

          if (clientRolesToRemove.length > 0) {
            // Keycloak expects an array of role objects with id and name for deletion
            const compositeRolesToRemove = clientRolesToRemove.map(role => ({
              id: role.id,
              name: role.name
            }));
            
            await axios.delete(
              `${KEYCLOAK_ADMIN_URL}/roles/${name}/composites`,
              {
                headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
                data: compositeRolesToRemove
              }
            );
          }
        }
      } catch (error) {
        console.warn('Failed to update client role assignments:', error);
      }
    }

    return NextResponse.json({ message: 'Role updated successfully' });
  } catch (err: any) {
    console.error("Error updating role:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data || "Failed to update role" },
      { status: err.response?.status || 500 }
    );
  }
}

// Delete a role
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  try {
    const { roleId } = await params;

    // Get all roles to find the role by ID
    const rolesResponse = await axios.get(
      `${KEYCLOAK_ADMIN_URL}/roles`,
      { headers: { Authorization: authHeader } }
    );
    
    const role = rolesResponse.data.find((r: any) => r.id === roleId);
    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    // Delete the role using the role name
    await axios.delete(
      `${KEYCLOAK_ADMIN_URL}/roles/${role.name}`,
      { headers: { Authorization: authHeader } }
    );

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (err: any) {
    console.error("Error deleting role:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data || "Failed to delete role" },
      { status: err.response?.status || 500 }
    );
  }
}
