import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import {
  Box,
  Stack,
  Typography,
  Tooltip,
  Grid2 as Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { format } from "date-fns";
import { GridColDef } from "@mui/x-data-grid";
import {
  GlPanelTable,
  Secure,
  AuthGuardContext,
  AuthGuardProvider,
} from "@givc/shared-components";
import { formatDate } from "../../utils/formatData/formatterv2";
import api, { fetcher } from "../../utils/Api";
import FeedbackService from "../../redux/services/FeedbackService";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { flattenPages } from "../../utils/trans";
import FeedbackDetailDialog from "./FeedbackDetailDialog";
import ImagePreviewDialog from "../../components/ImagePreviewDialog";
import HandleTitle from "../../components/HandleTitle/HandleTitle";

type CustomGridColDef = GridColDef & { resource_key: string };

interface FeedbackType {
  user_code: string;
  description: string;
}

export default function FeedbackAdmin() {
  const { t } = useContext(AuthGuardContext);
  const menuPages = useSelector((state: RootState) => state.trans.pages);
  const pageOptions = useMemo(() => {
    const flat = flattenPages(menuPages);
    const seen = new Set<string>();
    return flat
      .filter((p) => {
        const name = p.en_text || p.display_text;
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return true;
      })
      .map((p) => ({
        value: p.en_text || p.display_text,
        label: p.en_text || p.display_text,
      }));
  }, [menuPages]);
  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);
  const [feedbackType, setFeedbackType] = useState("");
  const [pageName, setPageName] = useState("");
  const [userFilterValue, setUserFilterValue] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tableParams, setTableParams] = useState<Record<string, any>>({});
  const [detailFeedback, setDetailFeedback] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    FeedbackService.getTypes()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setFeedbackTypes(list);
      })
      .catch(() => {});
  }, []);

  const handleFilter = () => {
    const params: Record<string, any> = {};
    if (feedbackType) params.feedback_type = feedbackType;
    if (pageName.trim()) params.page_name = pageName.trim();
    if (userFilterValue) {
      const fullName = [userFilterValue.first_name, userFilterValue.family_name]
        .filter(Boolean)
        .join(" ");
      params.created_by_name = fullName;
    }
    if (startDate) params.start_date = format(startDate, "yyyy-MM-dd");
    if (endDate) params.end_date = format(endDate, "yyyy-MM-dd");
    setTableParams(params);
  };

  const handleClear = () => {
    setFeedbackType("");
    setPageName("");
    setUserFilterValue(null);
    setStartDate(null);
    setEndDate(null);
    setTableParams({});
  };

  const handleViewDetail = useCallback((row: any) => {
    setDetailFeedback(row);
  }, []);

  const columns: CustomGridColDef[] = [
    {
      field: "feedback_id",
      resource_key: "feedbackadmin_45_FeedbackId",
      headerName: "ID",
      width: 80,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "page",
      resource_key: "feedbackadmin_45_Page",
      headerName: "Page",
      width: 150,
    },
    {
      field: "feedback_type",
      resource_key: "feedbackadmin_45_Type",
      headerName: "Type",
      width: 130,
    },
    {
      field: "feedback_text",
      resource_key: "feedbackadmin_45_Feedback",
      headerName: "Feedback",
      flex: 1,
      minWidth: 250,
      renderCell: (params: any) => (
        <Tooltip title={params.value || ""} sx={{ width: "100%" }}>
          <Box
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {params.value || "—"}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "created_by_name",
      resource_key: "feedbackadmin_45_User",
      headerName: "User",
      width: 160,
    },
    {
      field: "creation_date",
      resource_key: "feedbackadmin_45_Date",
      headerName: "Date",
      width: 170,
      renderCell: (params: any) => formatDate(params.value, "DATE_FORMAT"),
    },
    {
      field: "attachment",
      resource_key: "feedbackadmin_45_Attachments",
      headerName: "Attachments",
      width: 220,
      sortable: false,
      renderCell: (params: any) => {
        const row = params.row;
        let files: string[] = [];
        const att = row.attachment;
        if (Array.isArray(att)) files = att;
        else if (typeof att === "string") {
          try {
            const p = JSON.parse(att);
            if (Array.isArray(p)) files = p;
          } catch {}
        }
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
      },
    },
    {
      field: "actions",
      resource_key: "feedbackadmin_45_Action",
      headerName: "",
      width: 100,
      sortable: false,
      align: "left",
      headerAlign: "left",
      renderCell: (params: any) => (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          justifyContent="flex-end"
        >
          <Tooltip title={t("feedbackadmin_45_Action") || "View details"}>
            <Secure.GLIconButton
              resource_key="feedbackadmin_45_Action"
              size="small"
              onClick={() => handleViewDetail(params.row)}
            >
              <VisibilityIcon fontSize="small" />
            </Secure.GLIconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <HandleTitle titleKey="FEEDBACK_ADMIN" />
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t("feedbackadmin_45_PageTitle") || "Feedback Management"}
      </Typography>

      <GlPanelTable
        filterSection={
          <Grid
            container
            spacing={2}
            sx={{ width: "100%", alignItems: "center" }}
            onKeyDown={(e: any) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleFilter();
              }
            }}
          >
            <Grid size={{ xs: 12, sm: 2 }}>
              <Secure.GLDatePicker
                resource_key="feedbackadmin_45_StartDateFilter"
                label={t("feedbackadmin_45_StartDateFilter") || "Start Date"}
                value={startDate}
                onChange={(date) => setStartDate(date as Date | null)}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Secure.GLDatePicker
                resource_key="feedbackadmin_45_EndDateFilter"
                label={t("feedbackadmin_45_EndDateFilter") || "End Date"}
                value={endDate}
                onChange={(date) => setEndDate(date as Date | null)}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Secure.GLSecureInputs.Autocomplete
                permission="feedbackadmin_45_TypeFilter"
                freeSolo
                options={feedbackTypes}
                getOptionLabel={(opt: any) => (typeof opt === "string" ? opt : opt.description || opt.user_code)}
                value={feedbackType || null}
                inputValue={feedbackType}
                onChange={(_: any, v: any) => {
                  if (typeof v === "string") setFeedbackType(v);
                  else if (v) setFeedbackType(v.user_code || v.description || "");
                  else setFeedbackType("");
                }}
                onInputChange={(_: any, v: any) => setFeedbackType(v || "")}
                slotProps={{
                  paper: { sx: { fontSize: "12px" } },
                } as any}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Secure.GLSecureInputs.Autocomplete
                permission="feedbackadmin_45_PageFilter"
                freeSolo
                options={pageOptions.map((opt) => opt.label)}
                value={pageName || null}
                inputValue={pageName}
                onChange={(_: any, v: any) => setPageName(v || "")}
                onInputChange={(_: any, v: any) => setPageName(v || "")}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Secure.Forms.GLSecureAutoComplete
                resource_key="feedbackadmin_45_UserFilter"
                url="/usersetup/lookup"
                fetcher={fetcher}
                labelKeys={["first_name", "family_name"]}
                inputLabel={t("feedbackadmin_45_UserFilter") || "User"}
                idKey="user_id"
                name="user_id"
                value={userFilterValue}
                onChange={(val) => setUserFilterValue(val)}
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: "auto" }}
              sx={{ display: "flex", gap: 1, alignItems: "center" }}
            >
              <Secure.GLIconButton
                resource_key="feedbackadmin_45_SearchButton"
                onClick={handleFilter}
              >
                <SearchIcon />
              </Secure.GLIconButton>
              <Secure.GLIconButton
                resource_key="feedbackadmin_45_ClearButton"
                onClick={handleClear}
              >
                <ClearIcon />
              </Secure.GLIconButton>
            </Grid>
          </Grid>
        }
      >
        <Secure.GlCustomTable
          resource_key="feedbackadmin_45_Table"
          key={JSON.stringify(tableParams)}
          url="/api/feedback/all"
          limit={10}
          columns={columns}
          fetcher={fetcher}
          getRowId={(row: any) => row.feedback_id}
          params={tableParams}
        />
      </GlPanelTable>

      <AuthGuardProvider functionID="46" api={api}>
        <FeedbackDetailDialog
          open={detailFeedback !== null}
          feedback={detailFeedback}
          onClose={() => setDetailFeedback(null)}
        />
      </AuthGuardProvider>
      <ImagePreviewDialog
        open={previewImage !== null}
        src={previewImage || ""}
        alt=""
        onClose={() => setPreviewImage(null)}
      />
    </Box>
  );
}
