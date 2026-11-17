// ExportButton.tsx

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  if (data.length > 0) {
    const headerKeys = Object.keys(data[0]);
    const columnWidths = headerKeys.map((key) => ({
      wch: Math.max(10, key.length + 2, ...data.map((row) => (row[key] ? String(row[key]).length : 0))),
    }));
    worksheet["!cols"] = columnWidths;

    // Format headers
    headerKeys.forEach((key, index) => {
      const cellAddress = XLSX.utils.encode_cell({ c: index, r: 0 });
      if (!worksheet[cellAddress]) return;

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
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

        if (typeof row[key] === "number") {
          worksheet[cellAddress].z = row[key] % 1 === 0 ? "#,##0" : "#,##0.00";
          worksheet[cellAddress].s = {
            ...(worksheet[cellAddress].s || {}),
            alignment: { horizontal: "right" },
          };
        }

        if (row[key] instanceof Date) {
          worksheet[cellAddress].z = "yyyy-mm-dd";
          worksheet[cellAddress].v = row[key];
        }
      });
    });
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  const currentDate = new Date().toISOString().split("T")[0];
  const fullFileName = `${fileName}_${currentDate}.xlsx`;

  saveAs(blob, fullFileName);
};

interface ExportButtonProps {
  items: any[];
  fileName: string;
  exportButtonProps?: React.ComponentProps<typeof IconButton>;
  tooltip?: string;
}

const ExportButtonV3: React.FC<ExportButtonProps> = ({ items, fileName, exportButtonProps, tooltip = "Export to Excel" }) => {
  const handleExport = () => {
    exportToExcel(items, fileName);
  };

  return (
    <Tooltip title={tooltip}>
      <IconButton onClick={handleExport} {...exportButtonProps}>
        <FileUploadRoundedIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ExportButtonV3;
