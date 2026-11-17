import { useState, useCallback, useRef } from "react";
import FileUploaderService, { UploadResult } from "./FileUploaderService";

export interface FileItem {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  result?: UploadResult;
}

export interface UseFileUploaderOptions {
  endpoint: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
  autoUpload?: boolean;
}

export function useFileUploader(options: UseFileUploaderOptions) {
  const { endpoint, maxFileSize, maxFiles = 10, autoUpload = true } = options;

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null);
      const incoming = Array.from(newFiles);
      const total = files.length + incoming.length;

      if (total > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const items: FileItem[] = incoming.map((file) => {
        const item: FileItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          progress: 0,
          status: "pending",
        };

        if (file.type.startsWith("image/")) {
          item.preview = URL.createObjectURL(file);
        }

        return item;
      });

      setFiles((prev) => [...prev, ...items]);

      if (autoUpload) {
        setTimeout(() => uploadFiles([...files, ...items]), 0);
      }
    },
    [files, maxFiles, autoUpload]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
    setError(null);
  }, [files]);

  const uploadFiles = useCallback(
    async (fileList?: FileItem[]) => {
      const toUpload = fileList || files;
      const pending = toUpload.filter((f) => f.status === "pending");

      if (pending.length === 0) return [];

      setIsUploading(true);
      setError(null);
      abortRef.current = new AbortController();

      pending.forEach((f) => (f.status = "uploading"));

      try {
        const rawFiles = pending.map((f) => f.file);
        const response = await FileUploaderService.upload(endpoint, rawFiles);

        const results: UploadResult[] = response.data?.data?.files || [];

        setFiles((prev) =>
          prev.map((f) => {
            if (f.status === "uploading") {
              const match = results.find(
                (r) => r.originalName === f.file.name
              );
              if (match) {
                return { ...f, status: "done", progress: 100, result: match };
              }
              return { ...f, status: "error", error: "Upload failed" };
            }
            return f;
          })
        );

        return results;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.msg ||
          err?.message ||
          "Upload failed";

        setFiles((prev) =>
          prev.map((f) =>
            f.status === "uploading"
              ? { ...f, status: "error", error: message }
              : f
          )
        );
        setError(message);
        return [];
      } finally {
        setIsUploading(false);
        abortRef.current = null;
      }
    },
    [files, endpoint]
  );

  const retryFailed = useCallback(() => {
    const failed = files.filter((f) => f.status === "error");
    const reset = files.map((f) =>
      f.status === "error" ? { ...f, status: "pending" as const, error: undefined } : f
    );
    setFiles(reset);
    uploadFiles(reset);
  }, [files, uploadFiles]);

  const getDoneFiles = useCallback(() => {
    return files.filter((f) => f.status === "done").map((f) => f.result!.filename);
  }, [files]);

  const getUploadedFilenames = useCallback((): string[] => {
    return files
      .filter((f) => f.status === "done")
      .map((f) => f.result!.filename);
  }, [files]);

  return {
    files,
    isUploading,
    error,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    retryFailed,
    getDoneFiles,
    getUploadedFilenames,
    setError,
  };
}
