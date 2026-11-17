// src/theme/createTheme.ts
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { createTheme, ThemeOptions } from "@mui/material/styles";
import { getBaseUrl } from "../utils/getBaseUrl";

/* ============================================================
   TYPES
   ============================================================ */
export type DirectionType = "ltr" | "rtl";
export type ModeType = "light" | "dark";
export type DensityType = "compact" | "comfortable";

/* ============================================================
   RTL / LTR CACHE
   ============================================================ */
export const createEmotionCache = (direction: DirectionType) =>
  direction === "rtl"
    ? createCache({
      key: "muirtl",
      stylisPlugins: [prefixer, rtlPlugin],
    })
    : createCache({ key: "muiltr" });

/* ============================================================
   THEME JSON
   ============================================================ */
interface ThemeJson {
  palette?: any;
  typography?: any;
  shape?: any;
  spacing?: any;
  components?: any;
  [key: string]: any;
}

async function loadThemeJson(path: string): Promise<ThemeJson> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load theme file at: ${path}`);
  }
  return res.json();
}

/* ============================================================
   CREATE APP THEME
   ============================================================ */
export async function createAppTheme(
  mode: ModeType,
  density: DensityType,
  direction: DirectionType,
  overrides: any = {}
) {
  /* ----------------------------
     Load JSON themes
  ----------------------------- */
  const [modeOptions, densityOptions] = await Promise.all([
    loadThemeJson(getBaseUrl(`/themes/${mode}/options.json`)),
    loadThemeJson(getBaseUrl(`/themes/${density}/options.json`)),
  ]);

  /* ----------------------------
     Deep merge components
  ----------------------------- */
  const mergedComponents = {
    ...(modeOptions.components || {}),
    ...(densityOptions.components || {}),
  };


  /* ----------------------------
     DataGrid normalization
     (JSON must NOT contain logic)
  ----------------------------- */
  const dataGridDefaultProps =
    mergedComponents?.MuiDataGrid?.defaultProps;

  if (dataGridDefaultProps) {
    // row spacing: object → function
    if (
      dataGridDefaultProps.getRowSpacing &&
      typeof dataGridDefaultProps.getRowSpacing !== "function"
    ) {
      const spacing = dataGridDefaultProps.getRowSpacing;
      dataGridDefaultProps.getRowSpacing = () => spacing;
    }

    // row height: number → function
    if (
      dataGridDefaultProps.getRowHeight &&
      typeof dataGridDefaultProps.getRowHeight !== "function"
    ) {
      const baseHeight = dataGridDefaultProps.getRowHeight;
      delete dataGridDefaultProps.rowHeight; // IMPORTANT

      dataGridDefaultProps.getRowHeight = (params: any) =>
        params.model?.item_id ||
          params.model?.group_id ||
          params.model?.package_item_id ||
          params.model?.employee_id ||
          params.model?.payer_id ||
          params.model?.code_type
          ? "auto"
          : baseHeight;
    }
  }

  /* ----------------------------
     Create theme
  ----------------------------- */
  const theme = createTheme({
    direction,

    ...modeOptions,
    ...densityOptions,

    palette: {
      ...modeOptions.palette,
      ...densityOptions.palette,
      ...overrides.customPalette,
    },

    typography: {
      ...modeOptions.typography,
      ...densityOptions.typography,
      ...overrides.font,
    },

    components: {
      ...mergedComponents,

      MuiButton: {
        ...mergedComponents?.MuiButton,
        defaultProps: {
          ...mergedComponents?.MuiButton?.defaultProps,
          ...overrides.buttons,
        },
      },

      MuiDialog: {
        ...mergedComponents?.MuiDialog,
        defaultProps: {
          ...mergedComponents?.MuiDialog?.defaultProps,
          ...overrides.dialog,
        },
      },

      MuiTextField: {
        ...mergedComponents?.MuiTextField,
        defaultProps: {
          ...mergedComponents?.MuiTextField?.defaultProps,
          ...overrides.textField,
        },
      },

      MuiDataGrid: {
        ...mergedComponents?.MuiDataGrid,
        defaultProps: {
          ...mergedComponents?.MuiDataGrid?.defaultProps,
          ...overrides.dataGrid,
        },
      },
    },
  } as ThemeOptions);

  return theme;
}
