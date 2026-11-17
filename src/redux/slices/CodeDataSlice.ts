import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import CodeService from "../services/CodeService";
import { handleAxiosError } from "../errorHandler/axiosErrorHandler";
import { CodeData } from "../../types/CodeData";
import codeDataSchema from "../../models/codeDataScheme";
import { CodeDataDTO } from "../../types/CodeDataDTO";
import { CodeDataListDTO } from "../../types/CodeDataListDTO";
import { CodeDataFilter } from "../../types/CodeDataFilter";

interface CodeDataState {
  codedata: CodeData[];
  codetypelist: CodeDataListDTO[];
  selectedItem: CodeData | null;
  selectedItemId: number | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  page: number;
  limit: number;
  totalPages: number;
  isFilterOn: boolean;
}

const initialState: CodeDataState = {
  codedata: [],
  codetypelist: [],
  selectedItem: null, // Add a new field to store the selected item
  selectedItemId: null,
  status: "idle",
  error: null,
  page: 1,
  limit: 16,
  totalPages: 0,
  isFilterOn: false,
};

interface FetchCodeDataResponse {
  codedata: CodeData[];
  totalPages: number;
}

interface FetchCodeDataListResponse {
  codedatalist: CodeDataListDTO[];
}

// Define the async thunk for fetching codeDatas with pagination
export const fetchCodeData = createAsyncThunk<
  FetchCodeDataResponse,
  { page: number; limit: number }
>("codedata/fetchCodeData", async ({ page, limit }) => {
  const response = await CodeService.getAll(page, limit);
  return {
    codedata: response.data.codedata,
    totalPages: response.data.totalPages,
  };
});

export const fetchCodeDataList = createAsyncThunk<
  FetchCodeDataListResponse,
  { linkedType: number }
>("codedata/list", async ({ linkedType }) => {
  const response = await CodeService.getCodeDataList(linkedType);
  // response  == awaithttp.get(`/codedata/list/${linkedType}`)
  // response.data.codedatalist 
  return { codedatalist: response.data.codedatalist };
});

export const fetchCodeDataByCodeType = createAsyncThunk(
  "codedata/fetchByCodeType",
  async ({
    codeType,
    page,
    limit,
  }: {
    codeType: number;
    page: number;
    limit: number;
  }) => {
    const response = await CodeService.filterByCodeType(codeType, page, limit);
    return response.data;
  }
);

export const filterByHeader = createAsyncThunk<
  FetchCodeDataResponse,
  { codeType: number; page: number; limit: number; data: CodeDataFilter }
>("codedata/filterByHeader", async ({ codeType, page, limit, data }) => {
  console.log("data" + JSON.stringify(data));
  const response = await CodeService.filterByHeader(
    codeType,
    data,
    page,
    limit
  );
  return response.data;
});
export const filterBySinglecolumn = createAsyncThunk<
  FetchCodeDataResponse,
  {
    codeType: number;
    page: number;
    limit: number;
    columnName: string;
    searchValue: string;
  }
>(
  "codedata/filterByHeader",
  async ({ codeType, page, limit, columnName, searchValue }) => {
    // console.log("data"+JSON.stringify(data));
    const response = await CodeService.filterBySingleColumn(
      codeType,
      columnName,
      searchValue,
      page,
      limit
    );
    return response.data;
  }
);

export const addCodeData = createAsyncThunk<
  CodeData,
  { code_type: number; data: CodeDataDTO }
>("codedata/addCodeType", async ({ code_type, data }, { rejectWithValue }) => {
  const { error } = codeDataSchema.validate(data);
  if (error) {
    console.log(error.details[0].message , "ADD CODE DATA HANDLER");
    return rejectWithValue(error.details[0].message);
  }
  try {
    const response = await CodeService.create(code_type, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response.data.error || "An unknown error occurred"
    );
  }
});

export const updateCodeData = createAsyncThunk<
  CodeData,
  { id: number; data: CodeDataDTO }
>("codedata/update", async ({ id, data }, { rejectWithValue }) => {
  // Validate the data using the schema
  const { error } = codeDataSchema.validate(data);
  if (error) {
    console.log(error.details[0].message);
    return rejectWithValue(error.details[0].message);
  }
  try {
    const response = await CodeService.update(id, data);
    return response.data;
  } catch (error: any) {
    // return rejectWithValue(handleAxiosError(error));
    // Return the specific error message
    return rejectWithValue(
      error.response.data.error || "An unknown error occurred"
    );
  }
});

