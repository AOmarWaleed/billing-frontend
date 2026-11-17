import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/User";
import UserService from "../services/UserService";
import { Group } from "../../types/Group";
import { UserDTO } from "../../types/UserDTO";
import userSchema from "../../models/userSchema";
import { GroupData } from "../../types/GroupData";
import userUpdateSchema from "../../models/userUpdateSchema";
interface UserGroupState {
  users: User[];
  groups: Group[];
  groupsWithDesc: GroupData[];
  selectedItem: User | null;
  selectedItemId: number | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  page: number;
  limit: number;
  totalPages: number;
  active: string | null;
  notActive: string | null;
  locked: string | null;
  notLocked: string | null;
}

const initialState: UserGroupState = {
  users: [],
  groups: [],
  groupsWithDesc: [],
  selectedItem: null,
  selectedItemId: null,
  status: "idle",
  error: null,
  page: 1,
  limit: 10,
  totalPages: 0,
  active: "",
  notActive: "",
  locked: "",
  notLocked: "",
  // searchGroupOne: '',
  // searchGroupTwo: '',
  //group_id: null,
};

interface FetchUserGroupResponse {
  users: User[];
  totalPages: number;
}

export const fetchUsers = createAsyncThunk<
  FetchUserGroupResponse,
  {
    active: string;
    notActive: string;
    locked: string;
    notLocked: string;
    searchGroupOne: string;
    searchGroupTwo: string;
    group_id: number;
    sortBy: string;
    sortDirection: string;
    page: number;
    limit: number;
  }
>("userGroup/fetchusers", async ({ active, notActive, locked, notLocked, searchGroupOne, searchGroupTwo, group_id, sortBy, sortDirection, page, limit }) => {
  const response = await UserService.getAllUser(active, notActive, locked, notLocked, searchGroupOne, searchGroupTwo, group_id, sortBy, sortDirection, page, limit);
  //console.log(response.data.usergroupdata);
  return {
    users: response.data.usergroupdata,
    totalPages: response.data.totalPages,
  };
});

export const fetchGroups = createAsyncThunk<Group[], void>("users/fetchGroups", async () => {
  const response = await UserService.getAllGroups();
  //console.log(response.data);
  return response.data;
});

export const fetchGroupsWithData = createAsyncThunk<GroupData[], void>("users/fetchGroupsWithData", async () => {
  const response = await UserService.getAllGroupsData();
  //console.log(response.data);
  return response.data;
});
export interface UploadUsersResponse {
  message: string;
  summary: {
    total: number;
    added: number;
    duplicates: number;
    validationErrors: string[];
  };
  failedUsers?: UserDTO[]; // or whatever type you use for users
}

// Thunk action to upload user data
export const uploadUsers = createAsyncThunk<UploadUsersResponse, UserDTO[], { rejectValue: string }>("users/uploadUsers", async (users: UserDTO[], { rejectWithValue }) => {
  try {
    const response = await UserService.saveUsers(users);
    return response.data;
  } catch (error: any) {
    // Use rejectWithValue to propagate the error message
    return rejectWithValue(error.response?.data?.error || "Error uploading user data.");
  }
});

// add user
export const addUser = createAsyncThunk<User, { data: UserDTO }>("usersetup/addUser", async ({ data }, { rejectWithValue }) => {
  try {
    const response = await UserService.create(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.error || "An unknown error occurred");
  }
});

// update user
export const updateUser = createAsyncThunk<User, { id: number; data: UserDTO }>("usersetup/updateUser", async ({ id, data }, { rejectWithValue }) => {
  
  try {
    const response = await UserService.update(id, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.error || "An unknown error occurred");
  }
});
// Action to update active status
export const updateUserActiveStatus = createAsyncThunk<User, { userId: number; active: string }>("usersetup/updateactivestatus", async ({ userId, active }, { rejectWithValue }) => {
  try {
    const response = await UserService.updateUserActiveStatus(userId, active);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.error || "Failed to update active status:");
  }
});
// Action to update locked status
export const updateUserLockedStatus = createAsyncThunk<User, { userId: number; locked: string }>("usersetup/updatelockedstatus", async ({ userId, locked }, { rejectWithValue }) => {
  try {
    const response = await UserService.updateUserLockedStatus(userId, locked);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.error || "Failed to update locked status:");
  }
});
export const filterBySinglecolumn = createAsyncThunk<User[], { page: number; limit: number; columnName: string; searchValue: string }>(
  "codedata/filterByHeader",
  async ({ page, limit, columnName, searchValue }) => {
    // console.log("data"+JSON.stringify(data));
    const response = await UserService.filterBySingleColumn(columnName, searchValue, page, limit);
    return response.data;
  }
);

export const deleteUser = createAsyncThunk<number, { id: number }>("userss/delete", async ({ id }) => {
  await UserService.delete(id);
  return id;
});

const UsersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<User | null>) => {
      state.selectedItem = action.payload;
      if (action.payload) {
        state.selectedItemId = action.payload.user_id ?? null;
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
      //console.log("limit" + state.limit);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{ users: User[]; totalPages: number }>) => {
        state.status = "succeeded";
        state.users = action.payload.users;
        state.totalPages = action.payload.totalPages;
        if (action.payload.users?.length > 0) {
          state.selectedItem = action.payload.users[0];
          state.selectedItemId = action.payload.users[0].user_id;
        } else {
          state.selectedItem = null;
          state.selectedItemId = null;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
        //console.log(action.error.message);
      })
      .addCase(fetchGroups.fulfilled, (state, action: PayloadAction<Group[]>) => {
        state.status = "succeeded";
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchGroupsWithData.fulfilled, (state, action: PayloadAction<GroupData[]>) => {
        state.status = "succeeded";
        state.groupsWithDesc = action.payload;
      })
      .addCase(fetchGroupsWithData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(uploadUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
     
      })
      .addCase(uploadUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "succeeded";
        state.users.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "succeeded";
        const index = state.users.findIndex((user) => user.user_id === action.payload.user_id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateUserActiveStatus.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "succeeded";
        const index = state.users.findIndex((item) => item.user_id === action.payload.user_id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUserActiveStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateUserLockedStatus.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "succeeded";

        const index = state.users.findIndex((item) => item.user_id === action.payload.user_id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUserLockedStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(
        filterBySinglecolumn.fulfilled,
        (
          state,
          action: PayloadAction<{
            users: User[];
            totalPages: number;
          }>
        ) => {
          state.status = "succeeded";
          state.users = action.payload.users;
          state.totalPages = action.payload.totalPages;
          if (action.payload.users?.length > 0) {
            state.selectedItem = action.payload.users[0];
            state.selectedItemId = action.payload.users[0].user_id;
            //console.log(state.selectedItem+ " "+state.selectedItemId)
          } else {
            state.selectedItem = null;
            state.selectedItemId = null;
          }
        }
      )
      .addCase(filterBySinglecolumn.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
        // Create a new array reference
        state.users = [...state.users.filter((user) => user.user_id !== action.payload)];
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedItem, setPage, clearError, setLimit } = UsersSlice.actions;
export default UsersSlice.reducer;
