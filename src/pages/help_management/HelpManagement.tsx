import { useContext, useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { AuthGuardContext, Secure } from "@givc/shared-components";
import api from "../../utils/Api";
import { toast } from "react-toastify";
import HandleTitle from "../../components/HandleTitle/HandleTitle";

interface ImportResult {
  totalSections: number;
  matchedCount: number;
  matched: Array<{ page: string; function_id: number; description: string }>;
  failed: Array<{ expectedDescription: string; reason: string }>;
}

export default function HelpManagement() {
  const { t } = useContext(AuthGuardContext);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLabel = (key: string, fallback: string) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (
      file.type !==
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      toast.error(
        getLabel(
          "helpmanagement_50_FileTypeError",
          "Only .docx files are supported",
        ),
      );
      return;
    }
    setSelectedFile(file);
    setResult(null);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
      e.target.value = "";
    },
    [handleFileSelect],
  );

  const handleImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post("/api/help/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data?.data || response.data;
      setResult(data);

      if ((data.failed?.length || 0) === 0) {
        toast.success(`Successfully imported ${data.matchedCount} page(s)`);
      } else {
        toast.warning(
          `Imported ${data.matchedCount} page(s), ${data.failed?.length || 0} failed to match`,
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err.message ||
        "Import failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <HandleTitle titleKey="HELP_MANAGEMENT" />
      <Typography variant="h5" sx={{ mb: 3 }}>
        {getLabel("helpmanagement_50_PageTitle", "Help Management")}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          {getLabel("helpmanagement_50_UploadTitle", "Upload Help Document")}
        </Typography>

        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: "2px dashed",
            borderColor: isDragOver ? "primary.main" : "grey.400",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            bgcolor: isDragOver ? "action.hover" : "background.default",
            transition: "all 0.2s",
            "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: "grey.500", mb: 1 }} />
          <Typography color="textSecondary">
            {selectedFile
              ? selectedFile.name
              : getLabel(
                  "helpmanagement_50_DropHint",
                  "Drop Word file here or click to browse",
                )}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {getLabel(
              "helpmanagement_50_FileTypeError",
              "Only .docx files are supported",
            )}
          </Typography>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          hidden
          onChange={handleFileInputChange}
        />

        {loading && <LinearProgress sx={{ mt: 2 }} />}

        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Secure.GLButton
            resource_key="helpmanagement_50_ImportButton"
            variant="contained"
            onClick={handleImport}
            disabled={!selectedFile || loading}
          >
            {loading
              ? getLabel(
                  "helpmanagement_50_Importing",
                  "Importing... Please wait",
                )
              : getLabel("helpmanagement_50_ImportButton", "Import")}
          </Secure.GLButton>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            {getLabel("helpmanagement_50_SummaryTitle", "Import Summary")}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Chip label={`Total: ${result.totalSections}`} />
            <Chip
              label={`Matched: ${result.matched?.length || 0}`}
              color="success"
            />
            <Chip
              label={`Failed: ${result.failed?.length || 0}`}
              color={result.failed?.length ? "error" : "default"}
            />
          </Box>

          {result.matched?.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 1, color: "success.main" }}
              >
                Matched & Updated ({result.matched.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Title (from Word)</TableCell>
                      <TableCell>Function ID</TableCell>
                      <TableCell>DB Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.matched.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.page}</TableCell>
                        <TableCell>{item.function_id}</TableCell>
                        <TableCell>{item.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {result.failed?.length > 0 && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 1, color: "error.main" }}
              >
                Failed to Match ({result.failed.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Expected Description (from Word)</TableCell>
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.failed.map((err, i) => (
                      <TableRow key={i}>
                        <TableCell>{err.expectedDescription}</TableCell>
                        <TableCell>{err.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
