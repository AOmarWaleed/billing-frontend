import { createAsyncThunk, createSlice, isRejectedWithValue, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/User";
import GroupsService from "../services/GroupsService";
import { Group } from "../../types/Group";
import { UserDTO } from "../../types/UserDTO";
import groupSchema from "../../models/groupSchema";
import { GroupData } from "../../types/GroupData";
import { GroupDTO } from "../../types/GroupDTO";
import { Menu } from "../../types/Menu";
import { LdapGroup } from "../../types/LdapGroup";
interface UserGroupState {
  groupsWithDesc: GroupData[];
  menus: any[];
  ldapGroups: LdapGroup[];
  selectedItem: Group | null;
  selectedItemId: number | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  page: number;
  limit: number;
  totalPages: number;
}

const initialState: UserGroupState = {
  groupsWithDesc: [],
  menus: [],
  ldapGroups: [],
  selectedItem: null,
  selectedItemId: null,
  status: "idle",
  error: null,
  page: 1,
  limit: 10,
  totalPages: 0,
};

interface FetchGroupResponse {
  usergroups: GroupData[];
  totalPages: number;
}

export const fetchGroupsData = createAsyncThunk<
  FetchGroupResponse,
  {
    searchGroupOne: string;
    searchGroupTwo: string;
    group_id: number;
    page: number;
    limit: number;
  }
>("group/fetchgroupsData", async ({ searchGroupOne, searchGroupTwo, group_id, page, limit }) => {
  const response = await GroupsService.getAllGroupsData(searchGroupOne, searchGroupTwo, group_id, page, limit);
  //console.log(response.data.usergroupdata);
  return {
    usergroups: response.data.usergroups,
    totalPages: response.data.totalPages,
  };
});
export interface UploadGroupsResponse {
  message: string;
  summary: {
    total: number;
    added: number;
    duplicates: number;
    validationErrors: string[];
  };
  failedGroups?: GroupDTO[]; // or whatever type you use for users
}

// Thunk action to upload user data
export const uploadGroups = createAsyncThunk<UploadGroupsResponse, GroupDTO[], { rejectValue: string }>("group/uploadGroups", async (groups: GroupDTO[], { rejectWithValue }) => {
  try {
    const response = await GroupsService.saveGroups(groups);
    return response.data;
  } catch (error: any) {
    // Use rejectWithValue to propagate the error message
    return rejectWithValue(error.response?.data?.error || "Error uploading user data.");
  }
});
// add group
export const addGroup = createAsyncThunk<GroupData, { data: GroupDTO }>("group/addGroup", async ({ data }, { rejectWithValue }) => {
  const { error } = groupSchema.validate(data);
  if (error) {
    console.log(error.details[0].message);
    return rejectWithValue(error.details[0].message);
  }
  try {
    const response = await GroupsService.create(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.error || "An unknown error occurred");
  }
});

// update group
export const updateGroup = createAsyncThunk<GroupData, { id: number; data: GroupDTO }>("group/updateGroup", async ({ id, data }, { rejectWithValue }) => {
  console.log("from slice");
  const { error } = groupSchema.validate(data);
  if (error) {
    console.log(error.details[0].message);
    return rejectWithValue(error.details[0].message);
  }
  try {
    const response = await GroupsService.update(id, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.error || "An unknown error occurred");
  }
});

export const filterBySinglecolumn = createAsyncThunk<{ usergroups: GroupData[]; totalPages: number }, { page: number; limit: number; columnName: string; searchValue: string }>(
  "codedata/filterByHeader",
  async ({ page, limit, columnName, searchValue }) => {
    // console.log("data"+JSON.stringify(data));
    const response = await GroupsService.filterBySingleColumn(columnName, searchValue, page, limit);
    return response.data;
  }
);

export const fetchMenus = createAsyncThunk<Menu[], void>("userGroup/fetchGroups", async () => {
  const response = await GroupsService.getAllMenus();
  //console.log(response.data);
  return response.data;
});

export const fetchLdapGroups = createAsyncThunk<LdapGroup[], void, { rejectValue: string }>(
  "userGroup/fetchLdapGroups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await GroupsService.getLdapGroups();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to fetch LDAP groups";
      return rejectWithValue(errorMessage);
    }
  },
);

