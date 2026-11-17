import http from "../../utils/Api";

class FacilityService {
  create(data: any) {
    return http.post("/api/facility", data);
  }

  update(id: number, data: any) {
    return http.put(`/api/facility/${id}`, data);
  }

  delete(id: number) {
    return http.delete(`/api/facility/${id}`);
  }
}

export default new FacilityService();
