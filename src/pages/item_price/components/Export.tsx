import { Button } from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../utils/Api";

interface ExportProps {
  rows: any;
  currentPayerOption1: string | null,
  currentPayerOption2: string | null,
  selectedCategoryData: string | null,
  selectedType: {label: string, value: string} | null,
  pricesOptions: {label: string, value: string} | null,
  selectedDate: string
  search: string
  label: string,
  currentPriceListId: any ,
  catValueString: any ,
  itemBkField: any ,
  itemDescField : any ,
  itemCurrPriceField : any ,
  itemCatCodeField : any,
  itemStatusField : any,
  itemLegacyCodeField : any

}

const Export: React.FC<ExportProps> = ({currentPriceListId,selectedCategoryData ,itemLegacyCodeField,itemStatusField, itemCatCodeField , itemCurrPriceField , itemDescField ,catValueString, itemBkField,rows, currentPayerOption1, selectedType, selectedDate, pricesOptions, search , label}) => {
  const exportToExcel = async() => {

    try {
      toast.warn("Exporting... May take time if there is Huge Data!")

      // return ;
      
      const result = await api.get(`item_prices?selectedType=${selectedType?.value}&payer_id=${
        currentPayerOption1 || null
      }&price_list_id=${
        currentPriceListId || null
      }&${catValueString}&price_option=${
        pricesOptions?.value
      }&filter_date=${selectedDate}&search=${search}&item_bk=${itemBkField}&item_desc=${itemDescField}&item_curr_price=${itemCurrPriceField}&item_cat_code=${itemCatCodeField}&item_status=${itemStatusField}&item_leg_code=${itemLegacyCodeField}&isExport=true`)
  
            
      if (!result.data.data || result.data.data.length === 0) {
        console.error("No data available for export.");
        return;
      }
      
      
      
      const formattedRows = result.data.data.map((row: any) => ({
        item_bk: row.item_bk,
        item: row.description,
        price: row.price,
        new_price: null,
        start_date: (row.start_date),
        end_date: (row.end_date),
        status: row.status,
        legacy_code: row.legacy_code,
        price_id: row.price_id,
        item_id: row.item_id,
        payer_id: row.payer_id || (currentPayerOption1 === "null" ? 0 : Number(currentPayerOption1)),
        price_list_id: row.price_list_id || (currentPriceListId === "null" ? 0 : Number(currentPriceListId)),
        id: row.price_id
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(formattedRows);
      
      // Set column widths
      worksheet["!cols"] = [
        { wpx: 100 }, // item_bk
        { wpx: 500 },  // item (description)
        { wpx: 100 },  // price
        { wpx: 100 },  // new_price
        { wpx: 100 },  // start_date
        { wpx: 100 },  // end_date
        { wpx: 100 },  // status
        { wpx: 100 },  // legacy_code
        { wpx: 100 },  // price_id
        { wpx: 100 },  // item_item_id
        { wpx: 100 },  // item_id
        { wpx: 100 },  // payer_id
        { wpx: 100 },  // price_list_id
        { wpx: 100 },  // id
      ];
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      
      // Generate a unique filename
      const timestamp = new Date().toISOString().replace(/[-T:]/g, "").split(".")[0];
      const filename = `DataGridExport_${timestamp}.xlsx`;
      
      // Convert to Excel and download
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      
      saveAs(data, filename);
      toast.success("Data Exported Successfully!")
    }catch (error) {
      console.error(error)
    }
  };
    
    const formatDate = (dateString: string | null | undefined) => {
      if (!dateString) return ""; // Return an empty string if null/undefined
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original value if invalid

    return date.toLocaleDateString("en-GB");
  };

  return (
    <Button variant="contained" color="primary" size="small" onClick={exportToExcel} sx={{ whiteSpace: "nowrap" }}>
     {label}
    </Button>
  );
};

export default Export;
