import axios from "./index";

// Get all realm roles with their assigned client roles
export const getAllRoles = () => {
  return axios.get("/api/admin/roles");
};

// Search roles
export const searchRoles = (searchTerm: string) => {
  return axios.get(`/api/admin/roles?search=${encodeURIComponent(searchTerm)}`);
};

// Create a new role
export const createRole = (roleData: {
  name: string;
  description?: string;
  type: 'realm' | 'client';
  clientId?: string;
  clientRoleIds?: string[];
}) => {
  return axios.post("/api/admin/roles", roleData);
};

// Update a role
export const updateRole = (roleId: string, roleData: {
  name: string;
  description?: string;
  clientRoleIds?: string[];
}) => {
  return axios.put(`/api/admin/roles/${roleId}`, roleData);
};

// Delete a role
export const deleteRole = (roleId: string) => {
  return axios.delete(`/api/admin/roles/${roleId}`);
};

// Assign client roles to a realm role
export const assignClientRoles = (roleId: string, clientRoleIds: string[]) => {
  return axios.post(`/api/admin/roles/${roleId}/assign`, { clientRoleIds });
};

// Remove client role assignments from a realm role
export const removeClientRoles = (roleId: string, clientRoleIds: string[]) => {
  return axios.delete(`/api/admin/roles/${roleId}/assign`, { data: { clientRoleIds } });
};

// Get all clients (for client role assignment)
export const getAllClients = () => {
  return axios.get("/api/admin/clients");
};

// Get client roles for a specific client
export const getClientRoles = (clientId: string) => {
  return axios.get(`/api/admin/clients/${clientId}/roles`);
};
