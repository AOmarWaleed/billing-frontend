import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { log } from "node:console";

interface CoverageItem {
  coverage_id: number;
  policy_number: string;
  payer_name: string;
  coverage_period_start: string;
  coverage_period_end: string;
  member_status: string;
  [key: string]: any;
}

interface CoverageGridProps {
  data: CoverageItem[];
  setSelectedCoverage: (data: CoverageItem | null) => void;
}

const coverageColumns: GridColDef[] = [
  { field: "policy_number", headerName: "Policy Number", flex: 1 },
  { field: "payer_name", headerName: "Payer Name", flex: 3 },
  { 
    field: "serviced_period_start", 
    headerName: "Start Date", 
    flex: 1,
    // valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
  },
  { 
    field: "serviced_period_end", 
    headerName: "End Date", 
    flex: 1,
    // valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
  },
  { field: "member_status", headerName: "Member Status", flex: 1 },
];

export default function CoverageGrid({ data, setSelectedCoverage }: CoverageGridProps) {
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  useEffect(() => {
    console.log("CoverageGrid data:", data);
    if (data.length > 0) {
      const firstItemId = data[0].coverage_id;
      setSelectionModel([firstItemId]);
      setSelectedCoverage(data[0]);
    } else {
      setSelectionModel([]);
      setSelectedCoverage(null);
    }
  }, [data, setSelectedCoverage]);

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelectionModel(newSelection);
    const selectedItem = data.find(item => item.coverage_id === newSelection[0]);
    if (selectedItem) {
      setSelectedCoverage(selectedItem);
    }
  };

  const handleKeyDown = (params: any, event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const currentIndex = data.findIndex(item => item.coverage_id === params.id);
      
      const nextIndex = event.key === "ArrowDown" 
        ? Math.min(data.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);
      
      const nextItem = data[nextIndex];
      if (nextItem) {
        setSelectedCoverage(nextItem);
        setSelectionModel([nextItem.coverage_id]);
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={data}
        columns={coverageColumns}
        getRowId={(row) => row.coverage_id}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelectionChange}
        onCellKeyDown={handleKeyDown}
        onRowClick={(params) => setSelectedCoverage(params.row)}
        autoHeight
        hideFooterSelectedRowCount
         sx={{
          "& .MuiTablePagination-selectLabel , & .MuiTablePagination-displayedRows , & .MuiTablePagination-actions , & .MuiTablePagination-actions button":
            {
              m: 0,
              p: 0,
            },
          "& .MuiDataGrid-footerContainer , & .MuiToolbar-root": {
            height: "30px",
            minHeight: "30px",
            maxHeight: "30px",
          },
          "& > .MuiTablePagination-toolbar": {
            alignItems: "center",
            height: "30px",
          },
        }}
      />
    </Box>
  );
}