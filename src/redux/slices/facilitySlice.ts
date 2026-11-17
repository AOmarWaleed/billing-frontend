import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import FacilityService from "../services/FacilityService";
import { toast } from "react-toastify";

interface FacilityState {
  loading: boolean;
  error: string | null;
}

const initialState: FacilityState = {
  loading: false,
  error: null,
};

export const createFacility = createAsyncThunk<
  { facility: any },
  { data: any }
>("createFacility", async ({ data }, { rejectWithValue }) => {
  try {
    const response = await FacilityService.create(data);
    return { facility: response.data };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.msg || error.response?.data?.error || error.message || "Something went wrong",
    );
  }
});

export const updateFacility = createAsyncThunk<
  { facility: any },
  { id: number; data: any }
>("updateFacility", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await FacilityService.update(id, data);
    return { facility: response.data };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.msg || error.response?.data?.error || error.message || "Something went wrong",
    );
  }
});

export const deleteFacility = createAsyncThunk<
  { facility: any },
  { id: number }
>("deleteFacility", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await FacilityService.delete(id);
    return { facility: response.data };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.msg || error.response?.data?.error || error.message || "Something went wrong",
    );
  }
});

const facilitySlice = createSlice({
  name: "facility",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFacility.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFacility.fulfilled, (state) => {
        state.loading = false;
        toast.success("Facility updated successfully");
      })
      .addCase(updateFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      .addCase(deleteFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFacility.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export const { clearError } = facilitySlice.actions;
export default facilitySlice.reducer;
