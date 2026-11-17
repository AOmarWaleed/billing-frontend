import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ItemGroupService from "../services/ItemGroupService";
import {
  ItemGroup,
  Item,
  Payer,
  ItemGroupSet,
  Category,
} from "../../types/ItemGroupIndex"; // Updated import
import { act } from "react";
//import {toast } from "react-toastify";

interface ItemGroupState {
  itemGroups: ItemGroup[];
  page: number;
  limit: number;
  totalPages: number;
  total_count: number;
  selectedGroup: ItemGroup | null;
  currItemGroupSet: ItemGroupSet[];
  currSet: ItemGroupSet | null;
  currItem: Item | null;
  selectedGroupId: number | null;
  sortField: string;
  sortOrder: string;
  drugDispensingCodeTypes: any[];
  nphiesBenefitCategoryCodeTypes: any[];
  itemGroupSetCodeTypes: any[];
  itemGroupCodeTypes: any[];
  itemCategoryCodeTypes: any[];
  itemSubCategoryCodeTypes: any[];
  payers: Payer[];
  itemList: Item[];
  loading: boolean;
  error: string | null;
  processingStatus: "idle" | "loading" | "succeeded" | "failed";
  processingError: string | null;
  category: Category[];
}

const initialState: ItemGroupState = {
  itemGroups: [],
  page: 1,
  limit: 15,
  totalPages: 0,
  total_count: 0,
  selectedGroup: null,
  currItemGroupSet: [],
  currSet: null,
  currItem: null,
  selectedGroupId: null,
  sortField: "group_id",
  sortOrder: "desc",
  drugDispensingCodeTypes: [],
  nphiesBenefitCategoryCodeTypes: [],
  itemGroupSetCodeTypes: [],
  itemGroupCodeTypes: [],
  itemCategoryCodeTypes: [],
  itemSubCategoryCodeTypes: [],
  payers: [],
  itemList: [],
  loading: false,
  error: null,
  processingStatus: "idle",
  processingError: null,
  category: [],
};

//Fetch types for AutoCompelete options of forms in ItemGroup page
export const fetchItemGroupsCodeTypes = createAsyncThunk(
  "itemGroup/fetchItemGroupsCodeTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ItemGroupService.fetchItemGroupsCodeTypes();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch item groups"
      );
    }
  }
);

//Fetch Groups for ItemGroup page master table (not used any more)
export const fetchItemGroups = createAsyncThunk(
  "itemGroup/fetchItemGroups",
  async (
    params: {
      page?: number;
      limit?: number;
      sortField?: string;
      sortOrder?: string;
      searchField?: string;
      group_id?: string;
      nphies_benefit_category?: string;
      payer_name?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await ItemGroupService.getItemGroups(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch item groups"
      );
    }
  }
);

// Create new item group
export const createItemGroup = createAsyncThunk(
  "itemGroup/createItemGroup",
  async (itemGroupData: any, { rejectWithValue }) => {
    try {
      const response = await ItemGroupService.createItemGroup(itemGroupData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to create item group"
      );
    }
  }
);

// Update existing item group
export const updateItemGroup = createAsyncThunk(
  "itemGroup/updateItemGroup",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await ItemGroupService.updateItemGroup(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to update item group"
      );
    }
  }
);

// ADDED: Create item group set thunk
export const createItemGroupSet = createAsyncThunk(
  "itemGroup/set/createItemGroupSet",
  async (itemGroupSetData: any, { rejectWithValue }) => {
    try {
      const response = await ItemGroupService.createItemGroupSet(
        itemGroupSetData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to create item group set"
      );
    }
  }
);

export const proceedItemGroupSetThunk = createAsyncThunk(
  "itemGroup/proceedItemGroupSet",
  async (
    { group_id, set_id }: { group_id: number; set_id: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await ItemGroupService.proceedItemGroupSet({
        group_id,
        set_id,
      });
      return response.data;
    } catch (error: any) {
      // Suppress error - return success status to prevent error dialogs/toasts
      console.error("Process group error:", error.response?.data?.error || error.message);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }
);
// ADDED: Update item group set thunk
export const updateItemGroupSet = createAsyncThunk(
  "itemGroup/set/updateItemGroupSet",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await ItemGroupService.updateItemGroupSet(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to update item group set"
      );
    }
  }
);

