import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import PolicyService from "../services/PayerPolicyService";
import { toast } from "react-toastify";
import { Policy } from "../../types/Policy";
import CoverageDetails from "../../pages/payer/CoverageDetails";
import { PriceList } from "../../types/PriceList";
import { Coverage } from "../../types/Coverage";

interface PayerPolicyState {
  policies: Policy[];
  allPolicies: Policy[];
  priceList: PriceList[];
  coverageList: Coverage[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalPages: number;
  total_count: number;
  selectedPolicyId: number | null;
  currentCoverageId: number | null;
  sortField: string;
  sortOrder: string;
  coverageDetails: any | null;
  loadingCoverage: boolean;
  errorCoverage: string | null;
  selectedPolicyClass: any | null;
}

const initialState: PayerPolicyState = {
  policies: [],
  allPolicies: [],
  priceList: [],
  coverageList: [],
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  totalPages: 0,
  total_count: 0,
  selectedPolicyId: null,
  selectedPolicyClass: null,
  currentCoverageId: null,
  sortField: "policy_id",
  sortOrder: "desc",
  coverageDetails: null,
  loadingCoverage: false,
  errorCoverage: null,
};

export const fetchCoverageById = createAsyncThunk(
  "payerPolicy/fetchCoverageById",
  async (coverageId: number, { rejectWithValue }) => {
    try {
      const response = await PolicyService.getCoverageById(coverageId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch coverage details",
      );
    }
  },
);
// Fix the fetchPolicies async thunk
export const fetchPolicies = createAsyncThunk(
  "policies/fetchPolicies",
  async (
    payload: {
      page: number;
      limit: number;
      sortField: string;
      sortOrder: string;
      searchField: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const { page, limit, sortField, sortOrder, searchField } = payload;
      const response = await PolicyService.getAll(
        page,
        limit,
        sortField,
        sortOrder,
        searchField,
      );
      return {
        total_count: response.data.total_count,
        policies: response.data.data,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch policies",
      );
    }
  },
);
export const fetchPoliciesByPayer = createAsyncThunk<
  {
    policies: Policy[];
    totalPages: number;
    priceList: PriceList[];
    coverageList: Coverage[];
  },
  { payerId: number; page: number; limit: number }
>(
  "policies/fetchPoliciesByPayer",
  async ({ payerId, page, limit }, { rejectWithValue }) => {
    try {
      const response = await PolicyService.getByPayer(payerId, page, limit);
      console.log("hee", response.data);
      return {
        policies: response.data.data,
        totalPages: response.data.totalPages,
        coverageList: response.data.coverageList,
        priceList: response.data.priceList,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch policies by payer",
      );
    }
  },
);
export const createPolicy = createAsyncThunk(
  "payerpolicies/createPolicy",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await PolicyService.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to create policy",
      );
    }
  },
);

export const updatePolicy = createAsyncThunk(
  "payerpolicies/updatePolicy",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      console.log("UPDATE DATA SENT TO BACKEND", data);

      const response = await PolicyService.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to update policy",
      );
    }
  },
);

export const deletePolicy = createAsyncThunk(
  "payerpolicies/deletePolicy",
  async (id: number, { rejectWithValue }) => {
    try {
      await PolicyService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to delete policy",
      );
    }
  },
);

const payerPolicySlice = createSlice({
  name: "policies",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setSelectedPolicyId: (state, action) => {
      console.log("selected row" , action.payload);
      
      state.selectedPolicyId = action.payload;
    },
    setCurrentCoverageId: (state, action) => {
      state.currentCoverageId = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    setSelectedPolicyClass: (state, action) => {
      state.selectedPolicyClass = action.payload;
    },
    setSortField: (state, action) => {
      state.sortField = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    clearCoverageDetails: (state) => {
      state.coverageDetails = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearErrorCoverage: (state) => {
      state.errorCoverage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Policies
      .addCase(fetchCoverageById.pending, (state) => {
        state.loadingCoverage = true;
        state.errorCoverage = null;
      })
      .addCase(fetchCoverageById.fulfilled, (state, action) => {
        state.loadingCoverage = false;
        state.coverageDetails = action.payload;
      })
      .addCase(fetchCoverageById.rejected, (state, action) => {
        state.loadingCoverage = false;
        state.errorCoverage = action.payload as string;
        state.coverageDetails = null;
      })
      .addCase(fetchPolicies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.allPolicies = action.payload.policies;
        state.total_count = action.payload.total_count;
        state.totalPages = Math.ceil(action.payload.total_count / state.limit);
      })
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Policies By Payer
      .addCase(fetchPoliciesByPayer.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPoliciesByPayer.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload.policies;
        state.totalPages = action.payload.totalPages;
        state.priceList = action.payload.priceList;
        state.coverageList = action.payload.coverageList;
        if (action.payload.policies?.length > 0) {
          // state.selectedPolicyId = action.payload.policies[0].policy_id;
          // state.currentCoverageId = action.payload.policies[0].coverage_id;
        } else {
          state.coverageDetails = null;
        }
        //state.totalPages = Math.ceil(action.payload.total_count / state.limit);
      })
      .addCase(fetchPoliciesByPayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Policy
      .addCase(createPolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPolicy.fulfilled, (state, action) => {
        state.loading = false;
        // Add new policy to the beginning of the list
        console.log(
          "state.policies +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++=++",
          state.policies,
        );
        state.policies = [action.payload, ...state.policies];
        state.total_count += 1;
        // Recalculate total pages
        state.totalPages = Math.ceil(state.total_count / state.limit);
        toast.success("Policy created successfully!");
      })
      .addCase(createPolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Policy
      .addCase(updatePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePolicy.fulfilled, (state, action) => {
        state.loading = false;
        // Update the policy in the list
        const index = state.policies.findIndex(
          (p) => p.policy_id === action.payload.policy_id,
        );
        if (index !== -1) {
          state.policies[index] = action.payload;
        }
        toast.success("Policy updated successfully!");
      })
      .addCase(updatePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Policy
      .addCase(deletePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePolicy.fulfilled, (state, action) => {
        state.loading = false;
        // Remove deleted policy
        state.policies = state.policies.filter(
          (policy) => policy.policy_id !== action.payload,
        );
        state.total_count -= 1;
        // Recalculate total pages
        state.totalPages = Math.ceil(state.total_count / state.limit);

        // Reset to first page if current page is beyond new total
        if (state.page > state.totalPages && state.totalPages > 0) {
          state.page = state.totalPages;
        }
        toast.success("Policy deleted successfully!");
      })
      .addCase(deletePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    // Handle rejections for all async actions
    // .addMatcher(
    //   (action) => action.type.endsWith("/rejected"),
    //   (state, action) => {
    //     toast.error(action.payload || "An error occurred");
    //   }
    // );
  },
});

export const {
  clearErrorCoverage,
  clearError,
  setPage,
  setSelectedPolicyId,
  setCurrentCoverageId,
  setLimit,
  setSortField,
  setSortOrder,
  clearCoverageDetails,
  setSelectedPolicyClass,
} = payerPolicySlice.actions;
export default payerPolicySlice.reducer;
