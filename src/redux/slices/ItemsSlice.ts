import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ItemsService from "../services/ItemsService";
import { ItemDTO } from "../../types/ItemDTO"; // Ensure the path is correct
import itemSchema from "../../models/itemSchema";
import { handleAxiosError } from "../errorHandler/axiosErrorHandler";
import { HierarchicalCodeItem } from "../../types/CodeItem";
import CodeService from "../services/CodeService";
import { Pagination } from "../../types/Pagination";
import { ItemData } from "../../types/ItemData";
import { isAxiosError } from "axios";

interface ItemsState {
  items: ItemData[];
  groups: HierarchicalCodeItem[];
  vats: HierarchicalCodeItem[];
  nphies: HierarchicalCodeItem[];
  selectedItem: ItemData | null;
  selectedItemId: number | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  sortBy: string;
  sortDirection: string;
  errorDelete: string;
}

const initialState: ItemsState = {
  items: [],
  groups: [],
  vats: [],
  nphies: [],
  selectedItem: null, // Add a new field to store the selected item
  selectedItemId: null,
  status: "idle",
  error: null,
  page: 1,
  limit: 12,
  totalPages: 0,
  totalCount: 0,
  sortBy: "item_id",
  sortDirection: "ASC",
  errorDelete: "",
};

interface FetchItemsResponse {
  items: ItemData[];
  pagination: Pagination;
}
// Define the async thunk for fetching items with pagination
export const fetchItems = createAsyncThunk<
  FetchItemsResponse,
  { page: number; limit: number; searchBasic: string; item_id: number | null; item_bk: string; categoryCode: string; sortBy: string; sortDirection: string }
>("items/fetchItems", async ({ page, limit, searchBasic, item_id, item_bk, categoryCode, sortBy, sortDirection }) => {
  const response = await ItemsService.getAll(page, limit, searchBasic, item_id, item_bk, categoryCode, sortBy, sortDirection);
  //return { items: response.data.items, totalPages: response.data.totalPages };
  return response.data;
});

// export const addItem =

// createAsyncThunk<ItemData, ItemData>( 'items/addItem', async (item) =>
//    {

//     const response = await ItemsService.create(item);
//     return response.data;

//    } );
export const addItem = createAsyncThunk<ItemData, ItemDTO>("items/addItem", async (item: ItemDTO, { rejectWithValue }) => {
  const { error } = itemSchema.validate(item);
  if (error) {
    console.log(error.details[0].message);
    return rejectWithValue(error.details[0].message);
  }
  try {
    const response = await ItemsService.create(item);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(handleAxiosError(error));
  }
});

