// src/store/slices/configSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../utils/Api";
import { FormatKeys, DEFAULT_FORMATS } from "../../types/formateTypes";
import { RootState } from "../store";

interface FormatState {
  values: Record<FormatKeys, string>;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: FormatState = {
  values: DEFAULT_FORMATS as Record<FormatKeys, string>,
  loading: false,
  error: null,
  lastUpdated: null
};

interface ServerResponse {
  success: boolean;
  data: {
    DATE_FORMAT: string;
    TIMESTAMP_FORMAT: string;
    CURRENCY_SYMBOL: string;
    CURRENCY_DECIMALS: string;
    CURRENCY_THOUSAND_SEP: string;
    CURRENCY_DECIMAL_SEP: string;
    DATETIME_FORMAT: string;
  };
}

export const fetchAllFormats = createAsyncThunk(
  "config/fetchAllFormats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ServerResponse>("/api/formats");
      if (!response.data.success) {
        throw new Error("Server returned unsuccessful response");
      }
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load formats");
    }
  }
);

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setFormat: (
      state,
      action: PayloadAction<{ key: FormatKeys; value: string }>
    ) => {
      state.values[action.payload.key] = action.payload.value;
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFormats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFormats.fulfilled, (state, action) => {
        state.loading = false;
        // Only update the formats we received from server
        Object.keys(action.payload).forEach((key) => {
          const formatKey = key as FormatKeys;
          state.values[formatKey] = action.payload[formatKey];
        });
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAllFormats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Action creators
export const { setFormat } = configSlice.actions;

// Selectors
export const selectFormat = (key: FormatKeys) => (state: RootState) => 
  state.config.values[key];

export const selectDateFormat = (state: RootState) => 
  state.config.values.DATE_FORMAT;

export const selectDateTimeFormat = (state: RootState) =>
  state.config.values.DATETIME_FORMAT;

// export const selectCurrencyFormat = (state: RootState) => ({
//   symbol: state.config.values.CURRENCY_SYMBOL,
//   decimals: parseInt(state.config.values.CURRENCY_DECIMALS) || 2,
//   thousandSep: state.config.values.CURRENCY_THOUSAND_SEP,
//   decimalSep: state.config.values.CURRENCY_DECIMAL_SEP,
// });

export const selectAllFormats = (state: RootState) : Record<FormatKeys, string> => state.config.values;
//export const selectAllFormats = (state: RootState) => state.config.values;
export const selectFormatsLastUpdated = (state: RootState) => 
  state.config.lastUpdated;

export default configSlice.reducer;