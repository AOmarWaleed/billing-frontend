import "@mui/material/styles";
import { CSSObject } from "@mui/material";
import { DataGridProps } from "@mui/x-data-grid";

declare module "@mui/material/TextField" {
  interface TextFieldPropsColorOverrides {
    whiteField: true;
  }
}

declare module "@mui/material/styles" {
  interface Components {
    MuiDataGrid?: {
      defaultProps?: Partial<DataGridProps>;
      styleOverrides?: {
        root?: CSSObject | ((params: { theme: Theme }) => CSSObject);
        row?: CSSObject | ((params: { theme: Theme }) => CSSObject);
      };
    };
  }
  interface Palette {
    whiteField: Palette["primary"];
  }
  interface PaletteOptions {
    whiteField?: PaletteOptions["primary"];
  }

  interface TypeBackground {
    dataGrid?: string;
  }
}
