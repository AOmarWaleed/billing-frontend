import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { ItemGroup, ItemGroupSet } from "../../types/ItemGroupIndex";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import {
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import ItemGroupSetForm from "./ItemGroupSetForm";
import AddIcon from "@mui/icons-material/Add";
import EditNoteIcon from "@mui/icons-material/EditNote";
import {
  clearError,
  createItemGroupSet,
  updateItemGroupSet,
  deleteItemGroupSet,
  // setCurrSet,
  // clearCurrSet,
  proceedItemGroupSetThunk,
  deleteAllItemGroupSet,
} from "../../redux/slices/itemGroupSlice";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDeleteDialog from "../../components/deleteDialog/ConfirmDeleteDialog";
import PlayForWorkIcon from "@mui/icons-material/PlayForWork";
import GlobalSnackbar from "../../components/snackBar/GlobalSnackbar";
import { showSnackbar } from "../../redux/slices/snackbarSlice";
import Secure from "../../shared/security";
import { GLGridColDef } from "../../shared/security/GLCustomTable";
import GlPanelTable from "../../shared/tables/GlPanelTable";
import useSWR, { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import api from "../../utils/Api";
import { DisplayMsgDialog } from "@givc/shared-components";

const SetTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { error, currItemGroupSet, selectedGroupId, selectedGroup } =
    useAppSelector((state) => state.itemGroup);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false);
  const [currSet, setCurrSet] = useState(null);
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginatedData, setPaginatedData] = useState<ItemGroupSet[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const { t } = useContext(AuthGuardContext)!;

  const refetchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setAppliedFilters(filters);
    }, 500);

    return () => window.clearTimeout(debounceTimer);
  }, [filters]);

  useEffect(() => {
    if (!selectedGroupId && currSet !== null) {
      setCurrSet(null);
    }
  }, [selectedGroupId, currSet]);

  const handleRowSelection = (row: any) => {
    setCurrSet(row ?? null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  const handleAddClick = (e: React.MouseEvent) => {
    setOpenAddDialog(true);
    // open add dialog logic
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currSet) {
      // UPDATED: Check Redux state instead of local state
      setOpenEditDialog(true);
    } else {
      // Show error/notification if no set selected
      console.warn("No set selected for editing");
    }
  };

  const itemesSetsTableFetcher = () => {
    mutate((e) => apiUtility(e, "/sets"));
    mutate((e) => apiUtility(e, "/items"));
  };

  const handleAddSet = async (values: any) => {
    try {
      await dispatch(createItemGroupSet(values)).unwrap();
      setOpenAddDialog(false);
      refetchRef?.current?.();
      // Optionally show success message
      dispatch(
        showSnackbar({
          message: "Set created successfully!",
          severity: "success",
        }),
      );
      itemesSetsTableFetcher();
    } catch (error: any) {
      console.error("Failed to create set:", error);
    }
  };

  const handleUpdateSet = async (values: any) => {
    await dispatch(updateItemGroupSet({ id: currSet?.set_id, data: values }))
      .unwrap()
      .then(() => {
        setOpenEditDialog(false);
        itemesSetsTableFetcher();
        refetchRef?.current?.();
      })
      .catch((error: any) => {
        throw error;
      });
  };
  const handleDeleteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(clearError());
    setOpenDeleteDialog(true);
  };
  const handleDeleteAllClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    dispatch(clearError());
    setOpenDeleteAllDialog(true);
  };
  // Update handleDeleteConfirm
  const handleDeleteConfirm = async () => {
    if (!currSet) return;

    try {
      setOpenDeleteDialog(false);
      const deletedId = currSet?.set_id;

      await dispatch(deleteItemGroupSet(deletedId)).unwrap();
      itemesSetsTableFetcher();
      refetchRef?.current?.();
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  };
  // Update handleDeleteConfirm
  const handleDeleteAllConfirm = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      setOpenDeleteAllDialog(false);
      const deletedId = selectedGroup.group_id;

      await dispatch(deleteAllItemGroupSet(deletedId)).unwrap();
      itemesSetsTableFetcher();
      refetchRef?.current?.();
    } catch (error) {
      console.error("Deletion failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const handleProcess = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!currSet) return;
    try {
      const result = await dispatch(
        proceedItemGroupSetThunk({
          group_id: selectedGroup?.group_id,
          set_id: currSet?.set_id,
        }),
      ).unwrap();
      itemesSetsTableFetcher();

      dispatch(
        showSnackbar({
          message: result.message || "Items processed successfully!",
          severity: "success",
        }),
      );
    } catch (error) {
      // Error suppressed - no toast shown
      console.error("Process error:", error);
    }
  };

  const [loading, setLoading] = useState(false);

  const handleProcessAll = async () => {
    if (!selectedGroup) return;
    try {
      setLoading(true);

      // Fetch all sets for the selected group directly from API
      const { data } = await api.get(`/api/itemgroup/${selectedGroupId}/sets`);
      console.log(data);

      // Extract items array - adjust based on your API response structure
      const items = data.data || [];

      console.log("proceed all", items);

      if (!items || items.length === 0) {
        dispatch(
          showSnackbar({
            message: "No items to process",
            severity: "warning",
          }),
        );
        return;
      }

      let itemsLength = 0;

      for (const item of items) {
        const result = await dispatch(
          proceedItemGroupSetThunk({
            group_id: selectedGroup.group_id,
            set_id: item.set_id,
          }),
        ).unwrap();

        console.log({ result });
        itemsLength += +result?.data?.itemsProcessed;
      }

      // Refresh data after all processing is complete
      itemesSetsTableFetcher();

      dispatch(
        showSnackbar({
          message: `Successfully processed ${itemsLength} items`,
          severity: "success",
        }),
      );
    } catch (error) {
      console.error("Process all error:", error);
      // Error suppressed - no toast shown
    } finally {
      setLoading(false);
    }
  };

  const columns: GLGridColDef[] = [
    {
      field: "set_id",
      headerName: "ID",
      resource_key: "itemGroup_14_idSetTable",
      flex: 1,
      headerAlign: "center",
      align: "center",
      type: "number",
    },
    {
      field: "type",
      headerName: "Type",
      resource_key: "itemGroup_14_typeSetTable",
      flex: 2,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "code",
      headerName: "Code",
      resource_key: "itemGroup_14_codeSetTable",
      flex: 2,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "description",
      headerName: "Description",
      resource_key: "itemGroup_14_descriptionSetTable",
      flex: 2,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "status",
      headerName: "Status",
      resource_key: "itemGroup_14_statusSetTable",
      flex: 2,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "action",
      headerName: "Action",
      resource_key: "itemGroup_14_actionSetTable",
      flex: 2,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "auto_sync",
      headerName: "Auto Sync",
      resource_key: "itemGroup_14_autoSyncSetTable",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) =>
        params.value === "Y" ? (
          <CheckCircle style={{ color: "#4caf50", fontSize: "1.2rem" }} />
        ) : params.value === "N" ? (
          <Cancel style={{ color: "#f44336", fontSize: "1.2rem" }} />
        ) : // Fallback for unexpected values
        params.value ? (
          "Yes"
        ) : (
          "No"
        ),
    },
    {
      field: "processed",
      headerName: "Processed",
      resource_key: "itemGroup_14_processedSetTable",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) =>
        params.value === 1 ? (
          <CheckCircle style={{ color: "#4caf50", fontSize: "1.2rem" }} />
        ) : (
          <Cancel style={{ color: "#f44336", fontSize: "1.2rem" }} />
        ),
    },
  ];

  return (
    <Box mt={2} ml={2}>
      {loading && (
        <Box
          sx={{
            position: "fixed",
            inset: "0",
            backgroundColor: "rgba(0,0,0,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "9999",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <GlobalSnackbar />
        <Secure.GLTypography
          flex={3}
          resource_key="itemGroup_14_setTableSetTable"
        />

        <Secure.GLTooltip resource_key="itemGroup_14_addSetSetTable">
          <Secure.GLIconButton
            resource_key="itemGroup_14_addSetSetTable"
            sx={{ height: 32, width: 32, borderRadius: 1, padding: "4px" }}
            onClick={handleAddClick}
            disabled={!selectedGroup}
          >
            <AddCircleOutlineIcon fontSize="small" />
          </Secure.GLIconButton>
        </Secure.GLTooltip>
        <Secure.GLTooltip resource_key="itemGroup_14_editSetSetTable">
          <Secure.GLIconButton
            resource_key="itemGroup_14_editSetSetTable"
            sx={{ height: 32, width: 32, borderRadius: 1, padding: "4px" }}
            onClick={handleEditClick}
            disabled={!currSet}
          >
            <EditIcon fontSize="small" />
          </Secure.GLIconButton>
        </Secure.GLTooltip>
        <Secure.GLTooltip resource_key="itemGroup_14_deleteSetSetTable">
          <Secure.GLIconButton
            resource_key="itemGroup_14_deleteSetSetTable"
            sx={{
              height: 32,
              width: 32,
              borderRadius: 1,
              padding: "4px",
            }}
            onClick={handleDeleteClick}
            disabled={!currSet} // optional: disable if no row selected
          >
            <DeleteIcon fontSize="small" />
          </Secure.GLIconButton>
        </Secure.GLTooltip>
        <Secure.GLTooltip resource_key="itemGroup_14_deleteAllSetsSetTable">
          <Secure.GLIconButton
            resource_key="itemGroup_14_deleteAllSetsSetTable"
            sx={{
              height: 32,
              width: 32,
              borderRadius: 1,
              padding: "4px",
            }}
            onClick={handleDeleteAllClick}
            disabled={!currSet} // optional: disable if no row selected
          >
            <DeleteSweepIcon fontSize="small" />
          </Secure.GLIconButton>
        </Secure.GLTooltip>
        <Secure.GLTooltip resource_key="itemGroup_14_proceedSetTable">
          <Secure.GLIconButton
            resource_key="itemGroup_14_proceedSetTable"
            sx={{
              height: 32,
              width: 32,
              borderRadius: 1,
              padding: "4px",
            }}
            onClick={handleProcess}
            disabled={!currSet} // optional: disable if no row selected
          >
            <PlayForWorkIcon />
          </Secure.GLIconButton>
        </Secure.GLTooltip>
        <Secure.GLTooltip resource_key="itemGroup_14_proceedAllSetTable">
          <Secure.GLIconButton
            resource_key="itemGroup_14_proceedAllSetTable"
            sx={{
              height: 32,
              width: 32,
              borderRadius: 1,
              padding: "4px",
            }}
            onClick={handleProcessAll}
            // disabled={!currSet} // optional: disable if no row selected
          >
            <AutorenewIcon />
          </Secure.GLIconButton>
        </Secure.GLTooltip>
      </Stack>
      {/* 🔎 Column Filters */}
      <GlPanelTable
        filterSection={
          <Stack direction="row" spacing={0} sx={{ mb: 1 }}>
            {columns.map((col) => {
              if (col.field === "auto_sync" || col.field === "processed") {
                return (
                  <Box
                    key={col.field}
                    flex={col.flex ?? 1}
                    sx={{ px: 0.5 }}
                  ></Box>
                );
              } else {
                return (
                  <Box key={col.field} flex={col.flex ?? 1} sx={{ px: 0.5 }}>
                    <Secure.GLTextField
                      resource_key={col.resource_key}
                      fullWidth
                      size="small"
                      placeholder={t(col.resource_key)}
                      value={filters[col.field] ?? ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          [col.field]: e.target.value,
                        })
                      }
                    />
                  </Box>
                );
              }
            })}
          </Stack>
        }
      >
        {/* <DataGrid
        rows={paginatedData}
        columns={columns}
        rowCount={totalCount}
        getRowId={(row) => row.set_id}
        //onRowClick={() => {}}
        onRowSelectionModelChange={(ids) => handleRowSelection(ids)}
        //  rowSelectionModel={currSet ? [currSet.set_id] : []}
        paginationMode="server"
        pageSizeOptions={[5, 10, 20, 50]}
        rowHeight={49}
        disableColumnMenu
        // slots={{
        //   pagination: () => (
        //     <CustomPagination
        //       totalPages={totalPages}
        //       onPageChange={handlePageChange}
        //       currentPage={page}
        //       limit={limit}
        //       setLimit={handleLimitChange}
        //     />
        //   ),
        // }}
        slots={{
          pagination: () => (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                // p: 1,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <GlCustomPagination
                totalCount={totalPages}
                currentPage={page}
                pageSize={limit}
                onPageSizeChange={handleLimitChange}
                onPageChange={handlePageChange}
              />
            </Box>
          ),
        }}
      /> */}
        <Secure.GlCustomTable
          key={selectedGroupId ? `sets-${selectedGroupId}` : "no-group-sets"}
          params={appliedFilters}
          resource_key="SetTable_Title"
          url={selectedGroupId ? `/api/itemgroup/${selectedGroupId}/sets` : ""}
          columns={columns}
          limit={limit}
          getRowId={(row) => row.set_id}
          onRowSelected={handleRowSelection}
          autoSelectFirstRow={true}
          refetchRef={refetchRef}
          smallSize
          localeText={{
            noRowsLabel: "✨ No data available",
            noResultsOverlayLabel: "✨ No data available",
          }}
        />
      </GlPanelTable>
      {/* Add Set Dialog */}
      <GenericDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          dispatch(clearError());
        }}
        title={t("itemGroup_14_addSetSetForm")}
        icon={<AddIcon sx={dialogIconStyle} />}
        content={
          selectedGroup && (
            <ItemGroupSetForm
              initialValues={{
                group_id: selectedGroup.group_id,
                auto_sync: "N",
                set_type: "",
                status: "",
                process_type: "",
              }}
              onSubmit={handleAddSet}
              onClose={() => {
                setOpenAddDialog(false);
                dispatch(clearError());
              }}
              error={error || ""}
              isUpdate={false}
            />
          )
        }
      />
      {/* Edit Set Dialog */}
      <GenericDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          // setSelectedSet(null);
          dispatch(clearError());
        }}
        title={t("itemGroup_14_editSetEditSetForm")}
        icon={<EditNoteIcon sx={dialogIconStyle} />}
        content={
          // UPDATED: Use currSet from Redux
          selectedGroup && currSet ? (
            <ItemGroupSetForm
              initialValues={{
                group_id: selectedGroup.group_id,
                auto_sync: currSet.auto_sync,
                set_type: currSet.type,
                set_code: currSet.code,
                status: currSet.status,
                process_type: currSet.action,
              }}
              onSubmit={handleUpdateSet}
              onClose={() => {
                setOpenEditDialog(false);
                // dispatch(clearCurrSet()); // CLEAR selection on close
                dispatch(clearError());
              }}
              error={error || ""}
              isUpdate={true}
            />
          ) : null
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
        title={t("itemGroup_14_confirmToDeleteConfirmDelete")}
        message={t(
          "itemGroup_14_areYouSureYouWantToDeleteThisSetConfirmDelete",
        )}
        errorMsg={error || null}
      /> */}

      <DisplayMsgDialog
        getResource={false}
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          dispatch(clearError());
        }}
        onAction={handleDeleteConfirm}
        status="DELETE"
        actionLabel="Delete"
        actionColor="error"
        description={t(
          "itemGroup_14_areYouSureYouWantToDeleteThisSetConfirmDelete",
        )}
      />

      {/* Delete Confirmation Dialog */}
      {/* <ConfirmDeleteDialog
        open={openDeleteAllDialog}
        onClose={() => {
          setOpenDeleteAllDialog(false);
          dispatch(clearError());
        }}
        onConfirm={handleDeleteAllConfirm}
        title={t("itemGroup_14_confirmToDeleteConfirmDelete")}
        message={t("itemGroup_14_areYouSureYouWantToDeleteAllSetConfirmDelete")}
        errorMsg={error || null}
      /> */}

      <DisplayMsgDialog
        getResource={false}
        open={openDeleteAllDialog}
        onClose={() => {
          setOpenDeleteAllDialog(false);
          dispatch(clearError());
        }}
        onAction={handleDeleteAllConfirm}
        status="DELETE"
        actionLabel="Delete All"
        actionColor="error"
        description={t(
          "itemGroup_14_areYouSureYouWantToDeleteAllSetConfirmDelete",
        )}
      />
    </Box>
  );
};
const dialogIconStyle = {
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

export default SetTable;