export const deleteCodeData = createAsyncThunk<number, { id: number }>(
  "codedata/delete",
  async ({ id }, { rejectWithValue }) => {
    try {
      await CodeService.delete(id);
      return id;
    } catch (error: any) {
      // Return the specific error message
      return rejectWithValue(
        error.response.data.error || "An unknown error occurred"
      );
    }
  }
);

export const findcodeDataByCode = createAsyncThunk<CodeData, { id: number }>(
  "codedata/findById",
  async ({ id }) => {
    const res = await CodeService.get(id); // Assuming you meant to use get by ID here
    return res.data;
  }
);

const CodeDataSlice = createSlice({
  name: "codedata",
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<CodeData | null>) => {
      state.selectedItem = action.payload;
      if (action.payload) {
        state.selectedItemId = action.payload.code ?? null;
      } else {
        state.selectedItemId = null;
      }
    },
    setSelectedItemByCode: (state, action: PayloadAction<number | null>) => {
      const index = state.codedata.find((item) => item.code === action.payload);
      if (index) {
        state.selectedItem = index;
        state.selectedItemId = index.code;
      }
    },
    clearCodeData(state) {
      state.codedata = [];
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setIsFilterOn(state) {
      return {
        ...state,
        isFilterOn: !state.isFilterOn,
      };
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCodeData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCodeData.fulfilled,
        (
          state,
          action: PayloadAction<{ codedata: CodeData[]; totalPages: number }>
        ) => {
          state.status = "succeeded";
          state.codedata = action.payload.codedata;
          state.totalPages = action.payload.totalPages;
          if (action.payload.codedata?.length > 0) {
            // state.selectedItem = action.payload.codedata[0];
            state.selectedItemId = action.payload.codedata[0].code_type;
            //console.log(state.selectedItem+ " "+state.selectedItemId)
          } else {
            state.selectedItem = null;
            state.selectedItemId = null;
          }
        }
      )
      .addCase(fetchCodeData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(
        fetchCodeDataList.fulfilled,
        (state, action: PayloadAction<{ codedatalist: CodeDataListDTO[] }>) => {
          state.status = "succeeded";
          state.codetypelist = action.payload.codedatalist;
        }
      )
      .addCase(
        fetchCodeDataByCodeType.fulfilled,
        (
          state,
          action: PayloadAction<{ codedata: CodeData[]; totalPages: number }>
        ) => {
          state.status = "succeeded";
          state.codedata = action.payload.codedata;
          state.totalPages = action.payload.totalPages;
          if (action.payload.codedata?.length > 0) {
            // state.selectedItem = action.payload.codedata[0];
            state.selectedItemId = action.payload.codedata[0].code_type;
          } else {
            state.selectedItem = null;
            state.selectedItemId = null;
          }
        }
      )
      .addCase(
        addCodeData.fulfilled,
        (state, action: PayloadAction<CodeData>) => {
          state.codedata.push(action.payload);
          toast.success("Code created successfully!");
        }
      )
      .addCase(addCodeData.rejected, (state, action) => {
        state.error = action.payload as string;
        //console.log("from case :"+action.error.message);
      })
      .addCase(
        updateCodeData.fulfilled,
        (state, action: PayloadAction<CodeData>) => {
          //console.log('Payload:', action.payload);
          const index = state.codedata.findIndex(
            (item) => item.code === action.payload.code
          );
          if (index !== -1) {
            state.codedata[index] = action.payload;
          }
          toast.success("Code updated successfully!");
        }
      )
      .addCase(updateCodeData.rejected, (state, action) => {
        state.error = action.payload as string;
        //console.log("from case :"+action.error.message);
      })
      .addCase(
        deleteCodeData.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.codedata = state.codedata.filter(
            (item) => item.code_type !== action.payload
          );
          toast.success("Code deleted successfully!");
        }
      )
      .addCase(deleteCodeData.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(
        filterBySinglecolumn.fulfilled,
        (
          state,
          action: PayloadAction<{ codedata: CodeData[]; totalPages: number }>
        ) => {
          state.status = "succeeded";
          state.codedata = action.payload.codedata;
          state.totalPages = action.payload.totalPages;
          if (action.payload.codedata?.length > 0) {
            // state.selectedItem = action.payload.codedata[0];
            state.selectedItemId = action.payload.codedata[0].code_type;
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
      .addCase(
        findcodeDataByCode.fulfilled,
        (state, action: PayloadAction<CodeData>) => {
          state.selectedItem = action.payload; // Update the selectedItem with the found item
        }
      );
  },
});

export const {
  setSelectedItem,
  setSelectedItemByCode,
  clearCodeData,
  setPage,
  clearError,
  setIsFilterOn,
  setLimit,
} = CodeDataSlice.actions;
export default CodeDataSlice.reducer;
