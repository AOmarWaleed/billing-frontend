import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import CodeMappingService from "../services/CodeMappingService";
import { toast } from "react-toastify";
import { CodeSet, CodeType, CodingData, ExternalCode, MappingRow } from "../../types/CodeMappingIndex";

interface CodeMappingState {
  sets: CodeSet[];
  selectedSet: CodeSet | null;
  selectedMapping: MappingRow | null;
  coding: CodingData[];
  AllCodeTypes: CodeType[];
  loading: boolean;
  error: string | null;
  gridData: MappingRow[];
  gridLoading: boolean;
  gridError: string | null;
  externalCodes: ExternalCode[];
  externalCodesLoading: boolean;
  externalCodesError: string | null;
  createMappingLoading: boolean;
  createMappingError: string | null;
  updateMappingLoading: boolean;
  updateMappingError: string | null;
  setOperationLoading: boolean;
  setOperationError: string | null;
}

const initialState: CodeMappingState = {
  sets: [],
  selectedMapping: null,
  selectedSet: null,
  coding: [],
  AllCodeTypes: [],
  loading: false,
  error: null,
  gridData: [],
  gridLoading: false,
  gridError: null,
  externalCodes: [],
  externalCodesLoading: false,
  externalCodesError: null,
  createMappingLoading: false,
  createMappingError: null,
  updateMappingLoading: false,
  updateMappingError: null,
  setOperationLoading: false,
  setOperationError: null,
};

export const fetchCodeMappingData = createAsyncThunk("codeMapping/fetchData", async (_, { rejectWithValue }) => {
  try {
    const response = await CodeMappingService.getCodeMappingPageData();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch code mapping data");
  }
});

export const fetchMappings = createAsyncThunk(
  "codeMapping/fetchMappings",
  async (
    payload: {
      setId: number;
      categoryId: number;
      codeType?: string;
      pDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { setId, categoryId, codeType, pDate } = payload;
      const response = await CodeMappingService.getMappings(setId, {
        category_id: categoryId,
        code_type: codeType,
        p_date: pDate,
      });

      const { mappings, externalCodes } = response.data;

      const parsedMappings: MappingRow[] = mappings.map(
        (item: any, index: number): MappingRow => ({
          id: index + 1,
          map_id: item.map_id,
          app_code: item.app_code,
          app_sub_code: item.app_sub_code,
          description: item.description,
          sub_description: item.sub_description,
          map_to_code_id: item.map_to_code_id,
          ext_code: item.ext_code,
          ext_description: item.ext_description,
          start_date: item.start_date ? new Date(item.start_date) : null,
          end_date: item.end_date ? new Date(item.end_date) : null,
        })
      );

      console.log(externalCodes);

      return { mappings: parsedMappings, externalCodes };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch mappings");
    }
  }
);