export const deleteItemGroupSet = createAsyncThunk(
  "itemGroup/set/deleteItemGroupSet",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await ItemGroupService.deleteItemGroupSet(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete item group set"
      );
    }
  }
);

export const deleteAllItemGroupSet = createAsyncThunk(
  "itemGroup/set/all/deleteItemGroupSet",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await ItemGroupService.deleteAllItemGroupSet(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete item group set"
      );
    }
  }
);
export const deleteItemGroup = createAsyncThunk(
  "itemGroup/deleteItemGroup",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await ItemGroupService.deleteItemGroup(id);
      return response.data.deletedId; // return id so slice can remove it from state
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.message ||
        "Failed to delete item group"
      );
    }
  }
);

export const addItemToGroupThunk = createAsyncThunk(
  "itemGroup/addItemToGroup",
  async (
    { group_id, item_id }: { group_id: number; item_id: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await ItemGroupService.addItemToGroup({
        group_id,
        item_id,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to process item group set"
      );
    }
  }
);

export const deleteItemFromGroupThunk = createAsyncThunk(
  "itemGroup/deleteItemFromGroup",
  async (
    { group_id, item_id }: { group_id: number; item_id: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await ItemGroupService.deleteItemFromGroup(
        group_id,
        item_id
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to process item group set"
      );
    }
  }
);

const itemGroupSlice = createSlice({
  name: "itemGroup",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setSelectedItemGroup: (state, action) => {
      const nextGroup = action.payload ?? null;
      if (!state.selectedGroup && !nextGroup) {
        return;
      }
      if (
        state.selectedGroup &&
        nextGroup &&
        state.selectedGroup.group_id === nextGroup.group_id
      ) {
        return;
      }
      state.selectedGroup = nextGroup;
      state.selectedGroupId = nextGroup?.group_id ?? null;
      state.currItemGroupSet = nextGroup?.sets || [];
      state.currSet = null;
      state.currItem = null;
    },
    setSelectedSet: (state, action) => {
      state.currItemGroupSet = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    setSortField: (state, action) => {
      state.sortField = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrSet: (state, action: PayloadAction<ItemGroupSet>) => {
      state.currSet = action.payload;
    },
    clearCurrSet: (state) => {
      state.currSet = null;
    },
    resetProcessingState: (state) => {
      state.processingStatus = "idle";
      //state.processedItems = [];
      state.processingError = null;
    },
    setCurrItem: (state, action: PayloadAction<Item | null>) => {
      state.currItem = action.payload;
    },
    clearCurrItem: (state) => {
      state.currItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItemGroupsCodeTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchItemGroupsCodeTypes.fulfilled,
        (
          state,
          action: PayloadAction<{
            payers: Payer[];
            drugDispensingCodeTypes: any[];
            nphiesBenefitCategoryCodeTypes: any[];
            ItemGroupSetCodeTypes: any[];
            ItemGroupCodeTypes: any[];
            ItemCategoryCodeTypes: any[];
            ItemSubCategoryCodeTypes: any[];
            category: Category[];
          }>
        ) => {
          state.loading = false;
          state.drugDispensingCodeTypes =
            action.payload.drugDispensingCodeTypes || [];
          state.nphiesBenefitCategoryCodeTypes =
            action.payload.nphiesBenefitCategoryCodeTypes || [];
          state.itemGroupSetCodeTypes = action.payload.ItemGroupSetCodeTypes || [];
          state.itemCategoryCodeTypes = action.payload.ItemCategoryCodeTypes || [];
          state.itemSubCategoryCodeTypes =
            action.payload.ItemSubCategoryCodeTypes || [];
          state.itemGroupCodeTypes = action.payload.ItemGroupCodeTypes || [];
          state.category = action.payload.category || [];
          state.payers = action.payload.payers || [];
        }
      )
      .addCase(fetchItemGroupsCodeTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchItemGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchItemGroups.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: ItemGroup[];
            total_count: number;
            itemList: Item[];
          }>
        ) => {
          state.loading = false;

          state.itemGroups = action.payload.data || [];
          if (action.payload.data?.length > 0) {
            state.selectedGroup = {
              ...action.payload.data[0],
              sets: action.payload.data[0].sets || [],
              items: action.payload.data[0].items || [],
            };
            state.selectedGroupId = action.payload.data[0].group_id;
            state.currItemGroupSet = action.payload.data[0].sets || [];
          }

          state.total_count = action.payload.total_count || 0;
          state.totalPages = Math.ceil(
            (action.payload.total_count || 0) / state.limit
          );
        }
      )
      .addCase(fetchItemGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create item group
      .addCase(createItemGroup.pending, (state) => {
        state.error = null;
      })
      .addCase(
        createItemGroup.fulfilled,
        (state, action: PayloadAction<ItemGroup>) => {
          const newGroup = {
            ...action.payload,
            sets: action.payload.sets || [],
            items: action.payload.items || [],
          };
          state.itemGroups.unshift(newGroup);
          state.selectedGroup = newGroup;
          state.total_count += 1;
          state.totalPages = Math.ceil(state.total_count / state.limit);

          // reset sets and items since it's a new group
          state.currItemGroupSet = [];
          state.currSet = null;
          state.currItem = null;
        }
      )
      .addCase(createItemGroup.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Update item group
      .addCase(updateItemGroup.pending, (state) => {
        state.error = null;
      })
      .addCase(
        updateItemGroup.fulfilled,
        (state, action: PayloadAction<ItemGroup>) => {
          const updatedGroup = {
            ...action.payload,
            sets: action.payload.sets || [],
            items: action.payload.items || [],
          };
          state.itemGroups = state.itemGroups.map((group) =>
            group.group_id === updatedGroup.group_id ? updatedGroup : group
          );

          if (state.selectedGroup?.group_id === updatedGroup.group_id) {
            state.selectedGroup = updatedGroup;
          }
        }
      )
      .addCase(updateItemGroup.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete item group
      .addCase(
        deleteItemGroup.fulfilled,
        (state, action: PayloadAction<any>) => {
          const deletedId = action.payload.group_id;
          console.log(action.payload);

          // Filter out deleted item
          state.itemGroups = state.itemGroups.filter(
            (g) => String(g.group_id) !== String(deletedId)
          );
          state.total_count = Math.max(0, state.total_count - 1);

          // Recalculate total pages
          state.totalPages = Math.ceil(state.total_count / state.limit) || 1;

          // Adjust current page if needed
          if (state.page > state.totalPages) {
            state.page = state.totalPages;
          }

          // Update selection only if deleted item was selected
          if (String(state.selectedGroup?.group_id) === String(deletedId)) {
            const newSelectedGroup = state.itemGroups[0] || null;
            state.selectedGroup = newSelectedGroup ? {
              ...newSelectedGroup,
              sets: newSelectedGroup.sets || [],
              items: newSelectedGroup.items || [],
            } : null;
            state.selectedGroupId = state.selectedGroup?.group_id || null;

            // Clear sets as well
            state.currItemGroupSet = state.selectedGroup?.sets || [];
            state.currSet =
              state.currItemGroupSet.length > 0
                ? state.currItemGroupSet[0]
                : null;
          }
        }
      )
      .addCase(deleteItemGroup.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Create item group set
      .addCase(createItemGroupSet.pending, (state) => {
        state.error = null;
      })
      .addCase(
        createItemGroupSet.fulfilled,
        (state, action: PayloadAction<ItemGroupSet>) => {
          const newSet = action.payload;

          // Add to current group
          if (state.selectedGroup) {
            state.selectedGroup = {
              ...state.selectedGroup,
              sets: [newSet, ...(state.selectedGroup.sets || [])],
              items: state.selectedGroup.items || [],
              setCount: (state.selectedGroup.setCount || 0) + 1,
            };
          }

          // Update global groups list
          state.itemGroups = state.itemGroups.map((g) =>
            g.group_id === state.selectedGroup?.group_id
              ? {
                ...g,
                sets: [newSet, ...(g.sets || [])],
                items: g.items || [],
                setCount: (g.setCount || 0) + 1,
              }
              : g
          );

          // Update working list
          state.currItemGroupSet = [newSet, ...(state.currItemGroupSet || [])];
          state.currSet = newSet;
        }
      )
      .addCase(createItemGroupSet.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Update item group set
      .addCase(updateItemGroupSet.pending, (state) => {
        state.error = null;
      })
      .addCase(
        updateItemGroupSet.fulfilled,
        (state, action: PayloadAction<ItemGroupSet>) => {
          const updatedSet = action.payload;

          state.itemGroups = state.itemGroups.map((group) => {
            if (group.group_id === state.selectedGroup?.group_id) {
              console.log("find Group");
              return {
                ...group,
                sets: (group.sets || []).map((set) =>
                  String(set.set_id) === String(updatedSet.set_id)
                    ? updatedSet
                    : set
                ),
                items: group.items || [],
              };
            }
            return group;
          });

          // Update selectedGroup if it exists
          if (state.selectedGroup) {
            state.selectedGroup = {
              ...state.selectedGroup,
              sets: (state.selectedGroup.sets || []).map((set) =>
                String(set.set_id) === String(updatedSet.set_id)
                  ? updatedSet
                  : set
              ),
              items: state.selectedGroup.items || [],
            };

            // Create new arrays with updated set
            state.currItemGroupSet = (state.currItemGroupSet || []).map((s) =>
              String(s.set_id) === String(action.payload.set_id)
                ? action.payload
                : s
            );

            // Update current set
            console.log(action.payload);
            state.currSet = action.payload;
          }
        }
      )
      .addCase(updateItemGroupSet.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Delete single item group set
      .addCase(deleteItemGroupSet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteItemGroupSet.fulfilled,
        (state, action: PayloadAction<any>) => {
          const deleted = action.payload.data;

          // 1️⃣ Remove from currItemGroupSet
          state.currItemGroupSet = (state.currItemGroupSet || []).filter(
            (set) => String(set.set_id) !== String(deleted.set_id)
          );

          // 2️⃣ Update selectedGroup
          if (state.selectedGroup) {
            state.selectedGroup = {
              ...state.selectedGroup,
              sets: (state.selectedGroup.sets || []).filter(
                (set) => String(set.set_id) !== String(deleted.set_id)
              ),
              items: (state.selectedGroup.items || []).filter(
                (item) => String(item.set_id) !== String(deleted.set_id)
              ),
              setCount: Math.max(0, (state.selectedGroup.setCount || 0) - 1),
            };
          }

          // 3️⃣ Clear currSet if it was deleted
          if (String(state.currSet?.set_id) === String(deleted.set_id)) {
            state.currSet = null;
          }

          // 4️⃣ Clear currItem
          state.currItem = null;

          // 5️⃣ Update itemGroups (sync sets & decrement setCount)
          state.itemGroups = state.itemGroups.map((group) =>
            group.group_id === state.selectedGroup?.group_id
              ? {
                ...group,
                sets: (group.sets || []).filter(
                  (set) => String(set.set_id) !== String(deleted.set_id)
                ),
                items: (group.items || []).filter(
                  (item) => String(item.set_id) !== String(deleted.set_id)
                ),
                setCount: Math.max(0, (group.setCount || 0) - 1),
              }
              : group
          );

          state.loading = false;
        }
      )
      .addCase(deleteItemGroupSet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete all item group sets
      .addCase(deleteAllItemGroupSet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteAllItemGroupSet.fulfilled,
        (state, action: PayloadAction<any>) => {
          const deletedSets = action.payload.data || [];
          const deletedIds = deletedSets.map((s: any) => String(s.set_id));

          // Remove from currItemGroupSet
          state.currItemGroupSet = (state.currItemGroupSet || []).filter(
            (set) => !deletedIds.includes(String(set.set_id))
          );

          // Update selectedGroup sets
          if (state.selectedGroup) {
            state.selectedGroup = {
              ...state.selectedGroup,
              sets: (state.selectedGroup.sets || []).filter(
                (set) => !deletedIds.includes(String(set.set_id))
              ),
              items: (state.selectedGroup.items || []).filter(
                (item) => deletedIds.includes(String(item.set_id))
              ),
              setCount: 0,
            };
          }

          // Clear currSet if it was deleted
          if (
            state.currSet &&
            deletedIds.includes(String(state.currSet.set_id))
          ) {
            state.currSet = null;
          }

          // Clear currItem
          state.currItem = null;

          // Update itemGroups array (make sure sets stay synced)
          state.itemGroups = state.itemGroups.map((group) =>
            group.group_id === state.selectedGroup?.group_id
              ? {
                ...group,
                sets: (group.sets || []).filter(
                  (set) => !deletedIds.includes(String(set.set_id))
                ),
                items: (group.items || []).filter(
                  (item) => deletedIds.includes(String(item.set_id))
                ),
                setCount: 0,
              }
              : group
          );

          state.loading = false;
        }
      )
      .addCase(deleteAllItemGroupSet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Proceed item group set
      .addCase(proceedItemGroupSetThunk.pending, (state) => {
        state.processingStatus = "loading";
        state.processingError = null;
        state.error = null; // Clear any existing errors
      })
      .addCase(
        proceedItemGroupSetThunk.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.processingStatus = "succeeded";
          // Errors are silently logged, no toast shown
        }
      )

      // Add item to group
      .addCase(addItemToGroupThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(
        addItemToGroupThunk.fulfilled,
        (state, action: PayloadAction<Item>) => {
          const newItem = action.payload;

          state.itemGroups = state.itemGroups.map((group) => {
            if (group.group_id === state.selectedGroup?.group_id) {
              console.log("find Group");
              return {
                ...group,
                items: [...(group.items || []), newItem],
                sets: group.sets || [],
              };
            }
            return group;
          });

          // Update selectedGroup if it exists
          if (state.selectedGroup) {
            state.selectedGroup = {
              ...state.selectedGroup,
              items: [...(state.selectedGroup.items || []), newItem],
              sets: state.selectedGroup.sets || [],
            };
          }
        }
      )
      .addCase(addItemToGroupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete item from group
      .addCase(deleteItemFromGroupThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(
        deleteItemFromGroupThunk.fulfilled,
        (state, action: PayloadAction<any>) => {
          const deletedItem = action.payload.data?.deletedItem;

          if (!deletedItem) {
            state.loading = false;
            return;
          }

          state.itemGroups = state.itemGroups.map((group) => {
            if (String(group.group_id) === String(deletedItem.group_id)) {
              console.log("find Group");
              return {
                ...group,
                items: (group.items || []).filter(
                  (item) => String(item.item_id) !== String(deletedItem.item_id)
                ),
                sets: group.sets || [],
              };
            }
            return group;
          });

          state.currItem = null;

          // Update selectedGroup if it exists
          if (state.selectedGroup) {
            state.selectedGroup = {
              ...state.selectedGroup,
              items: (state.selectedGroup.items || []).filter(
                (item) => String(item.item_id) !== String(deletedItem.item_id)
              ),
              sets: state.selectedGroup.sets || [],
            };
          }
        }
      )
      .addCase(deleteItemFromGroupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setPage,
  setSelectedItemGroup,
  setLimit,
  setSortField,
  setSortOrder,
  clearError,
  setCurrSet,
  clearCurrItem,
  setCurrItem,
} = itemGroupSlice.actions;

export default itemGroupSlice.reducer;
