import React, { useEffect, useState } from "react";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import GlPanelTable from "../../shared/tables/GlPanelTable";
import GlCustomTable from "../../shared/tables/GlCustomTable";
import api from "../../utils/Api";
import InvoiceFilter from "./Components/Filter";
import { useSelector } from "react-redux";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import { RootState } from "../../redux/store";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { AxiosError } from "axios";
import { DisplayMsgDialog } from "@givc/shared-components";
import ReportAll from "./Components/ReportAll";
import axios from "../../utils/Api";
import CustomDialog from "../../components/CustomDialog/CustomDialog";
import Secure from "../../shared/security/index";
import { useContext } from "react";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { GLGridColDef } from "../../shared/security/GLCustomTable";
export const handleDownload = (
  data: string,
  fileName: string,
  type: "json" | "xml",
) => {
  const mime =
    type === "json"
      ? "application/json;charset=utf-8"
      : "text/xml;charset=utf-8";

  const blob = new Blob([data], { type: mime });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const ext = type === "json" ? ".json" : ".xml";
  a.download = fileName.endsWith(ext) ? fileName : `${fileName}${ext}`;

  a.click();
  a.remove();

  URL.revokeObjectURL(url);
};

export const handleDownloadJSON = async (
  transId: string,
  invoiceId: string,
) => {
  try {
    const response = await axios.get(`/api/invoice/apiTrans/${transId}`);

    const requestData = response.data.data[0].request;
    handleDownload(
      requestData,
      `${transId}_invoice_${invoiceId}_request`,
      "json",
    );

    const responseData = response.data.data[0].response;
    handleDownload(
      responseData,
      `${transId}_invoice_${invoiceId}_response`,
      "json",
    );
  } catch (error) {
    console.error("Error downloading JSON:", error);
  }
};

