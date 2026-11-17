import http from "../../utils/Api";
import { ItemData } from "../../types/ItemData";
import { ItemDTO } from "../../types/ItemDTO";

class ItemsService {
  getAll(page: number, limit: number, searchBasic: string, item_id: number | null, item_bk: string, category_code: string, sortBy: string, sortDirection: string) {
    return http.get("/items", {
      params: {
        page,
        limit,
        searchBasic,
        item_id,
        item_bk,
        category_code,
        sortBy,
        sortDirection,
      },
    });
  }

  get(id: number) {
    return http.get(`/items/${id}`);
  }

  create(data: ItemDTO) {
    return http.post("/items/", data);
  }

  update(id: number, data: ItemDTO) {
    return http.put(`/items/${id}`, data);
  }

  delete(id: number) {
    return http.delete(`/items/${id}`);
  }

  deleteAll() {
    return http.delete(`/items`);
  }

  findById(id: number) {
    return http.get(`/items?id=${id}`);
  }

  getGroupsAndSubGroups(code: number) {
    return http.get(`/items/groups/${code}`);
  }
}

export default new ItemsService();
