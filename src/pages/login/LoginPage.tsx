import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { login } from "../../redux/services/authService";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Link as MuiLink,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HttpsIcon from "@mui/icons-material/Https";
// import { useThemeHook } from "../../hooks/useThemeHook";
import { useSelector } from "react-redux";
import { AppStore, RootState } from "../../redux/store";
//import { RootState } from "@reduxjs/toolkit/query";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import {
  getGroups,
  getPageContent,
  getPages,
  getPagesTrans,
  getResourceTypes,
  useTransSlice,
} from "../../redux/slices/transSlice";
import { useLanguage } from "../../context/LanguageContext";
import { createResourceHelpers } from "../../utils/resourceMapping/createResourceHelpers";
import { setDirection } from "../../redux/slices/themeSlice";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 450,
  margin: "auto",
  marginTop: theme.spacing(8),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[10],
  background: theme.palette.background.paper,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.common.white,
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius * 2,
  fontWeight: 600,
  letterSpacing: 0.5,
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: "translateY(-1px)",
    transition: "all 0.3s ease",
  },
  "&:disabled": {
    background: theme.palette.action.disabledBackground,
  },
}));

const LoginPage: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const { content } = useSelector((state: RootState) => state.trans);
  const { language } = useLanguage();
  // const { changeDirectionHandler } = useThemeHook();
  // Get auth state from Redux
  const {
    isAuthenticated,
    loading,
    error: authError,
  } = useAppSelector((state) => state.auth);

  // Redirect if already logged in
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate("/");
  //   }
  // }, [isAuthenticated, navigate]);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (user) {
      setDirection(user?.language == "en" ? "ltr" : "rtl");
      // setLanguage(user?.language);
      navigate("/");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userName || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await dispatch(login(userName, password)).then(() => {
        console.log(JSON.stringify(user));
        // console.log()
        if (isAuthenticated) {
          // dispatch(getPages());
          // dispatch(getPageContent(1));
          // dispatch(getPageContent(0));
          // dispatch(getPagesTrans());
          // dispatch(getGroups());
          // dispatch(getResourceTypes());
        }
      });
      // .finally(() => {
      //   navigate("/");
      // });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", minHeight: "100vh" }}>
      <HandleTitle titleKey="LOGIN" />

      {/* img part */}
      <Box
        sx={{
          display: { lg: "block", xs: "none" },
          width: { lg: "60%", xs: "100%" },
          backgroundColor: "green",
          backgroundImage: "url(LoginBG.jpeg)",
          backgroundPosition: "top",
          backgroundSize: {
            lg: "cover",
            // xl : "100%"
          },
        }}
      >
        <img />
      </Box>

      {/* formPart  */}
      <Box
        sx={{
          width: { lg: "40%", xs: "100%" },
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "center",
            minWidth: "60%",
            "& .MuiTextField-root": {},
          }}
        >
          {/* <img className="login-img" src="login-logo.png" alt="" /> */}
          {language === "en" ? (
            <img className="login-img" src="login-logo.png" alt="" />
          ) : (
            <img className="login-img" src="logo-ar.png" alt="" />
          )}

          <Typography sx={{ alignSelf: "flex-start" }} variant="h6">
            {language === "en" ? "WELCOME TO RCM" : " مرحبا في RCM"}
          </Typography>

          {error && (
            <Box sx={{ width: "100%" }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          <TextField
            fullWidth
            size="small"
            id="username"
            placeholder={language === "en" ? "Username" : "اسم المستخدم"}
            name="username"
            autoComplete="username"
            autoFocus
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            //disabled={loading}
            variant="outlined"
            sx={{}}
            slotProps={{
              input: {
                style: {
                  borderRadius: 12,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            fullWidth
            size="small"
            name="password"
            placeholder={language === "en" ? "Password" : "كلمة المرور"}
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            //disabled={loading}
            variant="outlined"
            sx={{}}
            slotProps={{
              input: {
                style: {
                  borderRadius: 12,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <HttpsIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            //disabled={loading}
            sx={{
              backgroundImage: " linear-gradient(to bottom,#49abcc ,  #3582bb)",
              width: "fit-content",
              alignSelf: "flex-start",
              borderRadius: "200px",
              paddingX: 3,
              color: "white",
            }}
          >
            {language === "en" ? "Login" : "تسجيل الدخول"}
            {/* // {loading ? <CircularProgress size={24} color="inherit" /> : "Login"} */}
          </Button>

          <Box sx={{ textAlign: "right", mb: 2, alignSelf: "flex-end" }}>
            <MuiLink
              component={Link}
              to="/forgot-password"
              underline="none"
              sx={{
                color: "#3582bb",
                fontSize: "15px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "#49abcc",
                  textDecoration: "underline",
                },
              }}
            >
              {language === "en" ? "Forgot password?" : "نسيت كلمة المرور"}
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
