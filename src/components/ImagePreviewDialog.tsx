import { Dialog, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ImagePreviewDialogProps {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImagePreviewDialog({ open, src, alt, onClose }: ImagePreviewDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.85)" } },
        paper: { sx: { bgcolor: "transparent", boxShadow: "none", overflow: "visible" } },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: "fixed", top: 16, right: 16, color: "white", bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" }, zIndex: 1 }}
      >
        <CloseIcon />
      </IconButton>
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          objectFit: "contain",
          borderRadius: 1,
        }}
      />
    </Dialog>
  );
}
