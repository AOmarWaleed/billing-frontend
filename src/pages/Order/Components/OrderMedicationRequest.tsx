import { Box } from "@mui/material";
import React from "react";
import GlPanelTable from "../../../shared/tables/GlPanelTable";
import GlCustomTable from "../../../shared/tables/GlCustomTable";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useAppDispatch } from "../../../hooks/hooks";
import { GridColDef } from "@mui/x-data-grid";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import { useContext } from "react";
import Secure from "../../../shared/security";
import { GLGridColDef } from "../../../shared/security/GLCustomTable";
const columns: GLGridColDef[] = [
  {
    field: "medication_req_id",
    type: "number",

    headerName: "Medication ID",
    flex: 1,
    resource_key: "order_24_medicationId",
    // width: 130,
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "req_item_id",
    type: "number",

    headerName: "Request Item ID",
    flex: 1,
    resource_key: "order_24_requestItemId",
    // width: 130,
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "order_line_id",
    type: "number",

    headerName: "Order Line ID",
    flex: 1,
    resource_key: "order_24_orderLineId",
    // width: 130,
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "item_no",
    headerName: "Item No",
    flex: 1,
    resource_key: "order_24_itemNo",
    // width: 100,
    // headerClassName: "super-app-theme--header",
    // type: "number",
  },
  {
    field: "supply_period",
    headerName: "Supply Period",
    flex: 1,
    resource_key: "order_24_supplyPeriod",
    // width: 130,
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params) => params || " ",
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    resource_key: "order_24_statusSetTable",
    // width: 120,
    // headerClassName: "super-app-theme--header",
    // renderCell: (params) => (
    //   <Chip
    //     label={params || "Pending"}
    //     size="small"
    //     color={params ? "success" : "warning"}
    //     variant={params ? "filled" : "outlined"}
    //   />
    // ),
  },
  {
    field: "unit",
    headerName: "Unit",
    flex: 1,
    resource_key: "order_24_unit",
    // width: 80,
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "unit_type",
    headerName: "Unit Type",
    flex: 1,
    resource_key: "order_24_unitType",
    // width: 120,
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "dosage_times",
    headerName: "Dosage Times",
    flex: 1,
    resource_key: "order_24_dosageTimes",
    // width: 120,
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "per",
    headerName: "Per",
    flex: 1,
    resource_key: "order_24_per",
    // width: 80,
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params) => params || " ",
  },
  {
    field: "dosage",
    headerName: "Dosage",
    flex: 1,
    resource_key: "order_24_dosage",
    // width: 100,
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params) => params || " ",
  },
  {
    field: "prescribed_code",
    headerName: "Prescribed Code",
    flex: 1,
    resource_key: "order_24_prescribedCode",
    // width: 150,
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params) => params || " ",
  },
  {
    field: "selection_reason",
    headerName: "Selection Reason",
    flex: 1,
    resource_key: "order_24_selectionReason",
    // width: 160,
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params) => params || " ",
  },
  {
    field: "selection_reason_display",
    headerName: "Reason Display",
    flex: 1,
    resource_key: "order_24_reasonDisplay",
    // width: 180,
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params) => params || " ",
  },
  {
    field: "dosage_instruction_text",
    headerName: "Dosage Instructions",
    flex: 1,
    resource_key: "order_24_dosageInstructions",
    // width: 200,
    // headerClassName: "super-app-theme--header",
    // renderCell: (params) => (
    //   <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
    //     {params}
    //   </Typography>
    // ),
  },
  {
    field: "patient_instruction",
    headerName: "Patient Instructions",
    flex: 1,
    resource_key: "order_24_patientInstructions",
    valueFormatter: (params) => params || " ",
    // width: 180,
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "repeat_start",
    headerName: "Repeat Start",
    flex: 1,
    resource_key: "order_24_repeatStart",
    // width: 120,
    // headerClassName: "super-app-theme--header",
    type: "date",
    valueFormatter: (params) => {
      return params;
    },
  },
  {
    field: "repeat_end",
    headerName: "Repeat End",
    // width: 120,
    flex: 1,
    resource_key: "order_24_repeatEnd",
    // headerClassName: "super-app-theme--header",
    type: "date",
    valueFormatter: (params) => {
      return params;
    },
  },
  {
    field: "duration_value",
    headerName: "Duration Value",
    // width: 130,
    flex: 1,
    resource_key: "order_24_durationValue",
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "duration_unit",
    headerName: "Duration Unit",
    // width: 130,
    flex: 1,
    resource_key: "order_24_durationUnit",
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "frequency",
    headerName: "Frequency",
    // width: 100,
    flex: 1,
    resource_key: "order_24_frequency",
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "dosage_period",
    headerName: "Dosage Period",
    // width: 130,
    flex: 1,
    resource_key: "order_24_dosagePeriod",
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params) => params || " ",
  },
  {
    field: "period_unit",
    headerName: "Period Unit",
    // width: 120,
    flex: 1,
    resource_key: "order_24_periodUnit",
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params) => params || " ",
  },
  {
    field: "dose_rate_value",
    headerName: "Dose Rate Value",
    // width: 140,
    flex: 1,
    resource_key: "order_24_doseRateValue",
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "dose_rate_code",
    headerName: "Dose Rate Code",
    // width: 140,
    flex: 1,
    resource_key: "order_24_doseRateCode",
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "route_code",
    headerName: "Route Code",
    // width: 140,
    flex: 1,
    resource_key: "order_24_routeCode",
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "route_value",
    headerName: "Route Value",
    // width: 120,
    flex: 1,
    resource_key: "order_24_routeValue",
    // headerClassName: "super-app-theme--header",
  },
  {
    field: "strength",
    headerName: "Strength",
    // width: 100,
    flex: 1,
    resource_key: "order_24_strength",
    // headerClassName: "super-app-theme--header",
    // valueFormatter: (params) => params || " ",
  },
  //   {
  //     field: "created_by",
  //     headerName: "Created By",
  // width: 120,
  // flex: 1,
  //     headerClassName: "super-app-theme--header",
  //   },
  //   {
  //     field: "creation_date",
  //     headerName: "Creation Date",
  // width: 180,
  // flex: 1,
  //     headerClassName: "super-app-theme--header",
  //     type: "dateTime",
  //     valueFormatter: (params) => {
  //       return params ? new Date(params).toLocaleString() : " ";
  //     },
  //   },
  //   {
  //     field: "modified_by",
  //     headerName: "Modified By",
  // width: 150,
  // flex: 1,
  //     headerClassName: "super-app-theme--header",
  //     valueFormatter: (params) => params || " ",
  //   },
  //   {
  //     field: "modification_date",
  //     headerName: "Modification Date",
  // width: 180,
  // flex: 1,
  //     headerClassName: "super-app-theme--header",
  //     type: "dateTime",
  //     valueFormatter: (params) => {
  //       return params ? new Date(params).toLocaleString() : " ";
  //     },
  //   },
];

