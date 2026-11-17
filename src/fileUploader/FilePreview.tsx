import { Box, Typography, Chip, IconButton, Tooltip, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ErrorIcon from "@mui/icons-material/Error";
import type { FileItem } from "./useFileUploader";

interface FilePreviewProps {
  items: FileItem[];
  onRemove: (id: string) => void;
  getFileUrl: (filename: string) => string;
}

export function FilePreview({ items, onRemove, getFileUrl }: FilePreviewProps) {
  if (items.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 1,
            borderRadius: 1,
            border: "1px solid",
            borderColor: item.status === "error" ? "error.main" : "divider",
            bgcolor: item.status === "error" ? "error.50" : "background.paper",
          }}
        >
          {item.preview ? (
            <Box
              component="img"
              src={item.preview}
              alt={item.file.name}
              sx={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: 0.5,
              }}
            />
          ) : (
            <InsertDriveFileIcon color="action" sx={{ fontSize: 40 }} />
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {item.file.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {(item.file.size / 1024).toFixed(1)} KB
            </Typography>
            {item.status === "uploading" && (
              <CircularProgress size={14} sx={{ ml: 1 }} />
            )}
            {item.status === "error" && item.error && (
              <Tooltip title={item.error}>
                <ErrorIcon color="error" fontSize="small" sx={{ ml: 1, verticalAlign: "middle" }} />
              </Tooltip>
            )}
          </Box>

          <IconButton size="small" onClick={() => onRemove(item.id)} disabled={item.status === "uploading"}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}
