import { useContext, useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { AuthGuardContext } from "@givc/shared-components";
import { toast } from "react-toastify";
import api, { fetcher } from "../../../utils/Api";
import { formatDate } from "../../../utils/formatData/formatterv2";

const REPORT_TYPES_URL = "/api/patientEpisode/report-types";

const GENERATE_URL = (patientId: string | number, episodeNo: string | number) =>
  `/api/patientEpisode/${patientId}/${episodeNo}/attachments/generate`;

interface ReportType {
  code: string;
  description: string;
}

interface ReportFailure {
  code: string;
  itemId?: string | null;
  reason: string;
}

interface GenerateEpisode {
  patient_id: string | number;
  episode_no: string | number;
  start_date?: string | null;
  end_date?: string | null;
}

interface GenerateAttachmentsDialogProps {
  open: boolean;
  onClose: () => void;
  episode: GenerateEpisode;
  onGenerated: () => void;
}

export default function GenerateAttachmentsDialog({
  open,
  onClose,
  episode,
  onGenerated,
}: GenerateAttachmentsDialogProps) {
  const { t } = useContext(AuthGuardContext);

  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadReportTypes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetcher(REPORT_TYPES_URL);
      const list: ReportType[] = Array.isArray(data)
        ? data
        : (data?.data ?? []);
      setReportTypes(list);
      setSelected(new Set(list.map((item) => item.code)));
    } catch {
      toast.error(
        t("patientepisode_51_GenerateFailed") ||
          "Failed to load report types"
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (open) {
      loadReportTypes();
    }
  }, [open, loadReportTypes]);

  const toggle = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(reportTypes.map((item) => item.code)) : new Set());
  };

  const handleGenerate = useCallback(async () => {
    const reports = Array.from(selected);
    if (reports.length === 0 || generating) return;

    setGenerating(true);
    try {
      const { data } = await api.post(
        GENERATE_URL(episode.patient_id, episode.episode_no),
        { reports }
      );
      const failures: ReportFailure[] = data?.data?.failures ?? [];
      if (failures.length > 0) {
        const details = failures
          .map(
            (f) =>
              `${f.code}${f.itemId ? `/${f.itemId}` : ""} (${f.reason})`
          )
          .join(", ");
        toast.warning(
          `${t("patientepisode_51_GeneratePartial") || "Some reports failed"}: ${details}`
        );
      } else {
        toast.success(
          t("patientepisode_51_GenerateSuccess") ||
            "Attachments generated successfully"
        );
      }
      onGenerated();
      onClose();
    } catch (error: any) {
      const failures: ReportFailure[] =
        error?.response?.data?.data?.failures ?? [];
      const baseMsg =
        error?.response?.data?.msg ||
        t("patientepisode_51_GenerateFailed") ||
        "Failed to generate attachments";
      toast.error(
        failures.length > 0
          ? `${baseMsg}: ${failures
              .map((f) => `${f.code} (${f.reason})`)
              .join(", ")}`
          : baseMsg
      );
    } finally {
      setGenerating(false);
    }
  }, [selected, generating, episode, t, onGenerated, onClose]);

  const allSelected =
    reportTypes.length > 0 && selected.size === reportTypes.length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {generating && <CircularProgress size={20} color="inherit" />}
          <Typography component="span">
            {t("patientepisode_51_GenerateTitle") || "Generate Attachments"}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2">
              {t("patientepisode_51_ReportTypes") || "Report Types"}
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  disabled={loading || reportTypes.length === 0 || generating}
                />
              }
              label={t("patientepisode_51_SelectAll") || "Select All"}
            />
          </Box>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {reportTypes.map((type) => (
            <FormControlLabel
              key={type.code}
              control={
                <Checkbox
                  checked={selected.has(type.code)}
                  onChange={() => toggle(type.code)}
                  disabled={generating}
                />
              }
              label={
                t(`patientepisode_51_ReportType_${type.code}`) ||
                type.description
              }
            />
          ))}

          <Typography variant="caption" color="textSecondary">
            {[
              formatDate(episode?.start_date, "DATE_FORMAT"),
              formatDate(episode?.end_date, "DATE_FORMAT"),
            ].filter(Boolean).join(" — ")}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={generating}>
          {t("patientepisode_51_Cancel") || "Cancel"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={selected.size === 0 || generating}
          onClick={handleGenerate}
          startIcon={generating ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {generating
            ? t("patientepisode_51_Generating") || "Generating..."
            : t("patientepisode_51_GenerateButton") || "Generate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
