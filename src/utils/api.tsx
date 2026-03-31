import axios from "axios";
import { LoginData, RegisterData, UpdateUserData } from "@/types/apiType";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,
});

// Token auto attach
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 pe auto logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ✅ Auth APIs
export const loginUser = (data: LoginData) => API.post("/api/auth/login", data);
export const registerUser = (data: RegisterData) => API.post("/api/auth/register", data);

// ✅ Admin APIs
export const adminGetAllUsers = () => API.get("/api/admin/users");
export const adminGetUserById = (id: string) => API.get(`/api/admin/users/${id}`);
export const adminUpdateUser = (id: string, data: UpdateUserData) => API.patch(`/api/admin/users/${id}`, data);
export const adminDeleteUser = (id: string) => API.delete(`/api/admin/users/${id}`);
export const adminDeleteAllUsers = () => API.delete("/api/admin/users");

// ✅ User APIs
export const getAllUsers = () => API.get("/api/users");
export const getUserById = (id: string) => API.get(`/api/users/${id}`);
export const updateUser = (id: string, data: UpdateUserData) => API.put(`/api/users/${id}`, data);
export const deleteUser = (id: string) => API.delete(`/api/users/${id}`);

export default API;