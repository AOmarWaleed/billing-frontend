import { GroupDTO } from "../../types/GroupDTO";
import { LdapGroup } from "../../types/LdapGroup";
import http from "../../utils/Api";

class GroupService {
  create(data: GroupDTO) {
    return http.post(`/usergroups`, data);
  }

  update(id: number, data: GroupDTO) {
    return http.put(`/usergroups/${id}`, data);
  }

  //   getAll(page: number, limit: number) {
  //     return http.get(`/usersetup?page=${page}&limit=${limit}`);
  //   }
  saveGroups(groups: GroupDTO[]) {
    return http.post(`/usergroups/save-groups`, groups);
  }

  getAllGroupsData(searchGroupOne: string, searchGroupTwo: string, group_id: number, page: number, limit: number) {
    return http.get(`/usergroups`, {
      params: {
        searchGroupOne,
        searchGroupTwo,
        group_id,
        page,
        limit,
      },
    });
  }

  filterBySingleColumn(columnName: string, searchValue: string, page: number, limit: number) {
    return http.get(`/usergroups/filter/`, {
      params: {
        columnName,
        searchValue,
        page,
        limit,
      },
    });
  }
  getAllMenus() {
    return http.get(`/usergroups/menus`);
  }
  delete(id: number) {
    return http.delete(`/usergroups/${id}`);
  }
  getLdapGroups() {
    return http.get(`api/auth/ldap/groupsdesc`);
  }
  saveLdapGroups(selectedGroups: any[]) {
    return http.post(`api/auth/ldap/importgroups`, { groups: selectedGroups });
  }
}

export default new GroupService();
