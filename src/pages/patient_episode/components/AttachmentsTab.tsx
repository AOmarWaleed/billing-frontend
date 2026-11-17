import { useContext, useState, useCallback, useRef } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import { AuthGuardContext, Secure, DisplayMsgDialog } from "@givc/shared-components";
import { toast } from "react-toastify";
import api, { fetcher } from "../../../utils/Api";
import PDFViewer from "./PDFViewer";
import GenerateAttachmentsDialog from "./GenerateAttachmentsDialog";
import UploadAttachmentDialog from "./UploadAttachmentDialog";
import { formatDate } from "../../../utils/formatData/formatterv2";
import { formatFileSize } from "../../../utils/formatData/formatters";

const DOWNLOAD_URL = (fileName: string, patientId: string | number) =>
  `/api/patientEpisode/${patientId}/attachments/${encodeURIComponent(fileName)}/download`;

const DELETE_URL = (patientId: string | number, episodeNo: string | number, fileName: string) =>
  `/api/patientEpisode/${patientId}/${episodeNo}/attachments/${encodeURIComponent(fileName)}`;

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

type CustomGridColDef = GridColDef & { resource_key: string };

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function isImageFile(fileName: string): boolean {
  return IMAGE_EXTENSIONS.includes(getFileExtension(fileName));
}

