import axios from "axios";

const api = axios.create({
  baseURL: "https://cufe.up.railway.app/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (email: string, password: string) =>
  api.post("/auth/login", { email, password });
export const register = (
  fullname: string,
  username: string,
  email: string,
  password: string,
) => api.post("/auth/register", { fullname, username, email, password });

// Feedback
export const getFeedback = () => api.get("/feedback");
export const getFeedbackById = (id: string) => api.get(`/feedback/${id}`);
export const createFeedback = (data: any) => api.post("/feedback", data);
export const updateFeedback = (id: string, data: any) =>
  api.patch(`/feedback/${id}`, data);
export const deleteFeedback = (id: string) => api.delete(`/feedback/${id}`);

export const changeFeedbackStatus = (
  id: string,
  data: { status: string; reason?: string },
) => api.patch(`/feedback/${id}/status`, data);

export const getFeedbackHistory = (id: string) =>
  api.get(`/feedback/${id}/history`);

// Customers
export const getCustomers = () => api.get("/customers");
export const createCustomer = (data: any) => api.post("/customers", data);
export const searchCustomers = (q: string) =>
  api.get(`/customers/search?q=${q}`);

// Dashboard
export const getDashboard = () => api.get("/dashboard/");
export const getRecentActivity = () => api.get("/dashboard/recent-activity");

// Comments (internal notes)
export const getComments   = (feedbackId: string) =>
  api.get(`/feedback/${feedbackId}/comments`);
export const postComment   = (feedbackId: string, comment: string) =>
  api.post(`/feedback/${feedbackId}/comments`, { comment });
export const editComment   = (id: string, comment: string) =>
  api.patch(`/comments/${id}`, { comment });
export const deleteComment = (id: string) =>
  api.delete(`/comments/${id}`);

export const ping = () => api.get("/healthcheck").catch(() => {});

export default api;