export const invoiceColumns: GLGridColDef[] = [
  {
    field: "invoice_id",
    headerName: "Invoice ID",
    flex: 1,
    type: "number",
    resource_key: "inovices_22_invoiceIdInvoiceTable",
  },
  {
    field: "invoice_no",
    headerName: "Invoice No",
    flex: 1,
    resource_key: "inovices_22_invoiceNoInvoiceTable",
  },
  {
    field: "payer_id",
    headerName: "Payer ID",
    flex: 1,
    resource_key: "inovices_22_payerIdInvoiceTable",
    valueFormatter: (params) => params || "",
  },
  {
    field: "payer_short_name", //table payer cloumn short_name
    headerName: "Payer Name",
    flex: 2,
    resource_key: "inovices_22_payerNameInvoiceTable",
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    resource_key: "inovices_22_statusInvoiceTable",
  },
  {
    field: "invoice_date",
    headerName: "Date",
    flex: 1.5,
    resource_key: "inovices_22_dateInvoiceTable",
    // type: "date",
    // valueFormatter: (params) =>
    //   params ? new Date(params).toLocaleDateString() : " ",
  },
  {
    field: "payment_type",
    headerName: "Payment Type",
    flex: 1,
    resource_key: "inovices_22_paymentTypeInvoiceTable",
  },
  {
    field: "net",
    headerName: "Net",
    flex: 1,
    type: "number",
    resource_key: "inovices_22_netInvoiceTable",
  },
  {
    field: "tax",
    headerName: "VAT",
    flex: 1,
    type: "number",
    resource_key: "inovices_22_vatInvoiceTable",
  },
  {
    field: "total",
    headerName: "Total",
    flex: 1,
    type: "number",
    resource_key: "inovices_22_totalInvoiceTable",
  },
  {
    field: "cashier_id",
    headerName: "Cashier ID",
    flex: 1,
    resource_key: "inovices_22_cashierIdInvoiceTable",
    valueFormatter: (params) => params || "",
  },
  {
    field: "creation_date",
    headerName: "Created at",
    flex: 1.5,
    resource_key: "inovices_22_createdAtInvoiceTable",
    // type: "dateTime",
    // valueFormatter: (params) =>
    //   params ? new Date(params).toLocaleDateString() : " ",
  },
  {
    field: "trans_type",
    headerName: "Transaction Type",
    display: "flex",
    flex: 2,
    resource_key: "inovices_22_transactionTypeInvoiceTable",
  },
  {
    field: "zatca_uuid",
    headerName: "UUID",
    display: "flex",
    flex: 2,
    resource_key: "inovices_22_uuidInvoiceTable",
  },
  {
    field: "payer_type",
    headerName: "Type",
    display: "flex",
    flex: 1,
    resource_key: "inovices_22_typeInvoiceTable",
  },
  {
    field: "zatca_xml_files",
    headerName: "XML Files",
    flex: 1,
    resource_key: "inovices_22_xmlFilesInvoiceTable",
    renderCell: (params) => {
      const xml = params.row.zatca_xml;
      const signed = params.row.zatca_xml_signed;
      if (!xml && !signed) return " ";
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {xml && (
            <Tooltip title="Download XML">
              <IconButton
                size="small"
                onClick={() =>
                  handleDownload(
                    xml,
                    `${params.row.invoice_id}_zatca_xml_unsigned`,
                    "xml",
                  )
                }
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {signed && (
            <Tooltip title="Download Signed XML">
              <IconButton
                size="small"
                color="primary"
                onClick={() =>
                  handleDownload(
                    signed,
                    `${params.row.invoice_id}_zatca_xml_signed`,
                    "xml",
                  )
                }
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      );
    },
  },

  {
    field: "zatca_status",
    headerName: "Zatca Status",
    display: "flex",
    flex: 1,
    resource_key: "inovices_22_zatcaStatusInvoiceTable",
  },
  {
    field: "zatca_api_trans_id",
    headerName: "Trans ID",
    display: "flex",
    flex: 1,
    resource_key: "inovices_22_transIdInvoiceTable",
    renderCell: (params) => {
      const apiTransId = params.value;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Typography>{apiTransId || " "}</Typography>
          {apiTransId && (
            <Tooltip title="Download JSON">
              <IconButton
                size="small"
                color="primary"
                onClick={() =>
                  handleDownloadJSON(apiTransId, params.row.invoice_id)
                }
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      );
    },
  },

  {
    // FINDME ZATACA
    field: "zatca_qr",
    headerName: "ZATCA QR",
    display: "flex",
    resource_key: "inovices_22_zatcaQrInvoiceTable",
    flex: 1,
    renderCell: (params) => {
      if (!params.value) return;
      return (
        <>
          <img
            src={`data:image/png;base64,${btoa(
              String.fromCharCode(...params.value.data),
            )}`}
            alt="Patient"
            style={{
              width: "20px",
              height: "20px",
              objectFit: "cover",
            }}
          />
        </>
      );
    },
  },
];

const invoiceDetailColumns: GLGridColDef[] = [
  {
    field: "invoice_detail_id",
    headerName: "Detail ID",
    flex: 1,
    type: "number",
    resource_key: "inovices_22_detailId",
  },
  {
    field: "invoice_id",
    headerName: "Invoice ID",
    flex: 1,
    type: "number",
    resource_key: "inovices_22_invoiceId",
  },
  {
    field: "delivery_id",
    headerName: "Delivery ID",
    flex: 1,
    type: "number",
    resource_key: "inovices_22_deliveryId",
    valueFormatter: (params) => params || " ",
  },
  {
    field: "item_id",
    headerName: "Item ID",
    flex: 1,
    type: "number",
    resource_key: "inovices_22_itemId",
  },
  {
    field: "item_bk",
    headerName: "Code",
    flex: 1,
    resource_key: "inovices_22_code",
  },
  {
    field: "description",
    headerName: "Description",
    flex: 3,
    resource_key: "inovices_22_description",
  },
  {
    field: "quantity",
    headerName: "Quantity",
    flex: 1,
    resource_key: "inovices_22_quantity",
    type: "number",
  },
  {
    field: "unit_price",
    headerName: "Unit Price",
    flex: 1,
    resource_key: "inovices_22_unitPrice",
    type: "number",
    valueFormatter: (params) =>
      params ? `${parseFloat(params).toFixed(2)}` : " ",
  },
  {
    field: "discount",
    headerName: "Discount",
    flex: 1,
    resource_key: "inovices_22_discount",
    type: "number",
    valueFormatter: (params) =>
      params ? `${parseFloat(params).toFixed(2)}` : "$0.00",
  },
  {
    field: "tax_percent",
    headerName: "Tax %",
    flex: 1,
    type: "number",
    resource_key: "inovices_22_taxPercent",
    valueFormatter: (params) =>
      params ? `${parseFloat(params).toFixed(2)}%` : "0%",
  },
  {
    field: "tax",
    headerName: "Tax Amount",
    flex: 1,
    type: "number",
    resource_key: "inovices_22_taxAmount",
    valueFormatter: (params) =>
      params ? `${parseFloat(params).toFixed(2)}` : "$0.00",
  },
  {
    field: "total",
    headerName: "Total",
    flex: 1,
    resource_key: "inovices_22_totalDetailsTable",
    type: "number",
    valueFormatter: (params) =>
      params ? `${parseFloat(params).toFixed(2)}` : "$0.00",
  },
  {
    field: "net",
    headerName: "Net Amount",
    flex: 1,
    type: "number",
    resource_key: "inovices_22_netAmount",
    valueFormatter: (params) =>
      params ? `${parseFloat(params).toFixed(2)}` : "$0.00",
  },
  {
    field: "tax_category",
    headerName: "Tax Category",
    flex: 1,
    resource_key: "inovices_22_taxCategory",
  },
  {
    field: "share_factor",
    headerName: "Share Factor",
    flex: 1,
    resource_key: "inovices_22_shareFactor",
    valueFormatter: (params) => params || " ",
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    resource_key: "inovices_22_status",
  },
  {
    field: "package_delivery_id",
    headerName: "Package Delivery ID",
    flex: 1,
    resource_key: "inovices_22_packageDeliveryId",
    valueFormatter: (params) => params || " ",
  },
];

export default function Invoices() {
  const { t } = useContext(AuthGuardContext);
  const [selectedInvoice, setSelectedInvoice] = useState<any>();
  const [loadingReport, setLoadingReport] = useState(false);
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const { invoiceFilter } = useSelector((state: RootState) => state.invoice);

  const [loadingPrint, setLoadingPrint] = useState(false);
  const [response, setResponse] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [qrImageDialogeOpen, setQrImageDialogeOpen] = useState(false);

  const handleReport = async () => {
    setLoadingReport(true);

    try {
      const response = await api.get(
        `/api/invoiceReport/report/${selectedInvoice?.invoice_id}`,
      );
      setLoadingReport(false);

      setResponse(response.data?.data);
      setOpen(true);
    } catch (err) {
      setLoadingReport(false);
      if (err instanceof AxiosError && err.response) {
        // 🔥 Convert Blob error to JSON
        const response = await err.response.data.data;

        console.error("🔥 Error response:", response);
        setResponse(response);
        setOpen(true);
      }
    } finally {
    }
  };

  async function printInvoice(invoiceId: string) {
    try {
      setLoadingPrint(true);

      const response = await api.get(
        `/api/patientAccount/printInvoice/${invoiceId}`,
        { responseType: "blob" }, // handle both PDF and JSON
      );

      const contentType = response.headers["content-type"];
      const resourceId = response.headers["x-resource-id"];

      if (contentType.includes("application/pdf")) {
        // ✅ Success: it's a PDF
        const fileURL = window.URL.createObjectURL(response.data);
        // setOpen(true);
        setResponse({ resourceId });
        const link = document.createElement("a");
        link.href = fileURL;
        link.setAttribute("download", `invoice-${invoiceId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(fileURL);
      } else {
        // ❌ Unexpected non-PDF response (probably JSON error)
        const text = await response.data.text();
        const json = JSON.parse(text);
        console.error("Server error:", json);
        setResponse(json);
        setOpen(true);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        try {
          // 🔥 Convert Blob error to JSON
          const text = await error.response.data.text();
          const json = JSON.parse(text);

          console.error("🔥 Error JSON:", json);
          setResponse(json?.data);
          setOpen(true);
        } catch {
          // fallback if parsing fails
          console.error("🔥 Non-JSON error:", error);
          setResponse({
            description: "Unexpected error occurred while printing invoice.",
          });
          setOpen(true);
        }
      } else {
        console.error("🔥 Unknown error:", error);
        setResponse({
          description: "Network error or unexpected issue occurred.",
        });
        setOpen(true);
      }
    } finally {
      setLoadingPrint(false);
    }
  }

  async function getAllInvoices(invoiceFilter: any) {
    try {
      const { data } = await api.get("/api/invoice/all", {
        params: invoiceFilter,
      });
      if (data.sucess) {
        setAllInvoices(data.data);
      }
    } catch (error) {}
  }
  useEffect(() => {
    getAllInvoices(invoiceFilter);
  }, [invoiceFilter]);

  return (
    <Box mt={2}>
      <HandleTitle titleKey="INVOICES" />
      <DisplayMsgDialog
        open={open}
        onClose={() => setOpen(false)}
        description={response?.description || ""}
        resource_key={response?.resourceId || ""}
      />

      <Box mb={2}>
        <InvoiceFilter />
      </Box>
      <GlPanelTable>
        <Secure.GlCustomTable
          resource_key="replaceme"
          defaultHiddenColumns={["invoice_id"]}
          limit={10}
          smallSize
          getRowId={(row) => row.invoice_id}
          onRowSelected={(row) => {
            setSelectedInvoice(row);
          }}
          // handleDataChange={(rows) => setInvoiceRows(rows ?? [])}
          url="/api/invoice"
          columns={invoiceColumns.map((col) => {
            if (col.field === "zatca_qr") {
              const overRidenZatcaQrCol = {
                ...col,
                renderCell: (params: any) => {
                  if (!params.value) return;
                  return (
                    <>
                      <CustomDialog
                        open={qrImageDialogeOpen}
                        onClose={() => setQrImageDialogeOpen(false)}
                        maxWidth="xs"
                        title=""
                      >
                        <Box>
                          <img
                            src={`data:image/png;base64,${btoa(
                              String.fromCharCode(...params.value.data),
                            )}`}
                            alt="Patient"
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      </CustomDialog>
                      <img
                        src={`data:image/png;base64,${btoa(
                          String.fromCharCode(...params.value.data),
                        )}`}
                        alt="Patient"
                        style={{
                          width: "20px",
                          height: "20px",
                          objectFit: "cover",
                        }}
                        onClick={() => setQrImageDialogeOpen(true)}
                      />
                    </>
                  );
                },
              };

              return overRidenZatcaQrCol;
            }
            return col;
          })}
          params={{
            ...invoiceFilter,
          }}
          footer={
            <>
              <Secure.GLButton
                resource_key={"inovices_22_invoicePrint"}
                disabled={loadingPrint}
                onClick={() => printInvoice(selectedInvoice.invoice_id)}
              >
                {loadingPrint ? "..." : t("inovices_22_invoicePrint")}
              </Secure.GLButton>

              <Secure.GLButton
                resource_key="inovices_22_report"
                disabled={loadingReport}
                onClick={handleReport}
              >
                {loadingReport ? "..." : t("inovices_22_report")}
              </Secure.GLButton>

              <ReportAll invoiceRows={allInvoices} />
              {/* <Button disabled={loadingReportAll} onClick={handleReportAll}>
                {loadingReportAll ? "..." : "Report All"}
              </Button> */}
            </>
          }
        />
      </GlPanelTable>

      <Box sx={{ mt: 4 }}>
        <GlPanelTable>
          <Secure.GlCustomTable
            resource_key="replaceme"
            // rows
            defaultHiddenColumns={["invoice_id"]}
            limit={10}
            smallSize
            getRowId={(row) => row.item_id}
            url={
              selectedInvoice
                ? `/api/invoiceDetail/getByInvoiceId/${selectedInvoice.invoice_id}`
                : "/api/invoiceDetail/getByInvoiceId/0"
            }
            columns={invoiceDetailColumns}
          />
        </GlPanelTable>
      </Box>
    </Box>
  );
}
