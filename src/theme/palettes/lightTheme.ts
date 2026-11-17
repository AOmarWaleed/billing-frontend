// import { PaletteOptions, ThemeOptions } from "@mui/material";

// export const lightPalette: PaletteOptions = {
//   primary: {
//     main: "#f00",
//   },

//   secondary: {
//     main: "#55C5D6",
//   },

//   background: {
//     default: "#eee",
//     paper: "#f5f5f5",
//   },

//   text: {
//     primary: "#000",
//   },
//   dataGrid: {
//     rounded: 10,

//     row: {
//       selected: "#55C5D6",
//       odd: "rgba(202, 215, 231)",
//       even: "rgba(85, 197, 197)",
//       headerBg: "rgb(39 ,100 ,175)",
//       // headerBg : "red",
//       headerColor: "white",

//       iconColor: "white",
//       iconHoverColor: "red",
//     },

//     footer: {
//       bg: "black",
//       color: "white",
//     },
//     svgFilter: {
//       closeColor: "#08A90A",
//       openColor: "#111",
//     },
//   },

//   dialog: {
//     from: "#55C5D6",
//     to: "#2764af",

//     inputBG: "white",
//     inputColor: "black",

//     color: "white",
//     dividerBg: "white",
//     shadow: "white",
//   },
//   input: {
//     borderColor: "#55C5D6",
//     error: "#ff0",
//   },
//   select: {
//     borderColor: "#55C5D6",
//     menuBackgroundColor: "black",
//     menuColor: "white",
//     iconColor: "#55C5D6",
//     selectedBG: "red",
//     shadowColor: "rgba(0,0,0,.3)",
//   },
// };

// header #2765ad , #1da34b
// active side bar #55c5d6
//! icon at least #2764af
//! from to 2764AF 55C5D6

//! mosted used  ==> primary.main && primary.light

export const lightPalette  = {
  primary: {
    main: '#2764AF',
    // !even
    light: '#55c5d6',
    dark: '#1565c0',
    contrastText: '#fff'
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#fff'
  },
  error: {
    main: '#ff0',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#fff'
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#fff'
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#fff'
  },
  success: {
    main: '#1da34b',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#fff'
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)'
  },
  background: {
    default: '#fafafa',
    paper: '#fff',
    dataGrid : 'transparent'
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    A100: '#f5f5f5',
    A200: '#eeeeee',
    // !!!odd
    A400: '#bdbdbd',
    A700: '#616161'
  },
  common: {
    black: '#000',
    white: '#fff'
  },
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    hoverOpacity: 0.04,
    selected: 'rgba(0, 0, 0, 0.08)',
    selectedOpacity: 0.08,
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    disabledOpacity: 0.38,
    focus: 'rgba(0, 0, 0, 0.12)',
    focusOpacity: 0.12,
    activatedOpacity: 0.12
  },
   
};