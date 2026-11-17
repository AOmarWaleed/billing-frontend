/**
 * WARNING: Never import axios directly!
 *
 * This custom instance:
 * - Automatically adds authentication tokens
 * - Handles token refresh
 * - Includes security headers
 *
 * Direct axios imports WILL FAIL as the backend rejects them
 */

import axios, { AxiosRequestConfig } from "axios";
import { getBaseUrl } from "./getBaseUrl";

const NPHIES_BASE_URL = import.meta.env.VITE_API_BASE_URL_NPHIES;

const apiNphies = axios.create({
  baseURL:  getBaseUrl(NPHIES_BASE_URL),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "x-api-client": "rcm-app-v1",
  },
});

// ---------------- REQUEST INTERCEPTOR ---------------- //
apiNphies.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ---------------- RESPONSE INTERCEPTOR ---------------- //
apiNphies.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error?.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._isRetry
    ) {
      originalRequest._isRetry = true;

      try {
        location.href = "/login";
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const fetcherNphies = async (
  args: string | [string, AxiosRequestConfig]
) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];
    const res = await apiNphies.get(url, { ...config });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch (Nphies):", error);
    throw error;
  }
};

export default apiNphies;
