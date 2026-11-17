import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";

export default function InvoiceDetailsGrid({
  data,
  setSelectedInvoice,
  invoicesColumnsProp,
  hiddenColumns = [],
}: {
  data: any[];
  setSelectedInvoice: (data: any) => void;
  invoicesColumnsProp?: GridColDef[];
  hiddenColumns?: string[];
}) {
  const invoicesColumns: GridColDef[] = invoicesColumnsProp || [
    {
      field: "invoice_detail_id",
      headerName: "Invoice No",
      display: "flex",
      width: 100,
      align: "right",
    },
    {
      field: "creation_date",
      headerName: "Invoice Date",
      display: "flex",
      flex: 1,
    },
    {
      field: "invoice_detail_id",
      headerName: "Invoice Detail Id",
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
      field: "invoice_id",
      headerName: "Invoice Id",
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
    { field: "status", headerName: "Status", display: "flex", flex: 1 },
    {
      field: "delivery_id",
      headerName: "Delivery Id",
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
      field: "item_id",
      headerName: "item Id",
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
      field: "unit_price",
      headerName: "Unit Price",
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
      field: "discount",
      headerName: "Discount",
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
      field: "quantity",
      headerName: "Quantity",
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
      field: "net",
      headerName: "Net",
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
      field: "tax",
      headerName: "Tax",
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
      field: "total",
      headerName: "Total",
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

    // { field: "Payer", headerName: "Payer" , display  :"flex" , flex : 1 },
  ];
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectionModel, setSelectionModel] = useState<number[]>();

  useEffect(() => {
    if (data?.length > 0) {
      setSelectedInvoice(data[0]);
      setSelectionModel([Number(data[0].invoice_detail_id)] as number[]);
    } else {
      setSelectedInvoice(null);
      setSelectionModel([]);
    }
  }, [data]);
  useEffect(() => {
    selectedRow && setSelectedInvoice(selectedRow);
  }, [selectedRow]);

  return (
    <Box>
      <DataGrid
        // hide columns
        initialState={{
          columns: {
            columnVisibilityModel: {
              invoice_detail_id: hiddenColumns.includes("invoice_detail_id")
                ? true
                : false,
              invoice_id: hiddenColumns.includes("invoice_id") ? true : false,
              delivery_id: hiddenColumns.includes("delivery_id") ? true : false,
              item_id: hiddenColumns.includes("item_id") ? true : false,
            },
          },
        }}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={(newSelection: GridRowSelectionModel) => {
          setSelectionModel(newSelection as number[]);
          const selected = data.find(
            (f) => f.invoice_detail_id === newSelection[0]
          );
          if (selected) {
            setSelectedInvoice(selected);
          }
        }}
        onCellKeyDown={(params: any, event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();

            const currentIndex = data.findIndex(
              (r) => r.invoice_detail_id === params.id
            );

            const nextIndex =
              event.key === "ArrowDown"
                ? Math.min(data.length - 1, currentIndex + 1)
                : Math.max(0, currentIndex - 1);
            const nextRow = data[nextIndex];
            if (nextRow) {
              setSelectedInvoice(nextRow);
              setSelectionModel([Number(nextRow.invoice_detail_id)]);
            }
          }
        }}
        onRowClick={(p) => setSelectedRow(p?.row)}
        // columnHeaderHeight={35}
        hideFooterSelectedRowCount
        // getRowId={(item) => item?.invoice_detail_id}
        rows={data.map((item: any, index: any) => ({
          id: item?.invoice_detail_id || index,
          ...item,
        }))}
        columns={invoicesColumns}
        // autoHeight

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
