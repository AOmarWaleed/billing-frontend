import { useContext, useState, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { AuthGuardContext } from "@givc/shared-components";
import { toast } from "react-toastify";
import api from "../../../utils/Api";
import { formatFileSize } from "../../../utils/formatData/formatters";

const UPLOAD_URL = (patientId: string | number, episodeNo: string | number) =>
  `/api/patientEpisode/${patientId}/${episodeNo}/attachments`;

const ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.txt,.doc,.docx,image/*,application/pdf";

const MAX_SIZE = 25 * 1024 * 1024;

interface UploadEpisode {
  patient_id: string | number;
  episode_no: string | number;
}

interface UploadAttachmentDialogProps {
  open: boolean;
  onClose: () => void;
  episode: UploadEpisode;
  onUploaded: () => void;
}

export default function UploadAttachmentDialog({
  open,
  onClose,
  episode,
  onUploaded,
}: UploadAttachmentDialogProps) {
  const { t } = useContext(AuthGuardContext);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleClose = useCallback(() => {
    if (uploading) return;
    setFile(null);
    onClose();
  }, [uploading, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!selected) return;
    if (selected.size > MAX_SIZE) {
      toast.error(
        t("patientepisode_51_UploadTooLarge") ||
          `File exceeds the ${MAX_SIZE / 1024 / 1024} MB size limit`
      );
      return;
    }
    setFile(selected);
  };

  const handleUpload = useCallback(async () => {
    if (!file || uploading) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(UPLOAD_URL(episode.patient_id, episode.episode_no), formData);
      toast.success(
        t("patientepisode_51_UploadSuccess") || "Attachment uploaded successfully"
      );
      setFile(null);
      onClose();
      onUploaded();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.msg ||
          error?.response?.data?.message ||
          t("patientepisode_51_UploadFailed") ||
          "Failed to upload attachment"
      );
    } finally {
      setUploading(false);
    }
  }, [file, uploading, episode, t, onClose, onUploaded]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("patientepisode_51_AddAttachment") || "Add Attachment"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="textSecondary">
            {t("patientepisode_51_UploadHint") ||
              "Choose a file to attach to this episode (PDF, images, text files)."}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
              p: 2,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              style={{ display: "none" }}
              onChange={handleFileChange}
              disabled={uploading}
            />
            <Button
              variant="outlined"
              component="span"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              startIcon={<CloudUploadIcon />}
            >
              {t("patientepisode_51_ChooseFile") || "Choose File"}
            </Button>
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
              {file ? `${file.name} (${formatFileSize(file.size)})` : "—"}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          {t("patientepisode_51_Cancel") || "Cancel"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!file || uploading}
          onClick={handleUpload}
          startIcon={
            uploading ? <CircularProgress size={20} color="inherit" /> : undefined
          }
        >
          {uploading
            ? t("patientepisode_51_Uploading") || "Uploading..."
            : t("patientepisode_51_Upload") || "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
