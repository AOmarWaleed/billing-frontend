import { useState, useCallback, useRef, useContext } from "react";
import { Box, Stack, Typography, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { GridColDef } from "@mui/x-data-grid";
import { useSearchParams } from "react-router-dom";
import {
  AuthGuardContext,
  Secure,
  DisplayMsgDialog,
} from "@givc/shared-components";
import NewFeedbackDialog from "./NewFeedbackDialog";
import FeedbackService from "../../redux/services/FeedbackService";
import FeedbackDetailDialog from "../feedback_admin/FeedbackDetailDialog";
import ImagePreviewDialog from "../../components/ImagePreviewDialog";
import type { FeedbackItem } from "../../redux/slices/feedbackSlice";
import { fetcher } from "../../utils/Api";
import { formatDate } from "../../utils/formatData/formatterv2";
import HandleTitle from "../../components/HandleTitle/HandleTitle";

type CustomGridColDef = GridColDef & {
  resource_key: string;
};

function parseFiles(attachment: any): string[] {
  if (Array.isArray(attachment)) return attachment;
  if (typeof attachment === "string") {
    try {
      const p = JSON.parse(attachment);
      if (Array.isArray(p)) return p;
    } catch {}
  }
  return [];
}

export default function SendFeedback() {
  const { t } = useContext(AuthGuardContext);
  const [searchParams] = useSearchParams();
  const pageFromUrl = searchParams.get("page") || "";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFeedback, setEditFeedback] = useState<FeedbackItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeedbackItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [detailFeedback, setDetailFeedback] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const refetchRef = useRef<(() => void) | null>(null);

  const handleRefresh = useCallback(() => {
    refetchRef.current?.();
  }, []);

  const handleDelete = (row: FeedbackItem) => {
    setDeleteTarget(row);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await FeedbackService.delete(deleteTarget.feedback_id);
      setDeleteTarget(null);
      handleRefresh();
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete feedback");
    }
  };

  const handleViewDetail = useCallback((row: any) => {
    setDetailFeedback(row);
  }, []);

  const renderAttachments = (attachment: any) => {
    const files = parseFiles(attachment);
    if (files.length === 0)
      return (
        <Typography variant="body2" color="textSecondary">
          —
        </Typography>
      );
    const visible = files.slice(0, 3);
    const remaining = files.length - 3;
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
        {visible.map((name: string, i: number) => {
          const isImage = /\.(jpe?g|png|gif|webp)$/i.test(name);
          const url = FeedbackService.getFileUrl(name);
          return isImage ? (
            <Box
              key={i}
              component="img"
              src={url}
              alt={name}
              sx={{
                width: 28,
                height: 28,
                objectFit: "cover",
                borderRadius: 0.5,
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(url);
              }}
            />
          ) : (
            <Typography
              key={i}
              variant="caption"
              color="primary"
              sx={{
                cursor: "pointer",
                textDecoration: "underline",
                lineHeight: 1,
              }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(url, "_blank");
              }}
            >
              {name}
            </Typography>
          );
        })}
        {remaining > 0 && (
          <Typography variant="caption" color="textSecondary">
            +{remaining}
          </Typography>
        )}
      </Box>
    );
  };

  const columns: CustomGridColDef[] = [
    {
      field: "feedback_id",
      resource_key: "sendfeedback_46_FeedbackId",
      headerName: "ID",
      width: 80,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "page",
      resource_key: "sendfeedback_46_Page",
      headerName: "Page",
      width: 150,
      valueGetter: (_value: any, row: any) => row.page || "—",
    },
    {
      field: "feedback_type",
      resource_key: "sendfeedback_46_Type",
      headerName: "Type",
      width: 130,
    },
    {
      field: "feedback_text",
      resource_key: "sendfeedback_46_Feedback",
      headerName: "Feedback",
      flex: 1,
      minWidth: 200,
      renderCell: (params: any) => (
        <Tooltip title={params.value || ""}>
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            {params.value || "—"}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "creation_date",
      resource_key: "sendfeedback_46_Date",
      headerName: "Date",
      width: 170,
      renderCell: (params: any) => formatDate(params.value, "DATE_FORMAT"),
    },
    {
      field: "attachment",
      resource_key: "sendfeedback_46_Attachments",
      headerName: "Attachments",
      width: 120,
      sortable: false,
      renderCell: (params: any) => renderAttachments(params.row.attachment),
    },
    {
      field: "actions",
      resource_key: "sendfeedback_46_Actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          justifyContent="flex-end"
        >
          <Tooltip title={t("sendfeedback_46_ViewButton") || "View details"}>
            <Secure.GLIconButton
              resource_key="sendfeedback_46_ViewButton"
              size="small"
              onClick={() => handleViewDetail(params.row)}
            >
              <VisibilityIcon fontSize="small" />
            </Secure.GLIconButton>
          </Tooltip>
          <Tooltip title={t("sendfeedback_46_DeleteButton") || "Delete"}>
            <Secure.GLIconButton
              resource_key="sendfeedback_46_DeleteButton"
              size="small"
              onClick={() => handleDelete(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </Secure.GLIconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <HandleTitle titleKey="USER_FEEDBACK" />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">
          {t("sendfeedback_46_PageTitle") || "Feedback"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Secure.GLGenericButton
            resource_key="sendfeedback_46_NewButton"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditFeedback(null);
              setDialogOpen(true);
            }}
          >
            {t("sendfeedback_46_NewButton") || "New Feedback"}
          </Secure.GLGenericButton>
        </Box>
      </Box>

      <Secure.GlCustomTable
        resource_key="sendfeedback_46_Table"
        url="/api/feedback/my"
        limit={10}
        columns={columns}
        fetcher={fetcher}
        getRowId={(row: any) => row.feedback_id}
        refetchRef={refetchRef}
      />

      <NewFeedbackDialog
        open={dialogOpen}
        feedback={editFeedback}
        defaultPage={pageFromUrl}
        t={t}
        onClose={() => {
          setDialogOpen(false);
          setEditFeedback(null);
          handleRefresh();
        }}
      />

      <FeedbackDetailDialog
        open={detailFeedback !== null}
        feedback={detailFeedback}
        onClose={() => setDetailFeedback(null)}
      />

      <ImagePreviewDialog
        open={previewImage !== null}
        src={previewImage || ""}
        alt=""
        onClose={() => setPreviewImage(null)}
      />

      <DisplayMsgDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        getResource={false}
        status={deleteError ? "ERROR" : "WARNING"}
        actionLabel={
          deleteError ? undefined : t("sendfeedback_46_DeleteTitle") || "Delete"
        }
        onAction={deleteError ? undefined : confirmDelete}
        children={
          <Typography>
            {deleteError ||
              t("sendfeedback_46_DeleteMessage") ||
              "Are you sure you want to delete this feedback?"}
          </Typography>
        }
        actionColor="warning"
      />
    </Box>
  );
}
