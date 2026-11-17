import { useState, useContext } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AuthGuardContext, Secure } from "@givc/shared-components";
import FeedbackService from "../../redux/services/FeedbackService";
import ImagePreviewDialog from "../../components/ImagePreviewDialog";

interface FeedbackDetailDialogProps {
  open: boolean;
  onClose: () => void;
  feedback: any | null;
}

export default function FeedbackDetailDialog({ open, onClose, feedback }: FeedbackDetailDialogProps) {
  const { t } = useContext(AuthGuardContext);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  if (!feedback) return null;

  const files: string[] = (() => {
    const att = feedback.attachment;
    if (Array.isArray(att)) return att;
    if (typeof att === "string") {
      try { const p = JSON.parse(att); if (Array.isArray(p)) return p; } catch {}
    }
    return [];
  })();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("sendfeedback_46_DetailTitle") || "Feedback Details"}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              {t("sendfeedback_46_Page") || "Page"}
            </Typography>
            <Typography variant="body1">{feedback.page || "—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              {t("sendfeedback_46_Type") || "Type"}
            </Typography>
            <Typography variant="body1">{feedback.feedback_type || "—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              {t("sendfeedback_46_Feedback") || "Feedback"}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {feedback.feedback_text || "—"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              {t("sendfeedback_46_User") || "User"}
            </Typography>
            <Typography variant="body1">{feedback.created_by_name || "—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              {t("sendfeedback_46_Date") || "Date"}
            </Typography>
            <Typography variant="body1">
              {feedback.creation_date ? new Date(feedback.creation_date).toLocaleString() : "—"}
            </Typography>
          </Box>
          {files.length > 0 && (
            <Box>
              <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                {t("sendfeedback_46_Attachments") || "Attachments"}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {files.map((name: string, i: number) => {
                  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(name);
                  const url = FeedbackService.getFileUrl(name);
                  return isImage ? (
                    <Box
                      key={i}
                      component="img"
                      src={url}
                      alt={name}
                      sx={{
                        width: 80, height: 80, objectFit: "cover", borderRadius: 1,
                        border: "1px solid", borderColor: "divider", cursor: "pointer",
                      }}
                      onClick={() => setPreviewImage(url)}
                    />
                  ) : (
                    <Typography
                      key={i}
                      variant="body2"
                      color="primary"
                      sx={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => window.open(url, "_blank")}
                    >
                      {name}
                    </Typography>
                  );
                })}
              </Box>
              <ImagePreviewDialog
                open={previewImage !== null}
                src={previewImage || ""}
                alt=""
                onClose={() => setPreviewImage(null)}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Secure.GLButton resource_key="sendfeedback_46_ClearButton" onClick={onClose}>
          {t("sendfeedback_46_ClearButton") || "Close"}
        </Secure.GLButton>
      </DialogActions>
    </Dialog>
  );
}
