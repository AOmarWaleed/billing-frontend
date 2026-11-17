import http from "../../utils/Api";

//const PAYERS_URL = 'payers';
//const NEW_URL = 'payers';
//const EDIT_URL = '/payers/';

class PayersService {
  getAll(page: number, limit: number, sortField: string, sortOrder: string, searchField: string) {
    return http.get("/payers",{
      params:{
        page,
        limit,
        sortField,
        sortOrder,
        searchField
      }
    });
  }

  get(id) {
    return http.get(`/payers/${id}`);
  }

  create(data) {
    return http.post("/payers", data);
  }
  update(id: any, data) {
    return http.put(`/payers/${id}`, data);
  }

  delete(id: number) {
    return http.delete(`/payers/${id}`);
  }

  deleteAll() {
    return http.delete(`/payers`);
  }

  findById(id) {
    return http.get(`/payers?id=${id}`);
  }

  // searchPayers(page: number, limit: number, sortField: string, sortOrder: string, searchField: string){
  //   return http.get(`/payers/search?searchValue=${searchField}`,{
  //     params:{
  //       page,
  //       limit,
  //       sortField,
  //       sortOrder,
  //       searchField
  //     }
  //   })
    
  // }
}

export default new PayersService();
