import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const PATIENTS_API = `${API_BASE}/api/patients`;
export const AUTH_API     = `${API_BASE}/api/auth`;
export const DOCTOR_API   = `${API_BASE}/api`;

// Global axios interceptor — attaches JWT to every request automatically
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor — redirect to login on 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("doctorEmail");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API_BASE;
