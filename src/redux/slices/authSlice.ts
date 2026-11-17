import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDTO } from "../../types/UserDTO";
import { UserAuth } from "../../types/UserAuth";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: UserAuth | null;
  loading: boolean;
  error: string | null;
 
}

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  user: null,
  loading: false,
  error: null,
  
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    loginStart: (state) => {
      state.loading = true;
   //   state.isAuthenticated = false;
      state.error = null;
      
    },
    loginSuccess: (state, action: PayloadAction<{ accessToken: string; user: UserAuth }>) => {
      state.isAuthenticated = true;
      sessionStorage.setItem("Authenticated", "true");
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    //  console.log(state.user  , "state.user ");
      
      state.loading = false;
       
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    changeLanguageFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
       state.loading = false;
      state.isAuthenticated = false;
      sessionStorage.removeItem("Authenticated");
      state.accessToken = null;
      state.user = null;
      state.error = null;
    },
    tokenRefreshed: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
  },
});

export const { setLoading, loginStart, loginSuccess, loginFailure, logout, tokenRefreshed, changeLanguageFailure } = authSlice.actions;
export default authSlice.reducer;
