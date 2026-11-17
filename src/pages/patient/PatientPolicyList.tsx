import React, { useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GridColDef } from "@mui/x-data-grid";
import { Box, IconButton, Button, Chip, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  setSelectedPatientPolicyId,
  createPatientPolicy,
  updatePatientPolicy,
  deletePatientPolicy,
  clearError,
  setCurrentCoverageId,
} from "../../redux/slices/patientPolicySlice";
import { AppDispatch, RootState } from "../../redux/store";
import { formatDate } from "../../utils/formatData/formatterv2";
import PatientPolicyForm from "./PatientPolicyForm";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import ConfirmDeleteDialog from "../../components/deleteDialog/ConfirmDeleteDialog";
import GlCustomTable from "../../shared/tables/GlCustomTable";
import Secure from "../../shared/security";
import { GLGridColDef } from "../../shared/security/GLCustomTable";
import { publicUrl } from "../../utils/publicUrl";
import { DisplayMsgDialog } from "@givc/shared-components";
import CheckEligibilityButton from "../../components/CheckEligibility/CheckEligibilityButton";

interface PatientPolicyListProps {
  onSelectPolicy: (policyId: number) => void;
  identityNumber?: string;
  identityCode?: string;
  identityDescription?: string;
}

interface PolicyRow {
  patient_policy_id: number;
  description: string;
  policy_id: number;
  policy_description: string;
  payer_id: number;
  payer_description: string;
  start_date: string;
  end_date: string;
  coverage_id: number;
}

