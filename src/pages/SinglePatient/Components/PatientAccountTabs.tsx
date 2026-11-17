import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { usePatientAccount } from "../context/PatientAccountContext";
import DeliveryGrid from "./DeliveryGrid";
import InvoiceDetailsGrid from "./InvoiceDetailsGrid";
import PatientPolicyGrid from "./PatientPolicyGrid";
import CoverageGrid from "./CoverageGrid";
import { be, de } from "date-fns/locale";
import { BenefitsDataGrid } from "./BenefitsDataGrid";
import EpisodePolicyGrid from "./EpisodePolicyGrid";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import api from "../../../utils/Api";
import { PriceListDataGrid } from "./PriceListDataGrid";
import Split from "react-split";
import PolicyDataGrid from "./PolicyDataGrid";
import GlPanelTable from "../../../shared/tables/GlPanelTable";
import GlCustomTable from "../../../shared/tables/GlCustomTable";
import { mutate } from "swr";
import ReportAll from "../../Invoice/Components/ReportAll";
import { GridColDef } from "@mui/x-data-grid";
import { handleDownload, handleDownloadJSON } from "../../Invoice/Invoices";
import DownloadIcon from "@mui/icons-material/Download";
import { AxiosError } from "axios";
import { DisplayMsgDialog } from "@givc/shared-components";

import { toast } from "react-toastify";
import { apiUtility } from "../../../utils/apiUtility";
import CustomDialog from "../../../components/CustomDialog/CustomDialog";
import AmountPercentageForm from "./AmountPercentageForm";
import { number } from "joi";
import Secure from "../../../shared/security";
import { useContext } from "react";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import { GLGridColDef } from "../../../shared/security/GLCustomTable";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const invoiceColumns: GLGridColDef[] = [
  {
    field: "trans_type",
    headerName: "Trans T",
    flex: 1,
    resource_key: "patientAccount_11_transTInvoiceTable",
  },
  {
    field: "related_invoice_id",
    headerName: "Related I_ID",
    flex: 1,
    resource_key: "patientAccount_11_relatedIIdInvoiceTable",
  },
  {
    field: "invoice_id",
    headerName: "Invoice ID",
    flex: 1,
    type: "number",
    resource_key: "patientAccount_11_invoiceIdInvoiceTable",
  },
  {
    field: "invoice_no",
    headerName: "Invoice No",
    flex: 1,
    resource_key: "patientAccount_11_invoiceNoInvoiceTable",
  },
  {
    field: "payer_id",
    headerName: "Payer ID",
    type: "number",
    flex: 1,
    valueFormatter: (params) => params || "",
    resource_key: "patientAccount_11_payerIdInvoiceTable",
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    resource_key: "patientAccount_11_statusInvoiceTable",
  },
  {
    field: "invoice_date",
    headerName: "Date",
    flex: 1.5,
    resource_key: "patientAccount_11_dateInvoiceTable",
    // type: "date",
    // valueFormatter: (params) =>
    //   params ? new Date(params).toLocaleDateString() : " ",
  },
  {
    field: "payment_type",
    headerName: "Payment Type",
    flex: 1,
    resource_key: "patientAccount_11_paymentTypeInvoiceTable",
  },

  {
    field: "subtotal",
    headerName: "Subtotal",
    flex: 1,
    align: "right",
    resource_key: "patientAccount_11_subtotalInvoiceTable",
  },
  {
    field: "total_line_discount",
    headerName: "Total Line Discount",
    flex: 1,
    align: "right",
    resource_key: "patientAccount_11_totalLineDiscountInvoiceTable",
  },
  {
    field: "net",
    headerName: "Net",
    flex: 1,
    align: "right",
    resource_key: "patientAccount_11_netInvoiceTable",
  },
  {
    field: "invoice_level_discount",
    headerName: "Discount",
    flex: 1,
    align: "right",
    resource_key: "patientAccount_11_discountInvoiceTable",
  },
  {
    field: "net_after_invoice_discount",
    headerName: "Net After Inv Discount",
    flex: 1,
    align: "right",
    resource_key: "patientAccount_11_netAfterInvDiscountInvoiceTable",
  },
  {
    field: "tax",
    headerName: "VAT",
    flex: 1,
    align: "right",
    resource_key: "patientAccount_11_vatInvoiceTable",
  },
  {
    field: "total",
    headerName: "Total",
    flex: 1,
    align: "right",
    resource_key: "patientAccount_11_totalInvoiceTable",
  },
  {
    field: "cashier_id",
    headerName: "Cashier ID",
    flex: 1,
    resource_key: "patientAccount_11_cashierIdInvoiceTable",
    valueFormatter: (params) => params || "",
  },
  {
    field: "creation_date",
    headerName: "Created at",
    flex: 1.5,
    resource_key: "patientAccount_11_createdAtInvoiceTable",
    // type: "dateTime",
    // valueFormatter: (params) =>
    //   params ? new Date(params).toLocaleDateString() : " ",
  },
  {
    field: "zatca_uuid",
    headerName: "UUID",
    display: "flex",
    flex: 2,
    resource_key: "patientAccount_11_uuidInvoiceTable",
  },
  {
    field: "payer_type",
    headerName: "Type",
    display: "flex",
    flex: 1,
    resource_key: "patientAccount_11_typeInvoiceTable",
  },
  {
    field: "zatca_xml_files",
    headerName: "XML Files",
    flex: 1,
    resource_key: "patientAccount_11_xmlFilesInvoiceTable",
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
    resource_key: "patientAccount_11_zatcaStatusInvoiceTable",
  },
  {
    field: "zatca_api_trans_id",
    headerName: "Trans ID",
    display: "flex",
    flex: 1,
    resource_key: "patientAccount_11_transIdInvoiceTable",
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
    field: "zatca_qr",
    headerName: "ZATCA QR",
    display: "flex",
    flex: 1,
    resource_key: "patientAccount_11_zatcaQrInvoiceTable",
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
    resource_key: "patientAccount_11_detailIdInvoiceLineItemsTable",
    type: "number",
  },
  {
    field: "invoice_id",
    headerName: "Invoice ID",
    flex: 1,
    resource_key: "patientAccount_11_invoiceIdInvoiceLineItemsTable",
    type: "number",
  },
  {
    field: "delivery_id",
    headerName: "Delivery ID",
    flex: 1,
    resource_key: "patientAccount_11_deliveryIdInvoiceLineItemsTable",
    type: "number",
    valueFormatter: (params) => params || " ",
  },
  {
    field: "item_id",
    headerName: "Item ID",
    flex: 1,
    resource_key: "patientAccount_11_itemIdInvoiceLineItemsTable",
    type: "number",
  },
  {
    field: "quantity",
    headerName: "Quantity",
    flex: 1,
    resource_key: "patientAccount_11_quantityInvoiceLineItemsTable",
    type: "number",
  },
  {
    field: "unit_price",
    headerName: "Unit Price",
    flex: 1,
    resource_key: "patientAccount_11_unitPriceInvoiceLineItemsTable",
    type: "number",
    valueFormatter: (params) =>
      params ? `$${parseFloat(params).toFixed(2)}` : " ",
  },
  {
    field: "discount",
    headerName: "Line Discount",
    flex: 1,
    resource_key: "patientAccount_11_lineDiscountInvoiceLineItemsTable",
    type: "number",
    valueFormatter: (params) =>
      params ? `$${parseFloat(params).toFixed(2)}` : "$0.00",
  },
  {
    field: "tax_percent",
    headerName: "Tax %",
    flex: 1,
    resource_key: "patientAccount_11_taxPercentInvoiceLineItemsTable",
    type: "number",
    valueFormatter: (params) =>
      params ? `${parseFloat(params).toFixed(2)}%` : "0%",
  },
  {
    field: "tax",
    headerName: "Tax Amount",
    flex: 1,
    resource_key: "patientAccount_11_taxAmountInvoiceLineItemsTable",
    type: "number",
    valueFormatter: (params) =>
      params ? `$${parseFloat(params).toFixed(2)}` : "$0.00",
  },

  {
    field: "net",
    headerName: "Net Amount",
    flex: 1,
    resource_key: "patientAccount_11_netAmountInvoiceLineItemsTable",
    type: "number",
    valueFormatter: (params) =>
      params ? `$${parseFloat(params).toFixed(2)}` : "$0.00",
  },
  {
    field: "total",
    headerName: "Total",
    flex: 1,
    resource_key: "patientAccount_11_totalInvoiceLineItemsTable",
    type: "number",
    valueFormatter: (params) =>
      params ? `$${parseFloat(params).toFixed(2)}` : "$0.00",
  },
  {
    field: "tax_category",
    headerName: "Tax Category",
    flex: 1,
    resource_key: "patientAccount_11_taxCategoryInvoiceLineItemsTable",
  },
  {
    field: "share_factor",
    headerName: "Share Factor",
    flex: 1,
    resource_key: "patientAccount_11_shareFactorInvoiceLineItemsTable",
    valueFormatter: (params) => params || " ",
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    resource_key: "patientAccount_11_statusInvoiceLineItemsTable",
  },
  {
    field: "package_delivery_id",
    headerName: "Package Delivery ID",
    flex: 1,
    resource_key: "patientAccount_11_packageDelivInvoiceLineItemsTable",
    valueFormatter: (params) => params || " ",
  },
];

