import { Box } from "@mui/material";
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
    field: "hl7_obx_id",
    headerName: "OBX ID",
    type: "number",

    //   width: 100,
    flex: 1,
    resource_key: "order_24_obxId",
    //   headerClassName: 'super-app-theme--header',
  },
  {
    field: "api_transe_id",
    headerName: "API Trans_ID",
    //   width: 150,
    flex: 1,
    resource_key: "order_24_apiTransId",
    //   headerClassName: 'super-app-theme--header',
  },
  {
    field: "set_id",
    headerName: "Set ID",
    //   width: 100,
    flex: 1,
    //   headerClassName: 'super-app-theme--header',
    type: "number",
    resource_key: "order_24_setId",
  },
  {
    field: "value_type",
    headerName: "Value Type",
    //   width: 110,
    flex: 1,
    resource_key: "order_24_valueType",
    //   headerClassName: 'super-app-theme--header',
    //   renderCell: (params) => (
    //     <Chip
    //       label={params.value}
    //       size="small"
    //       color="primary"
    //       variant="outlined"
    //     />
    //   ),
  },
  {
    field: "observation_id",
    headerName: "Obs ID",
    //   width: 130,
    flex: 1,
    resource_key: "order_24_obsId",
    //   headerClassName: 'super-app-theme--header',
  },
  {
    field: "observation_text",
    headerName: "Obs Text",

    //   width: 250,
    flex: 1,
    resource_key: "order_24_obsText",
    //   headerClassName: 'super-app-theme--header',
  },
  {
    field: "observation_code_system",
    headerName: "Code System",
    //   width: 130,
    flex: 1,
    resource_key: "order_24_codeSystem",
  },
  {
    field: "observation_value",
    headerName: "Obs Value",
    renderCell: (p) => {
      return <Box sx={{ maxHeight: "200px", overflow: "auto" }}>{p.value}</Box>;
    },
    minWidth: 250,
    flex: 1,
    resource_key: "order_24_obsValue",
  },
  {
    field: "units",
    headerName: "Units",
    //   width: 80,
    flex: 1,
    resource_key: "order_24_units",
    //   headerClassName: 'super-app-theme--header',
    //   valueFormatter: (params) => params.value || 'None',
  },
  {
    field: "reference_range",
    headerName: "Reference Range",
    resource_key: "order_24_referenceRange",
    //   width: 150,
    flex: 1,
    //   headerClassName: 'super-app-theme--header',
    //   valueFormatter: (params) => {
    //     if (params.value === 'null-null') return 'Not specified';
    //     return params.value;
    //   },
  },
  {
    field: "abnormal_flags",
    headerName: "Abnormal Flags",
    //   width: 130,
    flex: 1,
    resource_key: "order_24_abnormalFlags",
    //   headerClassName: 'super-app-theme--header',
    //   renderCell: (params) => {
    //     const flagColors = {
    //       'N': 'success', // Normal
    //       'A': 'error',   // Abnormal
    //       'H': 'warning', // High
    //       'L': 'info',    // Low
    //       'default': 'default'
    //     };

    //     const flagLabels = {
    //       'N': 'Normal',
    //       'A': 'Abnormal',
    //       'H': 'High',
    //       'L': 'Low',
    //       'default': params.value
    //     };

    //     const color = flagColors[params.value] || flagColors.default;
    //     const label = flagLabels[params.value] || flagLabels.default;

    //     return (
    //       <Chip
    //         label={label}
    //         size="small"
    //         color={color}
    //         variant="filled"
    //       />
    //     );
    //   },
  },
  {
    field: "observation_result_status",
    headerName: "Result Status",
    //   width: 140,
    flex: 1,
    resource_key: "Result Status",
  },
  {
    field: "observation_datetime",
    headerName: "Obs Date/Time",
    //   width: 180,
    flex: 1,
    resource_key: "order_24_obsDateTime",
    // type: "dateTime",
  },

  {
    field: "his_order_line_id",
    headerName: "HIS Order Line ID",
    resource_key: "order_24_hisOrderLineId",
    //   width: 150,
    // flex : 1 ,
    //   headerClassName: 'super-app-theme--header',
  },
];

export default function OrderHL7OBX() {
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
            "hl7_obx_id",
            "observation_code_system",
            "reference_range",
            "observation_result_status",
          ]}
          limit={10}
          smallSize
          getRowId={(row) => row.hl7_obx_id}
          onRowSelected={(row) => {
            console.log("Selected Row: ", row);
            // dispatch(setSelectedOrderDetails(row));
          }}
          url={
            selectedOrderDetails
              ? `/api/order/hl7_obx/${selectedOrderDetails.order_detail_id}`
              : ""
          }
          columns={columns}
        />
      </GlPanelTable>
    </Box>
  );
}
