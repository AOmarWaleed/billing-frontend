import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// import api from "../../utils/Api";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store";
import { getgroups } from "process";
// import api from "api";
import api from "../../utils/Api";
import { ComponentStatesResponse, ResourceItem } from "../../types/ComponentStatesResponse";

export interface Page {
  menu_id: number;
  ar_text: string | null;
  en_text: string | null;
  display_text: string;
  parent_id: number | null;
  function_id: number | null;
  url: string | null;
  level: number;
  icon: string | null;
  disabled: boolean;
  created_by: string | null;
  creation_date: string;
  is_root: boolean;
  children: Page[];
}

interface ContentData {
  [contentType: string]: {
    [contentKey: string]: {
      text: string;
      disabled: 0 | 1;
    };
  };
}

interface State {
  pages: Page[];
  pagesTrans: any[];
  groups: any[];
  resourceTypes: any[];
  content: {
    [pageId: number]: ContentData;
  };
  resource: ComponentStatesResponse;
  isLoading: {
    getPages: boolean;
    getPageContent: boolean;
  };
  isError: {
    getPages: boolean;
    getPageContent: boolean;
  };
  error: string | null;
}

export const getPages = createAsyncThunk("trans/getPages", async (_, thunkAPI) => {
  try {
    // No need to manually set headers - the interceptor handles it
    // localStorage.getItem("lang")
    const { data } = await api.get("api/trans/menu?lang=" + localStorage.getItem("lang"));
    return data;
  } catch (err: any) {
    console.error("API Error:", err.response?.data || err.message);
    // The interceptor will automatically attempt token refresh on 401 errors
    return thunkAPI.rejectWithValue("Failed to fetch menu structure");
  }
});
export const switchLang = createAsyncThunk("trans/switchLang", async (lang: string, thunkAPI) => {
  try {
    // No need to manually set headers - the interceptor handles it
    const { data } = await api.get("api/trans/switchLang/" + lang);
    return data;
  } catch (err: any) {
    console.error("API Error:", err?.response?.data || err.message);
    // The interceptor will automatically attempt token refresh on 401 errors
    return thunkAPI.rejectWithValue("Failed to fetch menu structure");
  }
});

export const getPageContent = createAsyncThunk("trans/getPageContent", async (pageId: number, thunkAPI) => {
  try {
    // No need to manually set headers

    const { data } = await api.get(`api/trans/resources/${pageId}`);
    return { pageId, content: data.data };
  } catch (err) {
    // The interceptor will handle token refresh if needed
    return thunkAPI.rejectWithValue({
      msg: `Failed to fetch content for page ${pageId}`,
      pageId,
      err,
    });
  }
});

export const getPageContentWithoutGrouping = createAsyncThunk<ResourceItem[], { pageId: number }>("trans/getPageContentwihtoutgrouping", async ({ pageId }, { rejectWithValue }) => {
  try {
    // No need to manually set headers

    const result = await api.get(`api/trans/resources/page/${pageId}`);
    //console.log("resources " + JSON.stringify(result.data));
    return result.data;
  } catch (err) {
    // The interceptor will handle token refresh if needed
    return rejectWithValue({
      msg: `Failed to fetch content for page ${pageId}`,
      pageId,
      err,
    });
  }
});

export const getPagesTrans = createAsyncThunk("trans/getPagesTrans", async (_, thunkAPI) => {
  try {
    // No need to manually set headers - the interceptor handles it
    const { data } = await api.get("api/trans/pages");
    return data.data;
  } catch (err: any) {
    console.error("API Error:", err.response?.data || err.message);
    // The interceptor will automatically attempt token refresh on 401 errors
    return thunkAPI.rejectWithValue("getPagesTrans");
  }
});

export const getGroups = createAsyncThunk("trans/groups", async (_, thunkAPI) => {
  try {
    // No need to manually set headers - the interceptor handles it
    const { data } = await api.get("api/trans/groups");
    return data.data;
  } catch (err: any) {
    console.error("API Error:", err.response?.data || err.message);
    // The interceptor will automatically attempt token refresh on 401 errors
    return thunkAPI.rejectWithValue("groups");
  }
});

