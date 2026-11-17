import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { get } from "lodash";

const deliveryColumns: GridColDef[] = [
  { field: "item_id", headerName: "Item", display: "flex", flex: 0.7 },
  { field: "description", headerName: "Desc", display: "flex", flex: 3 },
  {
    field: "delivery_date",
    headerName: "Date",
    display: "flex",
    flex: 0.7,
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
    renderCell: (params) => {
      return (
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
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
          sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
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
          sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
        >
          {params.value}
        </Box>
      );
    },
  },

  {
    field: "Orderer",
    headerName: "Orderer",
    display: "flex",
    flex: 0.7,
    renderCell: (params) => {
      return (
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
        >
          {params.value}
        </Box>
      );
    },
  },

  // Item Price
  {
    field: "unit_price",
    headerName: "Unit Price IP",
    flex: 0.7,
    renderCell: (params) => (
      <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        {params.value || 0}
      </Box>
    ),
  },
  {
    field: "ordered_discount",
    headerName: "Discount",
    flex: 0.7,
    renderCell: (params) => (
      <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        {params.value || 0}
      </Box>
    ),
  },

  {
    field: "payer_share",
    headerName: "Payer Share",
    flex: 0.8,
    align :"right",
    type :"number",
    renderCell: (params) => {
     
      return (
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
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
    align :"right",
    type:"number",
   renderCell: (params) => {
     
      return (
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
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
      <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        {params.value ?? "-"}
      </Box>
    ),
  },
  {
    field: "policy_id",
    headerName: "Policy ID",
    flex: 0.8,
    renderCell: (params) => (
      <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        {params.value}
      </Box>
    ),
  },

  //{ field: "Invoice No", headerName: "Invoice No" , display  :"flex" , flex : 1 },
  // { field: "Invoice Date", headerName: "Invoice Date" , display  :"flex" , flex : 1 },
  // { field: "Payer", headerName: "Payer" , display  :"flex" , flex : 1 },
];

export default function DeliveryGrid({
  data,
  setSelectedDelivery,
  getItemPrice,
}: {
  data: any[];
  setSelectedDelivery: (data: any) => void;
  getItemPrice?: (
    itemId: string,
    date: string,
    patientId: string,
    episodeNo: string,
    query?:
      | { payer_id: string; policy_id: string; price_list_id: string }
      | undefined
  ) => Promise<any>;
}) {
  console.log("DeliveryGrid data:", data);

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectionModel, setSelectionModel] = useState<number[]>();
  // const [rowsWithPrices, setRowsWithPrices] = useState<any[]>([]);

  // Fetch prices for all items when data or getItemPrice changes
  // useEffect(() => {
  //   if (!data || !getItemPrice) return;

  //   const fetchPrices = async () => {
  //     const rows = await Promise.all(
  //       data.map(async (item, index) => {
  //         try {
  //           const priceData = await getItemPrice(
  //             item?.item_id,
  //             item?.delivery_date,
  //             item?.patient_id,
  //             item?.episode_no,
  //             {
  //               payer_id: item?.payer_id,
  //               policy_id: item?.policy_id,
  //               price_list_id: item?.price_list_id,
  //             }
  //           );
  //           console.log(priceData);

  //           return {
  //             id: item.delivery_id || index,
  //             ...item,
  //             ...priceData, // This should include unit_price, discount, price, price_list_id etc.
  //           };
  //         } catch (error) {
  //           console.error("Error fetching price for item", item.item_id, error);
  //           return {
  //             id: item.delivery_id || index,
  //             ...item,
  //             // Default values if price fetch fails
  //             unit_price: 0,
  //             discount: 0,
  //             price: -7,
  //             payer_share: 0,
  //             patient_share: 0,
  //             price_list_id : null ,
  //           };
  //         }
  //       })
  //     );
  //     setRowsWithPrices(rows);
  //   };

  //   fetchPrices();
  // }, [data]);

  // useEffect(() => {
  //   // Set the first delivery as selected if available
  // console.log("Rows with prices:", rowsWithPrices);

  //   return () => {

  //   }
  // }, [rowsWithPrices]);

  // Initialize selection model and selected delivery when data changes
  useEffect(() => {
    if (data?.length > 0) {
      setSelectedDelivery(data[0]);
      setSelectedRow(data[0]);
      setSelectionModel([Number(data[0].delivery_id)] as number[]);
    } else {
      setSelectedDelivery(null);
      setSelectionModel([]);
    }
  }, [data]);

  // Update selected delivery when selection model changes
  useEffect(() => {
    selectedRow && setSelectedDelivery(selectedRow);
  }, [selectedRow]);

  return (
    <Box>
      <DataGrid
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={(newSelection: GridRowSelectionModel) => {
          setSelectionModel(newSelection as number[]);
          const selected = data.find((f) => f.delivery_id === newSelection[0]);
          if (selected) {
            setSelectedDelivery(selected);
          }
        }}
        onCellKeyDown={(params: any, event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();

            const currentIndex = data.findIndex(
              (r) => r.delivery_id === params.id
            );

            const nextIndex =
              event.key === "ArrowDown"
                ? Math.min(data.length - 1, currentIndex + 1)
                : Math.max(0, currentIndex - 1);
            const nextRow = data[nextIndex];
            if (nextRow) {
              setSelectedDelivery(nextRow);
              setSelectedRow(nextRow);
              setSelectionModel([Number(nextRow.delivery_id)]);
            }
          }
        }}
        onRowClick={(p) => setSelectedRow(p.row)}
        hideFooterSelectedRowCount
        columns={deliveryColumns}
        getRowId={(row) => row.delivery_id}
        rows={data}
        autoHeight
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
