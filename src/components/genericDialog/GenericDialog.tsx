import React from "react";
import {
  Dialog,
  DialogContent,
  Divider,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Props for the GenericDialog component
interface GenericDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  dividers?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  sx?: any;
}

const GenericDialog: React.FC<GenericDialogProps> = ({
  open,
  onClose,
  title,
  icon,
  content,
  dividers = true,
  maxWidth = "sm",
  fullWidth = true,
  sx = {},
}) => {
  return (
    <>
      {/* Hidden element outside the Dialog to store values */}
      <div
        id="generic-dialog-props"
        data-title={title}
        style={{ display: "none" }}
      ></div>

      <Dialog
        open={open}
        onClose={(event, reason) => reason !== "backdropClick" && onClose()}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        sx={{
          
          ...sx,
        }}
      >
        {/* Dialog Header - Reduced padding */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "3px 6px",
          }}
        >
          {/* Left Side: Icon and Title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {icon}
            <Typography sx={{ fontWeight: "bold" }}>{title}</Typography>
          </Box>

          {/* Close Button */}
          <IconButton sx={{color:"currentcolor"}} onClick={onClose} size="small">
            <CloseIcon  fontSize="small" />
          </IconButton>
        </Box>

        {/* Optional Divider - Reduced margins */}
        {dividers && (
          <Divider

            sx={{
              alignSelf: "center",
              width: "94%",
              
            }}
          />
        )}

        {/* Dialog Content - Reduced padding */}
        <DialogContent sx={{ padding: 1  }}>{content}</DialogContent>
      </Dialog>
    </>
  );
};

export default GenericDialog;
