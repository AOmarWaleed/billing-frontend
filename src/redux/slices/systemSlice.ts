import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import api from "../../utils/Api";



export interface SystemRule {
  conf_key: string,
  conf_value: string,
  description: string,
  module_id: string,
  facility_id?: number | string,
  rule_id ?: string
}

interface State {
  modules: any[] ;
  systemRules: SystemRule[] | null;
  selectedRule: null | SystemRule;
  isLoading: {
    getRulesReq: boolean;
    addRuleReq: boolean;
    updateRuleReq: boolean;
    deleteRuleReq: boolean;
  };
  isError: {
    getRulesReq: boolean;
    addRuleReq: boolean;
    updateRuleReq: boolean;
    deleteRuleReq: boolean;
  };
  error: any;
}

export const getSystemRules = createAsyncThunk(
  "systemRules/get",
  async (data: any, thunkAPI) => {
    const {limit = 20 , page = 1 , params } = data ;
    try {
      const { data } = await api.get(`api/systemRules`,{params : { limit , page , ...params  }});
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        msg: "Failed to fetch system rules",
        err,
      });
    }
  }
);
export const getModules = createAsyncThunk(
  "modules/get",
  async (_, thunkAPI) => {
  
    try {
      const { data } = await api.get(`api/modules`);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        msg: "Failed to fetch modules ",
        err,
      });
    }
  }
);

export const addSystemRule = createAsyncThunk(
  "systemRules/add",
  async (newRule: SystemRule, thunkAPI) => {
    try {
      const { data } = await api.post(`api/systemRules`, newRule);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        msg: "Failed to add system rule",
        err,
      });
    }
  }
);

export const updateSystemRule = createAsyncThunk(
  "systemRules/update",
  async (
    { conf_key, updatedRule }: { conf_key: string; updatedRule: Partial<SystemRule> },
    thunkAPI
  ) => {
    try {
      const { data } = await api.put(`api/systemRules/${conf_key}`, updatedRule);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        msg: "Failed to update system rule",
        err,
      });
    }
  }
);

export const resetSystemRule = createAsyncThunk(
  "systemRules/reset",
  async (
    {
      conf_key,
      facility_id,
    }: {
      conf_key: string;
      facility_id?: number | string;
    },
    thunkAPI
  ) => {
    try {
      const { data } = await api.post(`api/systemRules/reset/${conf_key}`, {}, {
        params:
          facility_id !== undefined && facility_id !== null
            ? { facility_id }
            : {},
      });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        msg: "Failed to reset system rule",
        err,
      });
    }
  }
);

export const deleteSystemRule = createAsyncThunk(
  "systemRules/delete",
  async (
    {
      conf_key,
      facility_id,
    }: {
      conf_key: string;
      facility_id?: number | string;
    },
    thunkAPI
  ) => {
    try {
      const params: Record<string, any> = {};
      if (facility_id !== undefined && facility_id !== null) {
        params.facility_id = facility_id;
      }
      await api.delete(`api/systemRules/${conf_key}`, { params });
      return conf_key;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        msg: "Failed to delete system rule",
        err,
      });
    }
  }
);

const systemRulesSlice = createSlice({
  name: "systemRules",
  initialState: {
    modules: [],
    systemRules: null,
    selectedRule: null,
    isLoading: {
      getRulesReq: false,
      addRuleReq: false,
      updateRuleReq: false,
      deleteRuleReq: false,
    },
    isError: {
      getRulesReq: false,
      addRuleReq: false,
      updateRuleReq: false,
      deleteRuleReq: false,
    },
    error: {},
  } as State,
  reducers: {
    updateSelectedRule: (state, action: PayloadAction<SystemRule | null>) => {
      state.selectedRule = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSystemRules.pending, (state) => {
      state.isLoading.getRulesReq = true;
    });
    builder.addCase(
      getSystemRules.fulfilled,
      (state, action: PayloadAction<{ data: SystemRule[] }>) => {
        state.isLoading.getRulesReq = false;
        state.systemRules = action.payload.data;
      }
    );
    builder.addCase(getSystemRules.rejected, (state, action) => {
      state.isLoading.getRulesReq = false;
      state.isError.getRulesReq = true;
      state.error.getRulesReq = action.error;
    });

    builder.addCase(addSystemRule.pending, (state) => {
      state.isLoading.addRuleReq = true;
    });
    builder.addCase(
      addSystemRule.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading.addRuleReq = false;
        if (state.systemRules) state.systemRules.push(action.payload.data);
      }
    );
    builder.addCase(addSystemRule.rejected, (state, action) => {
      state.isLoading.addRuleReq = false;
      state.isError.addRuleReq = true;
      state.error.addRuleReq = action.error;
    });

    builder.addCase(updateSystemRule.pending, (state) => {
      state.isLoading.updateRuleReq = true;
    });
    builder.addCase(
      updateSystemRule.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading.updateRuleReq = false;
        if (state.systemRules) {
          state.systemRules = state.systemRules.map((rule) =>
            rule.rule_id === action.payload.data.rule_id
              ? action.payload.data
              : rule
          );
        }
      }
    );
    builder.addCase(updateSystemRule.rejected, (state, action) => {
      state.isLoading.updateRuleReq = false;
      state.isError.updateRuleReq = true;
      state.error.updateRuleReq = action.error;
    });

    builder.addCase(deleteSystemRule.pending, (state) => {
      state.isLoading.deleteRuleReq = true;
    });
    builder.addCase(
      deleteSystemRule.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.isLoading.deleteRuleReq = false;
        if (state.systemRules) {
          state.systemRules = state.systemRules.filter(
            (rule) => rule.rule_id !== action.payload
          );
        }
      }
    );
    builder.addCase(deleteSystemRule.rejected, (state, action) => {
      state.isLoading.deleteRuleReq = false;
      state.isError.deleteRuleReq = true;
      state.error.deleteRuleReq = action.error;
    });





    // modules
    builder.addCase(
      getModules.fulfilled,
      (state, action: PayloadAction<any>) => {
        
       state.modules = action.payload;
      }
    );
  },
});

export default systemRulesSlice.reducer;
const { updateSelectedRule } = systemRulesSlice.actions;

export function useSystemRulesSlice() {
  const systemRulesSliceData = useSelector(
    (store: RootState) => store.systemRules
  );
  const dispatch = useDispatch<AppDispatch>();

  //! sync
  function updateSelectedRuleFn(value: SystemRule | null) {
    return dispatch(updateSelectedRule(value));
  }

  //! async
  function getSystemRulesFn(data: any) {
    return dispatch(getSystemRules(data));
  }

  function addSystemRuleFn(newRule: SystemRule) {
    return dispatch(addSystemRule(newRule));
  }

  function updateSystemRuleFn(conf_key: string, updatedRule: Partial<SystemRule>) {
    return dispatch(updateSystemRule({ conf_key, updatedRule }));
  }

  function resetSystemRuleFn(data: {
    conf_key: string;
    facility_id?: number | string;
  }) {
    return dispatch(resetSystemRule(data));
  }

  function deleteSystemRuleFn(data: {
    conf_key: string;
    facility_id?: number | string;
  }) {
    return dispatch(deleteSystemRule(data));
  }
  function getModulesFn() {
    return dispatch(getModules());
  }

  return {
    getModulesFn ,
    updateSelectedRuleFn,
    getSystemRulesFn,
    addSystemRuleFn,
    updateSystemRuleFn,
    deleteSystemRuleFn,
    resetSystemRuleFn,
    systemRulesSliceData,
  };
}
