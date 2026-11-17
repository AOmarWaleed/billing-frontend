//import { Fab } from "@mui/material";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";


const exportToExcel = (data: any[], fileName: any) => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-fit columns with a minimum width
  if (data.length > 0) {
    const headerKeys = Object.keys(data[0]);
    const columnWidths = headerKeys.map((key) => ({
      wch: Math.max(
        10, // minimum width
        key.length + 2, // header length + padding
        ...data.map((row) => (row[key] ? String(row[key]).length : 0)) // content length
      ),
    }));

    worksheet["!cols"] = columnWidths;

    // Format headers
    headerKeys.forEach((key, index) => {
      const cellAddress = XLSX.utils.encode_cell({ c: index, r: 0 });
      if (!worksheet[cellAddress]) return;

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } }, // blue background
        alignment: { horizontal: "center", vertical: "center" },
      };
    });

    // Format data cells
    data.forEach((row, rowIndex) => {
      headerKeys.forEach((key, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({
          c: colIndex,
          r: rowIndex + 1,
        });
        if (!worksheet[cellAddress]) return;

        // Number formatting
        if (typeof row[key] === "number") {
          worksheet[cellAddress].z = row[key] % 1 === 0 ? "#,##0" : "#,##0.00";
        }

        // Date formatting
        if (row[key] instanceof Date) {
          worksheet[cellAddress].z = "yyyy-mm-dd";
          worksheet[cellAddress].v = row[key];
        }

        // Right-align numbers
        if (typeof row[key] === "number") {
          worksheet[cellAddress].s = worksheet[cellAddress].s || {};
          worksheet[cellAddress].s.alignment = { horizontal: "right" };
        }
      });
    });
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  const currentDate = new Date().toISOString().split("T")[0];
  const fullFileName = `${fileName}_${currentDate}`;

  saveAs(blob, `${fullFileName}.xlsx`);
};
const ExportButton = ({ items, fileName }) => {
  const handleExport = () => {
    exportToExcel(items, fileName);
  };

  return <FileUploadRoundedIcon onClick={handleExport} sx={{ ml: 1, mr: 1 }} />;
};

export default ExportButton;