export const getResourceTypes = createAsyncThunk("trans/getResourceTypes", async (_, thunkAPI) => {
  try {
    // No need to manually set headers - the interceptor handles it
    const { data } = await api.get("api/trans/resourceTypes");
    return data.data;
  } catch (err: any) {
    console.error("API Error:", err.response?.data || err.message);
    // The interceptor will automatically attempt token refresh on 401 errors
    return thunkAPI.rejectWithValue("resourceTypes");
  }
});

const initialState: State = {
  pages: [],
  content: {},
  pagesTrans: [],
  resourceTypes: [],
  groups: [],
  resource: { resources: [] },
  isLoading: {
    getPages: false,
    getPageContent: false,
  },
  isError: {
    getPages: false,
    getPageContent: false,
  },
  error: null,
};

const transSlice = createSlice({
  name: "trans",
  initialState,
  reducers: {
    clearContent: (state, action: PayloadAction<number>) => {
      delete state.content[action.payload];
    },
    clearAllContent: (state) => {
      state.content = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // getPages reducers
      .addCase(getPages.pending, (state) => {
        state.pages = [];
        state.isLoading.getPages = true;
        state.isError.getPages = false;
        state.error = null;
      })
      .addCase(getPages.fulfilled, (state, action) => {
        state.isLoading.getPages = false;
        state.pages = action.payload.data || action.payload;
      })
      .addCase(getPages.rejected, (state, action) => {
        state.isLoading.getPages = false;
        state.isError.getPages = true;
        state.error = typeof action.payload === "string" ? action.payload : "Failed to load pages";
      })

      // getPageContent reducers
      .addCase(getPageContent.pending, (state) => {
        state.isLoading.getPageContent = true;
        state.isError.getPageContent = false;
        state.error = null;
      })
      .addCase(getPageContent.fulfilled, (state, action) => {
        state.isLoading.getPageContent = false;
        state.content[action.payload.pageId] = action.payload.content;
        // console.log("content", action.payload);
        // console.log("content", state.content[action.payload.pageId]);
      })
      .addCase(getPageContent.rejected, (state, action) => {
        state.isLoading.getPageContent = false;
        state.isError.getPageContent = true;
        state.error = typeof action.error.message || "Failed to load page content";
      })
      .addCase(getPageContentWithoutGrouping.fulfilled, (state, action) => {
        state.isLoading.getPageContent = false;
        state.resource.resources = action.payload;
      })
      .addCase(getPageContentWithoutGrouping.rejected, (state, action) => {
        state.isLoading.getPageContent = false;
        state.isError.getPageContent = true;
        state.error = typeof action.error.message || "Failed to load page content";
      });

    builder.addCase(getPagesTrans.fulfilled, (state, action) => {
      state.pagesTrans = action.payload;
    });

    builder.addCase(getResourceTypes.fulfilled, (state, action) => {
      state.resourceTypes = action.payload;
    });

    builder.addCase(getGroups.fulfilled, (state, action) => {
      state.groups = action.payload;
    });
  },
});

// Export actions and reducer
export const { clearContent, clearAllContent } = transSlice.actions;
export default transSlice.reducer;

// Selectors
export const selectPages = (state: { trans: State }) => state.trans.pages;
export const selectPageContent = (pageId: number) => (state: { trans: State }) => state.trans.content[pageId];

export const selectContentItem = (pageId: number, contentType: string, contentKey: string) => (state: { trans: State }) => {
  return state.trans.content[pageId]?.[contentType]?.[contentKey] || `[${contentType}.${contentKey}]`;
};

// Custom Hook
export const useTransSlice = () => {
  const dispatch = useDispatch<AppDispatch>();
  const pages = useSelector(selectPages);
  const isLoading = useSelector((state: { trans: State }) => state.trans.isLoading);
  const isError = useSelector((state: { trans: State }) => state.trans.isError);
  const error = useSelector((state: { trans: State }) => state.trans.error);

  const getContent = (pageId: number, contentType: string, contentKey: string) => useSelector(selectContentItem(pageId, contentType, contentKey));

  return {
    pages,
    getPages: () => dispatch(getPages()),
    getPageContent: async (pageId: number) => await dispatch(getPageContent(pageId)),
    getPageResources: async (pageId: number) => await dispatch(getPageContentWithoutGrouping({ pageId })),
    clearContent: (pageId: number) => dispatch(clearContent(pageId)),
    clearAllContent: () => dispatch(clearAllContent()),
    getContent,
    isLoading,
    isError,
    error,
  };
};
