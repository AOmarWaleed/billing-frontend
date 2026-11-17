import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import PatientsService from "../services/PatientsService";
import { toast } from "react-toastify";

interface PatientState {
  patients: any[];
  patient: any;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalPages: number;
  total_count: number;
  selectedPatientId: number | null;
  nationalityCodeTypes: any[];
  maritalStatusCodeTypes: any[];
  occupationCodeTypes: any[];
  identityCodeTypes: any[];
  religionCodeTypes: any[];
  genderCodeTypes: any[];
  sortField: string;
  sortOrder: string;
}

const initialState: PatientState = {
  patients: [],
  patient: null,
  loading: false,
  error: "",
  page: 1,
  limit: 11,
  totalPages: 0,
  total_count: 0,
  selectedPatientId: null,
  nationalityCodeTypes: [],
  maritalStatusCodeTypes: [],
  occupationCodeTypes: [],
  identityCodeTypes: [],
  religionCodeTypes: [],
  genderCodeTypes: [],
  sortField: "patient_id",
  sortOrder: "desc",
};

export const fetchPatientsCodeTypes = createAsyncThunk(
  "patients/fetchPatientsCodeTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await PatientsService.fetchPatientsCodeTypes();
      console.log("fetchPatientsCodeTypes response:", response);
      return response.data.data; // Access nested data property
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch patient code types",
      );
    }
  },
);

export const fetchPatients = createAsyncThunk<
  { total_count: number; patients: any[] },
  {
    page: number;
    limit: number;
    sortField: string;
    sortOrder: string;
    searchField: string;
  }
>(
  "fetchPatients",
  async (
    { page, limit, sortField, sortOrder, searchField },
    { rejectWithValue },
  ) => {
    try {
      const response = await PatientsService.getAll(
        page,
        limit,
        sortField,
        sortOrder,
        searchField,
      );

      // Access data from response.data.data
      const result = {
        total_count: response.data.data.total_count,
        patients: response.data.data.data,
      };

      return result;
    } catch (error: any) {
      console.error("fetchPatients Error:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  },
);

export const updatePatient = createAsyncThunk<
  { patient: any },
  { id: any; data: any }
>("updatePatient", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await PatientsService.update(id, data);
    // response.data = { sucess: true, data: <patient row>, msg: "Success" }
    return { patient: response.data.data };
  } catch (error: any) {
    console.error("updatePatient Error:", error);
    return rejectWithValue(
      error.message ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Something went wrong",
    );
  }
});

export const createPatient = createAsyncThunk<{ patient: any }, { data: any }>(
  "createPatient",
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await PatientsService.create(data);
      return { patient: response.data };
    } catch (error: any) {
      console.error("createPatient Error:", error);
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  },
);

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setSelectedId: (state, action) => {
      state.selectedPatientId = action.payload;
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
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPatientsCodeTypes
      .addCase(fetchPatientsCodeTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientsCodeTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.nationalityCodeTypes = action.payload.nationalityCodeTypes || [];
        state.maritalStatusCodeTypes =
          action.payload.maritalStatusCodeTypes || [];
        state.occupationCodeTypes = action.payload.occupationCodeTypes || [];
        state.identityCodeTypes = action.payload.identityCodeTypes || [];
        state.religionCodeTypes = action.payload.religionCodeTypes || [];
        state.genderCodeTypes = action.payload.genderCodeTypes || [];
      })
      .addCase(fetchPatientsCodeTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchPatients
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload.patients.map((patient) => ({
          ...patient,
          id: patient.patient_id,
        }));
        state.total_count = action.payload.total_count;
        state.totalPages = Math.ceil(action.payload.total_count / state.limit);

        if (action.payload.patients.length > 0) {
          state.selectedPatientId = action.payload.patients[0].patient_id;
        } else {
          state.selectedPatientId = null;
        }
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error occurred";
      })
      // updatePatient
      .addCase(updatePatient.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        const updatedPatient = {
          ...action.payload.patient,
          id: action.payload.patient.patient_id,
        };

        const index = state.patients.findIndex(
          (item) => item.patient_id === updatedPatient.patient_id,
        );
        if (index !== -1) {
          state.patients[index] = updatedPatient;
        }

        toast.success("Saved Successfully!");
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "error occured";
      })
      // createPatient
      .addCase(createPatient.pending, (state) => {
        state.loading = false;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        let newPatient = action.payload.patient;
        newPatient.id = newPatient.patient_id;
        state.patient = newPatient;
        state.patients.unshift(newPatient);
        state.patients = state.patients.slice(0, 10);
        toast.success("Created a new Patient Successfully!");
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error occurred createPatient";
        // toast.error(`${action.payload}`);
      });
  },
});

export const {
  setPage,
  setSelectedId,
  setLimit,
  setSortField,
  setSortOrder,
  clearError,
} = patientSlice.actions;
export default patientSlice.reducer;
