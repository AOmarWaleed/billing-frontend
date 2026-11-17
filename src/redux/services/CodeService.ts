import http from "../../utils/Api";
import { CodeData } from "../../types/CodeData";
import { CodeDataDTO } from "../../types/CodeDataDTO";
import { CodeDataFilter } from "../../types/CodeDataFilter";

class CodeService {
  
  getAll(page: number, limit: number) {
    return http.get(`/codedata?page=${page}&limit=${limit}`);
  }

  filterByCodeType(id: number, page: number, limit: number) {
    const response = http.get(`/codedata/type/${id}`, {
      params: {
        page,
        limit,
      },
    });
    return response;
  }

  get(id: number) {
    return http.get(`/codedata/${id}`);
  }

  getCodeDataList(linkedType: number) {
    return http.get(`/codedata/list/${linkedType}`);
  }

  create(code_type: number, data: CodeDataDTO) {
    return http.post(`/codedata/${code_type}`, data);
  }

  update(id: number, data: CodeDataDTO) {
    return http.put(`/codedata/${id}`, data);
  }

  delete(id: number) {
    return http.delete(`/codedata/${id}`);
  }

  deleteAll() {
    return http.delete(`/codedata`);
  }

  findById(id: number) {
    return http.get(`/codedata?id=${id}`);
  }

  filterByHeader(code_type: number, data: CodeDataFilter, page: number, limit: number) {
    return http.get(`/codedata/filter/${code_type}`, {
      params: {
        data,
        page,
        limit,
      },
    });
  }
  filterBySingleColumn(code_type: number, columnName: string, searchValue: string, page: number, limit: number) {
    return http.get(`/codedata/filter/${code_type}`, {
      params: {
        columnName,
        searchValue,
        page,
        limit,
      },
    });
  }
  getHierarchicalCodesTS(code: number) {
    return http.get(`/codedata/cats/${code}`);
  }
}
export default new CodeService();
