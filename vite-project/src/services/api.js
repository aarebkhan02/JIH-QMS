import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearAuth,
} from "../utils/auth.js";

export const API_URL = "https://taylor-unirritant-latina.ngrok-free.dev/";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add access token to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();

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

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuth();
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}api/v1/auth/refresh`,
        {
          refreshToken: refreshToken,
        }
      );

      const newAccessToken = response.data.data.accessToken;

      // Save new access token
      setAccessToken(newAccessToken);

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);

    } catch (error) {
      clearAuth();
      window.location.href = "/login";

      return Promise.reject(error);
    }
  }
);