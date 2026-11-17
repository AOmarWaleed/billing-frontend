import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../utils/Api";
import { format } from "date-fns";


interface InvoiceFilter {
  startDate: string;
  endDate: string | null;
  invoiceNo: string;
  payerId: string | null;
  payerType: string;
  zatcaStatus: string;
  transType: string;
}

interface InvoiceState {
  invoiceFilter: InvoiceFilter;
  searchClicked: boolean;

  invoiceDetails: any;
  selectedInvoice: any;
  selectedInvoiceDetails: any;

  error: any;
  isLoading: any;

  selectedTransId: number | string;
}

const initialState: InvoiceState = {
  invoiceDetails: {},
  isLoading: {},
  selectedInvoice: null,
  selectedInvoiceDetails: null,
  error: {},
  selectedTransId: 0,
  invoiceFilter: {
    // startDate: format(new Date(), "yyyy-MM-dd"),
    startDate: new Date().toISOString(),
    endDate: null,
    invoiceNo: "",
    payerId: null,
    payerType: "",
    zatcaStatus: "",
    transType: "",
  },
  searchClicked: false,
};

// Async Thunks
export const getInvoiceDetails = createAsyncThunk(
  "invoice/getInvoiceDetails",
  async (invoice_id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: any }>(`/api/invoice/${invoice_id}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setSearchClicked: (state, action: PayloadAction<boolean>) => {
      state.searchClicked = action.payload;
    },

    setInvoiceFilter: (
      state,
      action: PayloadAction<Partial<InvoiceState["invoiceFilter"]>>
    ) => {
      state.invoiceFilter = { ...state.invoiceFilter, ...action.payload };
    },

    setSelectedInvoice: (state, action: PayloadAction<any>) => {
      state.selectedInvoice = action.payload;
    },

    setSelectedInvoiceDetails: (state, action: PayloadAction<any>) => {
      state.selectedInvoiceDetails = action.payload;
    },

    setSelectedTransId: (state, action: PayloadAction<number | string>) => {
      state.selectedTransId = action.payload;
    },

    resetInvoiceState: () => initialState,
  },

  extraReducers: (builder) => {
    // getInvoiceDetails
    builder
      .addCase(getInvoiceDetails.pending, (state) => {
        state.isLoading.getInvoiceDetails = true;
        state.error.getInvoiceDetails = null;
      })
      .addCase(getInvoiceDetails.fulfilled, (state, action) => {
        state.isLoading.getInvoiceDetails = false;
        state.invoiceDetails = action.payload;
      })
      .addCase(getInvoiceDetails.rejected, (state, action) => {
        state.isLoading.getInvoiceDetails = false;
        state.error.getInvoiceDetails = action.payload as string;
      });
  },
});

export const {
  setSearchClicked,
  setInvoiceFilter,
  setSelectedInvoice,
  setSelectedInvoiceDetails,
  setSelectedTransId,
  resetInvoiceState,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
