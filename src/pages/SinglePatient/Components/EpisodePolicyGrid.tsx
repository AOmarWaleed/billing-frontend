import { useEffect, useState, useMemo } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";

interface EpisodePolicyItem {
  episode_policy_id: number;
  patient_id: string;
  episode_no: string;
  policy_id: number;
  priority: number;
  status: string;
  facility_id: string;
  created_by: string;
  creation_date: string;
  modified_by: string;
  modification_date: string;
  [key: string]: any;
}

interface EpisodePolicyGridProps {
  data: EpisodePolicyItem[];
  setSelectedPolicy: (data: EpisodePolicyItem | null) => void;
}

export default function EpisodePolicyGrid({ data, setSelectedPolicy }: EpisodePolicyGridProps) {
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  const episodePolicyColumns: GridColDef[] = useMemo(() => [
    { 
      field: "episode_policy_id", 
      headerName: "Episode Policy ID", 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          {params.value}
        </Box>
      )
    },
    { 
      field: "patient_id", 
      headerName: "Patient ID", 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          {params.value}
        </Box>
      )
    },
    { field: "episode_no", headerName: "Episode No", flex: 1 },
    { 
      field: "patient_policy_id", 
      headerName: "Patient Policy ID", 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          {params.value}
        </Box>
      )
    },
    { 
      field: "priority", 
      headerName: "Priority", 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          {params.value}
        </Box>
      )
    },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "facility_id", headerName: "Facility ID", flex: 1 },
    { field: "created_by", headerName: "Created By", flex: 1 },
    { 
      field: "creation_date", 
      headerName: "Creation Date", 
      flex: 1,
      // valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : ' '
    },
    { field: "modified_by", headerName: "Modified By", flex: 1 },
    { 
      field: "modification_date", 
      headerName: "Modification Date", 
      flex: 1,
      // valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : ' '
    },
  ], []);

  useEffect(() => {
    if (data?.length > 0) {
      const firstItemId = data[0].episode_policy_id;
      setSelectionModel([firstItemId]);
      setSelectedPolicy(data[0]);
    } else {
      setSelectionModel([]);
      setSelectedPolicy(null);
    }
  }, [data]);

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    if (!data) return;
    
    setSelectionModel(newSelection);
    const selectedItem = data.find(item => item.episode_policy_id === newSelection[0]);
    setSelectedPolicy(selectedItem || null);
  };

  const handleKeyDown = (params: any, event: React.KeyboardEvent) => {
    if (!data || data.length === 0) return;
    
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const currentIndex = data.findIndex(item => item.episode_policy_id === params.id);
      
      const nextIndex = event.key === "ArrowDown" 
        ? Math.min(data.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);
      
      const nextItem = data[nextIndex];
      if (nextItem) {
        setSelectedPolicy(nextItem);
        setSelectionModel([nextItem.episode_policy_id]);
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={data || []}
        columns={episodePolicyColumns}
        getRowId={(row) => row.episode_policy_id}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelectionChange}
        onCellKeyDown={handleKeyDown}
        onRowClick={(params) => setSelectedPolicy(params.row)}
        autoHeight
        hideFooterSelectedRowCount
        sx={{
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-actions, & .MuiTablePagination-actions button": {
            m: 0,
            p: 0,
          },
          "& .MuiDataGrid-footerContainer, & .MuiToolbar-root": {
            height: "30px",
            minHeight: "30px",
            maxHeight: "30px",
          },
          "& > .MuiTablePagination-toolbar": {
            alignItems: "center",
            height: "30px",
          },
        }}
        aria-label="Episode policies data grid"
      />
    </Box>
  );
}