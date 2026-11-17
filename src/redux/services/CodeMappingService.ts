import http from "../../utils/Api";

class CodeMappingService {
  getCodeMappingPageData() {
    return http.get("/api/codemapping/page-data");
  }

  getMappings(
    setId: number,
    params: {
      p_date?: string;
      code_type?: string;
      category_id: number;
    }
  ) {
    return http.get(`/api/codemapping/mappings/${setId}`, {
      params: {
        ...params,
        category_id: params.category_id,
      },
    });
  }

  //  Create mapping
  createMapping(data: { set_id: number; code: string; type_code: number; map_to_code_id: number; start_date?: string; end_date?: string }) {
    return http.post("/api/codemapping", data);
  }

  //  Update mapping
  updateMapping(
    mapId: number,
    data: {
      map_to_code_id: number;
      start_date?: string;
      end_date?: string;
    }
  ) {
    return http.put(`/api/codemapping/${mapId}`, data);
  }

// Add to your existing service
deleteMapping(mapId: number) {
  return http.delete(`/api/codemapping/${mapId}`);
}

  createMappedSet(data: { description: string; set_query: string; code_type: number }) {
    return http.post("/api/codemapping/mapped-sets", data);
  }

  updateMappedSet(
    setId: number,
    data: {
      description: string;
      set_query: string;
      code_type: number;
    }
  ) {
    return http.put(`/api/codemapping/mapped-sets/${setId}`, data);
  }
}

export default new CodeMappingService();