export const createMapping = createAsyncThunk(
  "codeMapping/createMapping",
  async (
    payload: {
      set_id: number;
      code: string;
      type_code: number;
      map_to_code_id: number;
      start_date?: string;
      end_date?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("mapping");
      const response = await CodeMappingService.createMapping(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to create mapping");
    }
  }
);

export const updateMapping = createAsyncThunk(
  "codeMapping/updateMapping",
  async (
    payload: {
      mapId: number;
      data: {
        map_to_code_id: number;
        start_date?: string;
        end_date?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const { mapId, data } = payload;
      const response = await CodeMappingService.updateMapping(mapId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to update mapping");
    }
  }
);

export const deleteMapping = createAsyncThunk<number, { mapId: number }>("codeMapping/deleteMapping", async ({ mapId }) => {
  await CodeMappingService.deleteMapping(mapId);
  return mapId; // Return ID for reducer handling
});

export const createMappedSet = createAsyncThunk(
  "codeMapping/createMappedSet",
  async (
    payload: {
      description: string;
      set_query: string;
      code_type: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await CodeMappingService.createMappedSet(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to create set");
    }
  }
);

export const updateMappedSet = createAsyncThunk(
  "codeMapping/updateMappedSet",
  async (
    payload: {
      setId: number;
      data: {
        description: string;
        set_query: string;
        code_type: number;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const { setId, data } = payload;
      const response = await CodeMappingService.updateMappedSet(setId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to update set");
    }
  }
);

const codeMappingSlice = createSlice({
  name: "codeMapping",
  initialState,
  reducers: {
    setSelectedMapping: (state, action: PayloadAction<MappingRow | null>) => {
      state.selectedMapping = action.payload;
    },
    setSelectedSet: (state, action: PayloadAction<CodeSet | null>) => {
      state.selectedSet = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearGridError: (state) => {
      state.gridError = null;
    },
    clearExternalCodes: (state) => {
      state.externalCodes = [];
      state.externalCodesError = null;
    },
    clearCreateMappingError: (state) => {
      state.createMappingError = null;
    },
    clearUpdateMappingError: (state) => {
      state.updateMappingError = null;
    },
    clearSetError: (state) => {
      state.setOperationError = null;
    },
    resetMappingState: (state) => {
      state.selectedSet = null;
      state.selectedMapping = null;
      state.fr;
      state.gridData = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCodeMappingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCodeMappingData.fulfilled, (state, action) => {
        state.loading = false;
        state.sets = action.payload.sets;
        state.coding = action.payload.coding;
        state.AllCodeTypes = action.payload.AllCodeTypes;
      })
      .addCase(fetchCodeMappingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })
      .addCase(fetchMappings.pending, (state) => {
        state.gridLoading = true;
        state.gridError = null;
        state.gridData = [];
        state.externalCodes = [];
      })
      .addCase(fetchMappings.fulfilled, (state, action) => {
        state.gridLoading = false;
        state.gridData = action.payload.mappings;
        state.externalCodes = action.payload.externalCodes;
        if (action.payload.mappings?.length > 0) {
          state.selectedMapping = action.payload.mappings[0];
          //console.log(state.selectedItem+ " "+state.selectedItemId)
        } else {
          state.selectedMapping = null;
        }
      })
      .addCase(fetchMappings.rejected, (state, action) => {
        state.gridLoading = false;
        state.gridError = action.payload as string;
        toast.error(state.gridError);
      })
      // Create Mapping
      .addCase(createMapping.pending, (state) => {
        state.createMappingLoading = true;
        state.createMappingError = null;
      })
      .addCase(createMapping.fulfilled, (state) => {
        state.createMappingLoading = false;
        toast.success("Mapping created successfully");
      })
      .addCase(createMapping.rejected, (state, action) => {
        state.createMappingLoading = false;
        state.createMappingError = action.payload as string;
        toast.error(state.createMappingError);
      })

      // Update Mapping
      .addCase(updateMapping.pending, (state) => {
        state.updateMappingLoading = true;
        state.updateMappingError = null;
      })
      .addCase(updateMapping.fulfilled, (state) => {
        state.updateMappingLoading = false;
        toast.success("Mapping updated successfully");
      })
      .addCase(updateMapping.rejected, (state, action) => {
        state.updateMappingLoading = false;
        state.updateMappingError = action.payload as string;
        toast.error(state.updateMappingError);
      })
      .addCase(deleteMapping.pending, (state) => {
        //state.loading = "loading";
        state.error = null;
      })
      .addCase(deleteMapping.fulfilled, (state, action) => {
        // state.status = "succeeded";
        // Remove deleted mapping from state
        state.gridData = state.gridData.filter((mapping) => mapping.map_id !== action.payload);
      })
      .addCase(deleteMapping.rejected, (state, action) => {
        //state.loading = "failed";
        state.error = action.payload as string;
      })
      .addCase(createMappedSet.pending, (state) => {
        state.setOperationLoading = true;
        state.setOperationError = null;
      })
      .addCase(createMappedSet.fulfilled, (state, action) => {
        state.setOperationLoading = false;
        state.sets.push(action.payload);
        toast.success("Set created successfully");
      })
      .addCase(createMappedSet.rejected, (state, action) => {
        state.setOperationLoading = false;
        state.setOperationError = action.payload as string;
        toast.error(state.setOperationError);
      })
      .addCase(updateMappedSet.pending, (state) => {
        state.setOperationLoading = true;
        state.setOperationError = null;
      })
      .addCase(updateMappedSet.fulfilled, (state, action) => {
        state.setOperationLoading = false;
        const updatedSet = action.payload;
        state.sets = state.sets.map((set) => (set.set_id === updatedSet.set_id ? updatedSet : set));
        state.selectedSet = updatedSet;
        toast.success("Set updated successfully");
      })
      .addCase(updateMappedSet.rejected, (state, action) => {
        state.setOperationLoading = false;
        state.setOperationError = action.payload as string;
        toast.error(state.setOperationError);
      });
  },
});

export const { resetMappingState, clearError, clearGridError, clearExternalCodes, clearUpdateMappingError, clearCreateMappingError, clearSetError, setSelectedMapping, setSelectedSet } =
  codeMappingSlice.actions;
export default codeMappingSlice.reducer;
