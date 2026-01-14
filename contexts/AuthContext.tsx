import { userApi } from "@/api/userApi";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  image?: string;
  avatarId?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const PLACEHOLDER_IMAGE = "@/assets/images/default.jpg";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Map backend response to frontend User type
  const mapUserData = (data: any): User => ({
    id: data._id || data.id,
    name: data.name || "Unknown",
    email: data.email || "",
    username: data.username ? `@${data.username}` : "@unknown",
    image: data.image?.url || PLACEHOLDER_IMAGE,
  });

  // Fetch user data from API
  const loadUser = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        router.replace(ROUTES.LOGIN);
        return;
      }

      const res = await userApi.getUserData();
      setUser(mapUserData(res.data));
    } catch (err) {
      console.error("Failed to load user:", err);
      router.replace(ROUTES.LOGIN);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setUser(null);
    router.replace(ROUTES.LOGIN);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
