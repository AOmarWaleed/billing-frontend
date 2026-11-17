import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import FeedbackService from "../services/FeedbackService";
import { toast } from "react-toastify";

export interface FeedbackItem {
  feedback_id: number;
  page: string | null;
  feedback_text: string;
  feedback_type: string;
  attachment: string;
  facility_id: number | null;
  created_by: number;
  creation_date: string;
  modified_by: number | null;
  modification_date: string | null;
  created_by_name: string;
}

interface FeedbackState {
  myFeedback: FeedbackItem[];
  allFeedback: FeedbackItem[];
  loading: boolean;
  error: string | null;
}

const initialState: FeedbackState = {
  myFeedback: [],
  allFeedback: [],
  loading: false,
  error: null,
};

export const fetchMyFeedback = createAsyncThunk(
  "feedback/fetchMyFeedback",
  async (params: Record<string, any> | undefined, { rejectWithValue }) => {
    try {
      const response = await FeedbackService.getMyFeedback(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch feedback"
      );
    }
  }
);

export const fetchAllFeedback = createAsyncThunk(
  "feedback/fetchAllFeedback",
  async (params: Record<string, any> | undefined, { rejectWithValue }) => {
    try {
      const response = await FeedbackService.getAllFeedback(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch feedback"
      );
    }
  }
);

export const createFeedback = createAsyncThunk(
  "feedback/createFeedback",
  async (data: Record<string, any>, { rejectWithValue }) => {
    try {
      const response = await FeedbackService.create(data);
      toast.success("Feedback submitted successfully");
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to submit feedback";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateFeedback = createAsyncThunk(
  "feedback/updateFeedback",
  async ({ id, data }: { id: number; data: Record<string, any> }, { rejectWithValue }) => {
    try {
      const response = await FeedbackService.update(id, data);
      toast.success("Feedback updated successfully");
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to update feedback";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteFeedback = createAsyncThunk(
  "feedback/deleteFeedback",
  async (id: number, { rejectWithValue }) => {
    try {
      await FeedbackService.delete(id);
      toast.success("Feedback deleted successfully");
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to delete feedback";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.myFeedback = action.payload?.data || action.payload || [];
      })
      .addCase(fetchMyFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.allFeedback = action.payload?.data || action.payload || [];
      })
      .addCase(fetchAllFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.myFeedback.unshift(action.payload);
      });
  },
});

export const { clearError } = feedbackSlice.actions;
export default feedbackSlice.reducer;
