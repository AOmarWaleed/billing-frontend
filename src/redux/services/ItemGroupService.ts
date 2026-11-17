import api from "../../utils/Api";

const ItemGroupService = {
  getItemGroups: (params: {
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: string;
    searchField?: string;
    group_id?: number;
    nphies_benefit_category?: string;
    payer_name?: string;
  }) => {
    return api.get("/api/itemgroup/new/", { params });
  },
  fetchItemGroupsCodeTypes: () => {
    return api.get("/api/itemgroup/types/");
  },
  createItemGroup: (itemGroupData: any) => {
    return api.post("/api/itemgroup", itemGroupData);
  },

  updateItemGroup: (itemGroupId: number, itemGroupData: any) => {
    return api.put(`/api/itemgroup/${itemGroupId}`, itemGroupData);
  },
  deleteItemGroup: (id: number) => {
    return api.delete(`/api/itemgroup/${id}`);
  },

  createItemGroupSet: (itemGroupSetData: any) => {
    return api.post("/api/itemgroup/set", itemGroupSetData);
  },

  updateItemGroupSet: (itemGroupSetId: number, itemGroupSetData: any) => {
    return api.put(`/api/itemgroup/set/${itemGroupSetId}`, itemGroupSetData);
  },
  deleteItemGroupSet: (itemGroupSetId: number) => {
    return api.delete(`/api/itemgroup/set/${itemGroupSetId}`);
  },
  deleteAllItemGroupSet: (GroupId: number) => {
    return api.delete(`/api/itemgroup/deleteallset/${GroupId}`);
  },
  proceedItemGroupSet: (params: { group_id: number; set_id: number }) => {
    const config = {
      headers: { 
        'X-Suppress-Error-Toast': 'true',
        'Content-Type': 'application/json'
      }
    };
    return api.post("/api/itemgroup/set/proceed", params, config);
  },
  addItemToGroup: (params: { group_id: number; item_id: number }) => {
    return api.post("/api/itemgroup/items", params);
  },
  deleteItemFromGroup: (group_id: number, item_id: number) => {
    return api.delete(`/api/itemgroup/items/${group_id}/${item_id}`);
  },
};

export default ItemGroupService;
