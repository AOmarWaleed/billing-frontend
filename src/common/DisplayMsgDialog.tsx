import { useState, useEffect } from "react";
import {
  Button,
  Box,
  IconButton,
  Typography,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { get } from "http";

//! type
interface DisplayMsgDialogProps {
  open: boolean;
  onClose: () => void;
  setDesc?: (v: string) => void;
  resourceId?: string | number;
  description?: string;
  getResource?: boolean;
  status?: "WARNING" | "ERROR" | "INFO" | "QUESTION";
}
interface Details {
  resource_type: string;
  text: string;
}

//! Get icon based on resource type
const getStatusIcon = (resourceType: string | null) => {
  if (!resourceType) return null;

  switch (resourceType) {
    case "WARNING":
      return <WarningIcon fontSize="large" />;
    case "QUESTION":
      return <HelpOutlineIcon fontSize="large" />;
    case "ERROR":
      return <ErrorIcon fontSize="large" />;
    case "INFO":
      return <InfoIcon fontSize="large" />;
    default:
      return null;
  }
};

//! Get row count based on description length
const getRowCount = (description: string) => {
  const words = description.split(" ").length;
  // alert(words  );
  if (words < 30) {
    return 4;
  } else {
    const lines = Math.ceil(words / 7.5); // Assuming an average of 5 words per line
    return lines;
  }
};

//! style depend on Msg type
const getStatusStyles = (details: Details | null) => {
  if (!details) return {};

  switch (details.resource_type) {
    case "WARNING":
      return {
        bgcolor: "#fff3e0",
        borderLeft: "4px solid #ff9800",
        color: "#e65100",
      };
    case "QUESTION":
      return {
        bgcolor: "#f3e5f5",
        borderLeft: "4px solid #9c27b0",
        color: "#7b1fa2",
      };
    case "ERROR":
    case "ERROR while fetching details":
      return {
        bgcolor: "#ffebee",
        borderLeft: "4px solid #f44336",
        color: "#c62828",
      };
    case "INFO":
      return {
        bgcolor: "#e3f2fd",
        borderLeft: "4px solid #2196f3",
        color: "#1565c0",
      };
    default:
      return {};
  }
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback (best-effort, legacy)
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);

    return success;
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
};


// const copyToClipboard = async (text: string) => {
//   try {
//     if (navigator.clipboard && window.isSecureContext) {
//       await navigator.clipboard.writeText(text);
//       return true;
//     }

//     // Fallback for restricted browsers
//     const textarea = document.createElement("textarea");
//     textarea.value = text;
//     textarea.style.position = "fixed";
//     textarea.style.opacity = "0";
//     document.body.appendChild(textarea);
//     textarea.focus();
//     textarea.select();

//     document.execCommand("copy");
//     document.body.removeChild(textarea);
//     return true;
//   } catch {
//     return false;
//   }
// };

export default function DisplayMsgDialog({
  open,
  onClose,
  resourceId,
  description,
  setDesc,
  getResource = true,
  status,
}: DisplayMsgDialogProps) {
  const [details, setDetails] = useState<null | Details>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!description) return;

    const plainText = description.replace(/<[^>]*>/g, "");

    const success = await copyToClipboard(plainText);

    setCopied(success);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // alert(open  + " " + resourceId)
    if (open) {
      fetchDetails(resourceId);
    }

    // return () => {
    //   setDetails(null);
    //   setDesc && setDesc("");
    // };
  }, [open, resourceId]);

  const fetchDetails = async (id: any) => {
    if (!getResource) {
      if (status)
        return setDetails({
          text: "",
          resource_type: status,
        });

      return;
    }
    if (id == null || isNaN(id) || id === "") {
      return setDetails({
        text: "Please contact admin ",
        resource_type: "ERROR",
      });
    }
    setLoading(true);
    try {
      const { data } = await axios(
        `${
          import.meta.env.VITE_API_BASE_URL.endsWith("/")
            ? import.meta.env.VITE_API_BASE_URL.slice(0, -1)
            : import.meta.env.VITE_API_BASE_URL
        }/api/resource/${Math.abs(id)}`,
        {
          timeout: 10000,
        }
      );

      //  const { data } = await axios(
      //   `/${location.pathname.split("/")[1]}${
      //     import.meta.env.VITE_API_BASE_URL.endsWith("/")
      //       ? import.meta.env.VITE_API_BASE_URL.slice(0, -1)
      //       : import.meta.env.VITE_API_BASE_URL
      //   }/api/resource/${Math.abs(id)}`,
      //   {
      //     timeout: 10000,
      //   }
      // );

      setDetails(
        data.data || {
          text: "there is no details available for this resourceId " + id,
          resource_type: "ERROR",
        }
      );
      setError(null);
    } catch (err: any) {
      // setError("Failed to fetch details");
      setDetails({
        text: "there is no details available for this resourceId " + id,
        resource_type: "ERROR",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (loading)
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundColor: "loadingBg",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999,
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <ThemeProvider theme={createTheme({ typography: { fontSize: 12 } })}>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          handleClose();
        }}
        maxWidth="md"
        fullWidth
        slotProps={{
          transition: {
            onExited: () => {
              setDetails(null);
              setError(null);
              setDesc && setDesc("");
            },
          },
        }}
      >
        <Box sx={getStatusStyles(details)}>
          <DialogTitle>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" alignItems="center" gap={2}>
                {details && getStatusIcon(details.resource_type)}
                <Typography variant="h6">
                  {resourceId && !isNaN(+resourceId)
                    ? `  ${details?.resource_type || ""} - ${
                        isNaN(+resourceId) ? resourceId : Math.abs(+resourceId)
                      }`
                    : details?.resource_type || "ERROR"}
                </Typography>
              </Box>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            {/* {loading && <Typography>Loading...</Typography>} */}
            {error && <Typography color="error">{error}</Typography>}

            {details && (
              <>
                <Typography>{details.text}</Typography>
              </>
            )}

            {/* {description} */}
            {description && (
              <>
                <Typography sx={{ mt: 1, color: "black" }}>
                  Additional Information
                </Typography>

                {/* {getRowCount(description) } */}
                {/* { description.split(" ").length} */}
                {/* <TextField
                  multiline
                  rows={getRowCount(description)}
                  fullWidth
                  variant="standard"
                  value={description.split("; ")?.join("\n")}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip
                            title={copied ? "Copied!" : "Copy to clipboard"}
                            arrow
                            placement="top"
                          >
                            <IconButton
                              onClick={handleCopy}
                              edge="end"
                              color="inherit"
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    mt: import.meta.env.VITE_API_BASE_URL.endsWith("/") ? 4 : 2,
                  }}
                /> */}

                <Box
                  sx={{
                    mt: import.meta.env.VITE_API_BASE_URL.endsWith("/") ? 4 : 2,
                    position: "relative",
                    pb: 1,
                    maxHeight : "50vh",
                    overflow :"auto",
                    borderBottom :"1px solid gray"

                  }}
                >
                  <Typography
                    sx={{
                      whiteSpace: "pre-line",
                      color: "black",
                      pr: 4, // space for copy button
                    }}
                    dangerouslySetInnerHTML={{
                      __html: description.split("; ").join("\n\n"),
                    }}
                  >
                    {/* {description.split("; ").join("\n")} */}
                  </Typography>

                  <Tooltip
                    title={copied ? "Copied!" : "Copy to clipboard"}
                    arrow
                    placement="top"
                  >
                    <IconButton
                      onClick={handleCopy}
                      size="small"
                      sx={{ position: "absolute", top: '50%' ,transform : "translate(0% , -50%)", right: 0 }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </ThemeProvider>
  );
}
