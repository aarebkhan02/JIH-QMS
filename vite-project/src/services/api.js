import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearAuth,
} from "../utils/auth.js";

// In dev, use relative root ('/') so Vite proxy seamlessly handles requests without CORS
// In production or custom env, use VITE_API_URL or ngrok remote URL
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/' : 'https://ls6cx6sb-8080.inc1.devtunnels.ms');

// Attach global default headers to raw axios as well as a safety measure
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "69420";
axios.defaults.headers.common["Accept"] = "application/json";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
});


// Add access token and ngrok bypass to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  config.headers = config.headers || {};
  config.headers["ngrok-skip-browser-warning"] = "69420";
  if (!config.headers["Accept"]) {
    config.headers["Accept"] = "application/json";
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle expired access token
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/logout') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuth();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      const refreshUrl = `${API_URL.endsWith('/') ? API_URL : `${API_URL}/`}api/v1/auth/refresh`;
      const response = await axios.post(
        refreshUrl,
        {
          refreshToken: refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      const newAccessToken = response.data?.data?.accessToken;

      if (!newAccessToken) {
        throw new Error("No access token returned");
      }

      // Save new access token
      setAccessToken(newAccessToken);

      // Retry original request
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      originalRequest.headers["ngrok-skip-browser-warning"] = "69420";

      return api(originalRequest);

    } catch (refreshErr) {
      clearAuth();
      window.location.href = "/login";
      return Promise.reject(refreshErr);
    }
  }
);