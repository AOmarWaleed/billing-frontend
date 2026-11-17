import { createTheme, PaletteMode } from "@mui/material";

export const darkThemePalette = {
  mode: "dark" as PaletteMode,
  background: {
    default: "#121212",
    paper: "#1d1d1d",
  },
  loadingBg: "#12121255",
  form: "#000",
};

export const lightThemePalette = {
  mode: "light" as PaletteMode,
  background: {
    default: "#eee",
    paper: "#f5f5f5",
  },
  loadingBg: "#eeeeee55",
  form: "#fff",
};

export const createCustomTheme = (
  mode: "light" | "dark",
  dir: "rtl" | "ltr"
) => {
  const palette = mode === "light" ? lightThemePalette : darkThemePalette;
  const typography =
    mode === "light"
      ? {
          fontFamily: "Nunito, Arial, sans-serif, Segoe UI",
          body1: {
            fontSize: ".9rem",
          },
        }
      : {
          fontFamily: "Nunito, Arial, sans-serif, Segoe UI",
        };
  const components =
    mode == "light"
      ? {
          MuiTableContainer: {
            styleOverrides: {
              root: {
                background: "#fff",
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                color: "#000",
              },
            },
          },
          MuiButton: {
            defaultProps: {
              variant: "text",
              color: "primary",
              size: "medium",
              disableElevation: false,
              disableRipple: false,
              disableFocusRipple: false,
              fullWidth: false,
            },
            styleOverrides: {
              root: {
                fontSize: ".9rem",
                fontFamily: "Nunito, Arial, sans-serif, Segoe UI",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
              },
            },
          },
          MuiDataGrid: {
            styleOverrides: {
              root: {
                fontSize: ".78rem",
                "& .MuiTablePagination-actions button": {
                  Padding: "0px  ",
                },
                "& .MuiDataGrid-root": {
                  overFlow: "hidden",
                },
                "& .MuiDataGrid-iconButtonContainer": {
                  display: "none",
                },
                "& .MuiDataGrid-menuIconButton": {
                  width: "12px",
                },
               
                "& .MuiDataGrid-row": {
                    display: "flex", // enables flexbox inside the cell
                  alignItems: "center", // vertical center
                  justifyContent: "flex-start", // or "center" for full centering
                //   border : "none !important",
                //   backgroundColor : "red !important",
                  "&.Mui-selected:not(.highlighted-row  )": {
                    backgroundColor: "#55C5D6 !important",
                  },
                },
                "& .MuiDataGrid-row:nth-child(odd)": {
                  backgroundColor: "rgba(202, 215, 231, 0.15)",
                  transition: ".5s all",
                },

                "& .MuiDataGrid-row:nth-child(even)": {
                  backgroundColor: "rgba(85 , 197 , 197 , .15)",
                  transition: ".5s all",
                },
                "& .MuiDataGrid-row:nth-child(odd):hover": {
                  backgroundColor: "rgba(202, 215, 231, 0.44)",
                },
                "& .MuiDataGrid-row:nth-child(even):hover": {
                  backgroundColor: "rgba(85 , 197 , 197 , .44)",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#2764Af00",
                  height: "35px",
                  minHeight: "auto",
                },
                "& .MuiDataGrid-footerContainer .MuiToolbar-root": {
                  height: "30px",
                  minHeight: "auto",
                },
                "& .MuiDataGrid-footerContainer .MuiToolbar-root > *": {
                  marginTop: "0px",
                  marginBottom: "0px",
                },

                "& .MuiDataGrid-columnHeaders > div ": {
                  backgroundColor: "#2764AF !important",
                  color: "white",
                },

                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#2764AF !important",
                },
                borderRadius: "8px",

                "& .MuiDataGrid-cell": { padding: "0 5px " },
              },
              row: {
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                  outline: "none",
                },
              },
            },
            defaultProps: {
              getRowSpacing: (params: any) => ({
                top: params.isFirstVisible ? 0 : 0.5,
                bottom: params.isLastVisible ? 0 : 0.5,
              }),
              getRowHeight: (params) => {
                console.log({ params });

                return params.model.category_description ? "auto" : 25;
              },
              display: "flex",
              //   rowHeight: 25,
              pageSizeOptions: [5, 10, 20],
              columnHeaderHeight: 30,
            },
          },
          MuiTextField: {
            defaultProps: {
              value: "",
              variant: "outlined",
              color: "primary",
              size: "small",
              type: "text",
              disabled: false,
              fullWidth: true,
              required: false,
              margin: "none",
              error: false,
            },
            variants: [
              {
                props: { variant: "standard", color: "whiteField" },
                style: {
                  backgroundColor: "white",
                  "& .MuiInput-underline:before": {
                    borderBottomColor: "#55C5D6",
                  },
                  "& .MuiInput-underline:hover:before": {
                    borderBottomColor: "#55C5D6",
                  },
                },
              },
              {
                props: { variant: "outlined", color: "whiteField" },
                style: {
                  backgroundColor: "white",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      border: "none",
                      borderColor: "#55C5D6",
                    },
                    "&:hover fieldset": {
                      borderColor: "#55C5D6",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#55C5D6",
                    },
                  },
                },
              },
              {
                props: { variant: "filled", color: "whiteField" },
                style: {
                  backgroundColor: "white",
                  "& .MuiFilledInput-root": {
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: "white",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                    },
                  },
                },
              },
            ],
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#55C5D6",
                  },
                  "&:hover fieldset": {
                    borderColor: "#55C5D6",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#55C5D6",
                  },
                },
              },
            },
          },
        }
      : {
          MuiButton: {
            styleOverrides: {
              root: {
                fontSize: ".9rem",
                fontFamily: "Nunito, Arial, sans-serif, Segoe UI",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
              },
            },
          },
          MuiDataGrid: {
            styleOverrides: {
              root: {
                backgroundColor: "#000",
                borderRadius: "8px",
                color: "#fff",
                // "& .MuiDataGrid-cell" : {},
                "& .MuiDataGrid-cell": {
                    // backgroundColor : "red",
                  display: "flex", // enables flexbox inside the cell
                  alignItems: "center", // vertical center
                  justifyContent: "flex-start", // or "center" for full centering
                  color: "#fff",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#121212",
                  color: "#fff",
                },
                "& .MuiDataGrid-row": {
                  backgroundColor: "#000",
                  "&:hover": {
                    backgroundColor: "#1a1a1a",
                  },
                },
              },
              row: {
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                  outline: "none",
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.23)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.23)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.23)",
                  },
                },
              },
            },
          },
        };
  return createTheme({
    direction: dir,
    palette,

    typography: typography,
    components: components,
  });
};
