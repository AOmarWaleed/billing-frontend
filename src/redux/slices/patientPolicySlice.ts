import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import PatientPolicyService from "../services/patientPolicyService";
import PayerPolicyService from "../services/PayerPolicyService";
import { toast } from "react-toastify";

interface PatientPolicyState {
  policies: any[];
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
}

const initialState: PatientPolicyState = {
  policies: [],
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  totalPages: 0,
  total_count: 0,
  selectedPolicyId: null,
  currentCoverageId: null,
  sortField: "patient_policy_id",
  sortOrder: "desc",
  coverageDetails: null,
  loadingCoverage: false,
  errorCoverage: null,
};
export const fetchCoverageById = createAsyncThunk("payerPolicy/fetchCoverageById", async (coverageId: number, { rejectWithValue }) => {
  try {
    const response = await PatientPolicyService.getCoverageById(coverageId);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch coverage details");
  }
});
export const fetchPatientPolicies = createAsyncThunk(
  "patientPolicies/fetchPatientPolicies",
  async (
    payload: {
      page: number;
      limit: number;
      sortField: string;
      sortOrder: string;
      searchField: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { page, limit, sortField, sortOrder, searchField } = payload;
      const response = await PatientPolicyService.getAll(page, limit, sortField, sortOrder, searchField);
      return {
        total_count: response.data.total_count,
        policies: response.data.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch patient policies");
    }
  }
);

export const fetchPoliciesByPatient = createAsyncThunk<{ policies: any[]; totalPages: number }, { patientId: number; page: number; limit: number }>(
  "patientPolicies/fetchPoliciesByPatient",
  async ({ patientId, page, limit }, { rejectWithValue }) => {
    try {
      const response = await PatientPolicyService.getByPatient(patientId, page, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch policies by patient");
    }
  }
);

export const createPatientPolicy = createAsyncThunk("patientPolicies/createPatientPolicy", async (data: any, { rejectWithValue }) => {
  try {
    const response = await PatientPolicyService.create(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message || "Failed to create patient policy");
  }
});

export const updatePatientPolicy = createAsyncThunk("patientPolicies/updatePatientPolicy", async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
  try {
    const response = await PatientPolicyService.update(id, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message || "Failed to update patient policy");
  }
});

export const deletePatientPolicy = createAsyncThunk("patientPolicies/deletePatientPolicy", async (id: number, { rejectWithValue }) => {
  try {
    await PatientPolicyService.delete(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message || "Failed to delete patient policy");
  }
});

const patientPolicySlice = createSlice({
  name: "patientPolicies",
  initialState,
  reducers: {
    setPatientPolicyPage: (state, action) => {
      state.page = action.payload;
    },
    setSelectedPatientPolicyId: (state, action) => {
      state.selectedPolicyId = action.payload;
    },
    setCurrentCoverageId: (state, action) => {
      state.currentCoverageId = action.payload;
    },
    setPatientPolicyLimit: (state, action) => {
      state.limit = action.payload;
    },
    setPatientPolicySortField: (state, action) => {
      state.sortField = action.payload;
    },
    setPatientPolicySortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    resetPatientPolicies(state) {
      state.policies = [];
      state.page = 1;
      state.totalPages = 0;
      state.total_count = 0;
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
      .addCase(fetchPatientPolicies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientPolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload.policies;
        state.total_count = action.payload.total_count;
        state.totalPages = Math.ceil(action.payload.total_count / state.limit);
      })
      .addCase(fetchPatientPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Policies By Patient
      .addCase(fetchPoliciesByPatient.pending, (state) => {
        state.loading = true;
        state.selectedPolicyId = null;
        state.currentCoverageId = null;
        state.coverageDetails = null;
      })
      .addCase(fetchPoliciesByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload.policies;
        state.totalPages = action.payload.totalPages;
        if (action.payload.policies?.length > 0) {
          state.selectedPolicyId = action.payload.policies[0].patient_policy_id;
          state.currentCoverageId = action.payload.policies[0].coverageId;
        }
      })
      .addCase(fetchPoliciesByPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Policy
      .addCase(createPatientPolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatientPolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = [action.payload, ...state.policies];
        state.total_count += 1;
        state.totalPages = Math.ceil(state.total_count / state.limit);
        toast.success("Patient policy created successfully!");
      })
      .addCase(createPatientPolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Policy
      .addCase(updatePatientPolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatientPolicy.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.policies.findIndex((p) => p.patient_policy_id === action.payload.patient_policy_id);
        if (index !== -1) {
          state.policies[index] = action.payload;
        }
        toast.success("Patient policy updated successfully!");
      })
      .addCase(updatePatientPolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Policy
      .addCase(deletePatientPolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePatientPolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = state.policies.filter((policy) => policy.patient_policy_id !== action.payload);
        state.total_count -= 1;
        state.totalPages = Math.ceil(state.total_count / state.limit);

        if (state.page > state.totalPages && state.totalPages > 0) {
          state.page = state.totalPages;
        }
        toast.success("Patient policy deleted successfully!");
      })
      .addCase(deletePatientPolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Handle rejections for all async actions
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          toast.error(action.payload || "An error occurred");
        }
      );
  },
});

export const {
  setPatientPolicyPage,
  setSelectedPatientPolicyId,
  setPatientPolicyLimit,
  setPatientPolicySortField,
  setPatientPolicySortOrder,
  resetPatientPolicies,
  clearErrorCoverage,
  clearError,
  clearCoverageDetails,
  setCurrentCoverageId,
} = patientPolicySlice.actions;

export default patientPolicySlice.reducer;
