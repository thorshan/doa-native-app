import axios from "axios";

/* ================= TYPES ================= */

export interface ImageData {
  _id: string;
  fileName: string;
  filePath: string;
  originalName?: string;
  mimeType?: string;
  uploadedAt: string;
}

interface ImageUploadResponse {
  savedImage: ImageData;
}


const api = `${process.env.EXPO_PUBLIC_API_URL}/api`;

/* ================= API ================= */

export const imageApi = {
  addImage: (data: FormData) =>
    axios.post<ImageUploadResponse>(`${api}/images`, data),

  getImage: (id: string) => axios.get<ImageData>(`${api}/images/${id}`),

  removeImage: (id: string) => axios.delete(`${api}/images/${id}`),
};
