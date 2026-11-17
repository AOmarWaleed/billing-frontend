import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as XLSX from "xlsx";
import {
  Button,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
interface FileUploaderProps {
  action: (data: any) => any; // Redux action to dispatch
  accept?: string; // File types to accept (default: .xlsx, .xls)
  label?: string; // Button label (default: "Upload")
  title: string;
  error?: string | null;
  handleClose: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  action,
  accept = ".xlsx, .xls",
  label = "Upload",
  title,
  error,
  handleClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setMessage(""); // Clear any previous messages
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    setIsLoading(true);
    setMessage("Processing file...");

    try {
      // Read the file using FileReader
      const reader = new FileReader();

      // Wrap the FileReader onload event in a Promise
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const data = e.target?.result;
          if (data) {
            resolve(data as string); // Resolve with the file data
          } else {
            reject(new Error("Failed to read file."));
          }
        };
        reader.onerror = () => {
          reject(new Error("Error reading file."));
        };
        reader.readAsBinaryString(file); // Start reading the file
      });

      // Parse the Excel file
      const workbook = XLSX.read(fileData, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert the sheet to an array of objects
      const parsedData = XLSX.utils.sheet_to_json(worksheet);

      // Dispatch the Redux action and wait for the response
      await dispatch(action(parsedData))
        .unwrap()
        .then(() => {
          setMessage("Data processed successfully.");
        })
        .catch((error: any) => {
          // Set the error message from the thunk
          setMessage(error.payload || "Error processing file.");
        });

      // If the dispatch succeeds, set a success message
    } catch (error) {
      console.error("Error Processing File:", error);
      setMessage("Error Processing File : " + error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Box display="flex" flexDirection="column" alignItems="left" gap={2}>
      {/* File Input */}
      <Box display="flex" flexDirection="row" gap={2}>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isLoading}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <span style={{ marginRight: "8px" }}>{title}</span>
          <Button variant="contained" component="span" disabled={isLoading}>
            Choose File
          </Button>
        </label>

        {/* Display the selected file name */}
        {file && (
          <Typography variant="body1">
            Selected file: <strong>{file.name}</strong>
          </Typography>
        )}
      </Box>
      {/* Display success/error messages */}
      {message && (
        <Typography
          sx={{ mb: 0 }}
          color={message.startsWith("Error") ? "#ef5350" : "textPrimary"}
        >
          {message}
        </Typography>
      )}
      {error && <span style={{ color: "#ef5350" }}>{error}</span>}
      <Divider
        sx={{
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: "grey.700", // Gray color for the divider
        }}
      />
      <div
        className="col-lg-12"
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button onClick={handleClose} style={{ marginRight: "8px" }}>
          Cancel
        </Button>
        {/* Upload Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={isLoading || !file}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" /> // Loading spinner
            ) : (
              <CloudUploadIcon /> // Upload icon
            )
          }
        >
          {isLoading ? "Processing..." : label}
        </Button>
      </div>
    </Box>
  );
};

export default FileUploader;
