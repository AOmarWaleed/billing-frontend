import http from "../../utils/Api";

class PatientsService {
  getAll(page: number, limit: number, sortField: string, sortOrder: string, searchField: string) {
    return http.get("/patients/new", {
      params: {
        page,
        limit,
        sortField,
        sortOrder,
        searchField
      }
    });
  }

  fetchPatientsCodeTypes() {
    return http.get("/patients/new/types");
  }

  update(id: any, data: any) {
    return http.put(`/patients/${id}`, data);
  }

  create(data: any) {
    return http.post(`/patients`, data);
  }
}

export default new PatientsService();