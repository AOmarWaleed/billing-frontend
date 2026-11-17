import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import PackageSetupService from "../services/PackageSetupService";
import {
  Package,
  PackageResponse,
  Payer,
  Item,
  LimitCategoryPayload,
} from "../../types/PackageSetup";
import { Category } from "../../types/ItemGroupIndex";
import api from "../../utils/Api";
import { clear } from "console";

interface PackageSetupState {
  packages: Package[];
  selectedPackage: Package | null;
  page: number;
  limit: number;
  sortField: string;
  sortOrder: string;
  totalPages: number;
  totalItems: number;
  payers: Payer[];
  itemList: Item[];
  category: Category[];
  loading: boolean;
  error: string | null;
  fetchError: string | null;
  selectedItem: any;
}

const initialState: PackageSetupState = {
  packages: [],
  selectedItem: null,
  selectedPackage: null,
  page: 1,
  limit: 15,
  sortField: "package_item_id",
  sortOrder: "desc",
  totalPages: 0,
  totalItems: 0,
  payers: [],
  itemList: [],
  category: [],
  loading: false,
  error: null,
  fetchError: null,
};

// Async thunks
export const fetchPackages = createAsyncThunk(
  "packageSetup/fetchPackages",
  async (
    params: {
      page?: number;
      limit?: number;
      sortField?: string;
      sortOrder?: string;
      searchField?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      console.log("*****");

      const response = await PackageSetupService.getPackages(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch packages"
      );
    }
  }
);

export const fetchPackagesDeps = createAsyncThunk(
  "packageSetup/fetchPackagesDeps",
  async (_, { rejectWithValue }) => {
    try {
      console.log("*****");

      const response = await PackageSetupService.getDeps();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to getDeps"
      );
    }
  }
);

export const createPackage = createAsyncThunk(
  "packageSetup/createPackage",
  async (packageData: Partial<Package>, { rejectWithValue }) => {
    try {
      const response = await PackageSetupService.createPackage(packageData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create package"
      );
    }
  }
);

export const updatePackage = createAsyncThunk(
  "packageSetup/updatePackage",
  async (
    {
      package_item_id,
      data,
    }: { package_item_id: string; data: Partial<Package> },
    { rejectWithValue }
  ) => {
    try {
      const response = await PackageSetupService.updatePackage(
        package_item_id,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update package"
      );
    }
  }
);

// Delete parent package
export const deleteParentPackage = createAsyncThunk(
  "packageSetup/deleteParentPackage",
  async (package_item_id: string, { rejectWithValue }) => {
    try {
      const response = await PackageSetupService.deleteParentPackage(
        package_item_id
      );
      return response.data; // { deletedId, type: "parent", message }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to delete parent package"
      );
    }
  }
);

// Delete child (limited/excluded)
export const deleteChildPackage = createAsyncThunk(
  "packageSetup/deleteChildPackage",
  async (package_item_id: string, { rejectWithValue }) => {
    try {
      const response = await PackageSetupService.deleteChildPackage(
        package_item_id
      );
      return response.data; // { deletedId, type: "limited" | "excluded", message }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to delete child package"
      );
    }
  }
);

export const fetchCodeDataListByCodeType = createAsyncThunk(
  "code/fetchCodeDataListByCodeType",
  async (id: string | number, { rejectWithValue }) => {
    try {
      const response = await PackageSetupService.getCodeDataListByCodeType(id);
      return response.data; // backend should return JSON list
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch code list"
      );
    }
  }
);

// Add item to package
export const addItemToPackage = createAsyncThunk(
  "packageSetup/addItemToPackage",
  async (packageData: Partial<Package>, { rejectWithValue }) => {
    try {
      const response = await PackageSetupService.limitItemInPackage(
        packageData
      );
      return response.data; // should return updated package
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to add item"
      );
    }
  }
);

// Exclude item from package
export const excludeItemFromPackage = createAsyncThunk(
  "packageSetup/excludeItemFromPackage",
  async (packageData: Partial<Package>, { rejectWithValue }) => {
    try {
      const response = await PackageSetupService.excludeItemFromPackage(
        packageData
      );
      return response.data; // should return updated package
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to exclude item"
      );
    }
  }
);

export const limitCategoryInPackage = createAsyncThunk(
  "packageSetup/limitCategoryInPackage",
  async (packageData: any, { rejectWithValue }) => {
    try {
      const response = await PackageSetupService.limitCategoryInPackageService(
        packageData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to save category limit"
      );
    }
  }
);
export const updateItem = createAsyncThunk(
  "packageSetup/updateItem",
  async (packageData: any, { rejectWithValue }) => {
    try {
      const response = await PackageSetupService.updateItemService(
        packageData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to save category limit"
      );
    }
  }
);

export const getPackageById = createAsyncThunk(
  "packageSetup/getPackageById",
  async (packageId: string | number, { rejectWithValue }) => {
    try {
      const response = await PackageSetupService.getPackageById(packageId);
      return response.data; // backend should return the package object
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error ||
          error.message ||
          "Failed to fetch package"
      );
    }
  }
);

