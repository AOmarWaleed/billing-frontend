import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CustomUserForm from "./CustomUserForm";
import FileUploader from "../../../components/fileUploader/FileUploaderWithCols";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import CustomDialogHeader from "./CustomHeaderDialog";
import { GridRowId } from "@mui/x-data-grid";
type DialogMode = "add" | "edit" | "upload";

import Secure from "../../../shared/security";

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  mode: DialogMode;
  isNew?: boolean;
  editId?: number | null; // ID of the user being edited (if in edit mode)
  error?: string | null; // Error message to display
  uploadUsers: (data: any) => any;
  editRow: any;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onClose,
  mode,
  isNew,
  editId,
  error,
  uploadUsers,
  editRow,
}) => {
  const handleCloseDialog = () => {
    onClose();
  };

  return (
    <Dialog
      disableEscapeKeyDown
      // Prevent closing on Escape key

      open={open}
      onClose={(event, reason) => {
        // Prevent closing on backdrop click or Escape key
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
          return;
        }
        handleCloseDialog();
      }}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          // backgroundColor: "#121212", // Dark background for the dialog
          // color: "#ffffff", // Light text color
          borderRadius: "8px", // Optional: Add rounded corners
        },
        borderTop: "2px solid rgb(104, 104, 104)", // Custom top divider
        borderBottom: "2px solid rgb(109, 107, 108)", // Custom bottom divider
        padding: "16px 24px", // Optional: Adjust padding
      }}
    >
      {/* Use the DialogHeader component */}
      <CustomDialogHeader mode={mode} onClose={handleCloseDialog} />

      {/* Horizontal Gray Divider */}
      <Divider
        sx={{
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: "grey.800", // Gray color for the divider
          mr: "15px",
          ml: "15px",
          mb: "15px",
        }}
      />
      {/* Dialog Content */}
      <DialogContent>
        {/* Render the appropriate component based on the mode */}
        {mode === "upload" ? (
          <>
            <FileUploader
              action={uploadUsers} // Pass the appropriate Redux action
              label="Upload Users"
              handleClose={handleCloseDialog}
              title="Upload Users"
              error={error}
              columnsToRead={[
                "user_id",
                "user_name",
                "employee_id,employee_id",
                "password",
                "email",
              ]}
            />
          </>
        ) : (
          <CustomUserForm
            isNew={isNew}
            editId={editId || 0} // Pass the edit ID (0 for add mode)
            editRow={editRow}
            handleClose={handleCloseDialog}
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
