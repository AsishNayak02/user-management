import axios from "./index"
export const getAllUsers = () => {
  return axios.get("/api/admin/users");
};