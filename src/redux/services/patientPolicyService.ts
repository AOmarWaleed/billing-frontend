import http from "../../utils/Api";

class PatientPolicyService {
  getAll(page: number, limit: number, sortField: string, sortOrder: string, searchField: string) {
    return http.get("/api/patientpolicies", {
      params: {
        page,
        limit,
        sortField,
        sortOrder,
        searchField,
      },
    });
  }

  getByPatient(patientId: number, page: number, limit: number) {
    return http.get(`/api/patientpolicies/${patientId}/policies`, {
      params: {
        page,
        limit,
      },
    });
  }

  get(id: number) {
    return http.get(`/api/patientpolicies/${id}`);
  }

  create(data: any) {
    return http.post("/api/patientpolicies", data);
  }

  update(id: number, data: any) {
    return http.put(`/api/patientpolicies/${id}`, data);
  }

  delete(id: number) {
    return http.delete(`/api/patientpolicies/${id}`);
  }
  getCoverageById(coverageId: number) {
    return http.get(`/api/policypayer/coverage/${coverageId}`);
  }
}

export default new PatientPolicyService();