export const updateItem = createAsyncThunk<ItemData, { id: number; data: ItemDTO }>("items/update", async ({ id, data }, { rejectWithValue }) => {
  // Validate the data using the schema
  // const { error } = itemSchema.validate(data);
  // if (error) {
  //   console.log(error.details[0].message);
  //   return rejectWithValue(error.details[0].message);
  // }
  try {
    const response = await ItemsService.update(id, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(handleAxiosError(error));
  }
});

// export const updateItem = createAsyncThunk<ItemData, { id: number; data: ItemData }>( "items/update",
//   async ({ id, data }) => {
//     console.log('id '+ id);
//     const res = await ItemsService.update(id, data);
//     return res.data;
//   }
// );

export const deleteItem = createAsyncThunk<number, { id: number }>("items/delete", async ({ id } , { rejectWithValue }) => {

  try {
    await ItemsService.delete(id);
    console.log("from deleteItem.rejected :" + id);
    return id;
  } catch (error) {
    console.log("from deleteItem.rejected :"  ,  error);
   return  isAxiosError(error) &&  rejectWithValue(error.response?.data?.error || 'Sorry, Something Went Wrong');
  }

});

export const findItemsById = createAsyncThunk<ItemData, { id: number }>("items/findById", async ({ id }) => {
  const res = await ItemsService.get(id); // Assuming you meant to use get by ID here
  return res.data;
});

// export const getHierarchicalCodesTS = createAsyncThunk<HierarchicalCodeItem[], { code: number }>("items/fetchGroups", async ({ code }) => {
//   console.log("groups call ");
//   const response = await ItemsService.getGroupsAndSubGroups(code);
//   console.log("groups: " + response.data);
//   return response.data;
// });

export const getGroups = createAsyncThunk<HierarchicalCodeItem[], { code: number }>("items/fetchGroups", async ({ code }) => {
  //console.log("groups call ");
  const response = await CodeService.getHierarchicalCodesTS(code);
  //console.log("groups: " + response.data);
  return response.data;
});
export const getNphies = createAsyncThunk<HierarchicalCodeItem[], { code: number }>("items/fetchNphies", async ({ code }) => {
  //console.log("groups call ");
  const response = await CodeService.getHierarchicalCodesTS(code);
  //console.log("groups: " + response.data);
  return response.data;
});
export const getVatCats = createAsyncThunk<HierarchicalCodeItem[], { code: number }>("items/fetchVats", async ({ code }) => {
  //console.log("groups call ");
  const response = await CodeService.getHierarchicalCodesTS(code);
  //console.log("groups: " + response.data);
  return response.data;
});
const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<ItemData | null>) => {
      state.selectedItem = action.payload;
      if (action.payload) {
        state.selectedItemId = action.payload.item_id ?? null;
      } else {
        state.selectedItemId = null;
      }
    },

    setPage: (state, action) => {
      state.page = action.payload;
    },

    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortDirection: (state, action) => {
      state.sortDirection = action.payload;
    },
    clearError(state) {
      state.error = null;
      state.errorDelete = "";
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      //console.log("limit" + state.limit);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchItems.fulfilled, (state, action: PayloadAction<{ data: ItemData[]; pagination: Pagination }>) => {
        state.status = "succeeded";
        state.items = action.payload.data;
        state.totalPages = action.payload.pagination.totalPages;
        state.totalCount = action.payload.pagination.totalCount;
        if (action.payload.data.length > 0) {
          state.selectedItem = action.payload.data[0];
          state.selectedItemId = action.payload.data[0].item_id ?? null;
          console.log(state.selectedItem + " " + state.selectedItemId);
        } else {
          state.selectedItem = null;
          state.selectedItemId = null;
        }
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(getGroups.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getGroups.fulfilled, (state, action: PayloadAction<HierarchicalCodeItem[]>) => {
        state.status = "succeeded";
        state.groups = action.payload;
      })
      .addCase(getGroups.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(getVatCats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getVatCats.fulfilled, (state, action: PayloadAction<HierarchicalCodeItem[]>) => {
        state.status = "succeeded";
        state.vats = action.payload;
      })
      .addCase(getVatCats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      .addCase(getNphies.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getNphies.fulfilled, (state, action: PayloadAction<HierarchicalCodeItem[]>) => {
        state.status = "succeeded";
        state.nphies = action.payload;
      })
      .addCase(getNphies.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      .addCase(addItem.fulfilled, (state, action: PayloadAction<ItemData>) => {
        state.items.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(addItem.rejected, (state, action) => {
        console.log("from addItem.rejected :" + action.payload);
        
        state.error = action.payload as string;
        // state.error = action.error.message || 'Sorry, Something Went Wrong';
        //console.log("from case :" + action.error.message);
      })
      .addCase(updateItem.fulfilled, (state, action: PayloadAction<ItemData>) => {
        //console.log("Payload:", action.payload);
        const index = state.items.findIndex((item) => item.item_id === action.payload.item_id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateItem.rejected, (state, action) => {
        console.log("from updateItem.rejected :" + action.payload);

        state.error = action.payload as string;
      })
      .addCase(deleteItem.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((item) => item.item_id !== action.payload);
        // Drop a stale selection pointing at the removed row so the detail
        // section vanishes instead of showing deleted data
        if (state.selectedItemId === action.payload) {
          state.selectedItem = null;
          state.selectedItemId = null;
        }
      })
      .addCase(deleteItem.rejected, (state, action: PayloadAction<any>) => {
        console.log("from deleteItem.rejected :" + action.payload);
        
        state.errorDelete = action.payload as string;
      })
      .addCase(findItemsById.fulfilled, (state, action: PayloadAction<ItemData>) => {
        state.selectedItem = action.payload; // Update the selectedItem with the found item
      });
  },
});

export const { setSelectedItem, setPage, setLimit, clearError, setSortBy, setSortDirection } = itemsSlice.actions;
export default itemsSlice.reducer;
