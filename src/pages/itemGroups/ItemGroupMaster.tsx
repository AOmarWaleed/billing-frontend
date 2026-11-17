import React, { useContext, useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { GridColDef } from "@mui/x-data-grid";
import {
  clearError,
  createItemGroup,
  fetchItemGroups,
  fetchItemGroupsCodeTypes,
  setSelectedItemGroup,
  deleteItemGroup,
  updateItemGroup,
} from "../../redux/slices/itemGroupSlice";
import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import { ClearIcon } from "@mui/x-date-pickers";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import ItemGroupForm from "./ItemGroupForm";
import AddIcon from "@mui/icons-material/Add";
import SetTable from "./SetTable";
import ItemTable from "./ItemTable";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDeleteDialog from "../../components/deleteDialog/ConfirmDeleteDialog";
import IconFilterAlt from "@mui/icons-material/FilterAlt";
import GlPanelTable from "../../shared/tables/GlPanelTable";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import Secure from "../../shared/security";
import {
  DisplayMsgDialog,
  Secure as GalaxySecure,
} from "@givc/shared-components";
import { GLGridColDef } from "../../shared/security/GLCustomTable";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import { publicUrl } from "../../utils/publicUrl";
interface Filters {
  description: string;
  groupId: string;
  payerName: string;
}
const ItemsGroupMaster: React.FC = () => {
  /********* CONTEXT ********/
  const { t } = useContext(AuthGuardContext);

  /********* STORE ********/
  const dispatch = useAppDispatch();
  const {
    selectedGroup,
    selectedGroupId,
    limit,
    drugDispensingCodeTypes,
    error,
  } = useAppSelector((state) => state.itemGroup);

  /********* STATES ********/
  //State for Filters
  const [filters, setFilters] = useState<Filters>({
    description: "",
    groupId: "",
    payerName: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<Filters>(filters);
  const [showFilters, setShowFilters] = useState(false);

  // State for Dialogs
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const itemGroupsRef = React.useRef<(() => void) | null>(null);

  /********* EFFECTS ********/
  useEffect(() => {
    dispatch(fetchItemGroupsCodeTypes());
    dispatch(fetchItemGroups({ limit: 1000 }));
  }, []);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setAppliedFilters(filters);
    }, 500);

    return () => window.clearTimeout(debounceTimer);
  }, [filters]);

  /********* HANDLERS ********/
  //Filters handlers
  const handleShowFilters = () => {
    setShowFilters((previousState) => {
      const currentState = !previousState;
      if (!currentState) {
        setFilters({ ...filters, groupId: "", payerName: "" });
        mutate((e) => apiUtility(e, "itemgroup")); // Force table refresh when clearing filters
      }
      return currentState;
    });
  };

  const handleSearchValuesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  };

  // Action handlers

  const handleAddClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(clearError());
    setOpenAddDialog(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(clearError());
    setOpenDeleteDialog(true);
  };

  const handleEditClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(clearError());
    setOpenEditDialog(true);
  };

  const handleAddItemGroup = async (values: any) => {
    await dispatch(createItemGroup(values))
      .unwrap()
      .then(() => {
        setOpenAddDialog(false);
        itemGroupsRef?.current?.();
      })
      .catch((error) => {
        throw error;
      });
    mutate((e) => apiUtility(e, "itemgroup"));
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGroup) return;
    const deletedId = selectedGroup.group_id;
    await dispatch(deleteItemGroup(deletedId))
      .unwrap()
      .then(() => {
        setOpenDeleteDialog(false);
        itemGroupsRef?.current?.();
      })
      .catch((error) => {
        throw error;
      });
    mutate((e) => apiUtility(e, "itemgroup"));
  };

  const handleUpdateItemGroup = async (values: any) => {
    await dispatch(
      updateItemGroup({
        id: selectedGroup?.group_id,
        data: values,
      }),
    )
      .unwrap()
      .then(() => {
        setOpenEditDialog(false);
        itemGroupsRef?.current?.();
      })
      .catch((error: any) => {
        throw error;
      });
    mutate((e) => apiUtility(e, "itemgroup"));
  };

  const theme = useTheme();

  const columns = useMemo<GLGridColDef[]>(
    () => [
      {
        resource_key: "itemGroup_14_groupIdGroupItem",
        field: "group_id",
        flex: 1,
        sortable: true,
      },
      {
        resource_key: "itemGroup_14_descriptionGroupItem",
        field: "description",
        flex: 3,
        sortable: true,
      },
      {
        resource_key: "itemGroup_14_drugDispensingTypeGroupItem",
        field: "drug_dispensing_type",
        flex: 2,
        sortable: false,
        renderCell: (params) => {
          const type = drugDispensingCodeTypes.find(
            (t) => t.code == params.value?.toString(),
          );
          return type?.description || "";
        },
      },
      {
        resource_key: "itemGroup_14_payerGroupItem",
        field: "payer",
        flex: 2,
        sortable: false,
        renderCell: (params) => {
          const payer = params.value;
          return payer
            ? `${payer.id} - ${payer.name || payer.description}`
            : "No payer info";
        },
      },
      {
        resource_key: "itemGroup_14_setCountGroupItem",
        field: "setCount",
        flex: 1,
        sortable: false,
      },
      {
        resource_key: "itemGroup_14_actionsGroupItem",
        field: "Actions",
        type: "custom",
        headerName: "Actions",
        width: 100,
        disableColumnMenu: true,
        sortable: false,
        renderHeader: ({ field }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              justifyContent: "space-between",
            }}
          >
            <span>Actions</span>
            <GalaxySecure.GLIconButton2
              permission="itemGroup_14_addGroupItem"
              uiText="generic_0_add"
              fallBackText="Add Item"
              onClick={handleAddClick}
              size="small"
            >
              <img
                src={publicUrl(`themes/${theme.palette.mode}/icons/plus.png`)}
                width="15px"
              />
            </GalaxySecure.GLIconButton2>
          </Box>
        ),
        renderCell: (params) => (
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={1}
            sx={{ height: "100%" }}
          >
            <GalaxySecure.GLIconButton2
              permission="itemGroup_14_editGroupItem"
              uiText="generic_0_edit"
              fallBackText="Edit Item"
              onClick={handleEditClick}
              size="small"
            >
              <img
                src={publicUrl(`themes/${theme.palette.mode}/icons/pen.png`)}
                alt="Edit"
              />
            </GalaxySecure.GLIconButton2>

            <GalaxySecure.GLIconButton2
              permission="itemGroup_14_deleteGroupItem"
              uiText="generic_0_delete"
              fallBackText="Delete Item"
              onClick={handleDeleteClick}
              disabled={!selectedGroup}
              size="small"
            >
              <img
                src={publicUrl(`themes/${theme.palette.mode}/icons/delete.png`)}
                alt="Delete"
              />
            </GalaxySecure.GLIconButton2>
          </Stack>
        ),
      },
    ],
    [drugDispensingCodeTypes, theme.palette.mode, selectedGroup],
  );

  return (
    <Box display="flex" width="100%">
      <HandleTitle titleKey="ITEM_GROUP" />
      <Box p={2} borderRight="1px solid #ccc" sx={{ width: "27.75%" }}>
        <Box mt={2} sx={{ minHeight: 600 }}>
          <GlPanelTable
            filterSection={
              <>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Secure.GLTextField
                    resource_key="itemGroup_14_searchDescriptionGroupItem"
                    id="quickSearch"
                    placeholder={t("itemGroup_14_searchDescriptionGroupItem")}
                    variant="outlined"
                    name="description"
                    value={filters.description}
                    onChange={handleSearchValuesChange}
                    sx={{
                      flex: 1,
                      borderRadius: 1,
                      "& .MuiOutlinedInput-root": {
                        height: 32,
                        paddingRight: 1,
                      },
                      "& input": {
                        padding: "6px 10px",
                        fontSize: "0.875rem",
                        height: "100%",
                        boxSizing: "border-box",
                      },
                    }}
                    // InputProps={{
                    //   endAdornment: (
                    //     <InputAdornment position="end">
                    //       {filters.description && (
                    //         <IconButton
                    //           onClick={() =>
                    //             setFilters({ ...filters, description: "" })
                    //           }
                    //           size="small"
                    //           sx={{ padding: "4px" }}
                    //         >
                    //           <ClearIcon fontSize="small" />
                    //         </IconButton>
                    //       )}
                    //     </InputAdornment>
                    //   ),
                    // }}
                    type="search"
                  />

                  {/* <Secure.GLTooltip resource_key="itemGroup_14_addGroupItem">
                    <Secure.GLIconButton
                      resource_key="itemGroup_14_addGroupItem"
                      sx={{
                        height: 32,
                        width: 32,
                        borderRadius: 1,
                        padding: "4px",
                      }}
                      onClick={handleAddClick}
                    >
                      <AddCircleOutlineIcon fontSize="small" />
                    </Secure.GLIconButton>
                  </Secure.GLTooltip> */}

                  {/* <Secure.GLTooltip resource_key="itemGroup_14_editGroupItem">
                    <Secure.GLIconButton
                      resource_key="itemGroup_14_editGroupItem"
                      sx={{
                        height: 32,
                        width: 32,
                        borderRadius: 1,
                        padding: "4px",
                      }}
                      onClick={handleEditClick}
                    >
                      <EditIcon fontSize="small" />
                    </Secure.GLIconButton>
                  </Secure.GLTooltip> */}

                  {/* <Secure.GLTooltip resource_key="itemGroup_14_deleteGroupItem">
                    <Secure.GLIconButton
                      resource_key="itemGroup_14_deleteGroupItem"
                      sx={{
                        height: 32,
                        width: 32,
                        borderRadius: 1,
                        padding: "4px",
                      }}
                      onClick={handleDeleteClick}
                      disabled={!selectedGroup}
                    >
                      <DeleteIcon fontSize="small" />
                    </Secure.GLIconButton>
                  </Secure.GLTooltip> */}

                  <Secure.GLTooltip resource_key="itemGroup_14_filtersGroupItem">
                    <Secure.GLIconButton
                      resource_key="itemGroup_14_filtersGroupItem"
                      sx={{
                        height: 32,
                        width: 32,
                        borderRadius: 1,
                        padding: "4px",
                      }}
                      onClick={handleShowFilters}
                    >
                      <IconFilterAlt />
                    </Secure.GLIconButton>
                  </Secure.GLTooltip>
                </Stack>

                {showFilters && (
                  <Stack
                    direction="row"
                    spacing={0}
                    sx={{ width: "100%", mt: 1 }}
                  >
                    <Box flex={3} pr={1}>
                      <Secure.GLTextField
                        resource_key="itemGroup_14_searchByGroupIdGroupItem"
                        placeholder={t("itemGroup_14_searchByGroupIdGroupItem")}
                        size="small"
                        name="groupId"
                        value={filters.groupId}
                        type="search"
                        onChange={handleSearchValuesChange}
                        // InputProps={{
                        //   endAdornment: (
                        //     <InputAdornment position="end">
                        //       {filters.groupId && (
                        //         <IconButton
                        //           onClick={() =>
                        //             setFilters({ ...filters, groupId: "" })
                        //           }
                        //           size="small"
                        //         >
                        //           <ClearIcon />
                        //         </IconButton>
                        //       )}
                        //     </InputAdornment>
                        //   ),
                        // }}
                        fullWidth
                        sx={{
                          flex: 1,
                          borderRadius: 1,
                          "& .MuiOutlinedInput-root": {
                            height: 32,
                            paddingRight: 1,
                          },
                          "& input": {
                            padding: "6px 10px",
                            fontSize: "0.875rem",
                            height: "100%",
                            boxSizing: "border-box",
                          },
                        }}
                      />
                    </Box>

                    <Box flex={3}>
                      <Secure.GLTextField
                        resource_key="itemGroup_14_searchByPayerGroupItem"
                        placeholder={t("itemGroup_14_searchByPayerGroupItem")}
                        size="small"
                        name="payerName"
                        value={filters.payerName}
                        onChange={handleSearchValuesChange}
                        // InputProps={{
                        //   endAdornment: (
                        //     <InputAdornment position="end">
                        //       {filters.payerName && (
                        //         <IconButton
                        //           onClick={() =>
                        //             setFilters({ ...filters, payerName: "" })
                        //           }
                        //           size="small"
                        //         >
                        //           <ClearIcon />
                        //         </IconButton>
                        //       )}
                        //     </InputAdornment>
                        //   ),
                        // }}
                        type="search"
                        fullWidth
                        sx={{
                          borderRadius: 1,
                          "& .MuiOutlinedInput-root": {
                            height: 32,
                            paddingRight: 1,
                          },
                          "& input": {
                            padding: "6px 10px",
                            fontSize: "0.875rem",
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                )}
              </>
            }
          >
            <Secure.GlCustomTable
              resource_key="replaceme"
              url="/api/itemgroup/new"
              limit={10}
              params={appliedFilters}
              columns={columns}
              refetchRef={itemGroupsRef}
              getRowId={(row) => row.group_id}
              onRowSelected={(row) => {
                dispatch(setSelectedItemGroup(row ?? null));
              }}
              handleDataChange={(d: any[]) => {
                if (d?.length === 0) {
                  dispatch(setSelectedItemGroup(null));
                }
              }}
              enableKeyboardNavigation={true}
              autoSelectFirstRow={true}
              smallSize
              hideHeader={false}
              customSortColumns={["group_id", "description", "creation_date"]}
              localeText={{
                noRowsLabel: "✨ No data available",
                noResultsOverlayLabel: "✨ No data available",
              }}
            />
          </GlPanelTable>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          width: "70.75%",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <SetTable />
        <ItemTable />
      </Box>

      <GenericDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          dispatch(clearError());
        }}
        title={t("itemGroup_14_addGroupItemAddGroupItem")}
        icon={<AddIcon sx={dialogIconStyle} />}
        content={
          <ItemGroupForm
            initialValues={{
              description: "",
              drug_dispensing_type: "",
              nphies_benefit_category: "",
              payer_id: "",
            }}
            onSubmit={handleAddItemGroup}
            onClose={() => {
              setOpenAddDialog(false);
              dispatch(clearError());
            }}
            error={error || ""}
            isUpdate={false}
          />
        }
      />

      <GenericDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          dispatch(clearError());
        }}
        title={t("itemGroup_14_editGroupItemEditGroupItem")}
        icon={<EditIcon sx={dialogIconStyle} />}
        content={
          selectedGroup && (
            <ItemGroupForm
              initialValues={{
                description: selectedGroup.description,
                drug_dispensing_type: selectedGroup.drug_dispensing_type,
                nphies_benefit_category: selectedGroup.nphies_benefit_category,
                payer_id: selectedGroup?.payer?.id,
              }}
              onSubmit={handleUpdateItemGroup}
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

      {/* <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          dispatch(clearError());
        }}
        onConfirm={handleDeleteConfirm}
        title={t("itemGroup_14_confirmToDeleteConfirmDelete")}
        message={t("itemGroup_14_groupItemDeleteMsg")}
        errorMsg={error || null}
      /> */}

      <DisplayMsgDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          dispatch(clearError());
        }}
        onAction={handleDeleteConfirm}
        getResource={false}
        actionLabel="Delete"
        actionColor="error"
        status="DELETE"
        description={t("itemGroup_14_groupItemDeleteMsg")}
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

export default ItemsGroupMaster;
