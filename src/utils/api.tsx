// ✅ api.ts — poora updated file
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

// ✅ 401 pe refresh token try karo, fail ho toh logout
let isRefreshing = false;

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Infinite loop rokne ke liye
      if (isRefreshing) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh_token = localStorage.getItem("refresh_token");

        if (!refresh_token) {
          throw new Error("No refresh token");
        }

        // Naya access token lo
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          { refresh_token }
        );

        const newAccessToken = res.data.data.access_token;
        const newRefreshToken = res.data.data.refresh_token;

        // Naye tokens save karo
        localStorage.setItem("token", newAccessToken);
        localStorage.setItem("refresh_token", newRefreshToken);

        // Original request dobara karo naye token ke saath
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        isRefreshing = false;
        return API(originalRequest);

      } catch (refreshError) {
        // Refresh bhi fail — logout karo
        isRefreshing = false;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const loginUser = (data: LoginData) => API.post("/api/auth/login", data);
export const registerUser = (data: RegisterData) => API.post("/api/auth/register", data);
export const forgotPassword = (data: { email: string }) => API.post("/api/auth/forgot-password", data);
export const resetPassword = (data: { email: string; otp: string; newPassword: string }) => API.post("/api/auth/reset-password", data);
export const getMe = () => API.get("/api/auth/me");

// Admin APIs
export const adminGetAllUsers = () => API.get("/api/admin/users");
export const adminGetUserById = (id: string) => API.get(`/api/admin/users/${id}`);
export const adminUpdateUser = (id: string, data: UpdateUserData) => API.patch(`/api/admin/users/${id}`, data);
export const adminDeleteUser = (id: string) => API.delete(`/api/admin/users/${id}`);
export const adminDeleteAllUsers = () => API.delete("/api/admin/users");
export const adminCreateUser = (data: any) => API.post("/api/admin/users", data);
export const adminAssignRole = (id: string, role: string) => API.patch(`/api/admin/users/${id}/role`, { role });
export const adminUpdateUserPassword = (id: string, password: string) => API.patch(`/api/admin/users/${id}`, { newPassword: password });

// User Profile APIs
export const getProfile = () => API.get("/api/users/profile");
export const updateProfile = (data: { name: string }) => API.patch("/api/users/profile", data);
export const changePassword = (data: { oldPassword: string; newPassword: string }) => API.patch("/api/users/change-password", data);
export const deleteMyAccount = () => API.delete("/api/users/delete-account");

// Lead APIs
export const adminGetAllLeads = (params?: any) => API.get("/api/v1/leads", { params });
export const adminCreateLead = (data: any) => API.post("/api/v1/leads", data);
export const adminUpdateLead = (id: string, data: any) => API.put(`/api/v1/leads/${id}`, data);
export const adminDeleteLead = (id: string) => API.delete(`/api/v1/leads/${id}`);
export const adminAssignLead = (id: string, data: any) => API.post(`/api/v1/leads/${id}/assign`, data);
export const adminConvertLead = (id: string) => API.post(`/api/v1/leads/${id}/convert`);
export const adminMarkLost = (id: string, data: any) => API.post(`/api/v1/leads/${id}/mark-lost`, data);
export const adminGetActivities = (id: string) => API.get(`/api/v1/leads/${id}/activities`);
export const adminAddActivity = (id: string, data: any) => API.post(`/api/v1/leads/${id}/activities`, data);

export default API;