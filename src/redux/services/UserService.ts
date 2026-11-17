import { User } from "../../types/User";
import { UserDTO } from "../../types/UserDTO";
import http from "../../utils/Api";

class UserService {
  create(data: UserDTO) {
    return http.post(`/usersetup`, data);
  }

  update(id: number, data: UserDTO) {
    return http.put(`/usersetup/${id}`, data);
  }

  getAll(page: number, limit: number) {
    return http.get(`/usersetup?page=${page}&limit=${limit}`);
  }

  getAllUser(
    active: string,
    notActive: string,
    locked: string,
    notLocked: string,
    searchGroupOne: string,
    searchGroupTwo: string,
    group_id: number,
    sortBy: string,
    sortDirection: string,
    page: number,
    limit: number
  ) {
    return http.get(`/usersetup/new`, {
      params: {
        active,
        notActive,
        locked,
        notLocked,
        searchGroupOne,
        searchGroupTwo,
        group_id,
        sortBy,
        sortDirection,
        page,
        limit,
      },
    });
  }
  getAllGroups() {
    return http.get(`/usersetup/groups`);
  }

  getAllGroupsData() {
    return http.get(`/usersetup/groupswithdesc`);
  }
  saveUsers(users: UserDTO[]) {
    return http.post(`/usersetup/save-users`, users);
  }

  updateUserActiveStatus(userId: number, active: string) {
    return http.put(`/usersetup/active/${userId}`, { active });
  }
  updateUserLockedStatus(userId: number, locked: string) {
    return http.put(`/usersetup/locked/${userId}`, { locked });
  }

  filterBySingleColumn(columnName: string, searchValue: string, page: number, limit: number) {
    return http.get(`/usersetup/filter/`, {
      params: {
        columnName,
        searchValue,
        page,
        limit,
      },
    });
  }

  delete(id: number) {
    return http.delete(`/usersetup/${id}`);
  }


}

export default new UserService();
