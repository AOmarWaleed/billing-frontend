import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import api from "../../utils/Api";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import { useAppDispatch } from "../../hooks/hooks";
import { logoutUser } from "../../redux/services/authService";
import { Secure, AuthGuardContext } from "@givc/shared-components";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "100%",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[10],
}));

interface ChangePasswordProps {
  t?: (key: string) => string;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ t: tProp }) => {
  const ctx = useContext(AuthGuardContext);
  const t = tProp || ctx.t;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("api/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      dispatch(logoutUser());
      navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 100px)" }}>
      <HandleTitle titleKey="CHANGE_PASSWORD" />

      <Box sx={{ width: "100%", maxWidth: 700, mx: 2 }}>
        <StyledPaper>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LockIcon color="primary" />
            <Typography variant="h6">{t("changepassword_48_PageTitle") || "Change Password"}</Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Secure.GLTextField
            resource_key="changepassword_48_CurrentPassword"
            fullWidth
            size="small"
            label={t("changepassword_48_CurrentPassword") || "Current Password"}
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end" size="small">
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Secure.GLTextField
            resource_key="changepassword_48_NewPassword"
            fullWidth
            size="small"
            label={t("changepassword_48_NewPassword") || "New Password"}
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew(!showNew)} edge="end" size="small">
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Secure.GLTextField
            resource_key="changepassword_48_ConfirmPassword"
            fullWidth
            size="small"
            label={t("changepassword_48_ConfirmPassword") || "Confirm New Password"}
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Secure.GLGenericButton
              resource_key="changepassword_48_CancelButton"
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={loading}
              sx={{ textTransform: "none" }}
            >
              {t("changepassword_48_CancelButton") || "Cancel"}
            </Secure.GLGenericButton>
            <Secure.GLGenericButton
              resource_key="changepassword_48_SaveButton"
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ textTransform: "none" }}
            >
              {loading ? <CircularProgress size={24} /> : (t("changepassword_48_SaveButton") || "Save")}
            </Secure.GLGenericButton>
          </Box>
          </Box>
        </StyledPaper>
      </Box>
    </Box>
  );
};

export default ChangePassword;
