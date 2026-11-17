import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import PayersService from "../services/PayersService";
import { toast } from "react-toastify";
import { Payer } from "../../types/Payer";

interface PayerState {
  payers: Payer[];
  payer: any;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalPages: number;
  total_count: number;
  selectedPayerId: number | null;
  nphiesCodeTypes: any[];
  tpaCodeTypes: any[];
  shadowBillingCodeTypes: any[];
  sortField: string;
  sortOrder: string;
}

// Initial State
const initialState: PayerState = {
  payers: [],
  payer: null,
  loading: false,
  error: null,
  page: 1,
  limit: 12,
  totalPages: 0,
  total_count: 0,
  selectedPayerId: null,
  nphiesCodeTypes: [],
  tpaCodeTypes: [],
  shadowBillingCodeTypes: [],
  sortField: "payer_id",
  sortOrder: "desc",
};

export const fetchPayers = createAsyncThunk<
  {
    total_count: number;
    payers: Payer[];
    nphiesCodeTypes: any[];
    tpaCodeTypes: any[];
    shadowBillingCodeTypes: any[];
  },
  {
    page: number;
    limit: number;
    sortField: string;
    sortOrder: string;
    searchField: string;
  }
>(
  "fetchPayers",
  async (
    { page, limit, sortField, sortOrder, searchField },
    { rejectWithValue },
  ) => {
    try {
      const response = await PayersService.getAll(
        page,
        limit,
        sortField,
        sortOrder,
        searchField,
      );
      return {
        total_count: response.data.total_count,
        payers: response.data.payers,
        nphiesCodeTypes: response.data.nphiesCodeTypes,
        tpaCodeTypes: response.data.tpaCodeTypes,
        shadowBillingCodeTypes: response.data.shadowBillingCodeTypes,
      };
    } catch (error: any) {
      console.error("API Error:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  },
);

export const updatePayer = createAsyncThunk<
  { payer: any },
  { id: number; data: any }
>("updatePayer", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await PayersService.update(id, data);
    return { payer: response.data };
  } catch (error: any) {
    console.error(error);
    return rejectWithValue(
      error.response?.data?.error || error.message || "Something went wrong",
    );
  }
});

export const deletePayer = createAsyncThunk<{ payer: any }, { id: number }>(
  "deletePayer",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await PayersService.delete(id);
      return { payer: response.data };
    } catch (error: any) {
      console.error(error);
      return rejectWithValue(
        error.response?.data?.error || error.message || "Something went wrong",
      );
    }
  },
);

export const createPayer = createAsyncThunk<{ payer: any }, { data: any }>(
  "createPayer",
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await PayersService.create(data);
      return { payer: response.data };
    } catch (error: any) {
      console.error(error);
      return rejectWithValue(
        error.response?.data?.error || error.message || "Something went wrong",
      );
    }
  },
);

const payerSlice = createSlice({
  name: "payers",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setSelectedId: (state, action) => {
      state.selectedPayerId = action.payload;
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
  },
  extraReducers: (builder) => {
    builder
      // fetchPayers
      .addCase(fetchPayers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPayers.fulfilled, (state, action) => {
        state.loading = false;
        state.payers = action.payload.payers.map((payer) => ({
          ...payer,
          id: payer.payer_id,
        }));
        // if (action.payload.payers.length > 0) {
        //   console.log("payer id after fetching: ", state.payers[0].payer_id);
        //   state.selectedPayerId = state.payers[0].payer_id;
        // } else {
        //   state.selectedPayerId = null;
        // }

        state.total_count = action.payload.total_count;
        state.totalPages = Math.ceil(action.payload.total_count / state.limit);
        state.nphiesCodeTypes = action.payload.nphiesCodeTypes;
        state.tpaCodeTypes = action.payload.tpaCodeTypes;
        state.shadowBillingCodeTypes = action.payload.shadowBillingCodeTypes;
      })
      .addCase(fetchPayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error occurred";
      })

      // fetchPayerById
      .addCase(updatePayer.pending, (state) => {
        state.loading = false;
      })

      .addCase(updatePayer.fulfilled, (state, action) => {
        const updatedPayer = action.payload.payer; // Extract "payer" from payload
        console.log("Updated Payer:", updatedPayer);

        state.payer = updatedPayer;

        // Update payers list
        state.payers = state.payers.map((payer) =>
          payer.payer_id === updatedPayer.payer_id ? updatedPayer : payer,
        );

        state.payers = state.payers.map((payer) => ({
          ...payer,
          id: payer.payer_id,
        }));
        toast.success("Saved Successfully!");
      })

      .addCase(updatePayer.rejected, (state, action) => {
        state.loading = false;
        console.log("action.error", action.error);
        console.log("action.error", action.error);

        state.error = action.error.message ?? "Error occurred";
        toast.error(`${action.payload}`);
      })

      // createPayer
      .addCase(createPayer.pending, (state) => {
        state.loading = true;
      })

      .addCase(createPayer.fulfilled, (state, action) => {
        state.loading = false;
        let newPayer = action.payload.payer;
        newPayer.id = newPayer.payer_id;
        state.payer = newPayer;
        state.payers.unshift(newPayer);
        state.payers = state.payers.slice(0, 10);
        toast.success("Created a new Payer Successfully!");
      })

      .addCase(createPayer.rejected, (state, action) => {
        state.loading = false;
        console.log("action.error createPayer", action.error);
        console.log("action.error createPayer", action.error);

        state.error = action.error.message ?? "Error occurred createPayer";
        toast.error(`${action.payload}`);
      })

      // delete payer
      .addCase(deletePayer.pending, (state) => {
        state.loading = false;
      })
      .addCase(deletePayer.fulfilled, (state, action) => {
        const deletedPayer = action.payload.payer;
        console.log("deletedPayer Payer:", deletedPayer);

        state.payers = state.payers.filter(
          (payer) => payer.payer_id !== deletedPayer.payer_id,
        );

        state.payers = state.payers.map((payer) => ({
          ...payer,
          id: payer.payer_id,
        }));
        toast.success("Deleted!");
      })
      .addCase(deletePayer.rejected, (state, action) => {
        state.loading = false;
        console.log("action.error", action.error);
        console.log("action.error", action.error);

        state.error = action.error.message ?? "Error occurred";
        toast.error(`${action.payload}`);
      });
  },
});

export const { setPage, setSelectedId, setLimit, setSortField, setSortOrder } =
  payerSlice.actions;
export default payerSlice.reducer;
