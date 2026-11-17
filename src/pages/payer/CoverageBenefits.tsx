import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";

import { setSelectedPolicyClass } from "../../redux/slices/payerPolicySlice";
import { RootState, AppDispatch } from "../../redux/store";

import GlCustomTable from "../../shared/tables/GlCustomTable";
import { fetcher } from "../../utils/Api";

import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { CustomGridColDef } from "../../types/Columns";

const CoverageBenefits: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPolicyClass } = useSelector(
    (state: RootState) => state.payerPolicy,
  );

  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { t } = ctx;

  // select benefit_id, coverage_id, category, excluded, name, description, network, unit, term, approval_limit, copay_maximum, copay_percent, room, created_by, creation_date, modified_by, modification_date, class_id from coverage_benefit ;
  const columns: CustomGridColDef[] = [
    {
      field: "name",
      headerName: t("payers_7_benefit-name-column") || "Benefit Name",
      resource_key: "payers_7_benefit-name-column",
      flex: 1,
    },
    {
      field: "description",
      headerName:
        t("payers_7_benefit-description-column") || "Benefit Description",
      resource_key: "payers_7_benefit-description-column",
      flex: 2,
    },
    {
      field: "category",
      headerName: t("payers_7_benefit-category-column") || "Benefit Category",
      resource_key: "payers_7_benefit-category-column",
      flex: 1,
    },
    {
      field: "excluded",
      headerName: t("payers_7_excluded-column") || "Excluded",
      resource_key: "payers_7_excluded-column",
      flex: 1,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>
          {params.value ? t("yes") : t("no")}
        </span>
      ),
    },
    {
      field: "network",
      headerName: t("payers_7_network-column") || "Network",
      resource_key: "payers_7_network-column",
      flex: 1,
    },
    {
      field: "unit",
      headerName: t("payers_7_unit-column") || "Unit",
      resource_key: "payers_7_unit-column",
      flex: 1,
    },
    {
      field: "term",
      headerName: t("payers_7_term-column") || "Term",
      resource_key: "payers_7_term-column",
      flex: 1,
    },
    {
      field: "approval_limit",
      headerName: t("payers_7_approval-limit-column") || "Approval Limit",
      resource_key: "payers_7_approval-limit-column",
      align: "right",
      headerAlign: "right",
      flex: 1,
    },
    {
      field: "copay_maximum",
      headerName: t("payers_7_copay-maximum-column") || "Copay Maximum",
      resource_key: "payers_7_copay-maximum-column",
      align: "right",
      headerAlign: "right",
      flex: 1,
    },
    {
      field: "copay_percent",
      headerName: t("payers_7_copay-percent-column") || "Copay Percent",
      resource_key: "payers_7_copay-percent-column",
      align: "right",
      headerAlign: "right",
      flex: 1,
    },
    {
      field: "room",
      headerName: t("payers_7_room-column") || "Room",
      resource_key: "payers_7_room-column",
      flex: 1,
    },
  ];

  return (
    <Box mt={1} sx={{}}>
      {selectedPolicyClass?.class_id && (
        <GlCustomTable
          fetcher={fetcher}
          localeText={{ noRowsLabel: "✨ No data available" }}
          url={
            selectedPolicyClass?.class_id
              ? `/api/policypayer/${selectedPolicyClass?.class_id}/benefits`
              : ""
          }
          columns={columns}
          onRowSelected={(r: any) => {}}
          getRowId={(row) => row.benefit_id}
        />
      )}
    </Box>
  );
};

export default CoverageBenefits;
