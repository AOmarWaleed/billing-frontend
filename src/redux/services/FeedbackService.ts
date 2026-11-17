import http from "../../utils/Api";

class FeedbackService {
  getMyFeedback(params?: Record<string, any>) {
    return http.get("/api/feedback/my", { params });
  }

  getAllFeedback(params?: Record<string, any>) {
    return http.get("/api/feedback/all", { params });
  }

  create(data: Record<string, any>) {
    return http.post("/api/feedback", data);
  }

  update(id: number, data: Record<string, any>) {
    return http.put(`/api/feedback/${id}`, data);
  }

  delete(id: number) {
    return http.delete(`/api/feedback/${id}`);
  }

  getTypes() {
    return http.get("/api/feedback/types");
  }

  uploadFiles(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return http.post("/api/feedback/upload", formData);
  }

  getFileUrl(filename: string) {
    const base = http.defaults.baseURL || "/";
    const normalized = base.endsWith("/") ? base : base + "/";
    return `${normalized}api/feedback/files/${filename}`;
  }
}

export default new FeedbackService();
