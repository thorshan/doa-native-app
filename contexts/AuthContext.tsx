import { authApi } from "@/api/authApi";
import { ROUTES } from "@/constants/routes";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import React, { createContext, useContext, useEffect, useState } from "react";

WebBrowser.maybeCompleteAuthSession();

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 1. Google Auth Request Config
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  });

  // 2. Check for existing session on app launch
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedUser = await SecureStore.getItemAsync("user_data");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("Failed to load session", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  // 3. Listen for Google Response
  useEffect(() => {
    if (response?.type === "success") {
      // Use the id_token from Google to authenticate with your backend
      const { id_token } = response.params;
      handleBackendAuth(id_token);
    }
  }, [response]);

  const handleBackendAuth = async (googleIdToken: string) => {
    try {
      setIsLoading(true);
      // Call your streamlined one-endpoint API
      const res = await authApi.auth(googleIdToken);

      const { token, user: userData } = res.data;

      // Save the Backend JWT for the Axios Interceptor
      await SecureStore.setItemAsync("token", token);

      // Save user profile for persistence
      await SecureStore.setItemAsync("user_data", JSON.stringify(userData));

      setUser(userData);
      router.replace("/");
    } catch (error) {
      console.error("Backend Authentication Failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user_data");
    setUser(null);
    router.replace(ROUTES.AUTH);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn: () => promptAsync(),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
