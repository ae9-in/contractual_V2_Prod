import axios from "axios";
// import { useAuthStore } from "../stores/authStore"; // Avoid direct import if it causes cycle, use getState later

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const fallbackApiUrl = "https://contractual-v2-prod.onrender.com";

// Keep the mobile app on the same backend/data source as web by defaulting to production.
export const API_URL = rawApiUrl && rawApiUrl.length > 0
  ? rawApiUrl.replace(/\/+$/, "")
  : fallbackApiUrl;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  async (config) => {
    // Lazy import store to avoid circular dependencies
    const { useAuthStore } = await import("../stores/authStore");
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Lazy import store to avoid circular dependencies
      const { useAuthStore } = await import("../stores/authStore");
      await useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

export default api;
