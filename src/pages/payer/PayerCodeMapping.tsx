// PayerCodeMapping.tsx
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import api, { fetcher } from "../../utils/Api";
import { useRef, useState } from "react";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PayerCodeMappingDialog from "./PayerCodeMappingDialog";
import ConfirmDeleteDialog from "../../components/deleteDialog/ConfirmDeleteDialog";
import { Secure } from "@givc/shared-components";
import GlCustomTable from "../../shared/tables/GlCustomTable";
import { toast } from "react-toastify";
import { publicUrl } from "../../utils/publicUrl";

export default function PayerCodeMapping() {
  const {palette: {mode}} = useTheme();
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
  const [selectedMapping, setSelectedMapping] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [importing, setImporting] = useState(false);

  // Ref for table refresh
  const payerCodeMappingRef = useRef<any>(null);

  // Handle delete click - open confirmation dialog
  const handleDeleteClick = (e: React.MouseEvent, row: any) => {
    e.stopPropagation();
    setSelectedMapping(row);
    setOpenDeleteDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (!selectedMapping) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/api/payer-code-mapping/${selectedMapping.mapping_id}`);
      toast.success("Payer code mapping deleted successfully");

      // Refresh the table
      if (payerCodeMappingRef.current) {
        payerCodeMappingRef.current();
      }

      setOpenDeleteDialog(false);
      setSelectedMapping(null);
    } catch (error: any) {
      console.error("Error deleting payer code mapping:", error);
      toast.error(
        `Failed to delete payer code mapping - ${error?.response?.data?.error || error?.message || "Unknown error"}`,
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
    if (payerCodeMappingRef.current) {
      payerCodeMappingRef.current();
    }
  };

  const headerToFieldMap: Record<string, string> = {
    "Payer ID": "payer_id",
    "Payer Description": "payer_desc",
    "Item ID": "item_id",
    "Item Description": "item_desc",
    "Payer Code": "payer_code",
  };

  const handleImport = async (importData: any) => {
    setImporting(true);
    try {
      // Process in chunks of 500
      const rawArray: any[] = importData.data || importData;
      const dataArray = rawArray.map((row) => {
        const mapped: Record<string, any> = {};
        Object.entries(row).forEach(([key, value]) => {
          const field = headerToFieldMap[key] ?? key;
          mapped[field] = value;
        });
        return mapped;
      });
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
            "/api/payer-code-mapping/bulk-import",
            {
              data: chunk,
            },
            {
              params: {
                selectedPayerId: selectedPayerId,
              },
            },
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

      // Refresh table
      if (payerCodeMappingRef.current) {
        payerCodeMappingRef.current();
      }

      // Show final result
      const message = `Import completed! ${allResults.successful} successful, ${allResults.failed} failed`;
      const severity =
        allResults.failed === 0
          ? "success"
          : allResults.successful === 0
            ? "error"
            : "warning";

      toast[severity](message);

      // Log errors if any
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
    { field: "item_id", headerName: "Item ID" },
    { field: "item_desc", headerName: "Item Description" },
    { field: "payer_code", headerName: "Payer Code" },
  ];

  const fetchExportData = async () => {
    const { data } = await api.get(`/api/payer-code-mapping`, {
      params: {
        payer_id: selectedPayerId,
        policy_id: selectedPolicyId,
        class_id: selectedPolicyClass?.class_id,
      },
    });
    const result = data?.data || [];
    if (result.length === 0) toast.warn("No data available to export.");
    return result;
  };

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
          resource_key="payer_7_export-selected-payer-code-mapping"
          columns={exportColumns}
          data={fetchExportData}
          fileName={`${new Date().toISOString().slice(0, 10)}_${selectedPayerId}_payer-code-mapping`}
        >
          {""}
        </Secure.GLExcelExportButton>
        <Secure.GLExcelImportButton
          variant="outlined"
          size="small"
          startIcon={<CloudDownloadIcon />}
          showNotification={false}
          onImportSuccess={handleImport}
          onImportError={(error) => toast.error(error.message || "Failed to read file. Please check the file format.")}
          resource_key="payer_7_import-payer-code-mapping"
        >
          {""}
        </Secure.GLExcelImportButton>
      </Box>

      <GlCustomTable
        fetcher={fetcher}
        refetchRef={payerCodeMappingRef}
        localeText={{ noRowsLabel: "✨ No data available" }}
        url={"/api/payer-code-mapping"}
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
                {params.value} - {params.row.payer_description || "N/A"}
              </>
            ),
          },

          {
            field: "payer_code",
            headerName: "Payer Code",
            flex: 1,
          },
          {
            field: "payer_desc",
            headerName: "Payer Description",
            flex: 1.5,
          },
          {
            field: "item_id",
            headerName: "Item",
            flex: 1,
            renderCell: (params) => (
              <>
                {params.value
                  ? `${params.value} - ${params.row.item_desc || ""}`
                  : "-"}
              </>
            ),
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
        getRowId={(row) => row.mapping_id}
      />

      {/* Add/Edit Dialog */}
      <PayerCodeMappingDialog
        open={openDialog}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        editData={editData}
        selectedPayerId={selectedPayerId}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        errorMsg={null}
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setSelectedMapping(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirm to Delete"
        message={`Are you sure you want to delete this payer code mapping?${
          selectedMapping?.payer_code
            ? `\n\nPayer Code: ${selectedMapping.payer_code}\nItem: ${selectedMapping.item_desc || selectedMapping.item_id || "N/A"}`
            : ""
        }`}
        loading={deleteLoading}
      />
    </>
  );
}
