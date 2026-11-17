import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import HttpsIcon from "@mui/icons-material/Https";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LockResetIcon from "@mui/icons-material/LockReset";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../utils/Api";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import { useLanguage } from "../../context/LanguageContext";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const tokenFromUrl = pathSegments[pathSegments.length - 1];
    if (tokenFromUrl && tokenFromUrl !== "reset-password") {
      setToken(tokenFromUrl);
    } else {
      setError(
        language === "en"
          ? "Invalid reset link. Please request a new one."
          : "رابط إعادة تعيين غير صالح. الرجاء طلب رابط جديد.",
      );
    }
  }, [location.pathname, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError(
        language === "en"
          ? "Please fill in all fields"
          : "الرجاء ملء جميع الحقول",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        language === "en"
          ? "Passwords do not match"
          : "كلمات المرور غير متطابقة",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        language === "en"
          ? "Password must be at least 8 characters"
          : "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("api/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });
      setSuccess(response.data.message);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (language === "en"
            ? "Something went wrong. Please try again."
            : "حدث خطأ ما. الرجاء المحاولة مرة أخرى."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", minHeight: "100vh" }}>
      <HandleTitle titleKey="RESET_PASSWORD" />

      <Box
        sx={{
          display: { lg: "block", xs: "none" },
          width: { lg: "60%", xs: "100%" },
          backgroundColor: "green",
          backgroundImage: "url(LoginBG.jpeg)",
          backgroundPosition: "top",
          backgroundSize: { lg: "cover" },
        }}
      >
        <img />
      </Box>

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
          }}
        >
          {language === "en" ? (
            <img className="login-img" src="login-logo.png" alt="" />
          ) : (
            <img className="login-img" src="logo-ar.png" alt="" />
          )}

          <Typography sx={{ alignSelf: "flex-start" }} variant="h6">
            {language === "en" ? "Reset Password" : "إعادة تعيين كلمة المرور"}
          </Typography>

          <Typography
            sx={{ alignSelf: "flex-start", color: "text.secondary", fontSize: "14px" }}
          >
            {language === "en"
              ? "Enter your new password below."
              : "أدخل كلمة المرور الجديدة أدناه."}
          </Typography>

          {error && (
            <Box sx={{ width: "100%" }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {success && (
            <Box sx={{ width: "100%" }}>
              <Alert severity="success">{success}</Alert>
            </Box>
          )}

          {!success && (
            <>
              <TextField
                fullWidth
                size="small"
                name="password"
                placeholder={language === "en" ? "New Password" : "كلمة المرور الجديدة"}
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !token}
                variant="outlined"
                slotProps={{
                  input: {
                    style: { borderRadius: 12 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <HttpsIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                name="confirmPassword"
                placeholder={language === "en" ? "Confirm New Password" : "تأكيد كلمة المرور الجديدة"}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !token}
                variant="outlined"
                slotProps={{
                  input: {
                    style: { borderRadius: 12 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockResetIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                disabled={loading || !token}
                sx={{
                  backgroundImage: "linear-gradient(to bottom,#49abcc , #3582bb)",
                  borderRadius: "200px",
                  paddingX: 3,
                  color: "white",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : language === "en" ? (
                  "Reset Password"
                ) : (
                  "إعادة تعيين كلمة المرور"
                )}
              </Button>
            </>
          )}

          <Box sx={{ width: "100%", textAlign: "center" }}>
            <Button
              component={Link}
              to="/login"
              startIcon={<ArrowBackIcon />}
              sx={{ textTransform: "none", color: "#000000aa", fontSize: "14px" }}
            >
              {language === "en" ? "Back to Login" : "العودة إلى تسجيل الدخول"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPassword;
