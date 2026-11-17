import http from "../utils/Api";

export interface UploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
}

export interface UploadResponse {
  success: boolean;
  data: {
    files: UploadResult[];
  };
}

class FileUploaderService {
  upload(endpoint: string, files: File[]): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return http.post(endpoint, formData);
  }

  delete(endpoint: string, filename: string) {
    return http.delete(`${endpoint}/${filename}`);
  }

  getFileUrl(baseUrl: string, filename: string): string {
    const normalized = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    return `${normalized}${filename}`;
  }

  getBaseUrl(): string {
    return (http.defaults.baseURL || "/") + "/api/feedback/files";
  }
}

export default new FileUploaderService();
