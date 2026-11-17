import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../utils/Api";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import { useLanguage } from "../../context/LanguageContext";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 450,
  margin: "auto",
  marginTop: theme.spacing(8),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[10],
  background: theme.palette.background.paper,
}));

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError(
        language === "en" ? "Please enter your email" : "الرجاء إدخال البريد الإلكتروني",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("api/auth/forgot-password", { email });
      setSuccess(response.data.message);
      setEmail("");
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
      <HandleTitle titleKey="FORGOT_PASSWORD" />

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
            {language === "en" ? "Forgot Password" : "نسيت كلمة المرور"}
          </Typography>

          <Typography
            sx={{ alignSelf: "flex-start", color: "text.secondary", fontSize: "14px" }}
          >
            {language === "en"
              ? "Enter your email address and a new password will be sent to you."
              : "أدخل بريدك الإلكتروني وسيتم إرسال كلمة مرور جديدة إليك."}
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

          <TextField
            fullWidth
            size="small"
            id="email"
            type="email"
            placeholder={language === "en" ? "Email address" : "البريد الإلكتروني"}
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            variant="outlined"
            slotProps={{
              input: {
                style: { borderRadius: 12 },
                startAdornment: (
                  <Box component="span" sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                    <EmailIcon color="action" />
                  </Box>
                ),
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading}
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
              "Send New Password"
            ) : (
              "إرسال كلمة مرور جديدة"
            )}
          </Button>

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

export default ForgotPassword;
