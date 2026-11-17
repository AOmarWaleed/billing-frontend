import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";

import { setSelectedPolicyClass } from "../../redux/slices/payerPolicySlice";
import { RootState, AppDispatch } from "../../redux/store";

import { GlPanelTable } from "@givc/shared-components";
import GlCustomTable from "../../shared/tables/GlCustomTable";

import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { CustomGridColDef } from "../../types/Columns";
import { fetcher } from "../../utils/Api";

const PolicyClassDataGrid: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPolicyId } = useSelector(
    (state: RootState) => state.payerPolicy,
  );

  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { t } = ctx;

  const handleSelectPolicyClass = (policyClassData: any) => {
    dispatch(setSelectedPolicyClass(policyClassData));
  };

  // select class_id, policy_id, class, plan, class_group, created_by, creation_date, modified_by, modification_date from policy_class pc ;
  //
  const columns: CustomGridColDef[] = [
    {
      field: "class",
      headerName: t("payers_7_class-column") || "Class",
      resource_key: "payers_7_class-column",
      display : "flex",
      flex: 1,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value}</span>
      ),
    },
    {
      field: "plan",
      headerName: t("payers_7_plan-column") || "Plan",
      resource_key: "payers_7_plan-column",
      display : "flex",
      flex: 1,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value}</span>
      ),
    },
    {
      field: "class_group",
      headerName: t("payers_7_class-group-column") || "Class Group",
      resource_key: "payers_7_class-group-column",
      display : "flex",
      flex: 1,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value}</span>
      ),
    },
  ];

  return (
    <Box mt={1} sx={{}}>
      <GlPanelTable>
        <GlCustomTable
          fetcher={fetcher}
          localeText={{ noRowsLabel: "✨ No data available" }}
          url={
            selectedPolicyId
              ? //   ? `/api/policypayer/${selectedPolicyId}/policies/new`
                `/api/policypayer/${selectedPolicyId}/policiesClasses`
              : ""
          }
          columns={columns}
          onRowSelected={(r: any) => {
            handleSelectPolicyClass(r);
          }}
          getRowId={(row) => row.class_id}
        ></GlCustomTable>
      </GlPanelTable>
    </Box>
  );
};

export default PolicyClassDataGrid;
