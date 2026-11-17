import http from "../../utils/Api";
import { CodeTypeData } from "../../types/CodeTypeData";
import { CodeTypeDTO } from "../../types/CodeTypeDTO";

class CodeTypeService {
  getAll(
    page: number,
    limit: number,
    sortField: string,
    sortOrder: string,
    searchField: string
  ) {
    const response = http.get("/codetype", {
      params: {
        page,
        limit,
        sortField,
        sortOrder,
        searchField,
      },
    });
    return response;
    // return http.get(`/codetype?page=${page}&limit=${limit}`);
  }

  get(id: number) {
    return http.get(`/codetype/${id}`);
  }

  fetchTypes() {
    return http.get("codetype/type/list/");
  }

  create(data: CodeTypeDTO) {
    return http.post("/codetype/", data);
  }

  update(id: number, data: CodeTypeData) {
    return http.put(`/codetype/${id}`, data);
  }

  delete(id: number) {
    return http.delete(`/codetype/${id}`);
  }

  deleteAll() {
    return http.delete(`/codetype`);
  }

  findById(id: number) {
    return http.get(`/codetype?id=${id}`);
  }

  filterByCodeTypeAndDesc(searchfield: String, page: number, limit: number) {
    const response = http.get(`/codetype/search/${searchfield}`, {
      params: {
        page,
        limit,
      },
    });
    return response;
  }
}

export default new CodeTypeService();
