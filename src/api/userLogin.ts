import axios from "./index";
import Cookies from "js-cookie";

export const userLogin = (email: string, password: string) => {
  return axios.post("/api/login", { username:email, password });
};
export const refreshAccessToken = () => {
  return axios.post("/api/auth/refresh", { refreshToken: Cookies.get("RefreshToken") });
};
export const userLogout = () => {
    // const refreshToken = localStorage.getItem("RefreshToken");
    const refreshToken = Cookies.get("RefreshToken");
  return axios.post("/api/logout", { refreshToken });
};