const PatientPolicyList: React.FC<PatientPolicyListProps> = ({
  onSelectPolicy,
  identityNumber,
  identityCode,
  identityDescription,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const patientId = useSelector(
    (state: RootState) => state.patient.selectedPatientId,
  );
  const { selectedPolicyId, error } = useSelector(
    (state: RootState) => state.patientPolicies,
  );

  // State for dialogs
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRow | null>(null);

  // Localization

  // Ref for refetching table data
  const refetchRef = useRef<(() => void) | null>(null);

  // Construct API URL based on patientId
  const apiUrl = useMemo(() => {
    return patientId ? `/api/patientpolicies/${patientId}/policies` : "";
  }, [patientId]);

  // Action handlers
  const handleAddClick = () => {
    dispatch(clearError());
    setSelectedPolicy(null);
    setOpenAddDialog(true);
  };

  const handleEditClick = (e: React.MouseEvent, policy: PolicyRow) => {
    e.stopPropagation();
    dispatch(clearError());
    setSelectedPolicy(policy);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, policy: PolicyRow) => {
    e.stopPropagation();
    dispatch(clearError());
    setSelectedPolicy(policy);
    setOpenDeleteDialog(true);
  };

  const handleAddPolicy = async (values: any) => {
    const result = await dispatch(
      createPatientPolicy({
        ...values,
        patient_id: patientId,
      }),
    );

    if (result.meta.requestStatus === "fulfilled") {
      setOpenAddDialog(false);
      // Refetch table data
      refetchRef.current?.();
    }
  };

  const handleUpdatePolicy = async (values: any) => {
    if (selectedPolicy) {
      const updateData = {
        description: values.description,
        start_date: values.start_date,
        end_date: values.end_date,
      };

      const result = await dispatch(
        updatePatientPolicy({
          id: selectedPolicy.patient_policy_id,
          data: updateData,
        }),
      );

      if (result.meta.requestStatus === "fulfilled") {
        setOpenEditDialog(false);
        // Refetch table data
        refetchRef.current?.();
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedPolicy) {
      const result = await dispatch(
        deletePatientPolicy(selectedPolicy.patient_policy_id),
      );

      if (result.meta.requestStatus === "fulfilled") {
        setOpenDeleteDialog(false);
        // Refetch table data
        refetchRef.current?.();
      }
    }
  };

  const handleRowSelected = (row: PolicyRow | null) => {
    if (row) {
      dispatch(setSelectedPatientPolicyId(row.patient_policy_id));
      dispatch(setCurrentCoverageId(row.coverage_id));
      onSelectPolicy(row.coverage_id);
    }
  };

  // Calculate policy status
  const getPolicyStatus = (startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const isActive = start <= today && end >= today;

    if (isActive) return { label: "Active", color: "success" as const };
    if (end < today) return { label: "Expired", color: "error" as const };
    return { label: "Future", color: "info" as const };
  };

  const theme = useTheme();

  // Define columns
  const columns: GLGridColDef[] = useMemo(
    () => [
      {
        field: "patient_policy_id",
        headerName: "Patient Policy ID",
        resource_key: "patients_20_patientPolicyId",
        flex: 1.5,
        minWidth: 80,
        renderCell: (params) => (
          <span style={{ paddingLeft: "5px", fontWeight: 500 }}>
            {params.value}
          </span>
        ),
      },
      {
        field: "description",
        headerName: "Description",
        resource_key: "patients_20_descriptionEditForm",
        flex: 2,
        minWidth: 150,
        renderCell: (params) => (
          <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
        ),
      },
      {
        field: "policy_id",
        headerName: "Policy ID",
        resource_key: "patients_20_policyId",
        flex: 1.5,
        minWidth: 80,
        renderCell: (params) => (
          <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
        ),
      },
      {
        field: "policy_description",
        headerName: "Policy",
        resource_key: "patients_20_policy",
        flex: 2.5,
        minWidth: 150,
        renderCell: (params) => (
          <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
        ),
      },
      {
        field: "payer_id",
        headerName: "Payer ID",
        resource_key: "patients_20_payerId",
        flex: 1.5,
        minWidth: 80,
        renderCell: (params) => (
          <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
        ),
      },
      {
        field: "payer_description",
        headerName: "Payer",
        resource_key: "patients_20_payer",
        flex: 2.5,
        minWidth: 180,
        renderCell: (params) => (
          <span style={{ paddingLeft: "5px" }}>{params.value || "-"}</span>
        ),
      },
      {
        field: "start_date",
        headerName: "Start Date",
        resource_key: "patients_20_startDate",
        flex: 1.5,
        minWidth: 100,
        renderCell: (params) => (
          <span style={{ paddingLeft: "5px" }}>
            {formatDate(params.value, "DATE_FORMAT")}
          </span>
        ),
      },
      {
        field: "end_date",
        headerName: "End Date",
        resource_key: "patients_20_endDate",
        flex: 1.5,
        minWidth: 100,
        renderCell: (params) => (
          <span style={{ paddingLeft: "5px" }}>
            {formatDate(params.value, "DATE_FORMAT")}
          </span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        resource_key: "patients_20_status",
        flex: 1.5,
        minWidth: 110,
        filterable: true,
        sortable: true,
        renderCell: (params) => {
          const status = getPolicyStatus(
            params.row.start_date,
            params.row.end_date,
          );
          return (
            <Chip
              label={status.label}
              color={status.color}
              size="small"
              sx={{
                fontWeight: 600,
                minWidth: 70,
              }}
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        resource_key: "patients_20_actions",
        flex: 2,
        minWidth: 150,
        type: "actions",
        sortable: false,
        filterable: false,
        renderHeader: () => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              justifyContent: "space-between",
            }}
          >
            <span>Actions</span>
            <IconButton
              onClick={handleAddClick}
            >
              <img
                src={publicUrl(`themes/${theme.palette.mode}/icons/plus.png`)}
              />
            </IconButton>
          </Box>
        ),
        renderCell: (params) => (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <Box
              component="span"
              onClick={(e) => e.stopPropagation()}
              sx={{ display: "inline-flex" }}
            >
              <CheckEligibilityButton
                patientId={patientId ?? undefined}
                identityNumber={identityNumber}
                identityCode={identityCode}
                identityDescription={identityDescription}
                payerId={params.row.payer_id}
              />
            </Box>
            <IconButton
              onClick={(e) => handleEditClick(e, params.row)}
              size="small"
              color="primary"
            >
              <img
                src={publicUrl(`themes/${theme.palette.mode}/icons/pen.png`)}
                alt="Edit"
              />
            </IconButton>
            <IconButton
              onClick={(e) => handleDeleteClick(e, params.row)}
              size="small"
              color="error"
            >
              <img
                src={publicUrl(`themes/${theme.palette.mode}/icons/delete.png`)}
                alt="Delete"
              />
            </IconButton>
          </Box>
        ),
      },
    ],
    [
      theme.palette.mode,
      patientId,
      identityNumber,
      identityCode,
      identityDescription,
    ],
  );

  return (
    <Box mt={1}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          {selectedPolicy && (
            <Chip
              label={`Selected: ${
                selectedPolicy.policy_description || "Policy"
              }`}
              onDelete={() => {
                setSelectedPolicy(null);
                dispatch(setSelectedPatientPolicyId(null));
              }}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        {/* <Secure.GLButton
          resource_key="patients_20_addPolicy"
          variant="contained"
          onClick={handleAddClick}
          startIcon={<AddIcon />}
          color="primary"
          sx={{
            background: "linear-gradient(135deg, #2764AF 0%, #55C5D6 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #1e4d8b 0%, #3fa3b5 100%)",
            },
          }}
        /> */}
      </Box>

      <Secure.GlCustomTable
        resource_key="replaceme"
        url={apiUrl}
        columns={columns}
        limit={5}
        getRowId={(row) => row.patient_policy_id}
        onRowSelected={handleRowSelected}
        refetchRef={refetchRef}
        enableKeyboardNavigation={true}
        autoSelectFirstRow={true}
        defaultHiddenColumns={[]}
        smallSize
      />

      {/* Add Policy Dialog */}
      <GenericDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          dispatch(clearError());
        }}
        title="Add New Patient Policy"
        icon={<AddIcon sx={dialogIconStyle} />}
        content={
          <PatientPolicyForm
            initialValues={{
              description: "",
              start_date: null,
              end_date: null,
            }}
            onSubmit={handleAddPolicy}
            onClose={() => {
              setOpenAddDialog(false);
              dispatch(clearError());
            }}
            error={error || ""}
            isUpdate={false}
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
        title="Edit Patient Policy"
        icon={<EditIcon sx={dialogIconStyle} />}
        content={
          selectedPolicy && (
            <PatientPolicyForm
              initialValues={{
                description: selectedPolicy.description,
                start_date: selectedPolicy.start_date,
                end_date: selectedPolicy.end_date,
              }}
              onSubmit={handleUpdatePolicy}
              onClose={() => {
                setOpenEditDialog(false);
                dispatch(clearError());
              }}
              error={error || ""}
              isUpdate={true}
            />
          )
        }
      />

      {/* Delete Confirmation Dialog */}
      {/* <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          dispatch(clearError());
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirm to Delete"
        message="Are you sure you want to delete this patient policy?"
        errorMsg={error || null}
      /> */}

      <DisplayMsgDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          dispatch(clearError());
        }}
        onAction={handleDeleteConfirm}
        description="Are you sure you want to delete this patient policy?"
        actionLabel="Delete"
        actionColor="error"
        status="DELETE"
        getResource={false}
      />
    </Box>
  );
};

export const dialogIconStyle = {
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
};

export default PatientPolicyList;
