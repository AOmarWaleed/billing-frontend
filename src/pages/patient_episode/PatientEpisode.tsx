import { useState, useRef, useContext, useCallback } from "react";
import {
  Box,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { parseISO, isValid } from "date-fns";
import { GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import {
  GlPanelTable,
  Secure,
  AuthGuardContext,
  GlAutoComplete,
} from "@givc/shared-components";
import { fetcher } from "../../utils/Api";
import { formatDate } from "../../utils/formatData/formatterv2";
import InvoiceTab from "./components/InvoiceTab";
import ClinicalDataTab from "./components/ClinicalDataTab";
import AttachmentsTab from "./components/AttachmentsTab";
import CoverageTab from "./components/CoverageTab";
import HandleTitle from "../../components/HandleTitle/HandleTitle";

type CustomGridColDef = GridColDef & { resource_key: string };

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const parseEpisodeDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = parseISO(String(value).slice(0, 10));
  return isValid(date) ? date : null;
};

export default function PatientEpisode() {
  const { t } = useContext(AuthGuardContext);

  const [patientFilter, setPatientFilter] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [episodeFilter, setEpisodeFilter] = useState("");
  const [selectedEpisodeFilter, setSelectedEpisodeFilter] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [startDateFrom, setStartDateFrom] = useState<Date | null>(null);
  const [startDateTo, setStartDateTo] = useState<Date | null>(null);
  const [tableParams, setTableParams] = useState<Record<string, any>>({});

  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [detailTab, setDetailTab] = useState("invoices");

  const refetchRef = useRef<(() => void) | null>(null);

  const isDateRangeInvalid =
    !!startDateFrom && !!startDateTo && startDateTo < startDateFrom;

  const episodeOptionsUrl =
    selectedPatient &&
    typeof selectedPatient === "object" &&
    selectedPatient.patient_id
      ? `/api/patientEpisode/episode-options?patient_id=${selectedPatient.patient_id}`
      : "";

  const handleFilter = () => {
    if (isDateRangeInvalid) return;
    const params: Record<string, any> = {};
    if (patientFilter.trim()) params.patient_name = patientFilter.trim();
    if (episodeFilter.trim()) params.episode_no = episodeFilter.trim();
    if (statusFilter) params.status = statusFilter;
    if (startDateFrom)
      params.start_date_from = format(startDateFrom, "yyyy-MM-dd");
    if (startDateTo) params.start_date_to = format(startDateTo, "yyyy-MM-dd");
    setTableParams(params);
  };

  const handlePatientChange = (value: any) => {
    setSelectedPatient(value);
    setSelectedEpisodeFilter(null);
    setEpisodeFilter("");
    setStartDateFrom(null);
    setStartDateTo(null);
    if (typeof value === "string") {
      setPatientFilter(value);
    } else {
      setPatientFilter(value?.patient_name || "");
    }
  };

  const handleEpisodeChange = (value: any) => {
    setSelectedEpisodeFilter(value);
    if (typeof value === "string") {
      setEpisodeFilter(value);
      setStartDateFrom(null);
      setStartDateTo(null);
    } else {
      setEpisodeFilter(
        value?.episode_no != null ? String(value.episode_no) : "",
      );
      setStartDateFrom(parseEpisodeDate(value?.start_date));
      setStartDateTo(parseEpisodeDate(value?.end_date));
    }
  };

  const handleEpisodeInputChange = (value: string) => {
    setEpisodeFilter(value.replace(/\D/g, ""));
  };

  const handleEpisodeKeyDown = (event: React.KeyboardEvent) => {
    if (
      !/[0-9]/.test(event.key) &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(
        event.key,
      ) &&
      !(event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
    }

    if (event.key === "Enter") handleFilter();
  };

  const handleClear = () => {
    setPatientFilter("");
    setSelectedPatient(null);
    setEpisodeFilter("");
    setSelectedEpisodeFilter(null);
    setStatusFilter("");
    setStartDateFrom(null);
    setStartDateTo(null);
    setTableParams({});
  };

  const columns: CustomGridColDef[] = [
    {
      field: "patient_id",
      resource_key: "patientepisode_51_PatientId",
      headerName: "Patient ID",
      width: 100,
      type: "number",
      sortable: true,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "mrn",
      resource_key: "patientepisode_51_MRN",
      headerName: "MRN",
      width: 120,
      sortable: true,
    },
    {
      field: "patient_name",
      resource_key: "patientepisode_51_PatientName",
      headerName: "Patient Name",
      flex: 3,
      sortable: true,
    },
    {
      field: "episode_no",
      resource_key: "patientepisode_51_EpisodeNo",
      headerName: "Episode No",
      width: 110,
      type: "number",
      sortable: true,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "start_date",
      resource_key: "patientepisode_51_StartDate",
      headerName: "Start Date",
      flex: 1,
      sortable: true,
      renderCell: (params: any) =>
        formatDate(params.value, "DATE_FORMAT") || "—",
    },
    {
      field: "end_date",
      resource_key: "patientepisode_51_EndDate",
      headerName: "End Date",
      flex: 1,
      sortable: true,
      renderCell: (params: any) =>
        formatDate(params.value, "DATE_FORMAT") || "—",
    },
    {
      field: "status",
      resource_key: "patientepisode_51_Status",
      headerName: "Status",
      flex: 1,
      sortable: true,
    },
    {
      field: "attendance_type",
      resource_key: "patientepisode_51_AttendanceType",
      headerName: "Type",
      flex: 1,
      sortable: false,
    },
  ];

  const handleRowSelected = useCallback((row: any) => {
    if (row) {
      setSelectedEpisode(row);
      setDetailTab("invoices");
    }
  }, []);

  const handleEpisodeDataChange = useCallback((rows: any[]) => {
    if (!rows || rows.length === 0) {
      setSelectedEpisode(null);
    }
  }, []);

  const handleTabChange = useCallback((_: any, value: string) => {
    setDetailTab(value);
  }, []);

  return (
    <Box>
      <HandleTitle titleKey="PATIENT_EPISODE" />
      <GlPanelTable
        filterSection={
          <Grid
            container
            spacing={2}
            sx={{ width: "100%", alignItems: "center" }}
          >
            <Grid size={{ xs: 12, sm: 2 }}>
              <GlAutoComplete
                name="patient_id"
                url="/patients/options"
                labelKeys={["patient_name", "patient_id"]}
                separator=" - "
                idKey="patient_id"
                inputLabel={
                  t("patientepisode_51_PatientFilter") || "Patient Name/ID"
                }
                value={selectedPatient}
                onChange={handlePatientChange}
                onInputChange={(v) => setPatientFilter(v)}
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") handleFilter();
                }}
                fetcher={fetcher}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <GlAutoComplete
                name="episode_no"
                url={episodeOptionsUrl}
                labelKeys={["episode_no"]}
                separator=" - "
                idKey="episode_no"
                inputLabel={
                  t("patientepisode_51_EpisodeFilter") || "Episode No"
                }
                value={selectedEpisodeFilter}
                onChange={handleEpisodeChange}
                onInputChange={handleEpisodeInputChange}
                onKeyDown={handleEpisodeKeyDown}
                disabled={!selectedPatient}
                fetcher={fetcher}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Secure.GLTextField
                resource_key="patientepisode_51_StatusFilter"
                fullWidth
                size="small"
                label={t("patientepisode_51_StatusFilter") || "Status"}
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                select
                SelectProps={{
                  native: false,
                }}
                InputProps={{
                  endAdornment: statusFilter ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Clear status"
                        edge="end"
                        size="small"
                        onClick={() => setStatusFilter("")}
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Secure.GLTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Secure.GLDatePicker
                resource_key="patientepisode_51_DateFrom"
                label={t("patientepisode_51_DateFrom") || "Start Date"}
                format="dd/MM/yyyy"
                value={startDateFrom}
                onChange={(d: any) => setStartDateFrom(d as Date | null)}
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Secure.GLDatePicker
                resource_key="patientepisode_51_DateTo"
                label={t("patientepisode_51_DateTo") || "End Date"}
                format="dd/MM/yyyy"
                value={startDateTo}
                minDate={startDateFrom || undefined}
                onChange={(d: any) => setStartDateTo(d as Date | null)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: isDateRangeInvalid,
                    helperText: isDateRangeInvalid
                      ? t("patientepisode_51_InvalidDateRange") ||
                        "To date cannot be before From date"
                      : undefined,
                  },
                }}
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: "auto" }}
              sx={{ display: "flex", gap: 1, alignItems: "center" }}
            >
              <Secure.GLIconButton
                resource_key="patientepisode_51_SearchButton"
                onClick={handleFilter}
              >
                <SearchIcon />
              </Secure.GLIconButton>
              <Secure.GLIconButton
                resource_key="patientepisode_51_ClearButton"
                onClick={handleClear}
              >
                <ClearIcon />
              </Secure.GLIconButton>
            </Grid>
          </Grid>
        }
      >
        <Secure.GlCustomTable
          resource_key="patientepisode_51_Table"
          key={JSON.stringify(tableParams)}
          url="/api/patientEpisode"
          limit={10}
          columns={columns}
          fetcher={fetcher}
          getRowId={(row: any) => `${row.patient_id}-${row.episode_no}`}
          refetchRef={refetchRef}
          params={tableParams}
          onRowSelected={handleRowSelected}
          handleDataChange={handleEpisodeDataChange}
          autoSelectFirstRow={true}
          enableUnselectRow={false}
          {...({ autoHeight: true } as object)}
        />
      </GlPanelTable>

      {selectedEpisode && (
        <Box sx={{ mt: 2, border: 1, borderColor: "divider", borderRadius: 1 }}>
          <TabContext value={detailTab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
              <TabList onChange={handleTabChange} sx={{ minHeight: 36 }}>
                <Secure.GLTab
                  resource_key="patientepisode_51_TabInvoices"
                  label={
                    t("patientepisode_51_TabPatientAccount") ||
                    "Patient Account"
                  }
                  value="invoices"
                  sx={{ minHeight: 36, py: 0 }}
                />
                <Secure.GLTab
                  resource_key="patientepisode_51_TabClinical"
                  label={t("patientepisode_51_TabClinical") || "Clinical Data"}
                  value="clinical"
                  sx={{ minHeight: 36, py: 0 }}
                />
                <Secure.GLTab
                  resource_key="patientepisode_51_TabAttachments"
                  label={t("patientepisode_51_TabAttachments") || "Attachments"}
                  value="attachments"
                  sx={{ minHeight: 36, py: 0 }}
                />
                <Secure.GLTab
                  resource_key="patientepisode_51_TabCoverage"
                  label={
                    t("patientepisode_51_TabCoverage") ||
                    "Coverage & Price List"
                  }
                  value="coverage"
                  sx={{ minHeight: 36, py: 0 }}
                />
              </TabList>
            </Box>

            {detailTab === "invoices" && (
              <TabPanel value="invoices" sx={{ p: 2 }}>
                <InvoiceTab episode={selectedEpisode} />
              </TabPanel>
            )}
            {detailTab === "clinical" && (
              <TabPanel value="clinical" sx={{ p: 2 }}>
                <ClinicalDataTab episode={selectedEpisode} />
              </TabPanel>
            )}
            {detailTab === "attachments" && (
              <TabPanel value="attachments" sx={{ p: 2 }}>
                <AttachmentsTab episode={selectedEpisode} />
              </TabPanel>
            )}
            {detailTab === "coverage" && (
              <TabPanel value="coverage" sx={{ p: 2 }}>
                <CoverageTab episode={selectedEpisode} />
              </TabPanel>
            )}
          </TabContext>
        </Box>
      )}
    </Box>
  );
}
