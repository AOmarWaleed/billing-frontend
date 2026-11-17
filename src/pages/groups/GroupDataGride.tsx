import {
  Autocomplete,
  Box,
  Button,
  Grid,
  Grid2,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import i18n from "../../shared/core/i18n";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useContext,
  useCallback,
} from "react";
import React from "react";
import { grey } from "@mui/material/colors";
import { GridColDef, GridRowId } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
  fetchGroupsData,
  setPage,
  clearError,
  setSelectedItem,
  uploadGroups,
  deleteGroup,
  setLimit,
  fetchMenus,
} from "../../redux/slices/groupsSlice";
import { fetchGroups as fetchUserGroups } from "../../redux/slices/userSlice";

import { Group } from "../../types/Group";
import CustomToolbar from "../../components/customToolbar/CustomToolbar";
import GroupUsers from "./components/GroupUsers";
import GroupMenuTree from "./components/GroupMenuTree";
import GroupAuthorization from "./components/GroupAuthorization";

import ExportButton from "../../components/exportButton/ExportButtonV2";
import FileUploaderWithCols from "../../components/fileUploader/FileUploaderWithColsV3";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import CustomGroupForm from "./components/CustomGroupForm";
import ImportGroups from "./components/ImportGroups";
import ConfirmDeleteDialog from "../../components/deleteDialog/ConfirmDeleteDialog";
import groupSchema from "../../models/groupSchema";
import api from "../../utils/Api";
import { useTranslation } from "react-i18next";
import {
  DisplayMsgDialog,
  GlPanelTable,
  Secure,
  AuthGuardContext,
} from "@givc/shared-components";
import { fetcher } from "../../utils/Api";
import { publicUrl } from "../../utils/publicUrl";
import { GLGridColDef } from "../users/components/UserFacilitySection";
import { useDebounce } from "../../redux/hooks/useDebounce";

// Define your GroupData type
interface GroupData {
  group_id: number;
  group_name: string;
  description: string;
  auth_provider_group: string;
  menu_id: number;
  menu_description: string;
}

type CustomGridColDef = GridColDef & {
  id?: string;
  name?: string;
  resource_key: string;
};

const apiUrl = `/usergroups/new`;

