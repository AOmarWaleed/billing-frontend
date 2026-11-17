// order.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../utils/Api";
import { format } from "date-fns";
// import dayjs from 'dayjs';
// import { globalAxios } from '../../../Utils/api';

const FORMATE = "DD-MMM-YYYY";

interface OrderState {
  orderFilter: {
    startDate: string;
    endDate: string | null;
    patientId: string | null;
    episodeNo: string | null;
  };
  searchClicked: boolean;

  orderDetails: any;

  selectedOrder: any;
  selectedOrderDetails: any;

  error: any;
  isLoading: any;

  selectedTransId: number | string;
}

const initialState: OrderState = {
  orderDetails: {},
  isLoading: {},
  selectedOrder: null,
  selectedOrderDetails: null,
  error: {},
  selectedTransId: 0,
  orderFilter: {
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: null,
    patientId: null,
    episodeNo: null,
  },
  searchClicked: false,
};

// Async Thunks

export const getOrderDetails = createAsyncThunk(
  "order/getOrderDetails",
  async (order_id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: any }>(`/api/order/${order_id}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setSearchClicked: (state, action: PayloadAction<boolean>) => {
      state.searchClicked = action.payload;
    },
    setOrderFilter: (
      state,
      action: PayloadAction<Partial<OrderState["orderFilter"]>>
    ) => {
      state.orderFilter = { ...state.orderFilter, ...action.payload };
    },
    setSelectedOrder: (state, action: PayloadAction<any>) => {
      state.selectedOrder = action.payload;
    },

    setSelectedOrderDetails: (state, action: PayloadAction<any>) => {
      state.selectedOrderDetails = action.payload;
    },

    setSelectedTransId: (state, action: PayloadAction<number | string>) => {
      state.selectedTransId = action.payload;
    },

    resetOrderState: () => initialState,
  },
  extraReducers: (builder) => {
    // getOrderDetails
    builder
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading.getOrderDetails = true;
        state.error.getOrderDetails = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading.getOrderDetails = false;
        state.orderDetails = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading.getOrderDetails = false;
        state.error.getOrderDetails = action.payload as string;
      });
  },
});

export const {
  setSelectedOrder,
  setSearchClicked,
  setSelectedOrderDetails,
  resetOrderState,
  setOrderFilter,
} = orderSlice.actions;

export default orderSlice.reducer;
