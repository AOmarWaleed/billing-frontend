import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import api from "../../utils/Api";
import { useRef, useState } from "react";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AgreementExclusionDialog from "./AgreementExclusionDialog";
import ConfirmDeleteDialog from "../../components/deleteDialog/ConfirmDeleteDialog";
import { Secure } from "@givc/shared-components";
import GlCustomTable from "../../shared/tables/GlCustomTable";
import { fetcher } from "../../utils/Api";
import { toast } from "react-toastify";
import { publicUrl } from "../../utils/publicUrl";

export default function AgreementExclusion() {
  const selectedPayerId = useSelector(
    (state: RootState) => state.payer.selectedPayerId,
  );
  const { selectedPolicyClass, selectedPolicyId } = useSelector(
    (state: RootState) => state.payerPolicy,
  );

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  
  // Delete dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedExclusion, setSelectedExclusion] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  // Ref for table refresh
  const agreementExclusionRef = useRef<any>(null);

  // Handle delete click - open confirmation dialog
  const handleDeleteClick = (e: React.MouseEvent, row: any) => {
    e.stopPropagation();
    setSelectedExclusion(row);
    setOpenDeleteDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!selectedExclusion) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/api/agreement-exclusion/${selectedExclusion.exclusion_id}`);
      toast.success("Agreement exclusion deleted successfully");
      
      // Refresh the table
      if (agreementExclusionRef.current) {
        agreementExclusionRef.current();
      }
      
      setOpenDeleteDialog(false);
      setSelectedExclusion(null);
    } catch (error: any) {
      console.error("Error deleting agreement exclusion:", error);
      toast.error(
        `Failed to delete agreement exclusion - ${error?.response?.data?.error || error?.message || "Unknown error"}`
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle add button click
  const handleAddClick = () => {
    setEditData(null);
    setOpenDialog(true);
  };

  // Handle edit button click
  const handleEditClick = (row: any) => {
    setEditData(row);
    setOpenDialog(true);
  };

  // Handle dialog close and success
  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditData(null);
  };

  const handleDialogSuccess = () => {
    if (agreementExclusionRef.current) {
      agreementExclusionRef.current();
    }
  };

  const handleImport = async (importData: any) => {
    setImporting(true);
    try {
      const dataArray = importData.data || importData;
      const CHUNK_SIZE = 500;
      const totalChunks = Math.ceil(dataArray.length / CHUNK_SIZE);

      let allResults: any = {
        total: dataArray.length,
        successful: 0,
        failed: 0,
        errors: [],
      };

      toast.info(
        `Importing ${dataArray.length} records in ${totalChunks} chunks...`,
      );

      for (let i = 0; i < dataArray.length; i += CHUNK_SIZE) {
        const chunk = dataArray.slice(i, i + CHUNK_SIZE);
        const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;

        try {
          const response = await api.post(
            "/api/agreement-exclusion/bulk-import",
            { data: chunk },
          );

          if (response.data.success) {
            allResults.successful += response.data.data.successful;
            allResults.failed += response.data.data.failed;
            allResults.errors.push(...response.data.data.errors);
          }

          toast.info(
            `Processed chunk ${chunkNumber}/${totalChunks}... (${allResults.successful} successful, ${allResults.failed} failed)`,
          );
        } catch (error) {
          console.error(`Error importing chunk ${chunkNumber}:`, error);
          allResults.failed += chunk.length;
          allResults.errors.push({
            chunk: chunkNumber,
            error: (error as Error)?.message,
          });
        }
      }

      if (agreementExclusionRef.current) {
        agreementExclusionRef.current();
      }

      const message = `Import completed! ${allResults.successful} successful, ${allResults.failed} failed`;
      const severity =
        allResults.failed === 0
          ? "success"
          : allResults.successful === 0
            ? "error"
            : "warning";

      toast[severity](message);

      if (allResults.errors.length > 0) {
        console.error("Import errors:", allResults.errors);
      }
    } catch (error) {
      console.error("Error during import:", error);
      toast.error("Error during import process");
    } finally {
      setImporting(false);
    }
  };

  const exportColumns = [
    { field: "payer_id", headerName: "Payer ID" },
    { field: "payer_desc", headerName: "Payer Description" },
    { field: "policy_id", headerName: "Policy ID" },
    { field: "policy_desc", headerName: "Policy Description" },
    { field: "class_id", headerName: "Class ID" },
    { field: "class_desc", headerName: "Class Description" },
    { field: "exclusion_cat", headerName: "Exclusion Category" },
    { field: "exclusion_type", headerName: "Exclusion Type" },
    { field: "exclusion_value", headerName: "Exclusion Value" },
  ];

  const {palette: {mode}} = useTheme();


  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <Secure.GLExcelExportButton
          variant="outlined"
          size="small"
          startIcon={<CloudUploadIcon />}
          resource_key="payer_7_export-agreement-exclusion"
          columns={exportColumns}
          data={async () => {
            const params: Record<string, any> = { payer_id: selectedPayerId };
            if (selectedPolicyId) params.policy_id = selectedPolicyId;
            if (selectedPolicyClass?.class_id) params.class_id = selectedPolicyClass.class_id;
            const { data } = await api.get(
              `/api/agreement-exclusion`,
              { params },
            );
            const result = data?.data || [];
            if (result.length === 0) toast.warn("No data available to export.");
            return result;
          }}
          fileName={`${new Date().toISOString().slice(0, 10)}_${selectedPayerId}_agreement-exclusion`}
        >
          {''}
        </Secure.GLExcelExportButton>
        <Secure.GLExcelImportButton
          variant="outlined"
          size="small"
          startIcon={<CloudDownloadIcon />}
          showNotification={false}
          onImportSuccess={handleImport}
          onImportError={(error) => toast.error(error.message || "Failed to read file. Please check the file format.")}
          resource_key="payer_7_import-agreement-exclusion"
        >
          {''}
        </Secure.GLExcelImportButton>
      </Box>
      <GlCustomTable
        fetcher={fetcher}
        refetchRef={agreementExclusionRef}
        localeText={{ noRowsLabel: "✨ No data available" }}
        url={"/api/agreement-exclusion"}
        params={{
          payer_id: selectedPayerId,
          policy_id: selectedPolicyId,
          class_id: selectedPolicyClass?.class_id,
        }}
        columns={[
          {
            field: "payer_id",
            headerName: "Payer",
            flex: 1,
            renderCell: (params) => (
              <>
                {params.value} - {params.row.payer_desc}
              </>
            ),
          },
          {
            field: "policy_id",
            headerName: "Policy",
            flex: 1,
            renderCell: (params) => (
              <>
                {params.value} - {params.row.policy_desc}
              </>
            ),
          },
          {
            field: "class_id",
            headerName: "Class",
            flex: 1,
            renderCell: (params) => (
              <>
                {params.value} - {params.row.class_desc}
              </>
            ),
          },
          {
            field: "exclusion_cat",
            headerName: "Exclusion Category",
            width: 100,
          },
          {
            field: "exclusion_type",
            headerName: "Exclusion Type",
            width: 110,
          },
          {
            field: "exclusion_value",
            headerName: "Exclusion Value",
            width: 70,
          },
          {
            field: "action",
            headerName: "Action",
            width: 100,
            sortable: false,
            disableColumnMenu: true,
            renderHeader: () => {
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>Action</Typography>
                  <IconButton onClick={handleAddClick} size="small">
                    {/* <AddIcon sx={{ color: "white" }} fontSize="small" /> */}
                    <img src={publicUrl(`themes/${mode}/icons/plus.png`)} alt="Add" />
                  </IconButton>
                </Box>
              );
            },
            renderCell: (params) => (
              <Box>
                <IconButton
                  onClick={() => handleEditClick(params.row)}
                  sx={{ mr: 1 }}
                  size="small"
                >
                  <EditIcon color="info" fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={(e) => handleDeleteClick(e, params.row)}
                  size="small"
                >
                  <DeleteIcon color="error" fontSize="small" />
                </IconButton>
              </Box>
            ),
          },
        ]}
        onRowSelected={(r: any) => {}}
        getRowId={(row) => row.exclusion_id}
      />

      {/* Add/Edit Dialog */}
      <AgreementExclusionDialog
        open={openDialog}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        editData={editData}
        selectedPayerId={selectedPayerId || undefined}
        selectedPolicyId={selectedPolicyId || undefined}
        selectedPolicyClassId={selectedPolicyClass?.class_id || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        errorMsg={null}
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setSelectedExclusion(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirm to Delete"
        message={`Are you sure you want to delete this agreement exclusion?${
          selectedExclusion?.exclusion_value 
            ? `\n\nExclusion: ${selectedExclusion.exclusion_cat} - ${selectedExclusion.exclusion_value}`
            : ""
        }`}
        loading={deleteLoading}
      />
    </>
  );
}