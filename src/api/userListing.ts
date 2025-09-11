import axios from "./index"
export const getAllUsers = () => {
  return axios.get("/api/admin/users");
};

export const getAllOrganizations = () => {
  return axios.get("/api/admin/organizations");
};

export const getAllGroups = () => {
  return axios.get("/api/admin/groups");
};

export const checkUserExists = (username?: string, email?: string) => {
  return axios.post("/api/admin/check-user", { username, email });
};

export const searchUsers = (searchTerm: string, field: string = 'all') => {
  return axios.get(`/api/admin/users?search=${encodeURIComponent(searchTerm)}&field=${field}`);
};

export const updateUser = (userId: string, userData: any) => {
  return axios.put(`/api/admin/users/${userId}`, userData);
};

export const deleteUser = (userId: string) => {
  return axios.delete(`/api/admin/users/${userId}`);
};