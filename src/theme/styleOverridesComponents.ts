  import { Components, CSSObject, Theme } from "@mui/material";
  import { alpha } from "@mui/material/styles";
  const ROW_HEIGHT = 50;
  export const buttonProps = {
    variant: "text",
    color: "primary",
    size: "medium",

    disableElevation: false,
    disableRipple: false,
    disableFocusRipple: false,
    fullWidth: false,
    href: undefined,
    startIcon: undefined,
    endIcon: undefined,
  };

  export const dialogProps = {
    open: false,
    maxWidth: "sm",
    fullWidth: true,
    fullScreen: false,
    scroll: "paper",
    keepMounted: false,
    transitionDuration: 50,
  };
  export const textFieldProps = {
    value: "",
    defaultValue: undefined,
    variant: "outlined",
    color: "primary",
    size: "small",
    type: "text",
    name: undefined,
    label: undefined,
    placeholder: undefined,
    helperText: undefined,
    disabled: false,
    fullWidth: true,
    required: false,
    margin: "none",
    error: false,
  };
  export const createComponentObj = (rowHeight: any) => {
    const components: Components<Omit<Theme, "components">> = {
      MuiDataGrid: {
        styleOverrides: {
          root: ({ theme }): CSSObject => ({
            "& .MuiDataGrid-columnHeaders": {
              minHeight: `${rowHeight}px`, // 5 * 8px = 40px
              maxHeight: `${rowHeight}px`,
            },
            "& .MuiDataGrid-columnHeader": {
              minHeight: `${rowHeight}px`,
              maxHeight: `${rowHeight}px`,
            },
            backgroundColor: theme.palette.background.dataGrid,

            "& .MuiDataGrid-row": {
              lineHeight: "1.4",

              whiteSpace: "normal !important",
              minHeight: `${rowHeight}px !important`,
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
            "& div.MuiDataGrid-row.Mui-selected, & div.MuiDataGrid-row.Mui-selected:hover":
              {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
              },
            "& .MuiDataGrid-row:nth-child(odd)": {
              backgroundColor: alpha(theme.palette.primary.light, 0.1),
              transition: ".5s all",
            },
            "& .MuiDataGrid-row:nth-child(even)": {
              backgroundColor: alpha(theme.palette.grey["A200"], 0.2),
              transition: ".5s all",
            },
            "& .MuiDataGrid-row:nth-child(odd):hover": {
              backgroundColor: alpha(theme.palette.primary.light, 0.4),
            },
            "& .MuiDataGrid-row:nth-child(even):hover": {
              backgroundColor: alpha(theme.palette.grey["A200"], 0.7),
            },
            "& .MuiDataGrid-columnHeaders > div, & .MuiDataGrid-columnHeaders": {
              "--DataGrid-containerBackground": theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
            "& .MuiDataGrid-menuIcon, & .MuiDataGrid-filterIcon, & .MuiDataGrid-sortIcon":
              {
                color: theme.palette.primary.contrastText,
                "& .MuiIconButton-root": {
                  color: "inherit",
                },
              },
            "& .MuiDataGrid-columnHeader .MuiDataGrid-menuIcon:hover, & .MuiDataGrid-columnHeader .MuiDataGrid-sortIcon:hover, & .MuiDataGrid-columnHeader .MuiDataGrid-filterIcon:hover":
              {
                color: theme.palette.primary.contrastText,
              },
          }),
          row: {
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
          } as CSSObject,
        },
        defaultProps: {
          autoHeight: false,
          sortingOrder: ["asc", "desc", null],
          disableColumnFilter: false,
          disableColumnMenu: false,
          loading: false,
          getRowHeight: () => "auto",
          rowHeight: rowHeight,
          columnHeaderHeight: rowHeight,
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {},
        },
        defaultProps: {
          raised: false,
          variant: "elevation",
          elevation: 1,
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "capitalize",
          },
        },
        defaultProps: buttonProps as any,
      },

      MuiDialog: {
        styleOverrides: {
          root: {},
          paper: ({ theme }) => ({
            padding: "20px 10px",
            backgroundImage: `linear-gradient(to bottom right, ${alpha(
              theme.palette.primary.main,
              1
            )} 40%, ${alpha(theme.palette.primary.light, 1)})`,
            color: theme.palette.primary.contrastText,
            "& .MuiInputBase-root": {
              backgroundColor: theme.palette.primary.contrastText,
            },
            "& .MuiDivider-root": {
              backgroundColor: theme.palette.primary.contrastText,
              height: "3px",
              marginTop: "10px",
            },
          }),
        },
        defaultProps: dialogProps as any,
      },

      MuiSelect: {
        styleOverrides: {
          root: ({ theme }) => ({
            "& fieldset": {
              borderColor: theme.palette.primary.light,
            },
          }),
        },
        defaultProps: {
          value: "",
          variant: "outlined",
          size: "small",
          native: false,
          multiple: false,
          IconComponent: undefined,
          renderValue: undefined,
          displayEmpty: false,
          autoWidth: false,
          MenuProps: {
            PaperProps: {
              sx: (theme: Theme) => ({}),
            },
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: ({ theme }) => ({
            "& fieldset": {
              borderColor: theme.palette.primary.light,
            },
          }),
        },
        defaultProps: textFieldProps as any,
      },
    };

    return components;
  };
