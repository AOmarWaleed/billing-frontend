import { Box, Chip } from "@mui/material";
import React from "react";
import GlPanelTable from "../../../shared/tables/GlPanelTable";
import GlCustomTable from "../../../shared/tables/GlCustomTable";
import { useAppDispatch } from "../../../hooks/hooks";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { setSelectedOrderDetails } from "../../../redux/slices/orderSlice";
import { GridColDef } from "@mui/x-data-grid";
import { useContext } from "react";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import { GLGridColDef } from "../../../shared/security/GLCustomTable";
import Secure from "../../../shared/security";
const columns: GLGridColDef[] = [
  {
    field: "order_detail_id",
    headerName: "Detail ID",
    type: "number",

    // width: 100,
    flex: 1,
    resource_key: "order_24_detailId",
    // headerClassName: 'super-app-theme--header',
  },

  {
    field: "order_id",
    headerName: "Order ID",
    type: "number",

    // width: 100,
    flex: 1,
    resource_key: "order_24_orderId",
    // headerClassName: 'super-app-theme--header',
  },
  {
    field: "status",
    headerName: "Status",
    // width: 130,
    flex: 1,
    resource_key: "order_24_statusServiceTable",
    // headerClassName: 'super-app-theme--header',
  },
  {
    field: "nphies_service_type",
    headerName: "Service Type",

    minWidth: 150,
    // width: 100,
    flex: 1,
    resource_key: "order_24_serviceType",
    // headerClassName: 'super-app-theme--header',
  },
  {
    field: "description",
    headerName: "Desc",
    minWidth: 300,

    // width: 100,
    flex: 1,
    resource_key: "order_24_desc",
    // headerClassName: 'super-app-theme--header',
  },
  {
    field: "item_id",
    headerName: "Item ID",
    type: "number",

    // width: 100,
    flex: 1,
    resource_key: "order_24_itemId",

    // headerClassName: 'super-app-theme--header',
  },
  {
    field: "qty",
    headerName: "Quantity",
    // width: 100,
    flex: 1,
    // headerClassName: 'super-app-theme--header',
    type: "number",
    resource_key: "order_24_quantity",
  },
  {
    field: "pre_auth_required",
    headerName: "Pre-Auth",
    // width: 110,
    flex: 1,
    resource_key: "order_24_preAuth",
    // headerClassName: 'super-app-theme--header',
  },
  {
    field: "unit_price",
    headerName: "Unit Price",
    // width: 120,
    flex: 1,
    // headerClassName: 'super-app-theme--header',
    type: "number",
    resource_key: "order_24_unitPrice",
    valueFormatter: (params) => `$${parseFloat(params).toFixed(2)}`,
  },
  {
    field: "payer_share",
    headerName: "Payer Share",
    // width: 120,
    flex: 1,
    resource_key: "order_24_payerShare",
    // headerClassName: 'super-app-theme--header',
    type: "number",
    valueFormatter: (params) =>
      params ? `$${parseFloat(params).toFixed(2)}` : " ",
  },
  {
    field: "patient_share",
    headerName: "Patient Share",
    // width: 120,
    flex: 1,
    resource_key: "order_24_patientShare",
    // headerClassName: 'super-app-theme--header',
    type: "number",
    valueFormatter: (params) =>
      params ? `$${parseFloat(params).toFixed(2)}` : " ",
  },
  {
    field: "discount",
    headerName: "Discount",
    // width: 120,
    flex: 1,
    resource_key: "order_24_discount",
    // headerClassName: 'super-app-theme--header',
    type: "number",
    valueFormatter: (params) =>
      params ? `$${parseFloat(params).toFixed(2)}` : " ",
  },
  {
    field: "tax",
    headerName: "Tax",
    // width: 120,
    flex: 1,
    resource_key: "order_24_tax",
    // headerClassName: 'super-app-theme--header',
    type: "number",
    valueFormatter: (params) =>
      params ? `$${parseFloat(params).toFixed(2)}` : " ",
  },
  {
    field: "urgent_flag",
    headerName: "Urgent",
    // width: 100,
    flex: 1,
    resource_key: "order_24_urgent",
    // headerClassName: 'super-app-theme--header',
  },
  {
    field: "line_expiry_date",
    headerName: "Expiry Date",
    // width: 150,
    flex: 1,
    resource_key: "order_24_expiryDate",
    // headerClassName: 'super-app-theme--header',
    type: "date",
    valueFormatter: (params) => {
      return params ? params : " ";
    },
  },
  // {
  //   field: 'created_by',
  //   headerName: 'Created By',
  //   // width: 120,
  //   flex : 1,
  //   // headerClassName: 'super-app-theme--header',
  // },
  // {
  //   field: 'creation_date',
  //   headerName: 'Creation Date',
  //   // width: 180,
  //   flex : 1,
  //   // headerClassName: 'super-app-theme--header',
  //   type: 'dateTime',
  //   valueFormatter: (params) => {
  //     return params ? new Date(params).toLocaleString() : ' ';
  //   },
  // },
  // {
  //   field: 'modified_by',
  //   headerName: 'Modified By',
  //   // width: 150,
  //   flex : 1,
  //   // headerClassName: 'super-app-theme--header',
  //   valueFormatter: (params) => params || ' ',
  // },
  // {
  //   field: 'modification_date',
  //   headerName: 'Modification Date',
  //   // width: 180,
  //   flex : 1,
  //   // headerClassName: 'super-app-theme--header',
  //   type: 'dateTime',
  //   valueFormatter: (params) => {
  //     return params ? new Date(params).toLocaleString() : ' ';
  //   },
  // },
  {
    field: "his_order_detail_id",
    headerName: "HIS Detail ID",
    // width: 150,
    flex: 1,
    resource_key: "order_24_hisDetailId",
    // headerClassName: 'super-app-theme--header',
    valueFormatter: (params) => params || " ",
  },
];
export default function OrderDetails() {
  const { t } = useContext(AuthGuardContext);
  const { selectedOrder, selectedOrderDetails } = useSelector(
    (state: RootState) => state.order
  );
  const dispatch = useAppDispatch();
  return (
    <Box>
      {/* {JSON.stringify(selectedOrder)} */}
      {/* <br /> */}
      {/* {JSON.stringify(selectedOrderDetails?.order_detail_id)} */}
      <GlPanelTable>
        <Secure.GlCustomTable
          resource_key="replaceme"
          defaultHiddenColumns={[
            "order_detail_id",
            "order_id",
            "pre_auth_required",
            "urgent_flag",
            "line_expiry_date",
            "his_order_detail_id",
          ]}
          limit={10}
          smallSize
          getRowId={(row) => row.order_detail_id}
          onRowSelected={(row) => {
            console.log("Selected Row: ", row);
            dispatch(setSelectedOrderDetails(row));
          }}
          url={
            selectedOrder
              ? `/api/order/order-details/${selectedOrder.order_id}`
              : "/api/order/order-details/0"
          }
          columns={columns}
        />
      </GlPanelTable>
    </Box>
  );
}
