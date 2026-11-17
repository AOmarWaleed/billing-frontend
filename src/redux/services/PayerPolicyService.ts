import http from "../../utils/Api";

class PayerPolicyService {
  getAll(page: number, limit: number, sortField: string, sortOrder: string, searchField: string) {
    return http.get("/api/policypayer/policies", {
      params: {
        page,
        limit,
        sortField,
        sortOrder,
        searchField,
      },
    });
  }
  getByPayer(payerId: number, page: number, limit: number) {
    return http.get(`/api/policypayer/${payerId}/policies`, {
      params: {
        page,
        limit,
      },
    });
  }

  get(id: number) {
    return http.get(`/policies/${id}`);
  }

  create(data: any) {
    return http.post("/api/policypayer/policies", data);
  }

  update(id: number, data: any) {
    return http.put(`/api/policypayer/policies/${id}`, data);
  }

  delete(id: number) {
    return http.delete(`/api/policypayer/policies/${id}`);
  }

  getCoverageById(coverageId: number) {
    return http.get(`/api/policypayer/coverage/${coverageId}`);
  }
}

export default new PayerPolicyService();