export const GroupDataGride = () => {
  const dispatch = useAppDispatch();

  const groups = useAppSelector((state) => state.users.groups);
  const page = useAppSelector((state) => state.groups.page);
  const limit = useAppSelector((state) => state.groups.limit);
  const totalPages = useAppSelector((state) => state.groups.totalPages);
  const error = useAppSelector((state) => state.groups.error);
  const selectedGroup = useAppSelector((state) => state.groups.selectedItem);

  const [selectedFunctionId, setSelectedFunctionId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setSelectedFunctionId(null);
  }, [selectedGroup?.group_id]);

  const handleMenuSelect = useCallback((functionId: number | null) => {
    setSelectedFunctionId(functionId);
  }, []);

  const [deleteId, setDeleteId] = useState<GridRowId | null>(null);
  const [editId, setEditId] = useState<GridRowId | null>(null);

  const initialValues = {
    group_id: "",
    group_name: "",
    description: "",
    menu_id: "",
    meun_desc: "",
    auth_provider_group: "",
  };

  const [editRow, setEditRow] = useState<{
    group_id: number;
    group_name: string;
    description: string;
    menu_id: number;
    meun_desc: string;
    auth_provider_group: string;
  }>({
    group_id: "",
    group_name: "",
    description: "",
    menu_id: "",
    meun_desc: "",
    auth_provider_group: "",
  });

  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // const { t } = useTranslation("9");
  const { resourcesData, t } = useContext(AuthGuardContext)!;

  const refetchRef = useRef<(() => void) | null>(null);
  const [tablePage, setTablePage] = useState(1);
  const [tableRefreshKey, setTableRefreshKey] = useState(0);
  const [currentPageData, setCurrentPageData] = useState<any[]>([]);

  // Search states
  const [selectedGroupText, setSelectedGroupTextOption] = useState<string>();
  const [selectedGroupOption, setSelectedGroupOption] = useState<Group | null>(
    null,
  );
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>();
  const [firstSearchText, setFirstSearchText] = useState("");
  const [secondSearchText, setSecondSearchText] = useState("");
  const debouncedFirstSearchQuery = useDebounce(firstSearchText);
  const debouncedSecondSearchQuery = useDebounce(secondSearchText);

  // API params for GlCustomTable
  const [apiParams, setApiParams] = useState<Record<string, any>>({
    searchGroupOne: "",
    searchGroupTwo: "",
    group_id: null,
  });

  useEffect(() => {
    setApiParams((prev) => ({
      ...prev,
      searchGroupOne: debouncedFirstSearchQuery,
      searchGroupTwo: debouncedSecondSearchQuery,
      group_id: selectedGroupId || null,
    }));
  }, [debouncedFirstSearchQuery, debouncedSecondSearchQuery, selectedGroupId]);

  // Export all groups
  const fetchAllGroups = async (): Promise<any[]> => {
    try {
      const response = await api.get(`/usergroups/export`, {
        params: {
          searchGroupOne: firstSearchText,
          searchGroupTwo: secondSearchText,
          group_id: selectedGroupId || null,
        },
      });
      return response.data.usergroups;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred while fetching users.";
      throw new Error(message);
    }
  };

  const handleOpenAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpenAdd(true);
    dispatch(clearError());
  };

  const handleOpenEdit = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: number,
    row: any,
  ) => {
    e.stopPropagation();
    setEditId(id);
    setEditRow(row);
    setOpenEdit(true);
    dispatch(clearError());
  };

  const handleOpenUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpenUpload(true);
    dispatch(clearError());
  };

  const handleOpenImport = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpenImport(true);
    dispatch(clearError());
  };

  const handleOpenDelete = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: GridRowId,
  ) => {
    e.stopPropagation();
    dispatch(clearError());
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleCloseDeleteDialog = () => {
    dispatch(clearError());
    setOpenDelete(false);
    setDeleteId(null);
  };

  const handleDeleteClick = async () => {
    try {
      await dispatch(deleteGroup({ id: deleteId }))
        .unwrap()
        .then(() => {
          setOpenDelete(false);

          if (currentPageData.length === 1 && tablePage > 1) {
            setTablePage(1);
            setTableRefreshKey((current) => current + 1);
          } else {
            refetchRef.current?.();
          }
        });
    } catch (error: any) {
      throw error;
    }
  };

  // SEARCH HANDLERS
  const handleFirstSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setFirstSearchText(value);
  };

  const handleKeyDownFirstSearch = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleFirstSearch();
    }
  };

  const handleFirstSearch = () => {
    setApiParams((prev) => ({
      ...prev,
      searchGroupOne: firstSearchText,
    }));
  };

  const handleClearFirstSearch = () => {
    setFirstSearchText("");
    setApiParams((prev) => ({
      ...prev,
      searchGroupOne: "",
    }));
  };

  const handleSecondSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setSecondSearchText(value);
  };

  const handleKeyDownSecondSearch = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleSecondSearch();
    }
  };

  const handleSecondSearch = () => {
    setApiParams((prev) => ({
      ...prev,
      searchGroupTwo: secondSearchText,
    }));
  };

  const handleClearSecondSearch = () => {
    setSecondSearchText("");
    setApiParams((prev) => ({
      ...prev,
      searchGroupTwo: "",
    }));
  };

  const handleRowSelected = (selectedRow: GroupData | null) => {
    if (selectedRow) {
      dispatch(setSelectedItem(selectedRow));
    } else {
      dispatch(setSelectedItem(null));
    }
  };

  const handleDataChange = (data: any[]) => {
    setCurrentPageData(data);
  };

  const {
    palette: { mode },
  } = useTheme();

  const columns: GLGridColDef[] = [
    {
      field: "group_id",
      permission: "users_9_groupId",
      uiText: "users_9_groupId",
      headerName: "Group Id",
      flex: 1,
      minWidth: 110,
    },
    {
      field: "group_name",
      permission: "users_9_groupNameGroupsTab",
      uiText: "users_9_groupNameGroupsTab",
      headerName: "Group Name",
      flex: 2,
      minWidth: 110,
      filterable: true,
    },
    {
      field: "description",
      permission: "users_9_groupDescription",
      uiText: "generic_0_description",
      headerName: "Description",
      flex: 3,
      width: 230,
      filterable: true,
    },
    {
      field: "auth_provider_group",
      permission: "users_9_authProviderGroup",
      uiText: "users_9_authProviderGroup",
      headerName: "Auth Provider Group",
      flex: 2,
      width: 230,
      filterable: true,
    },
    {
      field: "menu_id",
      permission: "users_9_menuId",
      uiText: "users_9_menuId",
      headerName: "Menu Id",
      flex: 1,
      width: 230,
      filterable: true,
    },
    {
      field: "menu_description",
      permission: "users_9_menuDescription",
      uiText: "users_9_menuDescription",
      headerName: "Menu Description",
      flex: 2,
      width: 230,
      filterable: true,
    },
    {
      field: "actions",
      permission: "users_9_groupActions",
      uiText: "generic_0_actions",
      headerName: "Actions",
      disableColumnMenu: true,
      type: "custom",
      headerClassName: "super-app-theme--header",
      headerAlign: "left",
      align: "right",
      flex: 1,
      width: 80,
      sortable: false,
      filterable: false,
      cellClassName: "actions",
      renderHeader: () => {
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              justifyContent: "space-between",
            }}
          >
            <span>Actions</span>

            {/* <Secure.GLIconButton
              title={t("usergroups_9_Actions")}
              resource_key="usergroups_9_Actions"
              onClick={handleOpenAdd}
            >
              <img src={publicUrl(`themes/${mode}/icons/plus.png`)} alt="add" />
            </Secure.GLIconButton> */}

            <Secure.GLIconButton2
              permission="users_9_addGroup"
              uiText="generic_0_add"
              fallBackText="Add Group"
              onClick={handleOpenAdd}
              size="small"
            >
              <img src={publicUrl(`themes/${mode}/icons/plus.png`)} alt="add" />
            </Secure.GLIconButton2>
          </div>
        );
      },
      // getActions: (params) => {
      //   return [
      //     <Secure.GLIconButton2
      //       permission="users_9_editGroup"
      //       uiText="generic_0_edit"
      //       fallBackText="Edit Group"
      //       onClick={(e) => handleOpenEdit(e, params.row.group_id, params.row)}
      //       size="small"
      //     >
      //       <img src={publicUrl(`themes/${mode}/icons/pen.png`)} />
      //     </Secure.GLIconButton2>,

      //     <Secure.GLIconButton2
      //       permission="users_9_deleteGroup"
      //       uiText="generic_0_delete"
      //       fallBackText="Delete Group"
      //       onClick={handleOpenDelete(params.row.group_id)}
      //       size="small"
      //     >
      //       <img src={publicUrl(`themes/${mode}/icons/delete.png`)} />
      //     </Secure.GLIconButton2>,

      //     <Secure.GLIconButton2
      //       permission="users_9_viewGroup"
      //       uiText="generic_0_view"
      //       fallBackText="View Group"
      //       size="small"
      //     >
      //       <VisibilityIcon />
      //     </Secure.GLIconButton2>,
      //   ];
      // },
      renderCell: (params) => (
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={1}
          sx={{ height: "100%" }}
        >
          <Secure.GLIconButton2
            permission="users_9_editGroup"
            uiText="generic_0_edit"
            fallBackText="Edit Group"
            onClick={(e) => handleOpenEdit(e, params.row.group_id, params.row)}
            size="small"
          >
            <img src={publicUrl(`themes/${mode}/icons/pen.png`)} />
          </Secure.GLIconButton2>

          <Secure.GLIconButton2
            permission="users_9_deleteGroup"
            uiText="generic_0_delete"
            fallBackText="Delete Group"
            onClick={(e) => handleOpenDelete(e, params.row.group_id)}
            size="small"
          >
            <img src={publicUrl(`themes/${mode}/icons/delete.png`)} />
          </Secure.GLIconButton2>

          {/* <Secure.GLIconButton2
            permission="users_9_viewGroup"
            uiText="generic_0_view"
            fallBackText="View Group"
            size="small"
          >
            <VisibilityIcon />
          </Secure.GLIconButton2> */}
        </Stack>
      ),
    },
  ];

  useLayoutEffect(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  const hasFilters =
    firstSearchText !== "" ||
    secondSearchText !== "" ||
    selectedGroupOption !== null;

  return (
    <div className="container-fluid">
      {/* GlCustomTable Section */}
      <GlPanelTable
        filterSection={
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
            }}
          >
            {/* Search Section */}
            <Box
              sx={{
                flex: 4,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                gap: 2,
              }}
            >
              <Secure.GLTextField
                resource_key="usergroups_9_Group"
                variant="outlined"
                fullWidth
                id="Group_id_name_description"
                label={t("usergroups_9_Group") || "Group Id,Name, Description"}
                placeholder={
                  t("usergroups_9_Group") || "Group Id,Name, Description"
                }
                value={firstSearchText}
                onChange={handleFirstSearchChange}
                onKeyDown={handleKeyDownFirstSearch}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {firstSearchText && (
                        <IconButton
                          onClick={handleClearFirstSearch}
                          size="small"
                        >
                          <ClearIcon />
                        </IconButton>
                      )}
                      <IconButton onClick={handleFirstSearch} size="small">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Secure.GLTextField
                resource_key="usergroups_9_Menu"
                variant="outlined"
                fullWidth
                id="menuSearch"
                placeholder={t("usergroups_9_Menu") || "Menu Id,Name,Provider"}
                label={t("usergroups_9_Menu") || "Menu Id,Name,Provider"}
                value={secondSearchText}
                onChange={handleSecondSearchChange}
                onKeyDown={handleKeyDownSecondSearch}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {secondSearchText && (
                        <IconButton
                          onClick={handleClearSecondSearch}
                          size="small"
                        >
                          <ClearIcon />
                        </IconButton>
                      )}
                      <IconButton onClick={handleSecondSearch} size="small">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {groups && (
                <Autocomplete
                  id="groups"
                  value={selectedGroupOption || null}
                  inputValue={selectedGroupText || ""}
                  onInputChange={(event, newInputValue) => {
                    setSelectedGroupTextOption(
                      newInputValue ? newInputValue : "",
                    );
                  }}
                  options={groups.map((type) => ({
                    label: `${type.group_id} - ${type.group_name}`,
                    id: type.group_id,
                  }))}
                  onChange={(
                    event,
                    newValue: { label: string; id: number } | null,
                  ) => {
                    setSelectedGroupOption(newValue);
                    setSelectedGroupId(newValue?.id || null);
                    setApiParams((prev) => ({
                      ...prev,
                      group_id: newValue?.id || null,
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      placeholder={t("usergroups_9_Select") || "SELECT GROUP"}
                      label={t("usergroups_9_Select") || "SELECT GROUP"}
                      {...params}
                      fullWidth
                    />
                  )}
                  sx={{
                    width: "100%",
                  }}
                />
              )}
              {/* <Button
                variant="text"
                color="primary"
                startIcon={<RestartAltIcon fontSize="small" />}
                disabled={!hasFilters}
                onClick={() => {
                  handleClearFirstSearch();
                  handleClearSecondSearch();
                  setSelectedGroupOption(null);
                }}
                sx={{
                  minWidth: "auto",
                  px: 1,
                  fontSize: "0.8rem",
                  textTransform: "none",
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                  "& .MuiButton-startIcon": {
                    marginRight: "4px",
                    marginLeft: 0,
                  },
                }}
              >
                Reset
              </Button> */}
              <Secure.GLButton2
                permission="users_9_resetGroupsSearch"
                uiText="users_9_resetGroupsSearch"
                fallBackText="Reset"
                sx={{
                  minWidth: "auto",
                  px: 1,
                  fontSize: "0.8rem",
                  textTransform: "none",
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                  "& .MuiButton-startIcon": {
                    marginRight: "4px",
                    marginLeft: 0,
                  },
                }}
                variant="text"
                color="primary"
                startIcon={<RestartAltIcon fontSize="small" />}
                disabled={!hasFilters}
                onClick={() => {
                  handleClearFirstSearch();
                  handleClearSecondSearch();
                  setSelectedGroupOption(null);
                  setSelectedGroupId(null);
                }}
              />
            </Box>

            {/* Button Section */}
            <Box
              sx={{
                flex: 3,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "flex-end",
                // mb: 2,
                // bgcolor: (theme) =>
                //   theme.palette.mode === "light" ? "#fff" : grey[800],
                // maxHeight: "29px",
                // boxShadow: "4px 4px 8px #55c5d6 !important",
                // borderRadius: 1,
                // justifyContent: "space-between",
                // alignItems: "center",
                // border: 1,
                // borderColor: "#55c5d6 !important",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <Secure.GLExportButton
                  resource_key="usergroups_9_ExportAllGroups"
                  fileName="group"
                  tooltip={
                    t("usergroups_9_ExportAllGroups") || "Export All Groups"
                  }
                  fetchData={fetchAllGroups}
                />
                {/* <Tooltip title={t("usergroups_9_Import") || "Import Groups"}>
                  <Secure.GLIconButton
                    resource_key="usergroups_9_Import"
                    onClick={handleOpenUpload}
                  >
                    <GetAppRoundedIcon />
                  </Secure.GLIconButton>
                </Tooltip> */}

                <Secure.GLIconButton2
                  permission="users_9_importGroups"
                  uiText="users_9_importGroups"
                  fallBackText="Import Groups"
                  onClick={handleOpenUpload}
                  size="small"
                >
                  <GetAppRoundedIcon />
                </Secure.GLIconButton2>

                {/* <Tooltip title={t("usergroups_9_ImportLabel") || "Import"}>
                  <Secure.GLIconButton
                    resource_key="usergroups_9_ImportLabel"
                    onClick={handleOpenImport}
                  >
                    <GroupAddRoundedIcon />
                  </Secure.GLIconButton>
                </Tooltip> */}

                <Secure.GLIconButton2
                  permission="users_9_importLabel"
                  uiText="users_9_importLabel"
                  fallBackText="Import Labels"
                  onClick={handleOpenImport}
                  size="small"
                >
                  <GroupAddRoundedIcon />
                </Secure.GLIconButton2>
              </Box>
              {/* <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <CustomToolbar
                  title={t("usergroups_9_NewGroup") || "New Group"}
                  resourceKey="usergroups_9_NewGroup"
                  isFilterOn={false}
                  openForm={handleOpenAdd}
                  clickFilterOnHandler={() => {}}
                  disableAdd={false}
                />
              </Box> */}
            </Box>
          </Box>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", mb: "25px" }}>
          {/* <Secure.GlCustomTable
            resource_key="Groups_Table"
            url={apiUrl}
            params={apiParams}
            limit={limit}
            columns={columns}
            fetcher={fetcher}
            getRowId={(row) => row.group_id?.toString()}
            onRowSelected={handleRowSelected}
            handleDataChange={handleDataChange}
            refetchRef={refetchRef}
            enableKeyboardNavigation={true}
            autoSelectFirstRow={true}
            smallSize={false}
          /> */}

          <Secure.GLCustomTable2
            key={tableRefreshKey}
            permission="users_9_groupsTable"
            url={apiUrl}
            params={apiParams}
            page={tablePage}
            limit={limit}
            onPageChangeExternal={setTablePage}
            columns={columns.map((c: any) => ({
              ...c,
              resource_key: c.permission,
            }))}
            fetcher={fetcher}
            getRowId={(row) => row.group_id?.toString()}
            onRowSelected={(r) => handleRowSelected(r)}
            handleDataChange={handleDataChange}
            refetchRef={refetchRef}
            enableKeyboardNavigation={true}
            autoSelectFirstRow={true}
            smallSize
          />
        </Box>
      </GlPanelTable>
      {selectedGroup && (
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("usergroups_9_DetailsSettings") || "Details Settings"}
          </Typography>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <GroupUsers groupId={selectedGroup.group_id} />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <GroupMenuTree
                selectedFunctionId={selectedFunctionId}
                onMenuSelect={handleMenuSelect}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 5 }}>
              <GroupAuthorization
                groupId={selectedGroup.group_id}
                functionId={selectedFunctionId}
              />
            </Grid2>
          </Grid2>
        </Box>
      )}
      {/* Dialogs */}
      <GenericDialog
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          dispatch(clearError());
        }}
        title={t("usergroups_9_Edit") || "Edit Group"}
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
          <CustomGroupForm
            editId={editId as number}
            editRow={editRow}
            handleClose={() => {
              setOpenEdit(false);
              dispatch(clearError());
              if (refetchRef.current) {
                refetchRef.current();
              }
            }}
            error={error ? error : ""}
            isNew={false}
            formschema={groupSchema}
          />
        }
      />

      <GenericDialog
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          dispatch(clearError());
        }}
        title={t("usergroups_9_Add") || "Add Group"}
        icon={
          <PersonAddIcon
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
          <CustomGroupForm
            editId={0}
            handleClose={() => {
              setOpenAdd(false);
              dispatch(clearError());
              setTablePage(1);
              setTableRefreshKey((k) => k + 1);
              if (refetchRef.current) {
                refetchRef.current();
              }
              dispatch(fetchUserGroups());
            }}
            error={error ? error : ""}
            isNew={true}
            editRow={initialValues}
            formschema={groupSchema}
          />
        }
      />

      <GenericDialog
        open={openUpload}
        onClose={() => {
          setOpenUpload(false);
          dispatch(clearError());
        }}
        title={t("usergroups_9_Import") || "Import Groups"}
        icon={
          <PersonAddIcon
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
          <FileUploaderWithCols
            action={uploadGroups}
            handleClose={() => {
              setOpenUpload(false);
              dispatch(clearError());
              if (refetchRef.current) {
                refetchRef.current();
              }
            }}
            label={t("usergroups_9_UploadGroups") || "Upload Groups"}
            title={t("usergroups_9_UploadGroups") || "Upload Groups"}
            error={error}
            btnLabel={t("usergroups_9_Cancel") || "Cancel"}
            uploadBtnLabel={t("usergroups_9_Choose") || "Choose Excel File"}
            columnsToRead={[
              "group_name",
              "description",
              "auth_provider_group",
              "menu_id",
            ]}
          />
        }
      />

      <GenericDialog
        open={openImport}
        onClose={() => {
          setOpenImport(false);
          dispatch(clearError());
        }}
        title={
          t("usergroups_9_ImportGroups") ||
          "Import Groups from Active Directory"
        }
        icon={
          <PersonAddIcon
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
          <ImportGroups
            handleClose={() => {
              setOpenImport(false);
              dispatch(clearError());
              if (refetchRef.current) {
                refetchRef.current();
              }
            }}
          />
        }
      // maxWidth="md"
      // sx={{
      //   "&  .MuiDialog-paper": {
      //     minWidth: "30vw",
      //     maxWidth: "40vw",
      //   },
      // }}
      />

      {/* <ConfirmDeleteDialog
        open={openDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteClick}
        title={t("usergroups_9_ConfirmDelete") || "Confirm to delete"}
        message={
          t("usergroups_9_ConfirmDelete") ||
          "Are you sure you want to delete this Group?"
        }
        errorMsg={error || null}
      /> */}
      <DisplayMsgDialog
        open={openDelete}
        onClose={handleCloseDeleteDialog}
        getResource={false}
        status="DELETE"
        actionLabel="Delete"
        onAction={handleDeleteClick}
        children={
          <Typography>Are you sure you want to delete this Group ?</Typography>
        }
        actionColor="error"
      />
    </div>
  );
};
