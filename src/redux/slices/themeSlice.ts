import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ModeType = "light" | "dark";
export type DensityType = "compact" | "comfortable";
export type DirectionType = "ltr" | "rtl";

interface ThemeState {
  mode: ModeType;
  density: DensityType;
  direction: DirectionType;
}

const savedDir = sessionStorage.getItem("dir") as DirectionType | null;

const initialState: ThemeState = {
  mode: "light",
  density: "compact",
  direction: savedDir || "ltr",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<ModeType>) {
      state.mode = action.payload;
    },
    setDensity(state, action: PayloadAction<DensityType>) {
      state.density = action.payload;
    },
    setDirection(state, action: PayloadAction<DirectionType>) {
      state.direction = action.payload;
    },
    setTheme(state, action: PayloadAction<Partial<ThemeState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setMode, setDensity, setDirection, setTheme } = themeSlice.actions;

export default themeSlice.reducer;
