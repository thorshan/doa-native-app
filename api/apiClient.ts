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
  async (error) => {
    // Check if the error is 401 and not coming from the login route itself
    if (error.response?.status === 401) {
      console.warn("Session expired. Logging out...");
      
      // Clear token from SecureStore
      await SecureStore.deleteItemAsync("token"); 
      
      // Redirect to login using router.replace
      // Note: In some versions of Expo Router, you might need 
      // to ensure this doesn't run while a navigation is already in progress
      if (router.canGoBack()) router.dismissAll();
      router.replace(ROUTES.LOGIN);
    }
    return Promise.reject(error);
  }
);