export default function OrderMedicationRequest() {
  const { t } = useContext(AuthGuardContext);
  const { selectedOrderDetails } = useSelector(
    (state: RootState) => state.order,
  );
  const dispatch = useAppDispatch();

  return (
    <Box>
      {/* {JSON.stringify(selectedOrder)} */}
      {/* <br /> */}
      {/* {JSON.stringify(selectedOrderDetails?.order_detail_id)} */}
      {/* <br /> */}
      {/* {JSON.stringify(selectedOrderDetails?.item_id)} */}
      <GlPanelTable>
        <Secure.GlCustomTable
          resource_key="replaceme"
          defaultHiddenColumns={[
            "route_value",
            "strength",
            "repeat_start",
            "repeat_end",
            "duration_value",
            "duration_value",
            "duration_unit",
            "dosage_period",
            "period_unit",
            "dose_rate_value",
            "dose_rate_code",
            "route_code",
            "route_code",
            "frequency",
            "medication_req_id",
            "dosage_times",
            "per",
            "dosage",
            "prescribed_code",
            "selection_reason",
            "selection_reason_display",
            "dosage_instruction_text",
            "patient_instruction",
          ]}
          limit={10}
          smallSize
          getRowId={(row) => row.medication_req_id}
          onRowSelected={(row) => {
            console.log("Selected Row: ", row);
            // dispatch(setSelectedOrderDetails(row));
          }}
          url={
            selectedOrderDetails
              ? `/api/order/medication_request/${selectedOrderDetails.order_detail_id}`
              : ""
          }
          columns={columns}
        />
      </GlPanelTable>
    </Box>
  );
}