export const importLdapGroups = createAsyncThunk<any, LdapGroup[]>("userGroup/importLdapGroups", async (selectedGroups, thunkAPI) => {
  try {
    const response = await GroupsService.saveLdapGroups(selectedGroups);
    console.log("Imported groups response:", response.data);
    //alert("Groups imported successfully");
    return response.data;
  } catch (error: any) {
    console.error("Failed to import groups:", error);
    //alert("Failed to import groups");
    return thunkAPI.rejectWithValue(error.response?.data || "Import failed");
  }
});

export const deleteGroup = createAsyncThunk<any, { id: number }>("userGroup/delete", async ({ id }, { rejectWithValue }) => {
  try {
    await GroupsService.delete(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response.data.error || "An unknown error occurred");
  }
});
const GroupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<Group | null>) => {
      state.selectedItem = action.payload;
      if (action.payload) {
        state.selectedItemId = action.payload.group_id ?? null;
      }
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupsData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGroupsData.fulfilled, (state, action: PayloadAction<{ usergroups: GroupData[]; totalPages: number }>) => {
        state.status = "succeeded";
        state.groupsWithDesc = action.payload.usergroups;
        state.totalPages = action.payload.totalPages;
        if (action.payload.usergroups?.length > 0) {
          state.selectedItem = action.payload.usergroups[0];
          state.selectedItemId = action.payload.usergroups[0].group_id;
        } else {
          state.selectedItem = null;
          state.selectedItemId = null;
        }
      })
      .addCase(fetchGroupsData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
        console.log(action.error.message);
      })
      .addCase(uploadGroups.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(uploadGroups.rejected, (state, action) => {
        state.status = "failed";
        //state.error = action.error.message || null;
        state.error = action.payload as string;
      })
      .addCase(addGroup.fulfilled, (state, action: PayloadAction<GroupData>) => {
        state.status = "succeeded";
        state.groupsWithDesc.push(action.payload);
      })
      .addCase(addGroup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateGroup.fulfilled, (state, action: PayloadAction<GroupData>) => {
        state.status = "succeeded";
        const index = state.groupsWithDesc.findIndex((group) => group.group_id === action.payload.group_id);
        if (index !== -1) {
          state.groupsWithDesc[index] = action.payload;
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(filterBySinglecolumn.fulfilled, (state, action: PayloadAction<{ usergroups: GroupData[]; totalPages: number }>) => {
        state.status = "succeeded";
        state.groupsWithDesc = action.payload.usergroups;
        state.totalPages = action.payload.totalPages;
        if (action.payload.usergroups?.length > 0) {
          state.selectedItem = action.payload.usergroups[0];
          state.selectedItemId = action.payload.usergroups[0].group_id;
          //console.log(state.selectedItem+ " "+state.selectedItemId)
        } else {
          state.selectedItem = null;
          state.selectedItemId = null;
        }
      })
      .addCase(filterBySinglecolumn.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchMenus.fulfilled, (state, action: PayloadAction<Menu[]>) => {
        state.status = "succeeded";
        console.log("paylode" + action.payload);
        state.menus = action.payload;
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchLdapGroups.fulfilled, (state, action: PayloadAction<LdapGroup[]>) => {
        state.status = "succeeded";
        state.ldapGroups = action.payload;
      })
      .addCase(fetchLdapGroups.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || action.error.message || "Failed to fetch LDAP groups";
      })
      .addCase(deleteGroup.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "succeeded";
        state.groupsWithDesc = [...state.groupsWithDesc.filter((group) => group.group_id !== action.payload)];
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedItem, setPage, clearError, setLimit } = GroupsSlice.actions;
export default GroupsSlice.reducer;
