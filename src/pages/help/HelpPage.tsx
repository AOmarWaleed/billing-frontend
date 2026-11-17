import { useState, useEffect, useContext } from "react";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  AuthGuardContext,
  AuthGuardPermissions,
} from "@givc/shared-components";
import HelpService from "../../redux/services/HelpService";
import HandleTitle from "../../components/HandleTitle/HandleTitle";

interface HelpData {
  function_id: number;
  description: string;
  help: string | null;
}

export default function HelpPage() {
  const { functionId } = useParams<{ functionId: string }>();
  const navigate = useNavigate();
  const { t } = useContext(AuthGuardContext);
  const [data, setData] = useState<HelpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!functionId) {
      setError("No page specified");
      setLoading(false);
      return;
    }
    HelpService.getHelp(Number(functionId))
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load help content");
        setLoading(false);
      });
  }, [functionId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error || "Page not found"}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <HandleTitle titleKey="HELP" />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography
          component="span"
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "primary.main",
          }}
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon />
        </Typography>
        <Typography variant="h5">
          {data.description} - {t("help_47_PageTitle") || "Help"}
        </Typography>
      </Box>
      <AuthGuardPermissions secureId="help_47_Content">
        {() => (
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                overflow: "auto",
                "& img": { maxWidth: "100%", height: "auto" },
              }}
              dangerouslySetInnerHTML={{
                __html: data.help || "No help content available.",
              }}
            />
          </Paper>
        )}
      </AuthGuardPermissions>
    </Box>
  );
}
