import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";

interface PatientPolicyItem {
  policy_id: number;
  description: string;
  patient_id: string;
  coverage_id: string;
  start_date: string;
  end_date: string;
  [key: string]: any;
}

interface PatientPolicyGridProps {
  data: PatientPolicyItem[];
  setSelectedPolicy: (data: PatientPolicyItem | null) => void;
}


// "payer_id": "422",
//             "payer": "Vision Care",
//             "policy": "Sample item2",
//             "policy_start": "01-07-2025",
//             "policy_end": "15-07-2025",
//             "patient_policy_start": "24-06-2025",
//             "patient_policy_end": "22-10-2025",
//             "price_list_id": "5"

//  {
//             "policy_id": "15",
//             "description": "Senior Benefits",
//             "patient_id": "499029",
//             "patient_policy_id": "15",
//             "start_date": "24-06-2025",
//             "end_date": "19-02-2026"
//         },

const patientPolicyColumns: GridColDef[] = [

  { field: "policy_id", headerName: "Policy", flex: 3 },
  { field: "patient_id", headerName: "Patient", flex: 3 },
  { field: "description", headerName: "Description", flex: 3 },
  { field: "patient_policy_id", headerName: "Patient Policy Id", flex: 3 },
  { field: "start_date", headerName: "Start Date", flex: 3 },
  { field: "end_date", headerName: "End Date", flex: 3 },

 
];

export default function PatientPolicyGrid({
  data,
  setSelectedPolicy,
}: PatientPolicyGridProps) {
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
    []
  );
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  useEffect(() => {
    selectedRow && setSelectedPolicy(selectedRow);
  }, [selectedRow]);
  useEffect(() => {
    if (data.length > 0) {
      const firstItemId = data[0].id;
      setSelectionModel([firstItemId]);
      setSelectedRow(data[0]);
    } else {
      setSelectionModel([]);
      setSelectedPolicy(null);
      setSelectedRow(null);
    }
  }, [data]);

  // const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
  //   setSelectionModel(newSelection);
  //   const selectedItem = data.find(item => item.patient_policy_id === newSelection[0]);
  //   if (selectedItem) {
  //     setSelectedPolicy(selectedItem);
  //   }
  // };

  // const handleKeyDown = (params: any, event: React.KeyboardEvent) => {
  //   if (event.key === "ArrowDown" || event.key === "ArrowUp") {
  //     event.preventDefault();
  //     const currentIndex = data.findIndex(item => item.patient_policy_id === params.id);

  //     const nextIndex = event.key === "ArrowDown"
  //       ? Math.min(data.length - 1, currentIndex + 1)
  //       : Math.max(0, currentIndex - 1);

  //     const nextItem = data[nextIndex];
  //     if (nextItem) {
  //       setSelectedPolicy(nextItem);
  //       setSelectionModel([nextItem.patient_policy_id]);
  //     }
  //   }
  // };

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25, 50]}
        //
        rows={data}
        columns={patientPolicyColumns}
        
        getRowId={(row) => row.policy_id}
        rowSelectionModel={selectionModel}
        // onRowSelectionModelChange={handleSelectionChange}
        onRowSelectionModelChange={(newSelection: GridRowSelectionModel) => {
          setSelectionModel(newSelection as number[]);
          const selected = data.find(
            (f) => f.id === newSelection[0]
          );
          if (selected) {
            setSelectedPolicy(selected);
          }
        }}
        // onCellKeyDown={handleKeyDown}
        onCellKeyDown={(params: any, event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();

            const currentIndex = data.findIndex(
              (r) => r.id === params.id
            );

            const nextIndex =
              event.key === "ArrowDown"
                ? Math.min(data.length - 1, currentIndex + 1)
                : Math.max(0, currentIndex - 1);
            const nextRow = data[nextIndex];
            if (nextRow) {
              setSelectedPolicy(nextRow);
              setSelectedRow(nextRow);
              setSelectionModel([Number(nextRow.id)]);
            }
          }
        }}
        onRowClick={(params) => setSelectedRow(params.row)}
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
