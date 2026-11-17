// services/authService.ts
import axios from "axios";
import { AppDispatch } from "../store";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  tokenRefreshed,
  setLoading,
} from "../slices/authSlice";
import api from "../../utils/Api";
import apiNphies from "../../utils/ApiNphies";
import { jwtDecode } from "jwt-decode";


export const login =
  (userName: string, password: string) => async (dispatch: AppDispatch) => {
    dispatch(loginStart());
    try {
      const response = await api.post(
        `api/auth/login`,
        {
          userName,
          password,
        }
        // {
        //   withCredentials: true, // Necessary for cookies
        //   // headers: {
        //   //   "Content-Type": "application/json",
        //   // },
        // }
      );

      const { accessToken, user } = response.data;

      // Store in Redux (memory)
      dispatch(loginSuccess({ accessToken, user }));

      // Optionally store in sessionStorage
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("lang", user.language);
      sessionStorage.setItem("dir", user.language == "ar" ? "rtl" : "ltr");

      // Set axios default headers
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      apiNphies.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
    } catch (error: any) {
      console.error("Login error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        stack: error.stack,
      });

      dispatch(
        loginFailure(
          error.response?.data?.message ||
            error.message ||
            "Network error. Please try again."
        )
      );
    }
  };

export const refreshAccessToken = () => async (dispatch: AppDispatch) => {
  try {
    const response = await api.post(
      `api/auth/refresh-token`,

      {
        withCredentials: true,
      }
    );

    const { accessToken } = response.data;

    // Update Redux and sessionStorage
    dispatch(tokenRefreshed(accessToken));
    sessionStorage.setItem("accessToken", accessToken);

    // Update axios headers
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    return accessToken;
  } catch (error) {
    //dispatch(logout());
    console.error("Refresh token failed:", error);
    dispatch(logoutUser());
    throw error;
  }
};

export const logoutUser = () => async (dispatch: AppDispatch) => {
  try {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");

  
    // Dispatch logout action
    dispatch(logout());

    
    // Optional: Force reload to clear any in-memory state
    // window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Initialize auth state
// export const initializeAuth = () => async (dispatch: AppDispatch) => {
//   console.log("from initAuth");
//   dispatch(loginStart());

//   // 2. Fallback to session storage if refresh failed
//   const currAccessToken = sessionStorage.getItem("accessToken");
//   const userString = sessionStorage.getItem("user");

//   if (currAccessToken && userString) {
//     try {
//       if (isTokenExpired(currAccessToken)) {
//         console.log("from init refrech token");
//         const response = await api.post("api/auth/refresh-token");
//         const { accessToken, user } = response.data;
//         sessionStorage.setItem("accessToken", accessToken);
//         api.defaults.headers["Authorization"] = `Bearer ${accessToken}`;
//         dispatch(loginSuccess({ accessToken, user }));
//       } else {
//         // start
//         const user = JSON.parse(userString);
//         axios.defaults.headers.common["Authorization"] = `Bearer ${currAccessToken}`;
//         dispatch(loginSuccess({ accessToken: currAccessToken, user }));
//       }
//     } catch (error) {
//       console.error("Failed to initialize auth", error);
//       dispatch(logout());
//     }
//   }
// };
export const initializeAuth = () => async (dispatch: AppDispatch) => {
  dispatch(loginStart());

  try {
    const currAccessToken = sessionStorage.getItem("accessToken");
    const userString = sessionStorage.getItem("user");

    if (currAccessToken && userString) {
      if (isTokenExpired(currAccessToken)) {
        const response = await api.post("api/auth/refresh-token");
        const { accessToken, user } = response.data;
        sessionStorage.setItem("accessToken", accessToken);
        api.defaults.headers["Authorization"] = `Bearer ${accessToken}`;
        apiNphies.defaults.headers["Authorization"] = `Bearer ${accessToken}`;
        dispatch(loginSuccess({ accessToken, user }));
      } else {
        const user = JSON.parse(userString);
        api.defaults.headers["Authorization"] = `Bearer ${currAccessToken}`;
        apiNphies.defaults.headers[
          "Authorization"
        ] = `Bearer ${currAccessToken}`;
        dispatch(loginSuccess({ accessToken: currAccessToken, user }));
      }
    } else {
      // no token in session storage
      dispatch(loginFailure(""));
    }
  } catch (error) {
    console.error("Failed to initialize auth", error);
    dispatch(logout());
    dispatch(loginFailure(""));
  }
};

function isTokenExpired(token: string) {
  const { exp } = jwtDecode(token);
  return Date.now() >= exp * 1000;
}

export const changeLanguage =
  (newLangauge: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(
        `api/auth/change-language?language=${newLangauge}`
      );
      const { accessToken, user } = response.data;

      // Store in Redux (memory)
      dispatch(loginSuccess({ accessToken, user }));

      // Optionally store in sessionStorage
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("lang", user.language);

      // Set axios default headers
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      apiNphies.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
    } catch (error: any) {
      console.error("Login error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        stack: error.stack,
      });

      dispatch(
        loginFailure(
          error.response?.data?.message ||
            error.message ||
            "Network error. Please try again."
        )
      );
    }
  };
