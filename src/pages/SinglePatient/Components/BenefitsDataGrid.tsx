import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";


export const BenefitsDataGrid = ({ data }: { data: any[] }) => {
    const columns = [
      { field: "category", headerName: "category", flex : 1  },
      { field: "name", headerName: "name", flex : 3 },
      { field: "description", headerName: "description", flex: 4 },
      { field: "term", headerName: "term" , flex : 1 },
      // { field: "copay_percent", headerName: "copay_percent", flex : 1, align: "right" },
      // { field: "copay_maximum", headerName: "copay_maximum", flex : 1, align: "right" },
      // { field: "approval_limit", headerName: "approval_limit", flex : 1, align: "right" },
      // { field: "room", headerName: "room" },
    ];
  
    return (
      <Box sx={{ width: "100%" }}>
        <DataGrid
          getRowId={(row) => row.benefit_id}
          rows={data}
          columns={columns as any}
          hideFooter
        />
      </Box>
    );
  };