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

import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { getBaseUrl } from "./getBaseUrl";
// import { store } from "../redux/store";
// import { logoutUser, refreshAccessToken } from "../redux/services/authService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getStoredToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const storageCandidates = [sessionStorage, localStorage];

  for (const storage of storageCandidates) {
    for (const key of ["token", "accessToken"]) {
      const value = storage.getItem(key);
      if (value) {
        return value;
      }
    }
  }

  return null;
};

const applyAuthHeader = (config: InternalAxiosRequestConfig) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const api = axios.create({
  baseURL: getBaseUrl(BASE_URL),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "x-api-client": "rcm-app-v1",
  },
});

export const hl7Axios = axios.create({
  baseURL: `${getBaseUrl(import.meta.env.VITE_API_BASE_URL_HL7)}/api/v1/hl7`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

hl7Axios.interceptors.request.use((config) => applyAuthHeader(config));

api.interceptors.request.use((config) => applyAuthHeader(config));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("Attempting token refresh...");
    // If 401 and not a retry attempt
    if (
      error?.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._isRetry
    ) {
      // if (error.response.status === 401) {
      originalRequest._isRetry = true;
      try {
        location.href = "/login";
        // console.log("Attempting token refresh 2...");
        // const newToken = await store.dispatch(refreshAccessToken());

        //console.log("newToken " + newToken);
        // originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        // return api(originalRequest);
      } catch (refreshError) {
        //console.error("Token refresh failed", refreshError);
        // await store.dispatch(logoutUser());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// !!!

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];
    const res = await api.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

export default api;
