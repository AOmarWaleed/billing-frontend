import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import EmployeeService from "../services/employeeService";

import { toast } from "react-toastify";

interface EmployeeState {
  employees: any[];
  error: string | null;
  loading: boolean;
  page: number;
  limit: number;
  totalPages: number;
  sortField: string;
  sortOrder: string;
  total_count: number;
  selectedEmployeeId: number | null;
  employee?: any;
  nationalityCodeTypes: any[];
  maritalStatusCodeTypes: any[];
  occupationCodeTypes: any[];
  religionCodeTypes: any[];
  employeeJobCodeTypes: any[];
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  totalPages: 1,
  sortField: "employee_id",
  sortOrder: "desc",
  selectedEmployeeId: null,
  employee: undefined,
  total_count: 0,
  nationalityCodeTypes: [],
  maritalStatusCodeTypes: [],
  occupationCodeTypes: [],
  religionCodeTypes: [],
  employeeJobCodeTypes: [],
};

export const fetchEmployees = createAsyncThunk<
  { employees: any[]; total_count: number },
  {
    page: number;
    limit: number;
    sortBy: string;
    sortDirection: string;
    searchBasic: string;
    usePagedData?: boolean;
  }
>(
  "fetchEmployees",
  async (
    { page, limit, sortBy, sortDirection, searchBasic, usePagedData = true },
    { rejectWithValue }
  ) => {
    try {
      const response = await EmployeeService.getAll(
        page,
        limit,
        sortBy,
        sortDirection,
        searchBasic,
        usePagedData
      );
      return {
        total_count: response.data.pagination?.totalCount || response.data.length || 0,
        employees: response.data.data || response.data,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  }
);

export const fetchCodes = createAsyncThunk<{
  nationalityCodeTypes: any[];
  maritalStatusCodeTypes: any[];
  occupationCodeTypes: any[];
  religionCodeTypes: any[];
  employeeJobCodeTypes: any[];
}>("fetchCodes", async (_, { rejectWithValue }) => {
  try {
    const response = await EmployeeService.getCodes();
    return {
      nationalityCodeTypes: response.data.codes?.nationalityCodeTypes || [],
      maritalStatusCodeTypes: response.data.codes?.maritalStatusCodeTypes || [],
      occupationCodeTypes: response.data.codes?.occupationCodeTypes || [],
      religionCodeTypes: response.data.codes?.religionCodeTypes || [],
      employeeJobCodeTypes: response.data.codes?.employeeJobCodeTypes || [],
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
});

export const updateEmployee = createAsyncThunk<
  { employee: any },
  { id: any; data: any }
>("updateEmployee", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await EmployeeService.update(id, data);
    return { employee: response.data };
  } catch (error: any) {
    console.error("updateEmployee Error:", error);
    return rejectWithValue(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
});

export const createEmployee = createAsyncThunk<
  { employee: any },
  { data: any }
>("createEmployee", async ({ data }, { rejectWithValue }) => {
  try {
    const response = await EmployeeService.create(data);
    return { employee: response.data };
  } catch (error: any) {
    console.error("createEmployee Error:", error);
    return rejectWithValue(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
});

export const deleteEmployee = createAsyncThunk<{ id: any }, { id: any }>(
  "deleteEmployee",
  async ({ id }, { rejectWithValue }) => {
    try {
      await EmployeeService.delete(id);
      return { id };
    } catch (error: any) {
      console.error("deleteEmployee Error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  }
);

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setSelectedId: (state, action) => {
      state.selectedEmployeeId = action.payload;
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
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees.map((employee) => ({
          ...employee,
          id: employee.employee_id,
        }));
        state.selectedEmployeeId =
          state.employees.length > 0 ? state.employees[0].employee_id : null;
        state.total_count = action.payload.total_count;
        state.totalPages = Math.ceil(action.payload.total_count / state.limit);
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error occurred";
      })
      .addCase(fetchCodes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCodes.fulfilled, (state, action) => {
        state.loading = false;
        state.nationalityCodeTypes = action.payload.nationalityCodeTypes;
        state.maritalStatusCodeTypes = action.payload.maritalStatusCodeTypes;
        state.occupationCodeTypes = action.payload.occupationCodeTypes;
        state.religionCodeTypes = action.payload.religionCodeTypes;
        state.employeeJobCodeTypes = action.payload.employeeJobCodeTypes;
      })
      .addCase(fetchCodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error occurred";
      })
      .addCase(updateEmployee.pending, (state) => {
        state.loading = false;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const updatedEmployee = action.payload.employee;
        console.log("Updated employee:", updatedEmployee);
        state.employee = updatedEmployee;
        state.employees = state.employees.map((employee) =>
          employee.employee_id === updatedEmployee.employee_id
            ? { ...updatedEmployee, id: updatedEmployee.employee_id }
            : employee
        );
        toast.success("Saved Successfully!");
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error occurred";
        toast.error(`${action.payload}`);
      })
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter(
          (employee) => employee.employee_id !== action.payload.id
        );
        toast.success("Employee deleted successfully!");
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error occurred";
        toast.error(`${action.payload}`);
      })
      .addCase(createEmployee.pending, (state) => {
        state.loading = false;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        let newEmployee = action.payload.employee;
        newEmployee.id = newEmployee.employee_id;
        state.employee = newEmployee;
        state.employees.unshift(newEmployee);
        toast.success("Created a new Employee Successfully!");
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error occurred";
        toast.error(`${action.payload}`);
      });
  },
});

export const { setPage, setSelectedId, setLimit, setSortField, setSortOrder } =
  employeeSlice.actions;

export default employeeSlice.reducer;
