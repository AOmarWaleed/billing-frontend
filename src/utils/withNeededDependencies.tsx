import React, { useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Box, CssBaseline, Theme, ThemeProvider } from "@mui/material";
import { toast } from "react-toastify";
import api from "./Api";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export const withNeededDependencies = <P extends object>(
  Component: React.ComponentType<P>,
): React.FC<
  P & { theme: Theme; facility_id?: string; navigate: (path: string) => void }
> => {
  const WrappedComponent: React.FC<
    P & { theme: Theme; facility_id?: string; navigate: (path: string) => void }
  > = ({ theme, facility_id, navigate, ...props }) => {
    useEffect(() => {
      if (!navigate) {
        console.error(
          "Navigation function is not available. Please ensure that the component is wrapped with a Router.",
        );
        return;
      }
      const globalInterceptor = api.interceptors.response.use(
        (response) => response,
        (error) => {
          console.error("API Error:", error);

          const status = error.response?.status;

          // Skip ALL error handling if toast suppression is requested
          if (
            error.config?.headers?.["X-Suppress-Error-Toast"] ||
            error.config?.headers?.["x-suppress-error-toast"]
          ) {
            console.log("Error suppressed by X-Suppress-Error-Toast header");
            return Promise.reject(error);
          }

          if (status === 401) {
            sessionStorage.removeItem("token");
            navigate("/login");
          } else if (status === 403) {
            toast.error("You do not have permission to access this resource.", {
              autoClose: false,
            });
          } else if (status && status >= 400) {
            // Show toast for all other 4xx/5xx errors UNLESS suppressed
            toast.error(
              error.response?.data?.message ||
                error.message ||
                "An error occurred",
              {
                autoClose: 5000,
              },
            );
          }

          return Promise.reject(error);
        },
      );

      // ✅ cleanup function to eject interceptors when the component unmounts
      return () => {
        api.interceptors.response.eject(globalInterceptor);
      };
    }, [navigate]);

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box>
              <Component {...(props as P)} facility_id={facility_id} />
            </Box>
          </ThemeProvider>
        </>
      </LocalizationProvider>
    );
  };

  WrappedComponent.displayName = `withNeededDependencies(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};
