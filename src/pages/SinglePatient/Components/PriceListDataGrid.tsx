import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";


// {
//             "item_id": "264017",
//             "description": "VIPER SIDE (LUBRICANT)",
//             "item_bk": "SCH0503",
//             "legacy_code": "SCH0503",
//             "category_code": "SCH",
//             "price_id": "412691",
//             "price": "250.00",
//             "start_date": "2025-07-09T21:00:00.000Z",
//             "end_date": null,
//             "notes_id": null,
//             "status": "D",
//             "payer_id": "0",
//             "empolyee_id": "0",
//             "price_list_id": 0,
//             "facility_id": 0,
//             "created_by": 1,
//             "creation_date": "2025-07-08T21:00:00.000Z",
//             "modified_by": 1,
//             "modification_date": "2025-07-09T09:12:56.747Z"
//         },
export const PriceListDataGrid = ({ data }: { data: any[] }) => {
    const columns = [
      { field: "item_bk", headerName: "Item Bk", flex : 1  },
      { field: "description", headerName: "Description", flex : 1  },
      { field: "price", headerName: "Price", flex : 1  },
      { field: "start_date", headerName: "Start Date", flex : 1  },
      { field: "end_date", headerName: "End Date", flex : 1  },
      { field: "category_code", headerName: "Category Code", flex : 1  },
      { field: "status", headerName: "Status", flex : 1  },
      { field: "legacy_code", headerName: "Legacy Code", flex : 1  },
      
    
    ];
  
    return (
      <Box sx={{ width: "100%" }}>
        <DataGrid
          getRowId={(row) => row.item_id}
          rows={data}
          columns={columns as any}
          hideFooter
        />
      </Box>
    );
  };