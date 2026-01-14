import { apiClient } from "./apiClient";

export interface ImageData {
  _id: string;
  fileName: string;
  filePath: string;
  originalName?: string;
  mimeType?: string;
  uploadedAt?: string;
}

export interface UserData {
  _id: string;
  name: string;
  email: string;
  image: ImageData | null;
  username: string;
  level?: {
    passed?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface OTPData {
  otp: string;
}

export const userApi = {
  // Get logged-in user data
  getUserData: () => apiClient.get<UserData>("/users/user"),

  // Get user by ID
  getUser: (id: string) => apiClient.get<UserData>(`/users/${id}`),

  // Update user profile
  updateUser: (id: string, data: Partial<UserData>) =>
    apiClient.put<UserData>(`/users/update/${id}`, data),

  // Update user level/progress
  updateUserLevel: (id: string, data: any) =>
    apiClient.put<UserData>(`/users/${id}/level`, data),

  // Send OTP
  sendOTP: (data: OTPData) => apiClient.post(`/users/send-otp`, data),

  // Verify OTP
  verifyOTP: (data: OTPData) => apiClient.post(`/users/verify-otp`, data),
};