function isPdfFile(fileName: string): boolean {
  return getFileExtension(fileName) === "pdf";
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

interface AttachmentsTabProps {
  episode: any;
}

export default function AttachmentsTab({ episode }: AttachmentsTabProps) {
  const { t } = useContext(AuthGuardContext);

  const tableRef = useRef<any>(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    data: string;
    contentType: string;
  } | null>(null);

  const [generateOpen, setGenerateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const handleView = useCallback(async (row: any) => {
    setViewerLoading(true);
    try {
      const response = await fetcher([
        DOWNLOAD_URL(row.file_name, episode.patient_id),
        { responseType: "blob" },
      ]);
      const blob = response instanceof Blob ? response : new Blob([response]);
      const base64 = await blobToBase64(blob);
      const ext = getFileExtension(row.file_name);
      const mimeMap: Record<string, string> = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
      };
      setSelectedFile({ name: row.file_name, data: base64, contentType: mimeMap[ext] || "application/octet-stream" });
      setViewerOpen(true);
    } catch {
      setSelectedFile(null);
    } finally {
      setViewerLoading(false);
    }
  }, [episode]);

  const handleDownload = useCallback(async (row: any) => {
    try {
      const response = await fetcher([
        DOWNLOAD_URL(row.file_name, episode.patient_id),
        { responseType: "blob" },
      ]);
      const blob = response instanceof Blob ? response : new Blob([response]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = row.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  }, [episode]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(DELETE_URL(episode.patient_id, episode.episode_no, deleteTarget.file_name));
      toast.success(t("patientepisode_51_DeleteSuccess") || "Attachment deleted successfully");
      setDeleteTarget(null);
      tableRef.current?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.msg ||
          t("patientepisode_51_DeleteFailed") ||
          "Failed to delete attachment"
      );
    }
  }, [deleteTarget, episode, t]);

  const handleViewerClose = () => {
    setViewerOpen(false);
    setSelectedFile(null);
  };

  const columns: CustomGridColDef[] = [
    {
      field: "file_name",
      resource_key: "patientepisode_51_FileName",
      headerName: t("patientepisode_51_FileName") || "File Name",
      flex: 1,
    },
    {
      field: "file_size",
      resource_key: "patientepisode_51_FileSize",
      headerName: t("patientepisode_51_FileSize") || "Size",
      width: 100,
      renderCell: (params: any) => formatFileSize(params.value),
    },
    {
      field: "att_type",
      resource_key: "patientepisode_51_FileType",
      headerName: t("patientepisode_51_FileType") || "Type",
      width: 100,
    },
    {
      field: "creation_date",
      resource_key: "patientepisode_51_CreationDate",
      headerName: t("patientepisode_51_CreationDate") || "Created",
      width: 130,
      renderCell: (params: any) => formatDate(params.value, "DATE_FORMAT") || "\u2014",
    },
    {
      field: "actions",
      resource_key: "patientepisode_51_AttachmentActions",
      headerName: "",
      width: 140,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Secure.GLIconButton
              resource_key="patientepisode_51_View"
              size="small"
              onClick={(e: any) => {
                e.stopPropagation();
                handleView(params.row);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </Secure.GLIconButton>
            <Secure.GLIconButton
              resource_key="patientepisode_51_Download"
              size="small"
              onClick={(e: any) => {
                e.stopPropagation();
                handleDownload(params.row);
              }}
            >
              <DownloadIcon fontSize="small" />
            </Secure.GLIconButton>
            <Secure.GLIconButton
              resource_key="patientepisode_51_Delete"
              size="small"
              onClick={(e: any) => {
                e.stopPropagation();
                setDeleteTarget(params.row);
              }}
            >
              <DeleteIcon fontSize="small" />
            </Secure.GLIconButton>
          </Stack>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle2">
          {t("patientepisode_51_AttachmentsTitle") || "Attachments"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Secure.GLIconButton
            resource_key="patientepisode_51_AddAttachment"
            onClick={() => setUploadOpen(true)}
          >
            <AddIcon />
          </Secure.GLIconButton>
          <Secure.GLIconButton
            resource_key="patientepisode_51_GenerateAttachment"
            onClick={() => setGenerateOpen(true)}
          >
            <PictureAsPdfIcon />
          </Secure.GLIconButton>
        </Box>
      </Box>

      <Secure.GlCustomTable
        resource_key="patientepisode_51_AttachmentsTable"
        url={`/api/patientEpisode/${episode.patient_id}/${episode.episode_no}/attachments`}
        limit={10}
        columns={columns}
        fetcher={fetcher}
        getRowId={(row: any) => row.req_no ?? `${row.file_name}_${row.creation_date}`}
        autoSelectFirstRow={false}
        refetchRef={tableRef}
        {...({ autoHeight: true } as object)}
      />

      <Dialog
        open={viewerOpen}
        onClose={handleViewerClose}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.85)" } },
          paper: {
            sx: { bgcolor: "transparent", boxShadow: "none", overflow: "visible" },
          },
        }}
      >
        <Box sx={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 1, zIndex: 1 }}>
          {(isImageFile(selectedFile?.name || "") || isPdfFile(selectedFile?.name || "")) && selectedFile && (
            <IconButton
              onClick={() => {
                const a = document.createElement("a");
                const byteChars = atob(selectedFile.data);
                const buffer = new Uint8Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) buffer[i] = byteChars.charCodeAt(i);
                const blob = new Blob([buffer], { type: selectedFile.contentType });
                const url = URL.createObjectURL(blob);
                a.href = url;
                a.download = selectedFile.name;
                a.target = "_blank";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              sx={{ color: "white", bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
              title={t("patientepisode_51_Download") || "Download"}
            >
              <DownloadIcon />
            </IconButton>
          )}
          <IconButton
            onClick={handleViewerClose}
            sx={{ color: "white", bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", bgcolor: "rgba(0,0,0,0.7)", color: "white", px: 2, py: 0.5, borderRadius: 1, fontSize: "0.85rem", zIndex: 1 }}>
          {selectedFile?.name}
        </Box>

        {viewerLoading && (
          <Box sx={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1 }}>
            <CircularProgress sx={{ color: "white" }} />
          </Box>
        )}

        <DialogContent sx={{ p: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {selectedFile && isImageFile(selectedFile.name) && (
            <Box
              component="img"
              src={`data:${selectedFile.contentType};base64,${selectedFile.data}`}
              alt={selectedFile.name}
              sx={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 1 }}
            />
          )}
          {selectedFile && isPdfFile(selectedFile.name) && (
            <Box sx={{ bgcolor: "white", borderRadius: 1, p: 2, maxHeight: "90vh", overflow: "auto" }}>
              <PDFViewer encodedData={selectedFile.data} fileName={selectedFile.name} />
            </Box>
          )}
          {selectedFile && !isImageFile(selectedFile.name) && !isPdfFile(selectedFile.name) && (
            <Typography variant="body1" color="white" sx={{ p: 4 }}>
              {t("patientepisode_51_PreviewNotAvailable") || "Preview not available for this file type"}
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      <DisplayMsgDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        getResource={false}
        status="DELETE"
        actionLabel={t("patientepisode_51_Delete") || "Delete"}
        onAction={confirmDelete}
        children={
          t("patientepisode_51_DeleteConfirmMessage") ||
          "Are you sure you want to delete this attachment?"
        }
        actionColor="error"
      />

      <GenerateAttachmentsDialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        episode={episode}
        onGenerated={() => tableRef.current?.()}
      />

      <UploadAttachmentDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        episode={episode}
        onUploaded={() => tableRef.current?.()}
      />
    </Box>
  );
}
