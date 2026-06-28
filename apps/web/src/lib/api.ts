import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { envConfig } from "@/config/env";

const api: AxiosInstance = axios.create({
  baseURL: envConfig.NEXT_PUBLIC_BASE_URL,
  timeout: 30 * 1000,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error),
);

export default api;
