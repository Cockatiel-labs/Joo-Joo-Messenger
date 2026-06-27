import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { envConfig } from "@/config/env";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

/**
 * Read the `csrf_token` cookie value from document.cookie.
 * The cookie is set by the API on sign-in/sign-up (non-httpOnly so JS can read it).
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const api: AxiosInstance = axios.create({
  baseURL: envConfig.NEXT_PUBLIC_BASE_URL,
  timeout: 30 * 1000,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = (config.method || "get").toUpperCase();

  // Attach the CSRF token to every state-changing request.
  if (!SAFE_METHODS.includes(method)) {
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      config.headers.set("x-csrf-token", csrfToken);
    }
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error),
);

export default api;
