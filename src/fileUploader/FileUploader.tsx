import { useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Box, Typography, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { FilePreview } from "./FilePreview";
import { useFileUploader } from "./useFileUploader";
import FileUploaderService from "./FileUploaderService";

export interface FileUploaderHandle {
  upload: () => Promise<string[]>;
  getFilenames: () => string[];
  clearFiles: () => void;
  isUploading: boolean;
  hasFiles: boolean;
  error: string | null;
}

interface FileUploaderProps {
  endpoint: string;
  maxFiles?: number;
  autoUpload?: boolean;
  existingFiles?: string[];
  chooseLabel?: string;
  addMoreLabel?: string;
  onUploadComplete?: (filenames: string[]) => void;
  onError?: (error: string) => void;
}

export const FileUploader = forwardRef<FileUploaderHandle, FileUploaderProps>(function FileUploader(
  {
    endpoint,
    maxFiles = 10,
    autoUpload = false,
    existingFiles,
    chooseLabel = "Choose Files",
    addMoreLabel = "Add More Files",
    onUploadComplete,
    onError,
  },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const baseUrl = FileUploaderService.getBaseUrl();

  const hook = useFileUploader({ endpoint, maxFiles, autoUpload });

  useImperativeHandle(
    ref,
    () => ({
      upload: async () => {
        const results = await hook.uploadFiles();
        const filenames = results.map((r) => r.filename);
        if (filenames.length > 0) onUploadComplete?.(filenames);
        return filenames;
      },
      getFilenames: () => hook.getUploadedFilenames(),
      clearFiles: () => hook.clearFiles(),
      get isUploading() { return hook.isUploading; },
      get hasFiles() { return hook.files.length > 0; },
      get error() { return hook.error; },
    }),
    [hook, onUploadComplete]
  );

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        hook.addFiles(e.target.files);
      }
      if (inputRef.current) inputRef.current.value = "";
    },
    [hook]
  );

  return (
    <Box>
      {existingFiles && existingFiles.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
          {existingFiles.map((name, i) => (
            <Box
              key={i}
              component="img"
              src={FileUploaderService.getFileUrl(baseUrl, name)}
              alt={name}
              sx={{
                width: 48,
                height: 48,
                objectFit: "cover",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
              }}
              onClick={() => window.open(FileUploaderService.getFileUrl(baseUrl, name), "_blank")}
            />
          ))}
        </Box>
      )}

      <Button
        variant="outlined"
        size="small"
        component="label"
        startIcon={<CloudUploadIcon />}
        disabled={hook.isUploading}
      >
        {hook.files.length > 0 ? addMoreLabel : chooseLabel}
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept="image/*"
          onChange={handleSelect}
        />
      </Button>

      {hook.error && (
        <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
          {hook.error}
        </Typography>
      )}

      <FilePreview
        items={hook.files}
        onRemove={hook.removeFile}
        getFileUrl={(filename) => FileUploaderService.getFileUrl(baseUrl, filename)}
      />
    </Box>
  );
});

export { useFileUploader };
