import {
  Typography,
  IconButton,
  Toolbar,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Menu,
  Select,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { styled, useTheme } from "@mui/material/styles";
import { drawerWidth } from "../../utils/Constant";

import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggleButton from "../themeToggleButton/ThemeToggleButton";

//import { useDispatch } from "react-redux";
//import { logout } from "../../redux/slices/authSlice";
//import LogoutIcon from "@mui/icons-material/Logout";
import {
  getPageContentWithoutGrouping,
  getPages,
  useTransSlice,
} from "../../redux/slices/transSlice";
import Breadcrumb from "../BreadCrumb/BreadCrumb";
import { changeLanguage, logoutUser } from "../../redux/services/authService";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { logout } from "../../redux/slices/authSlice";
import { useEffect, useState } from "react";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
// import { useThemeHook } from "../../hooks/useThemeHook";
import api from "../../utils/Api";
import { publicUrl } from "../../utils/publicUrl";
import { useLanguage } from "../../context/LanguageContext";
import { Language } from "../../types/Language";
import { GlSelect } from "../../shared/forms/StandAlone/GlSelect";
// import { useGlTheme } from "../../hooks/useGlTheme";
import {
  DensityType,
  ModeType,
  setDensity,
  setDirection,
  setTheme,
} from "../../redux/slices/themeSlice";
import { useSelector } from "react-redux";
import { AppStore, RootState } from "../../redux/store";
import { useTranslation } from "react-i18next";
import { fetchCodeDataList } from "../../redux/slices/CodeDataSlice";
import GlThemeEditor from "../GlThemeEditor/GlThemeEditor";
import AuthGuard, { AuthGuardPermissions } from "../../shared/core/AuthGuard";
import NewFeedbackDialog from "../../pages/send_feedback/NewFeedbackDialog";
import { getCurrentPageName, getCurrentFunctionId } from "../../utils/trans";

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  // !!!!!!!
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

interface HeaderProps {
  open: boolean;
  setOpen: (nextS: boolean) => void;
}
export default function Header({ open, setOpen }: HeaderProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { getPageContent } = useTransSlice();

  const { mode } = useSelector((store: RootState) => store.theme);

  const location = useLocation();
  const { state } = location;

  const navigateTo = (path: string) => {
    navigate(path);
  };

  useEffect((
    () => {
      dispatch(fetchCodeDataList({ linkedType: 40 }))
    }
  ), [])

  const linkedList = useSelector(
    (state: RootState) => state.codedata.codetypelist
  );

  const logoutClick = async () => {
    await dispatch(logoutUser());
    navigateTo("login");
  };
  const user = useAppSelector((state) => state.auth.user);
  const languageContext = useLanguage();

  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    user?.language! as Language
  );
  const { i18n } = useTranslation();

  const handleLanguageChange = async (langCode: Language) => {
    await dispatch(changeLanguage(langCode));
    languageContext.setLanguage(langCode);
    dispatch(setDirection(langCode == "ar" ? "rtl" : "ltr"));

    setCurrentLanguage(langCode);

    await i18n.changeLanguage(langCode);
    // await i18n.reloadResources();
    sessionStorage.setItem("lang", langCode);
    sessionStorage.setItem("dir", langCode == "ar" ? "rtl" : "ltr");
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const { direction, density } = useAppSelector((state) => state.theme);
  const menuPages = useSelector((state: RootState) => state.trans.pages);

  const [hospitalName, setHospitalName] = useState("");
  const [hospitalLogo, setHospitalLogo] = useState("facility-logo.png");
  useEffect(() => {
    async function getHospitalDetails() {
      const { data } = await api.get("/api/systemRules/HOSPITAL_NAME");
      setHospitalName(data?.data?.conf_value);
    }

    getHospitalDetails();
  }, []);

  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportDialogT, setReportDialogT] = useState<((key: string) => string) | null>(null);
  const [feedbackSubAnchorEl, setFeedbackSubAnchorEl] = useState<null | HTMLElement>(null);

  const handleHelpMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setHelpAnchorEl(event.currentTarget);
  };

  const handleHelpMenuClose = () => {
    setHelpAnchorEl(null);
    setFeedbackSubAnchorEl(null);
  };

  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  const theme = useTheme();
  return (
    <>
    <AppBar
      sx={{
        color: "primary.contrastText",
        backgroundImage: `linear-gradient(to right , ${theme.palette.primary.main} , ${theme.palette.success.main})`,
      }}
      position="fixed"
      open={open}
    >
      <Toolbar sx={{ alignItems: "center", gap: 1 }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            marginRight: 5,
            ...(open && { display: "none" }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          sx={{ cursor: "pointer" }}
          variant="h6"
          noWrap
          component="div"
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <img height={"38"} src={publicUrl("logoText.svg")} />
          </Box>
        </Typography>

        <Breadcrumb />

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
          <Typography>{hospitalName}</Typography>
          <img src={publicUrl(hospitalLogo)} style={{ width: "40px" }} alt="" />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <LanguageSwitcher
            currentLanguage={currentLanguage}
            onChangeLanguage={handleLanguageChange}
          />

          <FormControl sx={{ minWidth: 90 }} size="small">
            <InputLabel
              sx={{
                color: "inherit !important",
              }}
            >
              Mode
            </InputLabel>
            <Select
              sx={{
                color: "inherit !important",
              }}

              value={mode}
              onChange={(value) => {
                dispatch(
                  setTheme({
                    mode: value.target.value as "light" | "dark",
                  })
                );
              }}
              label={"Mode"}
              size="small"
            >
              {linkedList?.map((option) => (
                <MenuItem key={option.user_code} value={option.user_code}>
                  {option.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 100 }} size="small">
            <InputLabel
              sx={{
                color: "inherit !important",
              }}
            >
              Density
            </InputLabel>
            <Select
              sx={{
                color: "inherit !important",

              }}
              value={density}
              onChange={(value) => {
                dispatch(
                  setTheme({
                    density: value.target.value as DensityType,
                  })
                );
              }}
              label={"Density"}
              size="small"
            >
              {[
                {
                  label: "compact",
                  value: "compact",
                },
                {
                  label: "comfortable",
                  value: "comfortable",
                },
              ].map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* <ThemeToggleButton sx={{ ml: "auto" }} /> */}
          <GlThemeEditor />
          <IconButton onClick={handleUserMenuOpen} sx={{ color: "inherit" }}>
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={userAnchorEl}
            open={Boolean(userAnchorEl)}
            onClose={handleUserMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <MenuItem disabled sx={{ opacity: "1 !important", fontWeight: 600 }}>
              {user?.userId ? `User #${user.userId}` : ""}
            </MenuItem>
            <Divider />
            <AuthGuard functionID="48">
              <AuthGuardPermissions secureId="changepassword_48_Page">
                {({ t }) => (
                  <MenuItem onClick={() => { handleUserMenuClose(); navigate("/change-password"); }}>
                    {t("changepassword_48_PageTitle") || "Change Password"}
                  </MenuItem>
                )}
              </AuthGuardPermissions>
            </AuthGuard>
          </Menu>
          <IconButton onClick={handleHelpMenuOpen} sx={{}}>
            <HelpOutlineIcon />
          </IconButton>
          <Menu
            anchorEl={helpAnchorEl}
            open={Boolean(helpAnchorEl)}
            onClose={handleHelpMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <AuthGuard functionID="47">
              <AuthGuardPermissions secureId="help_47_PageTitle">
                {() => (
                  <MenuItem onClick={() => { handleHelpMenuClose(); const fid = getCurrentFunctionId(menuPages, location.pathname); if (fid) window.open(`${window.location.origin}/help/${fid}`, "_blank"); }}>
                    Guide
                  </MenuItem>
                )}
              </AuthGuardPermissions>
            </AuthGuard>
            <AuthGuard functionID="50">
              <AuthGuardPermissions secureId="helpmanagement_50_PageTitle">
                {() => (
                  <MenuItem onClick={() => { handleHelpMenuClose(); window.open("/help-management", "_blank"); }}>
                    Help Management
                  </MenuItem>
                )}
              </AuthGuardPermissions>
            </AuthGuard>
            <MenuItem
              onClick={(e) =>
                setFeedbackSubAnchorEl(
                  feedbackSubAnchorEl ? null : e.currentTarget,
                )
              }
              endIcon={<KeyboardArrowDownIcon />}
            >
              Feedback
              <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
            </MenuItem>
            <Menu
              anchorEl={feedbackSubAnchorEl}
              open={Boolean(feedbackSubAnchorEl)}
              onClose={() => setFeedbackSubAnchorEl(null)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <AuthGuard functionID="46">
                <AuthGuardPermissions secureId="sendfeedback_46_PageTitle">
                  {({ t }) => (
                    <MenuItem onClick={() => { handleHelpMenuClose(); const page = getCurrentPageName(menuPages, location.pathname); window.open(window.location.origin + "/send-feedback?page=" + encodeURIComponent(page), "_blank"); }}>
                      {t("sendfeedback_46_PageTitle") || "User Feedback"}
                    </MenuItem>
                  )}
                </AuthGuardPermissions>
              </AuthGuard>
              <AuthGuard functionID="46">
                <AuthGuardPermissions secureId="sendfeedback_46_ReportButton">
                  {({ t }) => (
                    <MenuItem onClick={() => { setReportDialogT(() => t); handleHelpMenuClose(); setReportDialogOpen(true); }}>
                      {t("sendfeedback_46_ReportButton") || "Report an Issue"}
                    </MenuItem>
                  )}
                </AuthGuardPermissions>
              </AuthGuard>
            </Menu>
          </Menu>
          <IconButton onClick={() => { logoutClick() }} sx={{}}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_1_2796"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="32"
                height="32"
              >
                <rect y="0.35998" width="31.28" height="31.28" fill={"white"} />
              </mask>
              <g mask="url(#mask0_1_2796)">
                <path
                  d="M15.6402 0.499676C24.2012 0.499676 31.1412 7.43968 31.1412 16.0007C31.1412 24.5607 24.2012 31.5007 15.6402 31.5007C7.07916 31.5007 0.13916 24.5607 0.13916 16.0007C0.13916 7.43968 7.07916 0.499676 15.6402 0.499676Z"
                  fill={"white"}
                />
                <path
                  d="M15.64 31.6397C7.016 31.6397 0 24.6237 0 15.9997C0 7.37568 7.016 0.359676 15.64 0.359676C24.264 0.359676 31.28 7.37568 31.28 15.9997C31.28 24.6237 24.264 31.6397 15.64 31.6397ZM15.64 1.35968C7.567 1.35968 1 7.92768 1 15.9997C1 24.0727 7.567 30.6397 15.64 30.6397C23.713 30.6397 30.28 24.0727 30.28 15.9997C30.28 7.92768 23.713 1.35968 15.64 1.35968Z"
                  fill="green"
                />
                <path
                  d="M15.64 26.2697C9.67096 26.2697 4.81396 21.4137 4.81396 15.4437C4.81396 11.4097 7.03896 7.73768 10.62 5.86068C11.182 5.56568 11.877 5.78368 12.172 6.34468C12.467 6.90768 12.25 7.60268 11.687 7.89768C8.86696 9.37568 7.11396 12.2677 7.11396 15.4437C7.11396 20.1447 10.939 23.9687 15.64 23.9687C20.341 23.9687 24.165 20.1447 24.165 15.4437C24.165 12.2677 22.413 9.37568 19.592 7.89768C19.03 7.60268 18.812 6.90768 19.107 6.34468C19.402 5.78268 20.098 5.56768 20.66 5.86068C24.241 7.73768 26.465 11.4097 26.465 15.4437C26.465 21.4137 21.609 26.2697 15.64 26.2697Z"
                  fill="green"
                />
                <path
                  d="M15.6401 4.93968C16.2371 4.93968 16.7211 5.42368 16.7211 6.02068V11.7887C16.7211 12.3857 16.2371 12.8707 15.6401 12.8707C15.0431 12.8707 14.5591 12.3857 14.5591 11.7887V6.02068C14.5591 5.42368 15.0431 4.93968 15.6401 4.93968Z"
                  fill="green"
                />
              </g>
            </svg>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
      <AuthGuard functionID="46">
        <NewFeedbackDialog
          open={reportDialogOpen}
          onClose={() => { setReportDialogOpen(false); }}
          defaultPage={getCurrentPageName(menuPages, location.pathname)}
          t={reportDialogT || undefined}
        />
      </AuthGuard>
    </>
  );
}
