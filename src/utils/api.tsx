// ✅ api.ts — poora updated file
import axios from "axios";
import { LoginData, RegisterData, UpdateUserData } from "@/types/apiType";
 
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // withCredentials: true, // Set to true to include cookies in requests
});
 
// Token auto-attach
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 
// Handle 401 response and refresh token
let isRefreshing = false;
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
 
    if (error.response?.status === 401 && !originalRequest._retry) {
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
        if (!refresh_token) throw new Error("No refresh token");
 
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          { refresh_token }
        );
 
        const newAccessToken = res.data.data.access_token;
        const newRefreshToken = res.data.data.refresh_token;
 
        localStorage.setItem("token", newAccessToken);
        localStorage.setItem("refresh_token", newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        isRefreshing = false;
        return API(originalRequest);
      } catch (refreshError) {
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
 
// Define your API functions here, ensuring proper types
export const loginUser = (data: LoginData) => API.post("/api/auth/login", data);
export const registerUser = (data: RegisterData) => API.post("/api/auth/register", data);
export const forgotPassword = (data: { email: string }) => API.post("/api/auth/forgot-password", data);
export const resetPassword = (data: { email: string; otp: string; newPassword: string }) => API.post("/api/auth/reset-password", data);
export const getMe = () => API.get("/api/auth/me");

// Admin APIs
export const adminGetAllUsers = (params?: any) => API.get("/api/admin/users", { params });
export const adminGetUserById = (id: string) => API.get(`/api/admin/users/${id}`);
export const adminUpdateUser = (id: string, data: UpdateUserData) => API.patch(`/api/admin/users/${id}`, data);
export const adminDeleteUser = (id: string) => API.delete(`/api/admin/users/${id}`);
export const adminDeleteAllUsers = () => API.delete("/api/admin/users");
export const adminCreateUser = (data: any) => API.post("/api/admin/users", data);
export const adminAssignRole = (id: string, role: string) => API.patch(`/api/admin/users/${id}/role`, { role });
export const adminUpdateUserPassword = (id: string, password: string) => API.patch(`/api/admin/users/${id}`, { newPassword: password });

// User Profile APIs
export const getAllUsersForRole = () => API.get("/api/users");
export const getProfile = () => API.get("/api/users/profile");
export const updateProfile = (data: { name: string }) => API.patch("/api/users/profile", data);
export const changePassword = (data: { oldPassword: string; newPassword: string }) => API.patch("/api/users/change-password", data);
export const deleteMyAccount = () => API.delete("/api/users/delete-account");

// Lead APIs
export const getAllLeads = (params?: any) => API.get("/api/v1/leads", { params });
export const createLead = (data: any) => API.post("/api/v1/leads", data);
export const updateLead = (id: string, data: any) => API.put(`/api/v1/leads/${id}`, data);
export const deleteLead = (id: string) => API.delete(`/api/v1/leads/${id}`);
export const assignLead = (id: string, data: any) => API.post(`/api/v1/leads/${id}/assign`, data);
export const convertLead = (id: string, data: any) => API.post(`/api/v1/leads/${id}/convert`, data);
export const markLostLead = (id: string, data: any) => API.post(`/api/v1/leads/${id}/mark-lost`, data);
export const getActivitiesLead = (id: string) => API.get(`/api/v1/leads/${id}/activities`);
export const addActivityLead = (id: string, data: any) => API.post(`/api/v1/leads/${id}/activities`, data);
export const getLeadsStats = (userId?: string) => API.get("/api/v1/leads/stats", {
  params: userId ? { userId } : {},
});

// Program APIs
export const adminGetPrograms = (params?: any) => API.get("/api/v1/programs", { params });
export const adminCreateProgram = (data: any) => API.post("/api/v1/programs", data);
export const adminUpdateProgram = (id: string, data: any) => API.put(`/api/v1/programs/${id}`, data);
export const adminDeleteProgram = (id: string) => API.delete(`/api/v1/programs/${id}`);
export const adminDuplicateProgram = (id: string) => API.post(`/api/v1/programs/${id}/duplicate`);
export const adminGetProgramById = (id: string) => API.get(`/api/v1/programs/${id}`);

// Course APIs
export const adminGetCourses = (programId: string) => API.get(`/api/v1/programs/${programId}/courses`);
export const adminCreateCourse = (programId: string, data: any) => API.post(`/api/v1/programs/${programId}/courses`, data);
export const adminUpdateCourse = (id: string, data: any) => API.put(`/api/v1/programs/courses/${id}`, data);
export const adminDeleteCourse = (id: string) => API.delete(`/api/v1/programs/courses/${id}`);
export const adminGetCourseById = (id: string) => API.get(`/api/v1/programs/courses/${id}`);

// Module APIs
export const adminGetModules = (courseId: string) => API.get(`/api/v1/programs/courses/${courseId}/modules`);
export const adminCreateModule = (courseId: string, data: any) => API.post(`/api/v1/programs/courses/${courseId}/modules`, data);
export const adminUpdateModule = (id: string, data: any) => API.put(`/api/v1/programs/modules/${id}`, data);
export const adminDeleteModule = (id: string) => API.delete(`/api/v1/programs/modules/${id}`);
export const adminGetModuleById = (id: string) => API.get(`/api/v1/programs/modules/${id}`);

// Lesson APIs
export const adminGetLessons = (moduleId: string) => API.get(`/api/v1/programs/modules/${moduleId}/lessons`);
export const adminCreateLesson = (moduleId: string, data: any) => API.post(`/api/v1/programs/modules/${moduleId}/lessons`, data);
export const adminUpdateLesson = (id: string, data: any) => API.put(`/api/v1/programs/lessons/${id}`, data);
export const adminDeleteLesson = (id: string) => API.delete(`/api/v1/programs/lessons/${id}`);

// Batch APIs
export const adminGetBatches = (params?: any) => API.get("/api/v1/programs/batches", { params });
export const adminCreateBatch = (data: any) => API.post("/api/v1/programs/batches", data);
export const adminUpdateBatch = (id: string, data: any) => API.put(`/api/v1/programs/batches/${id}`, data);
export const adminDeleteBatch = (id: string) => API.delete(`/api/v1/programs/batches/${id}`);

//--------------------------------- website blog ------------------------
export const adminGetBlogs = (params?: any) => API.get("/api/v1/blogs", { params });
export const adminCreateBlog = (data: any) => API.post("/api/v1/blogs", data);
// export const adminUpdateBlog = (id: string, data: any) => API.put(`/api/v1/blogs/${id}`, data);
export const adminUpdateBlog = (slugOrId: string, data: any) => 
  API.put(`/api/v1/blogs/${slugOrId}`, data);
export const adminDeleteBlog = (slug: string) => API.delete(`/api/v1/blogs/${slug}`);
export const adminPublishBlog = (slug: string) => API.post(`/api/v1/blogs/${slug}/publish`);
export const adminGetBlogBySlug = (slug: string) =>
  API.get(`/api/v1/blogs/admin/${slug}`);

// ─── Finance — Invoices ───────────────────────────────────────
export const getAllInvoices = (params?: any) => API.get("/api/v1/finance/invoices", { params });
export const getInvoiceById = (id: string) => API.get(`/api/v1/finance/invoices/${id}`);
export const createInvoice = (data: any) => API.post("/api/v1/finance/invoices", data);
export const updateInvoice = (id: string, data: any) => API.patch(`/api/v1/finance/invoices/${id}`, data);
export const markInvoicePaid = (id: string) => API.patch(`/api/v1/finance/invoices/${id}/mark-paid`);
export const getPendingInvoices = () => API.get("/api/v1/finance/invoices/pending");
export const getOverdueInvoices = () => API.get("/api/v1/finance/invoices/overdue");
export const getUpcomingDues = (days?: number) => API.get("/api/v1/finance/invoices/upcoming-dues", { params: { days: days || 30 } });
 
// ─── Finance — Payments ──────────────────────────────────────
export const getAllPayments = (params?: any) => API.get("/api/v1/finance/payments", { params });
export const getPaymentById = (id: string) => API.get(`/api/v1/finance/payments/${id}`);
export const addPayment = (data: any) => API.post("/api/v1/finance/payments", data);
export const updatePayment = (id: string, data: any) => API.patch(`/api/v1/finance/payments/${id}`, data);
export const approvePayment = (id: string) => API.patch(`/api/v1/finance/payments/${id}/approve`);
export const rejectPayment = (id: string, data: { reason: string }) => API.patch(`/api/v1/finance/payments/${id}/reject`, data);
 
// ─── Finance — Reports ───────────────────────────────────────
export const getRevenueReport = () => API.get("/api/v1/finance/reports/revenue");
export const getMonthlyCollections = (year?: number) => API.get("/api/v1/finance/reports/monthly", { params: { year: year || new Date().getFullYear() } });
export const getPendingReport = () => API.get("/api/v1/finance/reports/pending");
 
// ─── Finance — Extension ─────────────────────────────────────
export const addFinanceExtension = (data: { enrollmentId: string; days: number; reason: string }) => API.post("/api/v1/finance/extension", data);
 
// ─── Enrollments ─────────────────────────────────────────────
// export const getAllEnrollments = (params?: any) => API.get("/api/v1/enrollments", { params });
// export const getMyEnrollments = () => API.get("/api/v1/enrollments/my");
// export const getEnrollmentById = (id: string) => API.get(`/api/v1/enrollments/${id}`);
// export const createEnrollment = (data: any) => API.post("/api/v1/enrollments", data);
// export const updateEnrollment = (id: string, data: any) => API.put(`/api/v1/enrollments/${id}`, data);
// export const deleteEnrollment = (id: string) => API.delete(`/api/v1/enrollments/${id}`);
// export const graduateEnrollment = (id: string) => API.patch(`/api/v1/enrollments/${id}/graduate`);
// export const suspendEnrollment = (id: string) => API.patch(`/api/v1/enrollments/${id}/suspend`);
// export const reactivateEnrollment = (id: string) => API.patch(`/api/v1/enrollments/${id}/reactivate`);
export const getAllEnrollments = (params?: any) => API.get("/api/v1/enrollments", { params });
export const getMyEnrollments = () => API.get("/api/v1/enrollments/my");
export const getEnrollmentById = (id: string) => API.get(`/api/v1/enrollments/${id}`);
export const createEnrollment = (data: any) => API.post("/api/v1/enrollments", data);
 
export const updateEnrollment = (id: string, data: any) => API.put(`/api/v1/enrollments/${id}`);         // PUT ✅
export const deleteEnrollment = (id: string) => API.delete(`/api/v1/enrollments/${id}`);
 
export const graduateEnrollment = (id: string) => API.post(`/api/v1/enrollments/${id}/graduate`);        // POST ✅
export const suspendEnrollment = (id: string) => API.post(`/api/v1/enrollments/${id}/suspend`);          // POST ✅
export const reactivateEnrollment = (id: string) => API.post(`/api/v1/enrollments/${id}/reactivate`);   // POST ✅

 
// ─── Access Control ───────────────────────────────────────────
export const grantAccess = (data: { enrollmentId: string; days: number }) => API.post("/api/v1/access/grant", data);
export const checkAccess = (enrollmentId: string) => API.get(`/api/v1/access/check/${enrollmentId}`);
 
// ─── Audit Logs ───────────────────────────────────────────────
export const getAllAuditLogs = (params?: any) => API.get("/api/v1/audit-logs", { params });
export const getAuditLogById = (id: string) => API.get(`/api/v1/audit-logs/${id}`);


export default API;