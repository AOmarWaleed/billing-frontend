import { useState, useContext } from "react";
import { Typography, Grid2 as Grid } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { AuthGuardContext, Secure } from "@givc/shared-components";
import { fetcher } from "../../../utils/Api";
import { formatDate } from "../../../utils/formatData/formatterv2";

type CustomGridColDef = GridColDef & { resource_key: string };

interface CoverageTabProps {
  episode: any;
}

export default function CoverageTab({ episode }: CoverageTabProps) {
  const { t } = useContext(AuthGuardContext);
  const [selectedPriceListId, setSelectedPriceListId] = useState<number | null>(null);

  const policyColumns: CustomGridColDef[] = [
    {
      field: "priority",
      resource_key: "patientepisode_51_Priority",
      headerName: t("patientepisode_51_Priority") || "Priority",
      flex: 1,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "payer_name",
      resource_key: "patientepisode_51_Payer",
      headerName: t("patientepisode_51_Payer") || "Payer",
      flex: 1,
      valueGetter: (_value, row) =>
        row?.payer_name || row?.payerName || row?.payer_desc || row?.payer_description || "",
    },
    {
      field: "policy_name",
      resource_key: "patientepisode_51_PolicyName",
      headerName: t("patientepisode_51_PolicyName") || "Policy",
      flex: 1,
      valueGetter: (_value, row) => row?.policy_name || row?.policyName || row?.policy || "",
    },
    {
      field: "class_name",
      resource_key: "patientepisode_51_ClassName",
      headerName: t("patientepisode_51_ClassName") || "Class",
      flex: 1,
      valueGetter: (_value, row) =>
        row?.class_name || row?.className || row?.class || "",
    },
    {
      field: "coverage_start",
      resource_key: "patientepisode_51_CoverageStart",
      headerName: t("patientepisode_51_CoverageStart") || "Start Date",
      flex: 1,
      renderCell: (params: any) => formatDate(params.value, "DATE_FORMAT") || "\u2014",
      valueGetter: (_value, row) =>
        row?.coverage_start || row?.coverageStart || row?.service_period_start || row?.start_date || "",
    },
    {
      field: "coverage_end",
      resource_key: "patientepisode_51_CoverageEnd",
      headerName: t("patientepisode_51_CoverageEnd") || "End Date",
      flex: 1,
      renderCell: (params: any) => formatDate(params.value, "DATE_FORMAT") || "\u2014",
      valueGetter: (_value, row) =>
        row?.coverage_end || row?.coverageEnd || row?.service_period_end || row?.end_date || "",
    },
    {
      field: "ep_status",
      resource_key: "patientepisode_51_EpStatus",
      headerName: t("patientepisode_51_EpStatus") || "Status",
      flex: 1,
    },
  ];

  const priceListColumns: CustomGridColDef[] = [
    {
      field: "item_name",
      resource_key: "patientepisode_51_ItemName",
      headerName: t("patientepisode_51_ItemName") || "Item",
      flex: 1,
    },
    {
      field: "item_code",
      resource_key: "patientepisode_51_ItemCode",
      headerName: t("patientepisode_51_ItemCode") || "Code",
      flex: 1,
    },
    {
      field: "price",
      resource_key: "patientepisode_51_Price",
      headerName: t("patientepisode_51_Price") || "Price",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      renderCell: (params: any) =>
        params.value ? Number(params.value).toFixed(2) : "0.00",
    },
  ];

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t("patientepisode_51_EpisodePolicies") || "Episode Policies"}
        </Typography>
        <Secure.GlCustomTable
          resource_key="patientepisode_51_PoliciesTable"
          url={`/api/patientEpisode/${episode.patient_id}/${episode.episode_no}/policies`}
          limit={10}
          columns={policyColumns}
          fetcher={fetcher}
          getRowId={(row: any) => row.episode_policy_id}
          autoSelectFirstRow={true}
          onRowSelected={(row: any) => {
            if (row?.price_list_id) {
              setSelectedPriceListId(Number(row.price_list_id));
            } else {
              setSelectedPriceListId(null);
            }
          }}
          smallSize
          {...({ autoHeight: true } as object)}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t("patientepisode_51_PriceList") || "Price List"}
        </Typography>
        {selectedPriceListId ? (
          <Secure.GlCustomTable
            resource_key="patientepisode_51_PriceListTable"
            key={selectedPriceListId}
            url={`/api/patientEpisode/price-list/${selectedPriceListId}`}
            limit={10}
            columns={priceListColumns}
            fetcher={fetcher}
            getRowId={(row: any) => row.item_price_id}
            autoSelectFirstRow={false}
            smallSize
            {...({ autoHeight: true } as object)}
          />
        ) : (
          <Typography color="textSecondary" sx={{ p: 2 }}>
            {t("patientepisode_51_SelectPolicy") || "Select a policy to view its price list"}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}
