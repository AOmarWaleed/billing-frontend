import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Header from "../components/header/Header";
import { useEffect, useState } from "react";
import SideBar from "../components/sidebar/SideBar";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { generateBreadcrumbs } from "../components/BreadCrumb/BreadCrumb";
import { setBreadcrumbs } from "../redux/slices/breadCrumb";
import { useTheme } from "@mui/material/styles";


const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // backgroundColor : "red",
  ...theme.mixins.toolbar,
}));

export default function MainLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme(); 
  

  useEffect(() => {
    const breadcrumbs = generateBreadcrumbs(location.pathname);
    dispatch(setBreadcrumbs(breadcrumbs));
  }, [location, dispatch]);

  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundImage:
          theme.palette.mode === "light"
            ? "url('bg.jpg')" 
            : "", 
      }}
    >
      <Header  setOpen={setOpen} open={open} />
      <SideBar  DrawerHeader={DrawerHeader} open={open} setOpen={setOpen} />
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          p: 2,
          pr: 2,
          pt: 1,
          paddingLeft: "80px",
        }}
      >
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
}
