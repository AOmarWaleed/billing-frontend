import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { toast } from "react-toastify";
import api from "../../../utils/Api";

interface PrintReportProps {
  currentPayerOption1: string | null;
  currentPriceListId: string | null;
  selectedType: { label: string; value: string } | null;
  pricesOptions: { label: string; value: string } | null;
  selectedDate: string;
  search: string;
  catValueString: string;
  itemBkField: string;
  itemDescField: string;
  itemCurrPriceField: string;
  itemCatCodeField: string;
  itemStatusField: string;
  itemLegacyCodeField: string;
}

const PrintReport: React.FC<PrintReportProps> = ({
  currentPayerOption1,
  currentPriceListId,
  selectedType,
  pricesOptions,
  selectedDate,
  search,
  catValueString,
  itemBkField,
  itemDescField,
  itemCurrPriceField,
  itemCatCodeField,
  itemStatusField,
  itemLegacyCodeField,
}) => {
  const [loading, setLoading] = useState(false);

  const buildQueryString = () =>
    `selectedType=${selectedType?.value ?? ""}&payer_id=${
      currentPayerOption1 ?? null
    }&price_list_id=${
      currentPriceListId ?? null
    }&${catValueString}&price_option=${
      pricesOptions?.value ?? ""
    }&filter_date=${selectedDate}&search=${search}&item_bk=${itemBkField}&item_desc=${itemDescField}&item_curr_price=${itemCurrPriceField}&item_cat_code=${itemCatCodeField}&item_status=${itemStatusField}&item_leg_code=${itemLegacyCodeField}`;

  const handlePrint = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/itemPriceReport/print?${buildQueryString()}`,
        { responseType: "blob" }
      );

      const contentType = String(response.headers["content-type"] ?? "");

      if (contentType.includes("application/pdf")) {
        const fileURL = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = fileURL;
        link.setAttribute(
          "download",
          `service-price-list-${new Date().toISOString().split("T")[0]}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(fileURL);
      } else {
        const text = await (response.data as Blob).text();
        const json = JSON.parse(text);
        toast.error(json?.data?.description || "Failed to generate report");
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown } };
      if (axiosError.response?.data instanceof Blob) {
        try {
          const text = await (axiosError.response.data as Blob).text();
          const json = JSON.parse(text);
          toast.error(json?.data?.description || "Failed to generate report");
        } catch {
          toast.error("An unexpected error occurred");
        }
      } else {
        toast.error("Network error while generating report");
      }
    } finally {
      setLoading(false);
    }
  };

  const isPayerSelected = !!currentPayerOption1 && currentPayerOption1 !== "null" && currentPayerOption1 !== "";

  return (
    <Button
      variant="outlined"
      color="primary"
      size="small"
      startIcon={
        loading ? <CircularProgress size={16} color="inherit" /> : <PrintIcon />
      }
      onClick={handlePrint}
      disabled={loading || !isPayerSelected}
      sx={{ whiteSpace: "nowrap" }}
      title={!isPayerSelected ? "Please select a payer first" : undefined}
    >
      {loading ? "Generating..." : "Print Report"}
    </Button>
  );
};

export default PrintReport;
