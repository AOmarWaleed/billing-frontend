import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditIcon from "@mui/icons-material/Edit";

import Secure from "../../../shared/security";

type DialogMode = "add" | "edit" | "upload";

interface DialogHeaderProps {
  mode: DialogMode;
  onClose: () => void;
}

// Configuration for title and icon based on mode
const modeConfig = {
  upload: {
    title: "Import Users",
    icon: <CloudUploadIcon sx={{ color: "primary.main" }} />,
  },
  add: {
    title: "Add User",
    icon: <PersonAddIcon sx={{ color: "primary.main" }} />,
  },
  edit: {
    title: "Edit User",
    icon: <EditIcon sx={{ color: "primary.main" }} />,
  },
};

const CustomDialogHeader: React.FC<DialogHeaderProps> = ({ mode, onClose }) => {
  const { title, icon } = modeConfig[mode] || {}; // Get title and icon based on mode

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid grey.700",
      }}
    >
      {/* Left Side: Icon and Title */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon} {/* Dynamically render the icon */}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {title} {/* Dynamically render the title */}
        </Typography>
      </Box>

      {/* Right Side: Close Button (X) */}
      <IconButton
        onClick={onClose}
        sx={{ color: "grey.500", "&:hover": { color: "grey.300" } }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

export default CustomDialogHeader;