const packageSetupSlice = createSlice({
  name: "packageSetup",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    setSortField: (state, action) => {
      state.sortField = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setSelectedPackage: (state, action: PayloadAction<Package | null>) => {
      state.selectedPackage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedItem(state, action) {
      state.selectedItem = action.payload;
    },
    clearSelectedItem(state) {
      state.selectedItem = null;
    },
    addPackage(state, action: PayloadAction<Package>) {
      state.packages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch packages
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
        state.fetchError = null;
      })
      .addCase(
        fetchPackagesDeps.fulfilled,
        (state, action: PayloadAction<PackageResponse>) => {
          // state.loading = false;
          console.log("fetchPackagesDeps********");

          state.payers = action.payload.payers;
          state.itemList = action.payload.items;
        }
      )
      .addCase(
        fetchPackages.fulfilled,
        (state, action: PayloadAction<PackageResponse>) => {
          state.loading = false;
          console.log("fetchPackages********");

          state.packages = action.payload.packages;
          state.totalPages = action.payload.totalPages;
          state.totalItems = action.payload.totalItems;
          state.page = action.payload.currentPage;
          state.payers = action.payload.payers;
          state.itemList = action.payload.items;
          // Auto-select first package if none selected
          if (!state.selectedPackage && action.payload.packages.length > 0) {
            state.selectedPackage = action.payload.packages[0];
          }
        }
      )
      .addCase(fetchPackages.rejected, (state, action) => {
        state.loading = false;
        state.fetchError = action.payload as string;
      })

      // Create package
      .addCase(
        createPackage.fulfilled,
        (state, action: PayloadAction<Package>) => {
          state.packages.unshift(action.payload);
          state.totalItems += 1;
          state.totalPages = Math.ceil(state.totalItems / state.limit);
        }
      )

      // Update package
      .addCase(
        updatePackage.fulfilled,
        (state, action: PayloadAction<Package>) => {
          const updatedPackage = action.payload;
          const index = state.packages.findIndex(
            (pkg) => pkg.package_item_id === updatedPackage.package_item_id
          );

          if (index !== -1) {
            state.packages[index] = updatedPackage;
          }

          if (
            state.selectedPackage?.package_item_id ===
            updatedPackage.package_item_id
          ) {
            state.selectedPackage = updatedPackage;
          }
        }
      )

      // Delete package
      .addCase(deleteParentPackage.fulfilled, (state, action) => {
        const { deletedId } = action.payload;

        state.packages = state.packages.filter(
          (pkg) => String(pkg.package_item_id) !== String(deletedId)
        );

        state.totalItems = Math.max(0, state.totalItems - 1);
        state.totalPages = Math.ceil(state.totalItems / state.limit) || 1;

        if (state.page > state.totalPages) {
          state.page = state.totalPages;
        }

        if (state.selectedPackage?.package_item_id === deletedId) {
          state.selectedPackage = state.packages[0] || null;
        }
      })
      .addCase(deleteChildPackage.fulfilled, (state, action) => {
        const { parent } = action.payload; // backend sends the updated parent

        if (!parent) return;
        // 🔹 Update selectedPackage
        state.selectedPackage = parent;
        // 🔹 Update the same package in the list
        state.packages = state.packages.map((pkg) =>
          String(pkg.package_item_id) === String(parent.package_item_id)
            ? parent
            : pkg
        );
      })
      .addCase(fetchCodeDataListByCodeType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCodeDataListByCodeType.fulfilled, (state, action) => {
        state.loading = false;
        state.category = action.payload.codedata;
      })
      .addCase(fetchCodeDataListByCodeType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addItemToPackage.fulfilled, (state, action) => {
        state.selectedPackage = action.payload;
        // 🔹 Update the same package in the list
        const index = state.packages.findIndex(
          (pkg) =>
            String(pkg.package_item_id) ===
            String(action.payload.package_item_id)
        );

        if (index !== -1) {
          Object.assign(state.packages[index], action.payload);
        }
      })
      .addCase(addItemToPackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(excludeItemFromPackage.fulfilled, (state, action) => {
        state.selectedPackage = action.payload;
        // 🔹 Update the same package in the list
        state.packages = state.packages.map((pkg) =>
          String(pkg.package_item_id) === String(action.payload.package_item_id)
            ? action.payload
            : pkg
        );
      })
      .addCase(excludeItemFromPackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(limitCategoryInPackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(limitCategoryInPackage.fulfilled, (state, action: any) => {
        state.loading = false;

        // 🔹 Replace selectedPackage with what backend returned
        state.selectedPackage = action.payload;

        // 🔹 Update packages list too
        state.packages = state.packages.map((pkg) =>
          String(pkg.package_item_id) === String(action.payload.package_item_id)
            ? action.payload
            : pkg
        );
      })
      .addCase(limitCategoryInPackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })




      .addCase(updateItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action: any) => {
        state.loading = false;

        // 🔹 Replace selectedPackage with what backend returned
        state.selectedPackage = action.payload;

        // 🔹 Update packages list too
        state.packages = state.packages.map((pkg) =>
          String(pkg.package_item_id) === String(action.payload.package_item_id)
            ? action.payload
            : pkg
        );
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      .addCase(getPackageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPackageById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPackage = action.payload; // replace with backend response
      })
      .addCase(getPackageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // .addCase(updateItem.fulfilled, (state, action) => {
    //   state.selectedPackage = action.payload;
    // })
  },
});

export const {
  setPage,
  setLimit,
  setSelectedPackage,
  clearError,
  clearSelectedItem,
  setSelectedItem,
  addPackage,
} = packageSetupSlice.actions;
export default packageSetupSlice.reducer;
