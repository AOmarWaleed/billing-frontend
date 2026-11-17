import { useState, useContext } from "react";
import { Box, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { AuthGuardContext, Secure } from "@givc/shared-components";
import { fetcher } from "../../../utils/Api";

type CustomGridColDef = GridColDef & { resource_key: string };

interface InvoiceTabProps {
  episode: any;
}

export default function InvoiceTab({ episode }: InvoiceTabProps) {
  const { t } = useContext(AuthGuardContext);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const invoiceColumns: CustomGridColDef[] = [
    {
      field: "invoice_no",
      resource_key: "patientepisode_51_InvoiceNo",
      headerName: t("patientepisode_51_InvoiceNo") || "Invoice No",
      flex: 1,
      sortable: true,
    },
    {
      field: "invoice_date",
      resource_key: "patientepisode_51_InvoiceDate",
      headerName: t("patientepisode_51_InvoiceDate") || "Date",
      flex: 1,
      sortable: true,
    },
    {
      field: "payer_name",
      resource_key: "patientepisode_51_Payer",
      headerName: t("patientepisode_51_Payer") || "Payer",
      flex: 1,
      sortable: true,
    },
    {
      field: "status",
      resource_key: "patientepisode_51_InvoiceStatus",
      headerName: t("patientepisode_51_InvoiceStatus") || "Status",
      flex: 1,
      sortable: true,
    },
    {
      field: "total",
      resource_key: "patientepisode_51_Total",
      headerName: t("patientepisode_51_Total") || "Total",
      flex: 1,
      type: "number",
      sortable: true,
      align: "right",
      headerAlign: "right",
      renderCell: (params: any) =>
        params.value ? Number(params.value).toFixed(2) : "0.00",
    },
  ];

  const detailColumns: CustomGridColDef[] = [
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
      field: "quantity",
      resource_key: "patientepisode_51_Quantity",
      headerName: t("patientepisode_51_Quantity") || "Qty",
      flex: 1,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "unit_price",
      resource_key: "patientepisode_51_UnitPrice",
      headerName: t("patientepisode_51_UnitPrice") || "Unit Price",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      renderCell: (params: any) =>
        params.value ? Number(params.value).toFixed(2) : "0.00",
    },
    {
      field: "discount",
      resource_key: "patientepisode_51_Discount",
      headerName: t("patientepisode_51_Discount") || "Discount",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      renderCell: (params: any) =>
        params.value ? Number(params.value).toFixed(2) : "0.00",
    },
    {
      field: "net",
      resource_key: "patientepisode_51_Net",
      headerName: t("patientepisode_51_Net") || "Net",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      renderCell: (params: any) =>
        params.value ? Number(params.value).toFixed(2) : "0.00",
    },
    {
      field: "tax",
      resource_key: "patientepisode_51_Tax",
      headerName: t("patientepisode_51_Tax") || "Tax",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      renderCell: (params: any) =>
        params.value ? Number(params.value).toFixed(2) : "0.00",
    },
    {
      field: "total",
      resource_key: "patientepisode_51_DetailTotal",
      headerName: t("patientepisode_51_DetailTotal") || "Total",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      renderCell: (params: any) =>
        params.value ? Number(params.value).toFixed(2) : "0.00",
    },
  ];

  const handleInvoiceSelected = (row: any) => {
    setSelectedInvoice(row);
  };

  return (
    <Box>
      <Secure.GlCustomTable
        resource_key="patientepisode_51_InvoicesTable"
        url={`/api/patientEpisode/${episode.patient_id}/${episode.episode_no}/invoices`}
        limit={10}
        columns={invoiceColumns}
        fetcher={fetcher}
        getRowId={(row: any) => row.invoice_id}
        onRowSelected={handleInvoiceSelected}
        autoSelectFirstRow={true}
        {...({ autoHeight: true } as object)}
      />

      {selectedInvoice && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t("patientepisode_51_InvoiceDetails") || "Invoice Details"} — #
            {selectedInvoice.invoice_no}
          </Typography>
          <Secure.GlCustomTable
            resource_key="patientepisode_51_InvoiceDetailsTable"
            url={`/api/patientEpisode/${episode.patient_id}/${episode.episode_no}/invoices/${selectedInvoice.invoice_id}/details`}
            limit={10}
            columns={detailColumns}
            fetcher={fetcher}
            getRowId={(row: any) => row.invoice_detail_id}
            autoSelectFirstRow={false}
            {...({ autoHeight: true } as object)}
          />
        </Box>
      )}
    </Box>
  );
}
