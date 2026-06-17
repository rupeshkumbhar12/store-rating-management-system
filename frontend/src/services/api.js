import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  changePassword: (data) => API.put("/auth/change-password", data),
};

export const adminAPI = {
  getDashboard: () => API.get("/admin/dashboard"),
  getUsers: (params) => API.get("/admin/users", { params }),
  getUserById: (id) => API.get(`/admin/users/${id}`),
  addUser: (data) => API.post("/admin/users", data),
  getStores: (params) => API.get("/admin/stores", { params }),
  addStore: (data) => API.post("/admin/stores", data),
};

export const storeAPI = {
  getStores: (params) => API.get("/stores", { params }),
};

export const ratingAPI = {
  submitRating: (data) => API.post("/ratings", data),
  updateRating: (id, data) => API.put(`/ratings/${id}`, data),
};

export const ownerAPI = {
  getAverageRating: () => API.get("/owner/average-rating"),
  getRatedUsers: () => API.get("/owner/ratings"),
};

export default API;
