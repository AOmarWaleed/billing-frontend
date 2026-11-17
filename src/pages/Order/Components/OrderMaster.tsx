import { Box } from "@mui/material";
import React from "react";
import GlPanelTable from "../../../shared/tables/GlPanelTable";
import GlCustomTable from "../../../shared/tables/GlCustomTable";
import { GridColDef } from "@mui/x-data-grid";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useAppDispatch } from "../../../hooks/hooks";
import { setSelectedOrder } from "../../../redux/slices/orderSlice";
import { format } from "date-fns";
import { useContext } from "react";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";
import { GLGridColDef } from "../../../shared/security/GLCustomTable";
const columns: GLGridColDef[] = [
  {
    field: "order_id",
    headerName: "Order ID",
    type: "number",
    // width: 100,
    flex: 1,
    resource_key: "order_24_orderIdOrderTable",
  },
  {
    field: "patient_id",
    headerName: "Patient ID",
    type: "number",

    // width: 120,
    flex: 1,
    resource_key: "order_24_patientId",
  },
  {
    field: "episode_no",
    headerName: "Episode No",
    // width: 120,
    flex: 1,
    type: "number",
    resource_key: "order_24_episodeNo",
  },
  // {
  //   field: 'requester',
  //   headerName: 'Requester',
  //   // width: 150,
  //   flex: 1,
  //   headerClassName: 'super-app-theme--header',
  //   valueFormatter: (params : any) => params?.value || ' ',
  // },
  {
    field: "order_date",
    headerName: "Order Date",
    // width: 300,
    flex: 1.7,
    resource_key: "order_24_orderDate",
    // headerClassName: "super-app-theme--header",
    type: "date",
    valueFormatter: (value: any) => {
      console.log("Order Date params: ", value);

      return value;
      // ? new Date(value)
      // : null;
    },
  },
  {
    field: "status",
    headerName: "Status",
    // width: 130,
    flex: 1,
    resource_key: "order_24_statusPatientTable",
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params: any) => params?.value || "Unknown",
  },
  {
    field: "encounter_id",
    headerName: "Encounter ID",
    // width: 150,
    flex: 1,
    resource_key: "order_24_encounterId",
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params: any) => params?.value || " ",
  },
  {
    field: "location_id",
    headerName: "Location ID",
    // width: 150,
    flex: 1,
    resource_key: "order_24_locationId",
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params: any) => params?.value || " ",
  },
  // {
  //   field: 'created_by',
  //   headerName: 'Created By',
  //   // width: 120,
  //   flex: 1,
  //   headerClassName: 'super-app-theme--header',
  // },
  // {
  //   field: 'creation_date',
  //   headerName: 'Creation Date',
  //   // width: 180,
  //   flex: 1,
  //   headerClassName: 'super-app-theme--header',
  //   type: 'dateTime',
  //   valueFormatter: (params : any) => {
  //     return params?.value ? new Date(params?.value).toLocaleString() : ' ';
  //   },
  // },
  // {
  //   field: 'modified_by',
  //   headerName: 'Modified By',
  //   // width: 150,
  //   flex: 1,
  //   headerClassName: 'super-app-theme--header',
  //   valueFormatter: (params : any) => params?.value || ' ',
  // },
  // {
  //   field: 'modification_date',
  //   headerName: 'Modification Date',
  //   // width: 180,
  //   flex: 1,
  //   headerClassName: 'super-app-theme--header',
  //   type: 'dateTime',
  //   valueFormatter: (params :any) => {
  //     return params?.value ? new Date(params?.value).toLocaleString() : ' ';
  //   },
  // },
  {
    field: "his_order_id",
    headerName: "HIS Order ID",
    // width: 150,
    flex: 1,
    type: "number",
    resource_key: "order_24_hisOrderId",
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params: any) => params?.value || " ",
  },
];

export default function OrderMaster() {
  const { orderFilter, searchClicked, selectedOrder } = useSelector(
    (state: RootState) => state.order
  );
  const dispatch = useAppDispatch();

  return (
    <Box>
      {/* {JSON.stringify(orderFilter)} */}
      {/* <br /> */}
      {/* {JSON.stringify(selectedOrder?.order_id)} */}
      <GlPanelTable>
        <Secure.GlCustomTable
          resource_key="replaceme"
          defaultHiddenColumns={["order_id", "location_id", "encounter_id"]}
          limit={25}
          smallSize
          getRowId={(row) => row.order_id}
          onRowSelected={(row) => {
            console.log("Selected Row: ", row);
            dispatch(setSelectedOrder(row));
          }}
          url={searchClicked ? "/api/order" : ""}
          columns={columns}
          params={{
            start_date: orderFilter?.startDate,
            end_date: orderFilter?.endDate,
            patient_id: orderFilter?.patientId,
            episode_no: orderFilter?.episodeNo,
          }}
        />
      </GlPanelTable>
    </Box>
  );
}