export const PatientTabs: React.FC = ({
  paymentRefetchRef,
}: {
  paymentRefetchRef: React.RefObject<() => void>;
}) => {
  const {
    formData,
    patient,
    selectedPatient,
    selectedDeliveryFirstTab,

    patientPolicyData,

    setSelectedPatientPolicy,
    setSelectedCoverage,
    selectedPatientPolicy,
    selectedInvoiceSecTab,

    setSelectedDeliveryFirstTab,
    setSelectedInvoiceFirstTab,
    setSelectedInvoiceSecTab,
    setSelectedEpisodePolicy,
    selectedEpisodePolicy,
    params,

    getPolicyThirdTap,
    selectedCoverage,
  } = usePatientAccount();
  const { t } = useContext(AuthGuardContext);
  const [isSubmittingDiscount, setIsSubmittingDiscount] = useState(false);
  const [value, setValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [secTabSelectedDeliveryId, setSecTabSelectedDeliveryId] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>();
  const invoiceRefetchRef = useRef<() => void>(() => {});
  const invoiceDetailTableColumns: GLGridColDef[] = [
    // {
    //   field: "trans_type",
    //   headerName: "Trans T",
    //   flex: 1,
    // },
    // {
    //   field: "related_invoice_id",
    //   headerName: "Related I_ID",
    //   flex: 1,
    // },
    {
      field: "invoice_detail_id",
      headerName: "Invoice Detail ID",
      display: "flex",
      flex: 1,
      resource_key: "patientAccount_11_invoiceDetailIdDetailTable",
    },
    {
      field: "creation_date",
      headerName: "Invoice Date",
      display: "flex",
      flex: 1,
      resource_key: "patientAccount_11_invoiceDateDetailTable",
    },

    {
      field: "invoice_id",
      headerName: "Invoice Id",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_invoiceIdDetailTable",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      display: "flex",
      flex: 1,
      resource_key: "patientAccount_11_statusDetailTable",
    },

    {
      field: "unit_price",
      headerName: "Unit Price",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_unitPriceDetailTable",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "discount",
      headerName: "Discount",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_discountDetailTable",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "quantity",
      headerName: "Quantity",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_quantityDetailTable",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "net",
      headerName: "Net",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_netDetailTable",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "tax",
      headerName: "Tax",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_taxDetailTable",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "total",
      headerName: "Total",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_totalDetailTable",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },

    {
      field: "package_delivery_detail_id",
      headerName: "packageDeliveryId",
      flex: 0.8,
      resource_key: "patientAccount_11_packageDeliveryId",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {params.value || "-"}
        </Box>
      ),
    },
    // { field: "Payer", headerName: "Payer" , display  :"flex" , flex : 1 },
  ];
  const policyTableColumns: GLGridColDef[] = [
    {
      field: "payer_id",
      headerName: "payer Id",
      flex: 3,
      resource_key: "patientAccount_11_payerIdPolicyTable",
      type: "number",
    },
    {
      field: "payer",
      headerName: "Payer",
      flex: 3,
      resource_key: "patientAccount_11_payerPolicyTable",
    },
    {
      field: "policy",
      headerName: "Policy",
      flex: 3,
      resource_key: "patientAccount_11_policyPolicyTable",
    },
    {
      field: "policy_start",
      headerName: "Policy Start",
      flex: 3,
      resource_key: "patientAccount_11_policyStartPolicyTable",
    },
    {
      field: "policy_end",
      headerName: "Policy End",
      flex: 3,
      resource_key: "patientAccount_11_policyEndPolicyTable",
    },
    {
      field: "patient_policy_start",
      headerName: "Patient Policy Start",
      flex: 3,
      resource_key: "patientAccount_11_patientPolicyStartPolicyTable",
    },
    {
      field: "patient_policy_end",
      headerName: "Patient Policy End",
      flex: 3,
      resource_key: "patientAccount_11_patientPolicyEndPolicyTable",
    },
    {
      field: "price_list_id",
      headerName: "Price List Id",
      flex: 3,
      resource_key: "patientAccount_11_priceListIdPolicyTable",
    },
  ];
  const deliveryTableColumns: GLGridColDef[] = [
    {
      field: "delivery_detail_id",
      headerName: "delivery_detail_id",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_deliveryDetailsDeliveryTable",
    },
    {
      field: "delivery_id",
      headerName: "delivery_id",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_deliveryIdDeliveryTable",
    },
    {
      field: "item_id",
      headerName: "Item",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_itemDeliveryTable",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              // flexDirection: "column",
              // backgroundColor : "red",
              // width: "70%",
              // maxWidth: "100%",
              // overflow: "auto",
            }}
          >
            <Typography>{params.value}</Typography>
            {params.row.item_type == "P" && (
              <img src="p.png" height={15} alt="" />
            )}
          </Box>
        );
      },
    },
    {
      field: "item_description",
      headerName: "Desc",
      display: "flex",
      flex: 3,
      resource_key: "patientAccount_11_descDeliveryTable",
    },
    {
      field: "delivery_date",
      headerName: "Date",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_dateDeliveryTable",
      align: "right",
    },
    // {
    //   field: "ordered_quantity",
    //   headerName: "Order d",
    //   display: "flex",
    //   flex: 0.7,
    //   renderCell: (params) => {
    //     return (
    //       <Box
    //         sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
    //       >
    //         {params.value}
    //       </Box>
    //     );
    //   },
    // },
    {
      field: "qty_delivered",
      headerName: "Deliver Qty",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_deliverQtyDeliveryTable",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "ordered_quantity",
      headerName: "Order Qty",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_orderQtyDeliveryTable",
      align: "right",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "unit_price_od",
      headerName: "Unit Price OD",
      display: "flex",
      flex: 0.7,
      resource_key: "patientAccount_11_unitPriceOdDeliveryTable",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },

    // {
    //   field: "Orderer",
    //   headerName: "Orderer",
    //   display: "flex",
    //   flex: 0.7,
    //   renderCell: (params) => {
    //     return (
    //       <Box
    //         sx={{
    //           display: "flex",
    //           justifyContent: "flex-end",
    //           width: "100%",
    //         }}
    //       >
    //         {params.value}
    //       </Box>
    //     );
    //   },
    // },

    // Item Price
    {
      field: "unit_price",
      headerName: "Unit Price IP",
      flex: 0.7,
      resource_key: "patientAccount_11_unitPriceIpDeliveryTable",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {params.value || 0}
        </Box>
      ),
    },
    {
      field: "ordered_discount",
      headerName: "Discount",
      flex: 0.7,
      resource_key: "patientAccount_11_discountDeliveryTable",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {params.value || 0}
        </Box>
      ),
    },

    {
      field: "payer_share",
      headerName: "Payer Share",
      flex: 0.8,
      resource_key: "patientAccount_11_payerShareDeliveryTable",
      align: "right",
      type: "number",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "patient_share",
      headerName: "Patient Share",
      flex: 0.8,
      resource_key: "patientAccount_11_patientShareDeliveryTable",
      align: "right",
      type: "number",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "price_list_id",
      headerName: "Price List ID",
      flex: 0.8,
      resource_key: "patientAccount_11_priceListIdDeliveryTable",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {params.value ?? "-"}
        </Box>
      ),
    },
    {
      field: "policy_id",
      headerName: "Policy ID",
      flex: 0.8,
      resource_key: "patientAccount_11_policyIdDeliveryTable",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "package_delivery_detail_id",
      headerName: "packageDeliveryId",
      flex: 0.8,
      resource_key: "patientAccount_11_packageDeliveryId",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {params.row.invoiceDetails?.[0]?.package_delivery_detail_id || "-"}
        </Box>
      ),
    },

    // { field: "package_delivery_detail_id", headerName: "packageDeliveryId"    , flex : .7 },
    // { field: "Invoice Date", headerName: "Invoice Date" , display  :"flex" , flex : 1 },
    // { field: "Payer", headerName: "Payer" , display  :"flex" , flex : 1 },
  ];
  const paymentTableColmuns: GLGridColDef[] = [
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      resource_key: "patientAccount_11_amountPaymentTable",
    },
    {
      field: "payment_datetime",
      headerName: "Date Time",
      flex: 1,
      resource_key: "patientAccount_11_dateTimePaymentTable",
    },
    {
      field: "payment_no",
      headerName: "Payment No",
      flex: 1,
      resource_key: "patientAccount_11_paymentNoPaymentTable",
    },
    {
      field: "method",
      headerName: "Method",
      flex: 1,
      resource_key: "patientAccount_11_methodPaymentTable",
    },
  ];

  const covarageTabelColumns: GLGridColDef[] = [
    {
      field: "policy_number",
      headerName: "Policy Number",
      flex: 1,
      resource_key: "patientAccount_11_policyNumberCoverageTable",
    },
    {
      field: "payer_name",
      headerName: "Payer Name",
      flex: 3,
      resource_key: "patientAccount_11_payerNameCoverageTable",
    },
    {
      field: "serviced_period_start",
      headerName: "Start Date",
      flex: 1,
      resource_key: "patientAccount_11_startDateCoverageTable",
      // valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
    },
    {
      field: "serviced_period_end",
      headerName: "End Date",
      flex: 1,
      resource_key: "patientAccount_11_endDateCoverageTable",
      // valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
    },
    {
      field: "member_status",
      headerName: "Member Status",
      flex: 1,
      resource_key: "patientAccount_11_memberStatusCoverageTable",
    },
  ];
  const benfitsTableColumns: GLGridColDef[] = [
    {
      field: "benefit_id",
      headerName: "id",
      flex: 1,
      resource_key: "patientAccount_11_idBenefitsTable",
    },
    {
      field: "category",
      headerName: "category",
      flex: 1,
      resource_key: "patientAccount_11_categoryBenefitsTable",
    },
    {
      field: "name",
      headerName: "name",
      flex: 3,
      resource_key: "patientAccount_11_nameBenefitsTable",
    },
    {
      field: "copay_maximum",
      headerName: "Copay Maximum",
      flex: 3,
      resource_key: "patientAccount_11_copayMaximumBenefitsTable",
    },
    {
      field: "copay_percent",
      headerName: "Copay Percent",
      flex: 3,
      resource_key: "patientAccount_11_copayPercentBenefitsTable",
    },
    // { field: "name", headerName: "name", flex: 3 },
    {
      field: "description",
      headerName: "description",
      flex: 4,
      resource_key: "patientAccount_11_descriptionBenefitsTable",
    },
    {
      field: "term",
      headerName: "term",
      flex: 1,
      resource_key: "patientAccount_11_termsBenefitsTable",
    },
    // { field: "copay_percent", headerName: "copay_percent", flex : 1, align: "right" },
    // { field: "copay_maximum", headerName: "copay_maximum", flex : 1, align: "right" },
    // { field: "approval_limit", headerName: "approval_limit", flex : 1, align: "right" },
    // { field: "room", headerName: "room" },
  ];
  const priceListTableColumns: GLGridColDef[] = [
    {
      field: "item_bk",
      headerName: "Item Bk",
      flex: 1,
      resource_key: "patientAccount_11_itemEkPriceListTable",
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      resource_key: "patientAccount_11_descriptionPriceListTable",
    },
    {
      field: "price",
      headerName: "Price",
      flex: 1,
      resource_key: "patientAccount_11_pricePriceListTable",
    },
    {
      field: "start_date",
      headerName: "Start Date",
      flex: 1,
      resource_key: "patientAccount_11_startDatePriceListTable",
    },
    {
      field: "end_date",
      headerName: "End Date",
      flex: 1,
      resource_key: "patientAccount_11_endDatePriceListTable",
    },
    {
      field: "category_code",
      headerName: "Category Code",
      flex: 1,
      resource_key: "patientAccount_11_categoryCodePriceListTable",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      resource_key: "patientAccount_11_statusPriceListTable",
    },
    {
      field: "legacy_code",
      headerName: "Legacy Code",
      flex: 1,
      resource_key: "patientAccount_11_legacyCodePriceListTable",
    },
  ];
  const handleAddClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [loading, setLoading] = useState(false);
  async function handleDelete() {
    try {
      setLoading(true);
      // console.log(selectepol);

      const { data } = await api.put(
        "/api/episodePolicies/" + selectedEpisodePolicy.id,
        {
          ...selectedEpisodePolicy,
          status: "C",
        },
      );
      setRandom(Math.random());
    } catch (error) {
      console.error("Failed to add patient policy data:", error);
    } finally {
      setLoading(false);
    }
  }

  function handSecTableInvoiceSelected(v: any) {
    setSelectedInvoiceSecTab(v);
    setSecTabSelectedDeliveryId(v?.delivery_id);
  }

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState("all");
  const [confirmOpenDeliveryRecharge, setConfirmOpenDeliveryRecharge] =
    useState(false);
  const [loadingRecharge, setLoadingRecharge] = useState(false);
  const [loadingRechargeDelivery, setLoadingRechargeDelivery] = useState(false);
  const [response, setResponse] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [rechargeResult, setRechargeResult] = useState<any>(null);
  const [random, setRandom] = useState(0);

  const handleRecharge = async () => {
    setLoadingRecharge(true);
    try {
      const config = {
        patient_id: selectedInvoice?.patient_id,
        episode_no: selectedInvoice?.episode_no,
        payer_id: selectedEpisodePolicy?.payer_id,
        price_list_id: selectedEpisodePolicy?.price_list_id,
        policy_id: selectedEpisodePolicy?.patient_policy_id,
        //!!!! change it to =>  waiting
        // date: selectedInvoice?.invoice_date,
      };

      const response = await api.post(
        `/api/patientAccount/rechargeInvoice/${selectedInvoice?.invoice_id}`,
        {},
        {
          params: config,
        },
      );

      // console.log({ response: response });

      if (
        response?.data?.data?.patientInvoiceId ||
        response?.data?.data?.payerInvoiceId
      ) {
        toast.success(
          `success the new patient invoice ${response?.data?.data?.patientInvoiceId}, payer invoice ${response?.data?.data?.payerInvoiceId}, and refund  `,
        );
      } else {
        toast.success(
          `success the new package invoice ${response?.data?.data?.packageItemInvoice} and refund  `,
        );
      }

      // setTimeout(() => {
      //   setLoadingRecharge(false);
      //   setRandom(response.data.data.newInvoiceId);
      // }, 1000);
      mutate((key) => {
        return apiUtility(key, "invoice");
      });
      setRechargeResult(response);
    } catch (err) {
      setLoadingRecharge(false);
      if (err instanceof AxiosError) {
        toast.error(err.response?.data.error || "some thing want wrong");
      }
    } finally {
      setLoadingRecharge(false);
    }
  };
  const handleRechargeDelivery = async () => {
    setLoadingRechargeDelivery(true);

    try {
      if (!selectedDeliveryFirstTab.delivery_detail_id) {
        toast.error("there is no delivery Detail ID  in this row ");
        return;
      }
      const response = await api.get(
        `/api/deliveryDetail/rechargeDeliveryByDeliveryDetail/${selectedDeliveryFirstTab.delivery_detail_id}?patient_id=${formData.patientId}&episode_no=${formData.episodeNo}`,
      );

      if (
        response?.data?.data?.patientInvoiceId ||
        response?.data?.data?.payerInvoiceId
      ) {
        toast.success(
          `success the new patient invoice ${response?.data?.data?.patientInvoiceId}, payer invoice ${response?.data?.data?.payerInvoiceId}  `,
        );
      } else {
        toast.success(
          `success the new package invoice ${response?.data?.data?.packageItemInvoice}  `,
        );
      }

      await mutate((key) => {
        return apiUtility(key, "delivery");
      });
      await mutate((key) => {
        return apiUtility(key, "invoice");
      });
    } catch (err) {
      setLoadingRechargeDelivery(false);
      if (err instanceof AxiosError) {
        toast.error(err.response?.data.error || "some thing want wrong");
      }

      console.log((err as any).message || "Failed to recharge invoice");
    } finally {
      setLoadingRechargeDelivery(false);
    }
  };

  // const [reportResult, setReportResult] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleReport = async () => {
    setLoadingReport(true);

    try {
      const response = await api.get(
        `/api/invoiceReport/report/${selectedInvoice?.invoice_id}`,
      );
      setLoadingReport(false);

      setResponse(response.data?.data);
      setOpen(true);

      console.log("Report clicked");
    } catch (err) {
      setLoadingReport(false);
      if (err instanceof AxiosError && err.response) {
        // 🔥 Convert Blob error to JSON
        const response = await err.response.data.data;

        console.error("🔥 Error response:", response);
        setResponse(response);
        setOpen(true);
      }
      console.log((err as any).message || "Failed to report invoice");
    } finally {
    }
  };

  async function handleAddEpisodePolicy() {
    try {
      setLoading(true);

      const { data } = await api.post("/api/episodePolicies", {
        patient_id: formData.patientId,
        episode_no: formData.episodeNo,
        patient_policy_id: selectedPatientPolicy.patient_policy_id,
      });
      setRandom(Math.random());
      // getPolicyThirdTap(params.patient_id, params.episode_no);

      handleCloseDialog();
    } catch (error) {
      console.error("Failed to add patient policy data:", error);
      toast.error(
        error?.response?.data?.error || "Failed to add patient policy data",
      );
    } finally {
      setLoading(false);

      //  mutate((e)=>   apiUtility(e , "patientDeliveryDetails") )
    }
  }

  //! print
  const [loadingPrint, setLoadingPrint] = useState(false);
  async function printInvoice(invoiceId: string) {
    try {
      setLoadingPrint(true);
      const response = await api.get(
        `/api/patientAccount/printInvoice/${invoiceId}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);

      // window.open(fileURL, "_blank");

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
    } finally {
      setLoadingPrint(false);
    }
  }

  const handleOpenConfirm = () => {
    if (!selectedInvoice) {
      toast.error("Please select an invoice first");
      return;
    }
    setConfirmOpen(true);
  };
  const handleOpenConfirmDeliveryRecharge = () => {
    if (!selectedDeliveryFirstTab) {
      toast.error("Please select an delivery first");
      return;
    }
    setConfirmOpenDeliveryRecharge(true);
  };

  const handleConfirmRecharge = async () => {
    setConfirmOpen(false);
    await handleRecharge();
  };
  const handleConfirmRechargeDelivery = async () => {
    setConfirmOpenDeliveryRecharge(false);
    await handleRechargeDelivery();
  };

  // !!! test refreash table
  const refetchTable = useRef<() => void>(null);
  const percentageAmountSubmitButton = useRef<HTMLFormElement>(null);
  return (
    <Box sx={{ width: "100%" }}>
      <CustomDialog
        open={discountDialogOpen}
        onClose={() => setDiscountDialogOpen(false)}
        maxWidth="xs"
        title=""
        actions={
          <Box>
            <Button
              onClick={() => setDiscountDialogOpen(false)}
              color="primary"
            >
              Close
            </Button>
            <Button
              color="primary"
              onClick={() => percentageAmountSubmitButton.current?.click()}
              disabled={isSubmittingDiscount}
            >
              {isSubmittingDiscount ? "Submitting..." : "Submit"}
            </Button>
          </Box>
        }
      >
        <Box>
          <Box>{`${selectedInvoice?.invoice_no} - ${selectedInvoice?.invoice_date} - ${selectedInvoice?.net}`}</Box>
          <Box>
            <AmountPercentageForm
              ref={percentageAmountSubmitButton}
              invoiceNet={selectedInvoice?.net}
              invoiceID={selectedInvoice?.invoice_id}
              setIsSubmittingDiscount={setIsSubmittingDiscount}
              setDiscountDialogOpen={setDiscountDialogOpen}
              invoiceRefetchRef={invoiceRefetchRef}
            />
          </Box>
        </Box>
      </CustomDialog>
      <DisplayMsgDialog
        open={open}
        onClose={() => setOpen(false)}
        description={response?.description || ""}
        resource_key={response?.resourceId || ""}
      />
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Tabs value={value} onChange={handleChange} sx={{ width: "100%" }}>
          <Secure.GLTab
            resource_key="patientAccount_11_delivery"
            label={t("patientAccount_11_delivery")}
            value={0}
          />
          <Secure.GLTab
            resource_key="patientAccount_11_invoice"
            label={t("patientAccount_11_invoice")}
            value={1}
          />
          <Secure.GLTab
            resource_key="patientAccount_11_policy"
            label={t("patientAccount_11_policy")}
            value={2}
          />
          {value === 2 && (
            <Box
              sx={{ display: "flex", gap: 1, alignItems: "center", ml: "auto" }}
            >
              <Tooltip title="Add">
                <IconButton onClick={handleAddClick}>
                  <AddCircleOutlineIcon color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton onClick={handleDelete}>
                  <HighlightOffIcon color="error" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Tabs>
      </Box>
      <TabPanel
        resource_key="patientAccount_11_delivery"
        value={value}
        index={0}
      >
        {/* <button
          onClick={() => {
            mutate([`/api/patientAccount/deliveryTab/457812/1"`]);
            // refetchTable.current && refetchTable.current();
          }}

          mutate
        >
          refresh
        </button> */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            // backgroundColor : "red",
            // width: "70%",
            // maxWidth: "100%",
            overflow: "auto",
          }}
        >
          <GlPanelTable>
            <Secure.GlCustomTable
              resource_key="replaceme"
              refetchRef={refetchTable}
              footer={
                <>
                  <Secure.GLButton
                    resource_key="patientAccount_11_rechargeDeliveryTable"
                    disabled={loadingRechargeDelivery}
                    onClick={handleOpenConfirmDeliveryRecharge}
                  >
                    {loadingRechargeDelivery
                      ? "..."
                      : t("patientAccount_11_rechargeDeliveryTable")}
                  </Secure.GLButton>
                </>
              }
              columns={deliveryTableColumns}
              url={
                formData?.patientId && formData.episodeNo
                  ? `/api/patientAccount/patientDeliveryDetails/${formData?.patientId}/${formData?.episodeNo}`
                  : ""
              }
              getRowId={(r) => r.delivery_id}
              onRowSelected={(r) => {
                setSelectedDeliveryFirstTab(r);
              }}

              // handleDataChange={(e)=>{

              // }}
            ></Secure.GlCustomTable>
          </GlPanelTable>
          {/* <DeliveryGrid
            data={deliveryData}
            setSelectedDelivery={setSelectedDeliveryFirstTab}
            getItemPrice={getItemPriceData}
          /> */}

          <GlPanelTable>
            <Secure.GlCustomTable
              resource_key="replaceme"
              //find me
              columns={invoiceDetailTableColumns}
              url={
                selectedDeliveryFirstTab?.delivery_id
                  ? `/api/invoiceDetail/search`
                  : ""
              }
              params={{
                delivery_id: selectedDeliveryFirstTab?.delivery_id,
                status: "ACTIVE",
              }}
              getRowId={(r) => r.invoice_detail_id}
              onRowSelected={(r) => {
                setSelectedInvoiceFirstTab(r);
              }}
              key={selectedDeliveryFirstTab?.delivery_id}
            ></Secure.GlCustomTable>

            {/* {selectedDeliveryFirstTab?.delivery_id || "mfe4"} */}
          </GlPanelTable>

          {/* <InvoiceDetailsGrid
            
            hiddenColumns={[
              "invoice_detail_id",
              "invoice_id",
              "delivery_id",
              "item_id",
            ]}
            data={invoicesFirstTab}
            setSelectedInvoice={setSelectedInvoiceFirstTab}
          /> */}
        </Box>
      </TabPanel>
      <TabPanel
        resource_key="patientAccount_11_invoice"
        value={value}
        index={1}
      >
        <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
          {/* {JSON.stringify(selectedEpisodePolicy)} */}

          {/* !!! NEW  */}

          <GlPanelTable>
            <Secure.GlCustomTable
              resource_key="replaceme"
              refetchRef={invoiceRefetchRef}
              defaultHiddenColumns={[
                "invoice_id",
                "zatca_uuid",
                "zatca_xml_files",
                "zatca_api_trans_id",
              ]}
              limit={10}
              smallSize
              getRowId={(row) => row.invoice_id}
              onRowSelected={(row) => {
                setSelectedInvoice(row);
              }}
              // handleDataChange={(rows) => setInvoiceRows(rows ?? [])}
              url={formData.patientId ? "/api/invoice" : ""}
              columns={invoiceColumns}
              params={{
                ...formData,
                status: "ACTIVE",
                transType: invoiceTypeFilter,
              }}
              footer={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box>
                    <FormControl>
                      <RadioGroup
                        row
                        sx={{ alignItems: "center", gap: 0.5 }}
                        aria-label="invoiceTypeFilter"
                        name="invoiceTypeFilter"
                        value={invoiceTypeFilter}
                        onChange={(e) => {
                          setInvoiceTypeFilter(e.target.value);
                        }}
                      >
                        <FormLabel component="span">
                          {t("patientAccount_11_displayInvoiceTable")}
                        </FormLabel>

                        <Secure.GLGenericFormControlLabel
                          resource_key="patientAccount_11_allInvoiceTable"
                          value="all"
                          control={<Radio />}
                          label={t("patientAccount_11_allInvoiceTable")}
                        />
                        <Secure.GLGenericFormControlLabel
                          resource_key="patientAccount_11_onlyCrInvoiceTable"
                          value="cr"
                          control={<Radio />}
                          label={t("patientAccount_11_onlyCrInvoiceTable")}
                        />
                        <Secure.GLGenericFormControlLabel
                          resource_key="patientAccount_11_invoicesInvoiceTable"
                          value="invoices"
                          control={<Radio />}
                          label={t("patientAccount_11_invoicesInvoiceTable")}
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  <Secure.GLButton
                    resource_key="patientAccount_11_discountInvoiceTableButton"
                    onClick={() =>
                      selectedInvoice && setDiscountDialogOpen(true)
                    }
                  />

                  <Secure.GLButton
                    resource_key="patientAccount_11_printInvoiceTable"
                    disabled={loadingPrint}
                    onClick={() => printInvoice(selectedInvoice.invoice_id)}
                  >
                    {loadingPrint
                      ? "..."
                      : t("patientAccount_11_printInvoiceTable")}
                  </Secure.GLButton>

                  <Secure.GLButton
                    resource_key="patientAccount_11_reportInvoiceTable"
                    disabled={loadingReport}
                    onClick={handleReport}
                  >
                    {loadingReport
                      ? "..."
                      : t("patientAccount_11_reportInvoiceTable")}
                  </Secure.GLButton>

                  {/* <Secure.GLButton disabled={loadingRecharge} onClick={handleRecharge}>
                    {loadingRecharge ? "..." : "Recharge"}
                  </Secure.GLButton> */}

                  <Secure.GLButton
                    resource_key="patientAccount_11_rechargeInvoiceTable"
                    disabled={loadingRecharge}
                    // color="primary"
                    // variant="contained"
                    onClick={handleOpenConfirm}
                  >
                    {loadingRecharge
                      ? "..."
                      : t("patientAccount_11_rechargeInvoiceTable")}
                  </Secure.GLButton>

                  {/* <ReportAll invoiceRows={allInvoices} /> */}
                  {/* <Button disabled={loadingReportAll} onClick={handleReportAll}>
                          {loadingReportAll ? "..." : "Report All"}
                        </Button> */}
                </Box>
              }
            />
          </GlPanelTable>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Box sx={{ width: `${secTabSelectedDeliveryId ? "76" : "100"}%` }}>
              <GlPanelTable>
                <Secure.GlCustomTable
                  resource_key="replaceme"
                  defaultHiddenColumns={["invoice_id"]}
                  limit={10}
                  getRowId={(row) => row.item_id}
                  url={
                    selectedInvoice
                      ? `/api/invoiceDetail/getByInvoiceId/${selectedInvoice.invoice_id}`
                      : ""
                  }
                  columns={invoiceDetailColumns}
                  onRowSelected={(v) =>
                    setSecTabSelectedDeliveryId(v?.delivery_id)
                  }
                />
              </GlPanelTable>

              <GlPanelTable>
                {/* {secTabSelectedDeliveryId} */}
                {secTabSelectedDeliveryId && (
                  <GlCustomTable
                    url={
                      secTabSelectedDeliveryId
                        ? `/api/patientAccount/deliveryDetailsByDeliveryId/${secTabSelectedDeliveryId}`
                        : ""
                    }
                    //here
                    columns={[
                      {
                        field: "item_id",
                        headerName: "Item",
                        display: "flex",
                        flex: 0.7,
                      },
                      {
                        field: "item_description",
                        headerName: "Desc",
                        display: "flex",
                        flex: 3,
                      },
                      {
                        field: "delivery_date",
                        headerName: "Date",
                        display: "flex",
                        flex: 0.7,
                        align: "right",
                      },

                      {
                        field: "qty_delivered",
                        headerName: "Deliver Qty",
                        display: "flex",
                        flex: 0.7,
                        renderCell: (params) => {
                          return (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                width: "100%",
                              }}
                            >
                              {params.value}
                            </Box>
                          );
                        },
                      },
                      {
                        field: "ordered_quantity",
                        headerName: "Order Qty",
                        display: "flex",
                        flex: 0.7,
                        align: "right",
                        renderCell: (params) => {
                          return (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                width: "100%",
                              }}
                            >
                              {params.value}
                            </Box>
                          );
                        },
                      },
                      {
                        field: "unit_price_od",
                        headerName: "Unit Price OD",
                        display: "flex",
                        flex: 0.7,
                        renderCell: (params) => {
                          return (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                width: "100%",
                              }}
                            >
                              {params.value}
                            </Box>
                          );
                        },
                      },

                      // {
                      //   field: "Orderer",
                      //   headerName: "Orderer",
                      //   display: "flex",
                      //   flex: 0.7,
                      //   renderCell: (params) => {
                      //     return (
                      //       <Box
                      //         sx={{
                      //           display: "flex",
                      //           justifyContent: "flex-end",
                      //           width: "100%",
                      //         }}
                      //       >
                      //         {params.value}
                      //       </Box>
                      //     );
                      //   },
                      // },

                      // Item Price
                      {
                        field: "unit_price",
                        headerName: "Unit Price IP",
                        flex: 0.7,
                        renderCell: (params) => (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              width: "100%",
                            }}
                          >
                            {params.value || 0}
                          </Box>
                        ),
                      },
                      {
                        field: "ordered_discount",
                        headerName: "Discount",
                        flex: 0.7,
                        renderCell: (params) => (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              width: "100%",
                            }}
                          >
                            {params.value || 0}
                          </Box>
                        ),
                      },

                      {
                        field: "payer_share",
                        headerName: "Payer Share",
                        flex: 0.8,
                        align: "right",
                        type: "number",
                        renderCell: (params) => {
                          return (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                width: "100%",
                              }}
                            >
                              {params.value}
                            </Box>
                          );
                        },
                      },
                      {
                        field: "patient_share",
                        headerName: "Patient Share",
                        flex: 0.8,
                        align: "right",
                        type: "number",
                        renderCell: (params) => {
                          return (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                width: "100%",
                              }}
                            >
                              {params.value}
                            </Box>
                          );
                        },
                      },
                      {
                        field: "price_list_id",
                        headerName: "Price List ID",
                        flex: 0.8,
                        renderCell: (params) => (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              width: "100%",
                            }}
                          >
                            {params.value ?? "-"}
                          </Box>
                        ),
                      },
                      {
                        field: "policy_id",
                        headerName: "Policy ID",
                        flex: 0.8,
                        renderCell: (params) => (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              width: "100%",
                            }}
                          >
                            {params.value}
                          </Box>
                        ),
                      },

                      //{ field: "Invoice No", headerName: "Invoice No" , display  :"flex" , flex : 1 },
                      // { field: "Invoice Date", headerName: "Invoice Date" , display  :"flex" , flex : 1 },
                      // { field: "Payer", headerName: "Payer" , display  :"flex" , flex : 1 },
                    ]}
                    getRowId={(r) => r.delivery_id}
                  />
                )}
              </GlPanelTable>
            </Box>
            {
              <Box sx={{ width: "24%" }}>
                <GlPanelTable>
                  {/* {secTabSelectedDeliveryId} */}
                  {
                    <Secure.GlCustomTable
                      resource_key="replaceme"
                      url={
                        formData?.patientId
                          ? "api/payment/patient-payments"
                          : ""
                      }
                      params={{
                        patient_id: formData.patientId,
                        episode_no: formData.episodeNo,
                      }}
                      columns={paymentTableColmuns}
                      smallSize
                      nphiesFetcher
                      refetchRef={paymentRefetchRef}
                    />
                  }
                </GlPanelTable>
              </Box>
            }
          </Box>
        </Box>
      </TabPanel>
      <TabPanel resource_key="patientAccount_11_policy" value={value} index={2}>
        <Box sx={{ display: "grid", gap: 1 }}>
          {/*! Actions */}
          {/* <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title="Add">
              <IconButton onClick={handleAddClick}>
                <AddCircleOutlineIcon color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={handleDelete}>
                <HighlightOffIcon color="error" />
              </IconButton>
            </Tooltip>
          </Box> */}

          <GlPanelTable>
            {/* {JSON.stringify(selectedEpisodePolicy)} */}
            <Secure.GlCustomTable
              resource_key="replaceme"
              // /api/patientAccount/invoiceTab
              url={
                formData.episodeNo && formData.patientId
                  ? `/api/patientAccount/policy/${formData?.patientId}/${formData?.episodeNo}?random=${random}`
                  : ""
              }
              columns={policyTableColumns}
              onRowSelected={setSelectedEpisodePolicy}
              getRowId={(r) => r?.id}
              // footer={
              //   <>
              //     <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              //       <Tooltip title="Add">
              //         <IconButton onClick={handleAddClick}>
              //           <AddCircleOutlineIcon color="primary" />
              //         </IconButton>
              //       </Tooltip>
              //       <Tooltip title="Delete">
              //         <IconButton onClick={handleDelete}>
              //           <HighlightOffIcon color="error" />
              //         </IconButton>
              //       </Tooltip>
              //     </Box>
              //   </>
              // }
            />
          </GlPanelTable>
          {/* <PolicyDataGrid
            data={policyThirdTap}
            setSelectedPolicy={setSelectedEpisodePolicy}
          /> */}
          <h4 style={{ margin: 0 }}>
            {t("patientAccount_11_coverageTitleCoverageTable")}{" "}
          </h4>
          {/* <CoverageGrid
            data={coverageData}
            setSelectedCoverage={setSelectedCoverage}
          /> */}

          <GlPanelTable>
            <Secure.GlCustomTable
              resource_key="replaceme"
              key={selectedEpisodePolicy}
              url={
                selectedEpisodePolicy?.id
                  ? `/api/patientAccount/coverage/${selectedEpisodePolicy?.id}`
                  : ""
              }
              columns={covarageTabelColumns}
              onRowSelected={setSelectedCoverage}
              getRowId={(r) => r.coverage_id}
            />
          </GlPanelTable>

          <Split
            className="split"
            sizes={[50, 50]}
            minSize={100}
            expandToMin={false}
            gutterSize={4}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
          >
            <div>
              <h4 style={{ margin: 0 }}>
                {t("patientAccount_11_benefitsTitleBenefitsTable")}{" "}
              </h4>
              {/* <BenefitsDataGrid data={benefits} /> */}

              <GlPanelTable>
                <Secure.GlCustomTable
                  resource_key="replaceme"
                  key={selectedCoverage}
                  url={
                    selectedCoverage?.coverage_id
                      ? `/api/patientAccount/benefits/${selectedCoverage?.coverage_id}`
                      : ""
                  }
                  columns={benfitsTableColumns}
                  // onRowSelected={setSelectedCoverage}
                  getRowId={(r) => r.benefit_id}
                />
              </GlPanelTable>
            </div>
            <div>
              <h4 style={{ margin: 0 }}>
                {t("patientAccount_11_priceListTitlePriceListTable")}
              </h4>

              {/* <PriceListDataGrid data={priceList} /> */}

              {/* {selectedEpisodePolicy?.payer_id &&   JSON.stringify(selectedEpisodePolicy)} */}
              <GlPanelTable>
                <Secure.GlCustomTable
                  resource_key="replaceme"
                  key={selectedEpisodePolicy}
                  url={
                    selectedEpisodePolicy?.payer_id
                      ? `/item_prices?price_list_id=${selectedEpisodePolicy?.price_list_id}&payer_id=${selectedEpisodePolicy?.payer_id}`
                      : ""
                  }
                  columns={priceListTableColumns}
                  // onRowSelected={setSelectedCoverage}
                  getRowId={(r) => r.item_id}
                />
              </GlPanelTable>
            </div>
          </Split>

          {/* <PatientPolicyGrid
                data={patientPolicyData}
                setSelectedPolicy={(selectedPolicy) => {
                  setSelectedPatientPolicy(selectedPolicy);
                  // handleCloseDialog();
                }}
                /> */}
          <Dialog
            open={openDialog}
            onClose={(_, reasons) => {
              if (reasons == "backdropClick") return;

              handleCloseDialog();
            }}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>Please Select Policy</DialogTitle>
            <DialogContent sx={{}}>
              <Box sx={{ mb: 2 }}>
                <PatientPolicyGrid
                  data={patientPolicyData}
                  setSelectedPolicy={(selectedPolicy) => {
                    setSelectedPatientPolicy(selectedPolicy);
                    // handleCloseDialog();
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Secure.GLButton
                  resource_key="patientAccount_11_deleteIcon"
                  color="error"
                  onClick={handleCloseDialog}
                  variant="contained"
                >
                  Close
                </Secure.GLButton>
                <Secure.GLButton
                  resource_key="patientAccount_11_addIcon"
                  onClick={handleAddEpisodePolicy}
                  variant="contained"
                >
                  Add
                </Secure.GLButton>
              </Box>
            </DialogContent>
          </Dialog>

          {/* <GenericDialog
            open={openDialog}
            onClose={() => {
              handleCloseDialog();
            }}
            content={
              <>
                <PatientPolicyGrid
                  data={patientPolicyData}
                  setSelectedPolicy={(selectedPolicy) => {
                    setSelectedPatientPolicy(selectedPolicy);
                    // handleCloseDialog();
                  }}
                />
                <Button variant="contained">Add</Button>
                <Button sx={{color :"white"}} >Close</Button>
              </>
            }
            maxWidth="xl"
            fullWidth
            title="Pls Select Policy"
          ></GenericDialog> */}
        </Box>
      </TabPanel>
      {/* Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          {t("patientAccount_11_confirmRechargeTitleRecharge")}
        </DialogTitle>
        <DialogContent>
          <Secure.GLTypography resource_key="patientAccount_11_areYouSureYouWantToRechargeThisInvoiceTextRecharge" />
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Secure.GLButton
              resource_key="patientAccount_11_cancelButtonRecharge"
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              color="error"
            />

            <Secure.GLButton
              resource_key="patientAccount_11_confirmButtonRecharge"
              onClick={handleConfirmRecharge}
              color="success"
              variant="contained"
              disabled={loadingRecharge}
            >
              {loadingRecharge
                ? t("patientAccount_11_processingButtonRecharge")
                : t("patientAccount_11_confirmButtonRecharge")}
            </Secure.GLButton>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={confirmOpenDeliveryRecharge}
        onClose={() => setConfirmOpenDeliveryRecharge(false)}
      >
        <DialogTitle>Confirm Recharge</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to recharge this delivery?
          </Typography>
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button
              onClick={() => setConfirmOpenDeliveryRecharge(false)}
              variant="outlined"
              color="error"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRechargeDelivery}
              color="success"
              variant="contained"
              disabled={loadingRechargeDelivery}
            >
              {loadingRechargeDelivery ? "Processing..." : "Confirm"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
