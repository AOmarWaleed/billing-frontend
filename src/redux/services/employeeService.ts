import http from "../../utils/Api";


class EmployeeService{
  getAll(
    page: number,
    limit: number,
    sortBy: string,
    sortDirection: string,
    searchBasic: string,
    usePagedData: boolean = true
  ) {
    if (usePagedData) {
      return http.get('/api/employee/allempspagedata', {
        params: { page, limit, sortBy, sortDirection, searchBasic },
      });
      
    } else {
      return http.get('/api/employee/allemps');
    }
  }

  getCodes(){
    return http.get(`/api/employee/codes`);
  }

  update(id: any, data: any){
    return http.put(`/api/employee/${id}`, data);
  }

  create(data: any){
    return http.post(`/api/employee`, data)
  }

  delete(id: any) {
    return http.delete(`/api/employee/${id}`);
  }

}


export default new EmployeeService();
