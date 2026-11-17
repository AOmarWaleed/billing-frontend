import { useContext } from "react";
import { Box, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { AuthGuardContext, Secure } from "@givc/shared-components";
import { fetcher } from "../../../utils/Api";
import { formatDate } from "../../../utils/formatData/formatterv2";

type CustomGridColDef = GridColDef & { resource_key: string };

interface ClinicalDataTabProps {
  episode: any;
}

const complaintColumns: CustomGridColDef[] = [
  {
    field: "CHIEF_COMPLAINT",
    resource_key: "patientepisode_51_CHIEF_COMPLAINT",
    headerName: "CHIEF_COMPLAINT",
    flex: 3,
  },
  {
    field: "START_DATE",
    resource_key: "patientepisode_51_START_DATE",
    headerName: "START_DATE",
    width: 130,
    renderCell: (params: any) =>
      formatDate(params.value, "DATE_FORMAT") || "\u2014",
  },
  {
    field: "END_DATE",
    resource_key: "patientepisode_51_END_DATE",
    headerName: "END_DATE",
    width: 130,
    renderCell: (params: any) =>
      formatDate(params.value, "DATE_FORMAT") || "\u2014",
  },
];

const vitalSignColumns: CustomGridColDef[] = [
  {
    field: "HIGHT",
    resource_key: "patientepisode_51_HIGHT",
    headerName: "HIGHT",
    flex: 1,
    type: "number",
    align: "left",
    headerAlign: "left",
  },
  {
    field: "WEIGHT",
    resource_key: "patientepisode_51_WEIGHT",
    headerName: "WEIGHT",
    flex: 1,
    type: "number",
    align: "left",
    headerAlign: "left",
  },
  {
    field: "TEMPERATURE",
    resource_key: "patientepisode_51_TEMPERATURE",
    headerName: "TEMPERATURE",
    flex: 1,
    type: "number",
    align: "left",
    headerAlign: "left",
  },
  {
    field: "HIGH_BLOOD_PRESSURE",
    resource_key: "patientepisode_51_HIGH_BLOOD_PRESSURE",
    headerName: "HIGH_BP",
    flex: 1,
    type: "number",
    align: "left",
    headerAlign: "left",
  },
  {
    field: "LOW_BLOOD_PRESSURE",
    resource_key: "patientepisode_51_LOW_BLOOD_PRESSURE",
    headerName: "LOW_BP",
    flex: 1,
    type: "number",
    align: "left",
    headerAlign: "left",
  },
  {
    field: "PULSE_RATE",
    resource_key: "patientepisode_51_PULSE_RATE",
    headerName: "PULSE",
    flex: 1,
    type: "number",
    align: "left",
    headerAlign: "left",
  },
  {
    field: "RESPIRATORY_RATE",
    resource_key: "patientepisode_51_RESPIRATORY_RATE",
    headerName: "RESP_RATE",
    flex: 1,
    type: "number",
    align: "left",
    headerAlign: "left",
  },
  {
    field: "OXYGEN_SATURATION",
    resource_key: "patientepisode_51_OXYGEN_SATURATION",
    headerName: "O2_SAT",
    flex: 1,
    type: "number",
    align: "left",
    headerAlign: "left",
  },
];

const diagnosisColumns: CustomGridColDef[] = [
  {
    field: "DIAGNOSIS_CODE",
    resource_key: "patientepisode_51_DIAGNOSIS_CODE",
    headerName: "DIAGNOSIS_CODE",
    flex: 1,
    type: "number",
    align: "left",
    headerAlign: "left",
  },
  {
    field: "DESCRIPTION",
    resource_key: "patientepisode_51_DESCRIPTION",
    headerName: "DESCRIPTION",
    flex: 1,
  },
  {
    field: "DIAGNOSIS_TYPE_DESC",
    resource_key: "patientepisode_51_DIAGNOSIS_TYPE_DESC",
    headerName: "DIAGNOSIS_TYPE",
    flex: 1,
  },
  {
    field: "FINAL_DIAGNOSIS",
    resource_key: "patientepisode_51_FINAL_DIAGNOSIS",
    headerName: "FINAL_DIAG",
    flex: 1,
  },
  {
    field: "ADMIT_FLAG",
    resource_key: "patientepisode_51_ADMIT_FLAG",
    headerName: "ADMIT",
    flex: 1,
  },
  {
    field: "DATE_RECORDED",
    resource_key: "patientepisode_51_DATE_RECORDED",
    headerName: "DATE_RECORDED",
    width: 130,
    renderCell: (params: any) =>
      formatDate(params.value, "DATE_FORMAT") || "\u2014",
  },
  {
    field: "PATIENT_ID",
    resource_key: "patientepisode_51_PATIENT_ID",
    headerName: "PATIENT_ID",
    flex: 1,
    type: "number",
    align: "left",
    headerAlign: "left",
  },
  {
    field: "EPISODE_NO",
    resource_key: "patientepisode_51_EPISODE_NO",
    headerName: "EPISODE_NO",
    flex: 1,
    type: "number",
    align: "left",
    headerAlign: "left",
  },
];

export default function ClinicalDataTab({ episode }: ClinicalDataTabProps) {
  const { t } = useContext(AuthGuardContext);

  const baseUrl = `/api/patientEpisode/${episode.patient_id}/${episode.episode_no}/clinical-data`;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t("patientepisode_51_ChiefComplaintsTable") || "Chief Complaints"}
      </Typography>
      <Secure.GlCustomTable
        resource_key="patientepisode_51_ChiefComplaintsTable"
        url={`${baseUrl}/complaints`}
        limit={10}
        columns={complaintColumns}
        fetcher={fetcher}
        getRowId={(row: any, index?: number) => `complaint_${index}`}
        autoSelectFirstRow={false}
        {...({ autoHeight: true } as object)}
      />

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        {t("patientepisode_51_VitalSignsTable") || "Vital Signs"}
      </Typography>
      <Secure.GlCustomTable
        resource_key="patientepisode_51_VitalSignsTable"
        url={`${baseUrl}/vitals`}
        limit={10}
        columns={vitalSignColumns}
        fetcher={fetcher}
        getRowId={(row: any, index?: number) => `vital_${index}`}
        autoSelectFirstRow={false}
        {...({ autoHeight: true } as object)}
      />

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        {t("patientepisode_51_MainSymptomsTable") || "Episode Main Symptoms"}
      </Typography>
      <Secure.GlCustomTable
        resource_key="patientepisode_51_MainSymptomsTable"
        url={`${baseUrl}/diagnoses`}
        limit={10}
        columns={diagnosisColumns}
        fetcher={fetcher}
        getRowId={(row: any, index?: number) => `diagnosis_${index}`}
        autoSelectFirstRow={false}
        {...({ autoHeight: true } as object)}
      />
    </Box>
  );
}
