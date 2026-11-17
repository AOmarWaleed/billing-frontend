import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import CodeTypeService from "../services/CodeTypeService";

import { CodeTypeData } from "../../types/CodeTypeData";
import codeTypeSchema from "../../models/codeTypeSchema";
import CodeService from "../services/CodeService";
import { promises } from "dns";
import { TypeList } from "../../types/TypeList";
import { CodeTypeDTO } from "../../types/CodeTypeDTO";
import { CodeDataListDTO } from "../../types/CodeDataListDTO";

interface CodeTypeState {
  codetypes: CodeTypeData[];
  types: TypeList[];
  selectedItem: CodeTypeData | null;
  selectedItemId: number | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  page: number;
  limit: number;
  totalPages: number;
  sortField: string;
  sortOrder: string;
}

const initialState: CodeTypeState = {
  codetypes: [],
  types: [],
  selectedItem: null, // Add a new field to store the selected item
  selectedItemId: null,
  status: "idle",
  error: null,
  page: 1,
  limit: 13,
  totalPages: 0,
  sortField: "code_type",
  sortOrder: "asc",
};

interface FetchCodeTypesResponse {
  codeTypes: CodeTypeData[];
  totalPages: number;
}
// Define the async thunk for fetching codetypes with pagination
export const fetchCodeTypes = createAsyncThunk<
  FetchCodeTypesResponse,
  {
    page: number;
    limit: number;
    sortField: string;
    sortOrder: string;
    searchField: string;
  }
>("codetypes/fetchcodetypes", async ({ page, limit, sortField, sortOrder, searchField }) => {
  const response = await CodeTypeService.getAll(page, limit, sortField, sortOrder, searchField);
  return {
    codetypes: response.data.codetypes,
    totalPages: response.data.totalPages,
  };
});

export const fetchTypes = createAsyncThunk<TypeList[], void>("codetypes/fetchTypes", async () => {
  const response = await CodeTypeService.fetchTypes();
  return response.data.rows;
});

export const addCodeType = createAsyncThunk<CodeTypeData, { data: CodeTypeDTO }>("codetypes/addCodeType", async ({ data }, { rejectWithValue }) => {
  const { error } = codeTypeSchema.validate(data);
  if (error) {
    console.log(error.details[0].message);
    return rejectWithValue(error.details[0].message);
  }
  try {
    const response = await CodeTypeService.create(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.error || "An unknown error occurred");
  }
});

export const updateCodeType = createAsyncThunk<CodeTypeData, { id: number; data: CodeTypeDTO }>("codetypes/update", async ({ id, data }, { rejectWithValue }) => {
  // Validate the data using the schema
  const { error } = codeTypeSchema.validate(data);
  if (error) {
    console.log(error.details[0].message);
    return rejectWithValue(error.details[0].message);
  }
  try {
    const response = await CodeTypeService.update(id, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.error || "An unknown error occurred");
  }
});

// export const deleteCodeType = createAsyncThunk<number, { id: number }>( "codetypes/delete",
//   async ({ id }) => {
//     await CodeTypeService.delete(id);
//     return id;
//    }
//   );
export const deleteCodeType = createAsyncThunk<number, { id: number }>("codetypes/delete", async ({ id }, { rejectWithValue }) => {
  try {
    await CodeTypeService.delete(id);
    return id;
  } catch (error: any) {
    // Return the specific error message
    return rejectWithValue(error.response.data.error || "An unknown error occurred");
  }
});
export const findcodetypesById = createAsyncThunk<CodeTypeData, { id: number }>("codetypes/findById", async ({ id }) => {
  const res = await CodeTypeService.get(id); // Assuming you meant to use get by ID here
  return res.data;
});

export const filterByCodeTypeAndDesc = createAsyncThunk<CodeTypeData, { searchfield: string; page: number; limit: number }>(
  "codetypes/filterByCodetypeAndDesc",
  async ({ searchfield, page, limit }) => {
    const res = await CodeTypeService.filterByCodeTypeAndDesc(searchfield, page, limit); // Assuming you meant to use get by ID here
    return res.data;
  }
);

const CodeTypeSlice = createSlice({
  name: "codetypes",
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<CodeTypeData | null>) => {
      state.selectedItem = action.payload;
      if (action.payload) {
        state.selectedItemId = action.payload.code_type ?? null;
      } else {
        state.selectedItemId = null;
      }
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setSortField: (state, action) => {
      state.sortField = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    setCodeTypes : (state , action)=>{
      state.codetypes = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCodeTypes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCodeTypes.fulfilled,
        (
          state,
          action: PayloadAction<{
            codetypes: CodeTypeData[];
            totalPages: number;
          }>
        ) => {
          state.status = "succeeded";
          state.codetypes = action.payload.codetypes;
          state.totalPages = action.payload.totalPages;
          if (action.payload.codetypes?.length > 0) {
            // state.selectedItem = action.payload.codetypes[0];
            // state.selectedItemId = action.payload.codetypes[0].code_type ?? null;
            //console.log(state.selectedItem+ " "+state.selectedItemId)
          } else {
            // state.selectedItem = null;
            // state.selectedItemId = null;
          }
        }
      )
      .addCase(fetchCodeTypes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchTypes.fulfilled, (state, action: PayloadAction<TypeList[]>) => {
        state.status = "succeeded";
        state.types = action.payload;
      })

      .addCase(
        filterByCodeTypeAndDesc.fulfilled,
        (
          state,
          action: PayloadAction<{
            codetypes: CodeTypeData[];
            totalPages: number;
          }>
        ) => {
          state.status = "succeeded";
          state.codetypes = action.payload.codetypes;
          state.totalPages = action.payload.totalPages;
          if (action.payload.codetypes?.length > 0) {
            // state.selectedItem = action.payload.codetypes[0];
            // state.selectedItemId = action.payload.codetypes[0].code_type ?? null;
            //console.log(state.selectedItem+ " "+state.selectedItemId)
          } else {
            // state.selectedItem = null;
            // state.selectedItemId = null;
          }
        }
      )
      .addCase(addCodeType.fulfilled, (state, action: PayloadAction<CodeTypeData>) => {
        state.codetypes.push(action.payload);
        toast.success("Code Type created successfully!");
      })
      .addCase(addCodeType.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateCodeType.fulfilled, (state, action: PayloadAction<CodeTypeData>) => {
        console.log("Payload:", action.payload);
        const index = state.codetypes.findIndex((item) => item.code_type === action.payload.code_type);
        if (index !== -1) {
          state.codetypes[index] = action.payload;
        }
        toast.success("Code Type updated successfully!");
      })
      .addCase(updateCodeType.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteCodeType.fulfilled, (state, action: PayloadAction<number>) => {
        state.codetypes = state.codetypes.filter((item) => item.code_type !== action.payload);
        toast.success("Code Type deleted successfully!");
      })
      .addCase(deleteCodeType.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(findcodetypesById.fulfilled, (state, action: PayloadAction<CodeTypeData>) => {
        // state.selectedItem = action.payload; // Update the selectedItem with the found item
      });
  },
});

export const { setSelectedItem,setCodeTypes, setPage, setSortField, setSortOrder, clearError, setLimit } = CodeTypeSlice.actions;
export default CodeTypeSlice.reducer;
