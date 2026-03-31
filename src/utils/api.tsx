import axios from "axios";
import { LoginData, RegisterData, UpdateUserData } from "@/types/apiType";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const loginUser = (data: LoginData) => API.post("/api/auth/login", data);
export const registerUser = (data: RegisterData) => API.post("/api/auth/register", data);
export const getAllUsers = () => API.get("/api/users");
export const getUserById = (id: string) => API.get(`/api/users/${id}`);
export const updateUser = (id: string, data: UpdateUserData) => API.put(`/api/users/${id}`, data);
export const deleteUser = (id: string) => API.delete(`/api/users/${id}`);

export default API;