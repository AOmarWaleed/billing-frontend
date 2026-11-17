import { green } from "@mui/material/colors";
import { maxWidth, styled } from "@mui/system";

// Define the main container
const StyledContainer = styled("div")(({ theme }) => ({
  display: "flex",
  maxwidth: "95vw",
  minwidth: "480px",
  paddingLeft: "20px",
  maxHeight: "100%",
  flexDirection: "row",
  justifyContent: "flex-start",
  // backgroundColor:'#e8f5e9',
  [theme.breakpoints.down("sm")]: {
    // Adjust 'sm' to your desired breakpoint
    flexDirection: "column",
    maxWidth: "100vw",
  },
  "@media (max-width: 1024px)": {
    // Custom media query for 480px or less
    flexDirection: "column",
  },
}));

// Define the sub-components
export const SubComponentOne = styled("div")(({ theme }) => ({
  width: "30vw",
  height: "100%",
  marginBottom: "10px",
  "@media (max-width: 1024px)": {
    // Custom media query for 480px or less
    width: "90vw",
  },
}));

export const SubComponentTwo = styled("div")(({ theme }) => ({
  width: "60vw",
  height: "100%",
  marginLeft: "10px",
  "@media (max-width: 1024px)": {
    // Custom media query for 480px or less
    width: "90vw",
  },
}));

export default StyledContainer;
