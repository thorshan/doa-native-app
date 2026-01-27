import { authApi } from "@/api/authApi";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

interface LevelData {
  _id: string;
  code: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  avatarId: number;
  role: string;
  level: {
    current: LevelData;
    passed: [];
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from SecureStore on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await SecureStore.getItemAsync("user_data");
        if (userData) setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Failed to load user from SecureStore", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // LOGIN
  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { token, user: userData } = res.data;

      // Store token and user data
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user_data", JSON.stringify(userData));

      setUser(userData);
      router.replace("/"); // redirect to home
    } catch (err: any) {
      console.error("Login error", err.response?.data || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTER
  const register = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({ name, email, password });
      const { token, user: userData } = res.data;

      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user_data", JSON.stringify(userData));

      setUser(userData);
      router.replace("/"); // redirect to home
    } catch (err: any) {
      console.error("Register error", err.response?.data || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // LOGOUT
  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user_data");
      setUser(null);
      router.replace(ROUTES.LOGIN);
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
