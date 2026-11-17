import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  setPage,
  setSelectedPolicyId,
  setCurrentCoverageId,
  setLimit,
  setSortField,
  setSortOrder,
  fetchPoliciesByPayer,
  createPolicy,
  updatePolicy,
  deletePolicy,
  clearError,
} from "../../redux/slices/payerPolicySlice";
import { RootState, AppDispatch } from "../../redux/store";
import PolicyForm from "./PolicyForm";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import ConfirmDeleteDialog from "../../components/deleteDialog/ConfirmDeleteDialog";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import Secure from "../../shared/security";
import { CustomGridColDef } from "../../types/Columns";
import GlCustomTable from "../../shared/tables/GlCustomTable";
import { fetcher } from "../../utils/Api";
import { publicUrl } from "../../utils/publicUrl";

interface PolicyListProps {
  onSelectPolicy: (policyId: number) => void;
}

const PolicyList: React.FC<PolicyListProps> = ({ onSelectPolicy }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { priceList, coverageList, page, limit, error } = useSelector(
    (state: RootState) => state.payerPolicy,
  );

  const selectedPayerId = useSelector(
    (state: RootState) => state.payer.selectedPayerId,
  );

  // Ref to trigger table refresh
  const refetchRef = useRef<(() => void) | null>(null);

  // State for dialogs
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;

  const {
    palette: { mode },
  } = useTheme();

  // Fetch initial metadata (priceList & coverageList) when payer changes
  useEffect(() => {
    if (selectedPayerId) {
      dispatch(
        fetchPoliciesByPayer({
          payerId: selectedPayerId,
          page: 1,
          limit: 10,
        }),
      );
    }
  }, [dispatch, selectedPayerId]);

  const handleSelectPolicyId = (policyId: number, coverageId: any) => {
    console.log("selected row", policyId, coverageId);

    dispatch(setSelectedPolicyId(policyId));
    dispatch(setCurrentCoverageId(coverageId));
  };

  const sanitizePolicyData = (values: any) => {
    return {
      ...values,
      payer_id: selectedPayerId,
      price_list_id:
        values.price_list_id && values.price_list_id !== ""
          ? Number(values.price_list_id)
          : null,
      coverage_id:
        values.coverage_id && values.coverage_id !== ""
          ? Number(values.coverage_id)
          : null,
      start_date: values.start_date
        ? new Date(values.start_date).toISOString()
        : null,
      end_date: values.end_date
        ? new Date(values.end_date).toISOString()
        : null,
      copay_percent:
        values.copay_percent !== "" && values.copay_percent != null
          ? Number(values.copay_percent)
          : null,
      copay_max:
        values.copay_max !== "" && values.copay_max != null
          ? Number(values.copay_max)
          : null,
    };
  };

  const refreshTable = () => {
    refetchRef.current?.();
  };

  // Action handlers
  const handleAddClick = () => {
    dispatch(clearError());
    setSelectedPolicy(null);
    setOpenAddDialog(true);
  };

  const handleEditClick = (e: React.MouseEvent, policy: any) => {
    e.stopPropagation();
    dispatch(clearError());
    setSelectedPolicy(policy);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, policy: any) => {
    e.stopPropagation();
    dispatch(clearError());
    setSelectedPolicy(policy);
    setOpenDeleteDialog(true);
  };

  const handleAddPolicy = async (values: any) => {
    const data = sanitizePolicyData(values);

    try {
      await dispatch(createPolicy(data)).unwrap();
      refreshTable();
      setOpenAddDialog(false); // Only close if no error
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleUpdatePolicy = async (values: any) => {
    if (selectedPolicy) {
      const { id, ...updateData } = values;
      const data = sanitizePolicyData(updateData);
      try {
        await dispatch(
          updatePolicy({ id: selectedPolicy.policy_id, data }),
        ).unwrap();
        refreshTable();
        setOpenEditDialog(false);
      } catch (error: any) {
        console.error("Failed to update policy:", error);
      }
    }
  };

  const handleDeleteConfirm = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    try {
      if (selectedPolicy) {
        await dispatch(deletePolicy(selectedPolicy.policy_id))
          .unwrap()
          .then(() => {
            refreshTable();
            setOpenDeleteDialog(false);
          });
      }
    } catch (error: any) {
      console.error("Failed to delete policy:", error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleSortModelChange = (model: any) => {
    if (model.length > 0) {
      const { field, sort } = model[0];
      dispatch(setSortField(field));
      dispatch(setSortOrder(sort || "asc"));
    }
  };

  const handlePageChange = (currPage: number) => {
    dispatch(setPage(currPage));
  };

  const handleLimitChange = (limit: number) => {
    dispatch(setLimit(limit));
  };

  const columns: CustomGridColDef[] = [
    {
      field: "policy_id",
      headerName: t("payers_7_PolicyID") || "ID",
      resource_key: "payers_7_PolicyID",
      align: "right",
      headerAlign: "right",
      display: "flex",
      flex: 1,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value}</span>
      ),
    },
    {
      field: "description",
      headerName: t("payers_7_PolicyDescription") || "Description",
      resource_key: "payers_7_PolicyDescription",
      display: "flex",
      flex: 3,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
      ),
    },
    {
      field: "policy_number",
      headerName: t("payers_7_PolicyNumber") || "Policy #",
      resource_key: "payers_7_PolicyNumber",
      display: "flex",
      flex: 2,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
      ),
    },
    {
      field: "policy_holder",
      headerName: t("payers_7_PolicyHolder") || "Holder",
      resource_key: "payers_7_PolicyHolder",
      display: "flex",
      flex: 3,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
      ),
    },
    {
      field: "sponsor_number",
      headerName: t("payers_7_SponsorNumber") || "Sponsor #",
      resource_key: "payers_7_SponsorNumber",
      display: "flex",
      flex: 2,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
      ),
    },
    {
      field: "start_date",
      headerName: t("payers_7_StartDate") || "Start Date",
      resource_key: "payers_7_StartDate",
      display: "flex",
      flex: 2,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
      ),
    },
    {
      field: "end_date",
      headerName: t("payers_7_EndDate") || "End Date",
      resource_key: "payers_7_EndDate",
      display: "flex",
      flex: 2,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
      ),
    },
    {
      field: "network",
      headerName: t("payers_7_Network") || "Network",
      resource_key: "payers_7_Network",
      display: "flex",
      flex: 2,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
      ),
    },
    {
      field: "class_name",
      headerName: t("payers_7_Class") || "Class",
      resource_key: "payers_7_Class",
      display: "flex",
      flex: 2,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
      ),
    },
    {
      field: "coverage_id",
      headerName: t("payers_7_CoverageID") || "Coverage ID",
      resource_key: "payers_7_CoverageID",
      align: "right",
      headerAlign: "right",
      display: "flex",
      flex: 1,
      renderCell: (params) => (
        <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
      ),
    },
    {
      field: "actions",
      headerName: t("payers_7_Actions") || "Actions",
      resource_key: "payers_7_Actions",
      display: "flex",
      disableColumnMenu: true,
      sortable: false,
      flex: 2,
      renderHeader: () => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: "5px",
          }}
        >
          <span> {t("payers_7_Actions") || "Actions"}</span>
          <Tooltip
            title={t("payers_7_AddPolicy") || "Add Policy"}
            placement="top"
          >
            <Secure.GLIconButton
              resource_key="payers_7_AddPolicy"
              onClick={handleAddClick}
            >
              <img src={publicUrl(`themes/${mode}/icons/plus.png`)} alt="Add" />
            </Secure.GLIconButton>
          </Tooltip>
        </Box>
      ),
      renderCell: (params) => (
        <div>
          <IconButton onClick={(e) => handleEditClick(e, params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={(e) => handleDeleteClick(e, params.row)}>
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Box mt={1} sx={{}}>
      <GlCustomTable
        fetcher={fetcher}
        refetchRef={refetchRef}
        url={
          selectedPayerId
            ? `/api/policypayer/${selectedPayerId}/policies/new`
            : ""
        }
        columns={columns}
        limit={10}
        localeText={{ noRowsLabel: "✨ No data available" }}
        onRowSelected={(r: any) => {
          console.log("selected row", r);
          handleSelectPolicyId(r?.policy_id, r?.coverage_id);
        }}
        getRowId={(row) => row.policy_id}
      ></GlCustomTable>

      {/* Add Policy Dialog */}
      <GenericDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          dispatch(clearError());
        }}
        title={t("payers_7_AddNewPolicy") || "Add New Policy"}
        icon={
          <AddIcon
            sx={{
              backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
              color: "white",
              border: "0",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        }
        content={
          <PolicyForm
            initialValues={{
              policy_number: "",
              description: "",
              policy_holder: "",
              sponsor_number: "",
              start_date: null,
              end_date: null,
              network: "",
              class_name: "",
              coverage_id: null,
            }}
            onSubmit={handleAddPolicy}
            onClose={() => {
              setOpenAddDialog(false);
              dispatch(clearError());
            }}
            error={error || ""}
            priceLists={priceList}
            coverages={coverageList}
          />
        }
      />

      {/* Edit Policy Dialog */}
      <GenericDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          dispatch(clearError());
        }}
        title={t("payers_7_EditPolicy") || "Edit Policy"}
        icon={
          <EditIcon
            sx={{
              backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
              color: "white",
              border: "0",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        }
        content={
          selectedPolicy && (
            <PolicyForm
              initialValues={selectedPolicy}
              onSubmit={handleUpdatePolicy}
              onClose={() => {
                setOpenEditDialog(false);
                dispatch(clearError());
              }}
              error={error || ""}
              priceLists={priceList}
              coverages={coverageList}
            />
          )
        }
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          dispatch(clearError());
        }}
        onConfirm={handleDeleteConfirm}
        title={t("payers_7_DeletePolicyConfirmation") || "Confirm to Delete"}
        message={
          t("payers_7_DeletePolicyConfirmation") ||
          "Are you sure you want to delete this policy?"
        }
        errorMsg={error || null}
      />
    </Box>
  );
};

export default PolicyList;
