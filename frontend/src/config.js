const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const PATIENTS_API = `${API_BASE}/api/patients`;
export const AUTH_API     = `${API_BASE}/api/auth`;
export const DOCTOR_API   = `${API_BASE}/api`;

export default API_BASE;
