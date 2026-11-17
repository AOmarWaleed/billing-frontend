import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as XLSX from "xlsx";
import { Button, Typography, Box, Divider, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface FileUploaderProps {
  action: (data: any) => any; // Redux action to dispatch
  accept?: string; // File types to accept (default: .xlsx, .xls)
  label?: string; // Button label (default: "Upload")
  title?: string;
  error?: string | null;
  handleClose: () => void;
  columnsToRead?: string[]; // Array of column names to read (optional)
  btnLabel: string;
  uploadBtnLabel: string;
  // ✅ Custom render function for feedback (optional)
  renderFeedback?: (feedback: any) => React.ReactNode;
}

const FileUploaderWithCols: React.FC<FileUploaderProps> = ({ action, accept = ".xlsx, .xls", label = "Upload", title, error, handleClose, columnsToRead, btnLabel, uploadBtnLabel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [feedback, setFeedback] = useState<any>(null); // can hold object or string
  const [showAllFailedUsers, setShowAllFailedUsers] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setMessage(""); // Clear any previous messages
    }
  };

  // Filter data to only include specified columns
  const filterColumns = (data: any[]) => {
    if (!columnsToRead || columnsToRead.length === 0) return data;

    return data.map((row) => {
      const filteredRow: any = {};
      columnsToRead.forEach((col) => {
        if (row.hasOwnProperty(col)) {
          filteredRow[col] = row[col];
        }
      });
      return filteredRow;
    });
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

      // Filter the data to only include specified columns
      const filteredData = filterColumns(parsedData);

      // ✅ Add this validation
      if (filteredData.length === 0) {
        setMessage("No valid data found in file.");
        setIsLoading(false); // Stop loading if no data
        return;
      }

      // Dispatch the Redux action with filtered data
      await dispatch(action(filteredData))
        .unwrap()
        .then((response: any) => {
          setFeedback(response);
          setMessage("Data processed successfully.");
        })
        .catch((error: any) => {
          setMessage(error.payload || "Error processing file.");
        });
    } catch (error) {
      console.error("Error Processing File:", error);
      setMessage("Error Processing File : " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="left" gap={2} sx={{ width: "100%" }}>
      {/* File Input */}
      <Box display="flex" alignItems="center" gap={2}>
        <input type="file" accept={accept} onChange={handleFileChange} disabled={isLoading} style={{ display: "none" }} id="file-upload" />
        <label htmlFor="file-upload">
          <Button variant="outlined" component="span" disabled={isLoading} startIcon={<CloudUploadIcon />} sx={{ backgroundColor: "text.obs", color: "primary.main" }}>
            {uploadBtnLabel}
          </Button>
        </label>

        {file && (
          <Typography variant="body2" color="text.obs">
            Selected: <strong>{file.name}</strong>
          </Typography>
        )}
      </Box>

      {/* Display columns to be read */}
      {/* {columnsToRead && columnsToRead.length > 0 && <Typography variant="body2">Columns to import: {columnsToRead.join(", ")}</Typography>} */}

      {/* Display success/error messages */}
      {message && (
        <Typography variant="body2" sx={{ mb: 0 }} color={message.startsWith("Error") ? "yellow" : "textPrimary"}>
          {message}
        </Typography>
      )}

      {/* {feedback && typeof feedback === "object" && (
        <Box mt={1} p={1} sx={{ backgroundColor: "#f3f3f3", borderRadius: 1 }}>
          <Typography variant="body2">
            ✅ <strong>{feedback.summary?.added}</strong> users added, ⚠️ <strong>{feedback.summary?.duplicates}</strong> duplicates, ❌ <strong>{feedback.summary?.validationErrors}</strong>{" "}
            validation errors.
          </Typography>

          {feedback.failedUsers?.length > 0 && (
            <Box mt={1}>
              <Typography variant="body2" fontWeight="bold">
                Failed Users:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {feedback.failedUsers.slice(0, 5).map((f: any, index: number) => (
                  <li key={index}>
                    User: {`"` + (f.user.user_name || "Unnamed") + `"`} - <span style={{ color: "red" }}>{f.reason}</span>
                  </li>
                ))}
                {feedback.failedUsers.length > 5 && <li>...and {feedback.failedUsers.length - 5} more</li>}
              </ul>
            </Box>
          )}
        </Box>
      )} */}
      {feedback && typeof feedback === "object" && (
        <Box mt={1} p={1} sx={{ backgroundColor: "#f3f3f3", borderRadius: 1 }}>
          <Typography variant="body2">
            ✅ <strong>{feedback.summary?.added}</strong> users added, ⚠️ <strong>{feedback.summary?.duplicates}</strong> duplicates, ❌{" "}
            <strong>{feedback.summary?.validationErrors?.length || 0}</strong> validation errors.
          </Typography>

          {feedback.failedUsers?.length > 0 && (
            <Box mt={1}>
              <Typography variant="body2" fontWeight="bold">
                Failed Users:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {(showAllFailedUsers ? feedback.failedUsers : feedback.failedUsers.slice(0, 5)).map((f: any, index: number) => (
                  <li key={index}>
                    User: {`"` + (f.user?.user_name || "Unnamed") + `"`} - <span style={{ color: "red" }}>{f.reason}</span>
                  </li>
                ))}
              </ul>

              {feedback.failedUsers.length > 5 && (
                <Typography variant="body2" color="primary" sx={{ cursor: "pointer", mt: 1 }} onClick={() => setShowAllFailedUsers((prev) => !prev)}>
                  {showAllFailedUsers ? "Show less" : `...and ${feedback.failedUsers.length - 5} more`}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}

      {error && <span style={{ color: "yellow" }}>{error}</span>}

      <Divider
        sx={{
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: "grey.700",
        }}
      />

      <div
        className="col-lg-12"
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}>
        <Button onClick={handleClose} variant="outlined" sx={{ mr: 2, backgroundColor: "text.obs", color: "primary.main" }}>
          {btnLabel}
        </Button>
        <Button variant="contained" color="primary" onClick={handleUpload} disabled={isLoading || !file} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}>
          {isLoading ? "Processing..." : label}
        </Button>
      </div>
    </Box>
  );
};

export default FileUploaderWithCols;
