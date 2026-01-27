import { ROUTES } from "@/constants/routes";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const API = `${process.env.EXPO_PUBLIC_API_URL}/api`;

export const apiClient = axios.create({
  baseURL: API,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST ================= */
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE ================= */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const logout = async () => {
        await SecureStore.deleteItemAsync("token");
        router.replace(ROUTES.LOGIN);
      };
      logout();
    }
    return Promise.reject(error);
  }
);
