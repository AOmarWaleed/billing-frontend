import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  Tooltip,
  useTheme,
  TextField,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import "../../../assets/css/Style.css";
import { useState, useEffect, useMemo, useContext, useRef } from "react";
import React from "react";
import { grey } from "@mui/material/colors";
import { GridColDef, GridRowId } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import {
  fetchUsers,
  setPage,
  clearError,
  deleteUser,
  fetchGroups,
} from "../../../redux/slices/userSlice";
import {
  setSelectedItem,
  uploadUsers,
  setLimit,
} from "../../../redux/slices/userSlice";
import { User } from "../../../types/User";
import { Group } from "../../../types/Group";
import { SelectOption } from "../../../types/SelectOpion";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { publicUrl } from "../../../utils/publicUrl";
import useStyles from "../../../assets/css/useStyles";
import {
  updateActiveStatus,
  updateLockedStatus,
} from "../components/UserDataGrideHandlers";
import ExportButton from "../../../components/exportButton/ExportButtonV2";
import GenericDialog from "../../../components/genericDialog/GenericDialog";
import userSchema from "../../../models/userSchema";
import CustomUserForm from "./CustomUserForm";
import FileUploaderWithCols from "../../../components/fileUploader/FileUploaderWithColsV2";
import userUpdateSchema from "../../../models/userUpdateSchema";
import ConfirmDeleteDialog from "../../../components/deleteDialog/ConfirmDeleteDialog";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import {
  GlPanelTable,
  GlCustomTable,
  DisplayMsgDialog,
  Secure as GalaxySecure,
} from "@givc/shared-components";
import Secure from "../../../shared/security";
import GlCustomTableSecure from "../../../shared/security/GLCustomTable";
import { fetcher } from "../../../utils/Api";
import api from "../../../utils/Api";
import { mutate } from "swr";
import { apiUtility } from "../../../utils/apiUtility";
import UserFacilitySection, { GLGridColDef } from "./UserFacilitySection";
import { useDebounce } from "../../../redux/hooks/useDebounce";

type CustomGridColDef = GridColDef & {
  id?: string;
  name?: string;
  resource_key: string;
};

export const UserDataGride = () => {
  const classes = useStyles();
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const {
    users,
    groups,
    active,
    notActive,
    locked,
    notLocked,
    page,
    limit,
    totalPages,
    error,
  } = useAppSelector((state) => state.users);

  const initialValues = {
    user_name: "",
    first_name: "",
    middle_name: "",
    family_name: "",
    group_id: "",
    password_expiry_date: "",
    employee_id: "",
    email: "",
    password: "",
    confirm_password: "",
  };

  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  // const [tablePage, setTablePage] = useState(1);
  const [tableRefreshKey, setTableRefreshKey] = useState(0);
  const [currentPageData, setCurrentPageData] = useState<any[]>([]);

  // Sort tracking
  // const [sortField, setSortField] = useState<string>("user_id");
  // const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);

  if (!ctx) {
    // Option 1: render nothing
    return null;

    // Option 2: or render a simple fallback / loader
    // return <div>Loading permissions...</div>;
  }

  const { resourcesData, t, userLang } = ctx;

  const columns = useMemo(
    (): GLGridColDef[] => [
      {
        field: "user_id",
        permission: "users_9_userId",
        uiText: "users_9_userId",
        headerName: "USER ID",
        flex: 2,
        type: "number",
        align: "left",
        headerAlign: "left",
      },
      {
        field: "user_name",
        permission: "users_9_userName",
        uiText: "generic_0_userName",
        headerName: "USER NAME",
        flex: 4,
        filterable: true,
      },
      {
        field: "full_name",
        permission: "users_9_fullName",
        uiText: "generic_0_fullName",
        headerName: "FULL NAME",
        flex: 4,
        filterable: true,
        // renderCell(params) {
        //   const { first_name, middle_name, family_name } = params.row;
        //   const fullName = [first_name, middle_name, family_name]
        //     .filter(Boolean)
        //     .join(" ");
        //   return <span>{fullName}</span>;
        // },
      },
      {
        field: "employee_id",
        permission: "users_9_employeeId",
        uiText: "users_9_employeeId",
        headerName: "EMPLOYEE ID",
        flex: 2,
        filterable: true,
      },
      {
        field: "group_name",
        permission: "users_9_groupNameUsersTab",
        uiText: "users_9_groupNameUsersTab",
        headerName: "GROUP NAME",
        flex: 4,
        filterable: true,
      },
      {
        field: "active",
        permission: "users_9_activeState",
        uiText: "users_9_activeState",
        headerName: "ACTIVE STATE",
        flex: 2,
        sortable: false,
        filterable: true,
        renderCell: (params) => (
          <Box
            display="flex"
            width="100%"
            alignItems="center"
            justifyContent="center"
          >
            <Switch
              checked={params.row.active === "Y"}
              onChange={(event) => {
                const newActiveStatus = params.row.active === "Y" ? "N" : "Y";
                updateActiveStatus(
                  dispatch,
                  params.row.user_id,
                  newActiveStatus,
                );
                mutate((event) => apiUtility(event, "/usersetup/new"));
                usersRefetchRef.current?.();
              }}
              inputProps={{ "aria-label": "controlled" }}
              color="success"
              size="small"
            />
            {/* <span>
              {params.row.active === "Y"
                ? t("usersetup_9_Active") || "Active"
                : t("usersetup_9_Inactive") || "Inactive"}
            </span> */}
          </Box>
        ),
      },
      {
        field: "locked",
        permission: "users_9_lockedState",
        uiText: "users_9_lockedState",
        headerName: "LOCKED STATE",
        flex: 2,
        sortable: false,
        filterable: true,
        renderCell: (params) =>
          params.row.locked === "N" ? (
            <Box
              sx={{
                width: "100%",
                // height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <GalaxySecure.GLTypography2
                permission="users_9_unlockedState"
                uiText="generic_0_unlocked"
                fallBackText="Unlocked"
                sx={{
                  border: "0",
                  borderRadius: "4px",
                  height: "25px",
                  width: "90px",
                  padding: "0 10px",
                  bgcolor: "#43a047",
                  color: "#ffffff",
                  textAlign: "center",
                  fontSize: "0.7rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  updateLockedStatus(dispatch, params.row.user_id, "Y");
                  mutate((e) => apiUtility(e, "/usersetup/new"));
                  usersRefetchRef.current?.();
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                // height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* <Chip
                label={t("usersetup_9_Locked") || "Locked"}
                variant="outlined"
                sx={{
                  bgcolor: "#9e9e9e",
                  color: "#ffffff",
                  border: "0",
                  borderRadius: "4px",
                  height: "25px",
                  width: "90px",
                  padding: "0 10px",
                }}
                icon={<LockIcon />}
                onClick={(e) => {
                  updateLockedStatus(dispatch, params.row.user_id, "N");
                  mutate((e) => apiUtility(e, "/usersetup/new"));
                  usersRefetchRef.current?.();
                }}
                size="small"
              /> */}
              <GalaxySecure.GLTypography2
                permission="usersetup_9_Locked"
                uiText="generic_0_locked"
                fallBackText="Locked"
                sx={{
                  bgcolor: "#9e9e9e",
                  color: "#ffffff",
                  border: "0",
                  borderRadius: "4px",
                  height: "25px",
                  fontSize: "0.7rem",
                  width: "90px",
                  padding: "0 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={(e) => {
                  updateLockedStatus(dispatch, params.row.user_id, "N");
                  mutate((e) => apiUtility(e, "/usersetup/new"));
                  usersRefetchRef.current?.();
                }}
              >
                <LockIcon />
                {t("usersetup_9_Locked") || "Locked"}
              </GalaxySecure.GLTypography2>
            </Box>
          ),
      },
      {
        field: "actions",
        permission: "users_9_userActions",
        uiText: "generic_0_actions",
        headerName: "ACTIONS",
        sortable: false,
        type: "custom",
        headerClassName: "super-app-theme--header",
        headerAlign: "left",
        width: 180,
        filterable: false,
        cellClassName: "actions",
        disableColumnMenu: true,
        hideSortIcons: true,
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
            {/* <Secure.GLIconButton
              resource_key="usersetup_9_NewUser"
              title={t("usersetup_9_NewUser") || "New User"}
              size="small"
              onClick={handleOpenAdd}
            >
              <img
                src={publicUrl(`themes/${theme.palette.mode}/icons/plus.png`)}
                width="15px"
              />
            </Secure.GLIconButton> */}
            <GalaxySecure.GLIconButton2
              permission="users_9_addUser"
              uiText="generic_0_add"
              fallBackText="Add User"
              onClick={handleOpenAdd}
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
              permission="users_9_editUser"
              uiText="generic_0_edit"
              fallBackText="Edit User"
              onClick={(e) => handleOpenEdit(e, params.row.user_id, params.row)}
              size="small"
            >
              <img
                src={publicUrl(`themes/${theme.palette.mode}/icons/pen.png`)}
                alt="Edit"
              />
            </GalaxySecure.GLIconButton2>

            <GalaxySecure.GLIconButton2
              permission="users_9_deleteUser"
              uiText="generic_0_delete"
              fallBackText="Delete User"
              onClick={(e) => handleOpenDelete(e, params.row.user_id)}
              size="small"
            >
              <img
                src={publicUrl(`themes/${theme.palette.mode}/icons/delete.png`)}
                alt="Delete"
              />
            </GalaxySecure.GLIconButton2>

            {/* <GalaxySecure.GLIconButton2
              permission="users_9_viewUser"
              uiText="generic_0_view"
              fallBackText="View User"
              // sx={{ pad
              // ding: "5px" }}
              size="small"
            >
              <VisibilityIcon />
            </GalaxySecure.GLIconButton2> */}
          </Stack>
        ),
      },
    ],
    [userLang, t],
  );

  const handleOpenAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsNew(true);
    setOpenAdd(true);
    dispatch(clearError());
  };

  const handleOpenEdit = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: number,
    editRow: any,
  ) => {
    e.stopPropagation();
    setIsNew(false);
    setEditId(id);
    setEditRow(editRow);
    setOpenEdit(true);
    dispatch(clearError());
  };

  const handleOpenUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpenUpload(true);
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

  const handleCloseAddDialog = () => {
    setOpenAdd(false);
    dispatch(clearError());
  };

  const handleDeleteClick = async () => {
    try {
      await dispatch(deleteUser({ id: deleteId }))
        .unwrap()
        .then(() => {
          setOpenDelete(false);
          mutate((e) => apiUtility(e, "/usersetup/new"));
          usersRefetchRef.current?.();

          // if (currentPageData.length === 1 && tablePage > 1) {
          //   setTablePage(1);
          //   setTableRefreshKey((current) => current + 1);
          // } else {
          //   usersRefetchRef.current?.();
          // }
        });
    } catch (error: any) {
      throw error;
    }
  };

  const [isNew, setIsNew] = useState(false);
  const [selectedGroupText, setSelectedGroupTextOption] = useState<string>();
  const [selectedGroupOption, setSelectedGroupOption] = useState<Group | null>(
    null,
  );
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>();
  const [groupOptions, setGroupOptions] = useState<SelectOption[] | null>(null);
  const selectedUser = useSelector(
    (state: RootState) => state.users.selectedItem,
  );

  const [editId, setEditId] = useState<GridRowId | null>(null);
  const [editRow, setEditRow] = useState<{
    user_name: string;
    first_name: string;
    middle_name: string;
    family_name: string;
    group_id: number;
    password_expiry_date: Date;
    employee_id: number;
    email: string;
    password: string;
    confirm_password: string;
  }>({
    user_name: "",
    first_name: "",
    middle_name: "",
    family_name: "",
    group_id: "",
    password_expiry_date: "",
    employee_id: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [deleteId, setDeleteId] = useState<GridRowId | null>(null);

  const [firstSearchText, setFirstSearchText] = useState("");
  const [secondSearchText, setSecondSearchText] = useState("");

  const [state, setState] = React.useState({
    checkedActive: true,
    checkedNotActive: true,
    checkedLocked: true,
    checkedUnLocked: true,
  });

  type StateKeys =
    | "checkedActive"
    | "checkedNotActive"
    | "checkedLocked"
    | "checkedUnLocked";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const key = name as StateKeys;
    setState((prevstate) => ({
      ...prevstate,
      [key]: checked,
    }));
  };

  // Search handlers
  const handleFirstSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setFirstSearchText(value);
    if (value === "") {
      handleClearFirstSearch();
    }
  };

  const handleKeyDownFirstSearch = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleFirstSearch();
    }
  };

  const handleFirstSearch = () => {
    setFirstSearchText(firstSearchText);
  };

  const handleClearFirstSearch = () => {
    setFirstSearchText("");
  };

  const handleSecondSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setSecondSearchText(value);
    if (value === "") {
      handleClearSecondSearch();
    }
  };

  const handleKeyDownSecondSearch = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleSecondSearch();
    }
  };

  const handleSecondSearch = () => {
    setSecondSearchText(secondSearchText);
  };

  const handleClearSecondSearch = () => {
    setSecondSearchText("");
  };

  const usersRefetchRef = useRef<(() => void) | null>(null);

  // Fetch all users for export
  const fetchAllUsers = async (): Promise<any[]> => {
    try {
      const response = await api.get(`/usersetup/export`, {
        params: {
          active: state.checkedActive ? "Y" : null,
          notActive: state.checkedNotActive ? "N" : null,
          locked: state.checkedLocked ? "Y" : null,
          notLocked: state.checkedUnLocked ? "N" : null,
          searchGroupOne: firstSearchText,
          searchGroupTwo: secondSearchText,
          group_id: selectedGroupId || null,
          // sortBy: sortField,
          // sortDirection: sortDirection,
        },
      });
      return response.data.usersdata;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred while fetching users.";
      throw new Error(message);
    }
  };

  const debouncedFirstSearchQuery = useDebounce(firstSearchText);
  const debouncedSecondSearchQuery = useDebounce(secondSearchText);

  // Create table params for GlCustomTable
  const tableParams = useMemo(() => {
    const params: any = {};

    // Active/Inactive filters - send the actual values being filtered
    params.active = state.checkedActive ? "Y" : null;
    params.notActive = state.checkedNotActive ? "N" : null;
    params.locked = state.checkedLocked ? "Y" : null;
    params.notLocked = state.checkedUnLocked ? "N" : null;

    if (debouncedFirstSearchQuery)
      params.searchGroupOne = debouncedFirstSearchQuery;
    if (debouncedSecondSearchQuery)
      params.searchGroupTwo = debouncedSecondSearchQuery;
    if (selectedGroupId) params.group_id = selectedGroupId;
    // if (sortField) params.sortBy = sortField;
    // if (sortDirection) params.sortDirection = sortDirection;

    return params;
  }, [
    state.checkedActive,
    state.checkedNotActive,
    state.checkedLocked,
    state.checkedUnLocked,
    debouncedFirstSearchQuery,
    debouncedSecondSearchQuery,
    selectedGroupId,
    // sortField,
    // sortDirection,
  ]);

  useEffect(() => {
    dispatch(setSelectedItem(null));
  }, [tableParams, dispatch]);

  const handleUserTableDataChange = (rows: any[]) => {
    setCurrentPageData(rows);
    if (rows.length === 0) {
      dispatch(setSelectedItem(null));
    }
  };

  // Fetch groups for dropdown
  useEffect(() => {
    if (groups) {
      const tempGroups = groups.map((type) => ({
        label: `${type.group_id} - ${type.group_name}`,
        id: type.group_id,
      }));
      setGroupOptions(tempGroups);
    }
  }, [groups]);

  const hasFilters =
    firstSearchText !== "" ||
    secondSearchText !== "" ||
    selectedGroupOption !== null;

  return (
    <div className="container-fluid">
      {/* Data Grid Section  */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <GlPanelTable
          filterSection={
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 1,
                alignItems: "center",
                alignContent: "center",
                justifyContent: "flex-start",
              }}
            >
              {/* Search Section */}
              <Box
                sx={{
                  flex: 8,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  gap: 2,
                  mr: 2,
                  // pr: 2,
                  // mb: 4,
                }}
              >
                <GalaxySecure.GLTextField
                  resource_key="usersetup_9_SearchByIdUsername"
                  variant="outlined"
                  fullWidth
                  id="185"
                  data-id="185"
                  name="User-Id-Name-Group-Search"
                  label={
                    t("usersetup_9_SearchByIdUsername") ||
                    "Search by Id,User Name"
                  }
                  placeholder={
                    t("usersetup_9_SearchByIdUsername") ||
                    "Search by Id,User Name"
                  }
                  value={firstSearchText}
                  onChange={handleFirstSearchChange}
                  onKeyDown={handleKeyDownFirstSearch}
                  type="search"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleFirstSearch} size="small">
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <GalaxySecure.GLTextField
                  resource_key="usersetup_9_SearchByEmployeeName"
                  fullWidth
                  id="186"
                  data-id="186"
                  name="employeeSearch"
                  label={
                    t("usersetup_9_SearchByEmployeeName") ||
                    "Search by Employee Name"
                  }
                  placeholder={
                    t("usersetup_9_SearchByEmployeeName") ||
                    "Search by Employee ID, Name"
                  }
                  variant="outlined"
                  type="search"
                  value={secondSearchText}
                  onChange={handleSecondSearchChange}
                  onKeyDown={handleKeyDownSecondSearch}
                  // InputProps={{
                  //   endAdornment: (
                  //     <InputAdornment position="end">
                  //       {secondSearchText && (
                  //         <IconButton
                  //           onClick={handleClearSecondSearch}
                  //           size="small"
                  //         >
                  //           <ClearIcon />
                  //         </IconButton>
                  //       )}
                  //       <IconButton onClick={handleSecondSearch} size="small">
                  //         <SearchIcon />
                  //       </IconButton>
                  //     </InputAdornment>
                  //   ),
                  // }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleSecondSearch} size="small">
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                {groups && (
                  <Secure.GLAutocomplete
                    resource_key="usersetup_9_SelectGroup" // This needs to be checked as the label is ambigous to me FINDME AMER
                    id="187"
                    value={selectedGroupOption || null}
                    inputValue={selectedGroupText || ""}
                    onInputChange={(event, newInputValue) => {
                      setSelectedGroupTextOption(
                        newInputValue ? newInputValue : "",
                      );
                    }}
                    options={groupOptions}
                    onChange={(
                      event,
                      newValue: { label: string; id: number } | null,
                    ) => {
                      setSelectedGroupOption(newValue);
                      setSelectedGroupId(newValue?.id);
                    }}
                    renderInput={(params) => (
                      <TextField
                        placeholder={
                          t("usersetup_9_SelectGroup") || "SELECT GROUP"
                        }
                        label={t("usersetup_9_SelectGroup") || "SELECT GROUP"}
                        {...params}
                        fullWidth
                      />
                    )}
                    sx={{
                      width: "100%",
                      // mr: "10px",
                      // borderRadius: 2,
                      // boxShadow: "4px 4px 8px #55c5d6 !important",
                      // alignSelf: "center",
                      // "& input": { padding: "7px 10px !important" },
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
                <GalaxySecure.GLButton2
                  permission="users_9_resetUsersSearch"
                  uiText="users_9_resetUsersSearch"
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
                    "& .MuiButton-root": {
                      height: "100%",
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

              {/* Checkbox Section */}
              <Box
                sx={{
                  flex: 2,
                  display: "flex",
                  flexDirection: "row",
                  gap: 2,

                  // paddingLeft: 2,
                  // paddingRight: 2,
                  // mr: 2,
                  // mb: 1,
                  // maxHeight: "30px",
                  // boxShadow: "4px 4px 8px #55c5d6 !important",
                  // bgcolor: (theme) =>
                  //   theme.palette.mode === "light" ? "#fff" : grey[800],
                  // borderRadius: 1,
                  // border: 1,
                  // borderColor: "#55c5d6 !important",
                }}
              >
                {/* <Secure.GLFormControlLabel
                  resource_key="usersetup_9_Active"
                  control={
                    <Checkbox
                      sx={{ p: 0.5 }}
                      checked={state.checkedActive}
                      onChange={handleChange}
                      name="checkedActive"
                      color="success"
                    />
                  }
                  name="checkedActiveLbl"
                  id="172"
                  data-id="172"
                /> */}
                <GalaxySecure.GLSecureInputs.Checkbox
                  permission="users_9_activeCheckbox"
                  uiText="generic_0_active"
                  label="Active"
                  sx={{ p: 0.5 }}
                  checked={state.checkedActive}
                  onChange={handleChange}
                  name="checkedActive"
                  color="success"
                />

                {/* <Secure.GLFormControlLabel
                  resource_key="usersetup_9_InactiveLabel"
                  control={
                    <Checkbox
                      sx={{ p: 0.5 }}
                      checked={state.checkedNotActive}
                      onChange={handleChange}
                      name="checkedNotActive"
                      color="success"
                    />
                  }
                  name="checkedNotActiveLbl"
                  id="176"
                  data-id="176"
                /> */}

                <GalaxySecure.GLSecureInputs.Checkbox
                  permission="users_9_inActiveCheckbox"
                  uiText="generic_0_inactive"
                  label="Inactive"
                  sx={{ p: 0.5 }}
                  checked={state.checkedNotActive}
                  onChange={handleChange}
                  name="checkedNotActive"
                  color="success"
                />

                {/* <Secure.GLFormControlLabel
                  resource_key="usersetup_9_LockedLabel"
                  control={
                    <Checkbox
                      sx={{ p: 0.5 }}
                      checked={state.checkedLocked}
                      onChange={handleChange}
                      name="checkedLocked"
                      color="success"
                    />
                  }
                  name="checkedLockedLbl"
                  id="175"
                  data-id="175"
                /> */}

                <GalaxySecure.GLSecureInputs.Checkbox
                  permission="users_9_lockedCheckbox"
                  uiText="generic_0_locked"
                  label="Locked"
                  sx={{ p: 0.5 }}
                  checked={state.checkedLocked}
                  onChange={handleChange}
                  name="checkedLocked"
                  color="success"
                />

                {/* <Secure.GLFormControlLabel
                  resource_key="usersetup_9_UnlockedLabel"
                  control={
                    <Checkbox
                      sx={{ p: 0.5 }}
                      checked={state.checkedUnLocked}
                      onChange={handleChange}
                      name="checkedUnLocked"
                      color="success"
                    />
                  }
                  name="checkedUnLockedLbl"
                  id="177"
                  data-id="177"
                /> */}

                <GalaxySecure.GLSecureInputs.Checkbox
                  permission="users_9_unlockedCheckbox"
                  uiText="generic_0_unlocked"
                  label="Unlocked"
                  sx={{ p: 0.5 }}
                  checked={state.checkedUnLocked}
                  onChange={handleChange}
                  name="checkedUnLocked"
                  color="success"
                />
              </Box>

              {/* Button Section */}
              <Box
                sx={{
                  flex: 3,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  // mb: 1,
                  // bgcolor: (theme) =>
                  //   theme.palette.mode === "light" ? "#fff" : grey[800],
                  // maxHeight: "30px",
                  // boxShadow: "4px 4px 8px #55c5d6 !important",
                  // borderRadius: 1,
                  justifyContent: "flex-end",
                  alignItems: "center",
                  // border: 1,
                  // borderColor: "#55c5d6 !important",
                }}
              >
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Secure.GLExportButton
                    resource_key="usersetup_9_ExportAll"
                    fileName="user"
                    tooltip={t("usersetup_9_ExportAll") || "Export All Users"}
                    fetchData={fetchAllUsers}
                  />
                  {/* <Secure.GLIconButton
                    onClick={handleOpenUpload}
                    resource_key="usersetup_9_ImportUsers"
                  >
                    <Tooltip
                      title={t("usersetup_9_ImportUsers") || "Import Users"}
                    >
                      <GetAppRoundedIcon />
                    </Tooltip>
                  </Secure.GLIconButton> */}
                  <GalaxySecure.GLIconButton2
                    permission="users_9_importUsers"
                    uiText="users_9_importUsers"
                    fallBackText="Import Users"
                    onClick={handleOpenUpload}
                    size="small"
                  >
                    <GetAppRoundedIcon />
                  </GalaxySecure.GLIconButton2>
                </div>
              </Box>
            </Box>
          }
        >
          {/* <Secure.GlCustomTable
            resource_key="usersetup_9_UsersTable"
            key={JSON.stringify(tableParams)}
            getRowId={(r) => r.user_id?.toString()}
            columns={columns}
            fetcher={fetcher}
            url="/usersetup/new"
            params={tableParams}
            onRowSelected={(r: any) => r && dispatch(setSelectedItem(r))}
            limit={limit}
            enableKeyboardNavigation={true}
            autoSelectFirstRow={true}
          /> */}

          <GalaxySecure.GLCustomTable2
            permission="users_9_usersTable"
            key={`${JSON.stringify(tableParams)}-${tableRefreshKey}`}
            getRowId={(r) => r.user_id?.toString()}
            columns={columns}
            fetcher={fetcher}
            refetchRef={usersRefetchRef}
            url="/usersetup/new"
            params={tableParams}
            // page={tablePage}
            // onPageChangeExternal={setTablePage}
            handleDataChange={handleUserTableDataChange}
            onRowSelected={(r: any) => r && dispatch(setSelectedItem(r))}
            limit={5}
            enableKeyboardNavigation={true}
            autoSelectFirstRow={true}
            smallSize
          />
        </GlPanelTable>
      </Box>

      {/* Edit User Dialog */}
      <GenericDialog
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          dispatch(clearError());
        }}
        title={t("usersetup_9_UpdateUser") || "Update User"}
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
          <CustomUserForm
            editId={editId as number}
            editRow={editRow}
            handleClose={() => {
              setOpenEdit(false);
              dispatch(clearError());
            }}
            error={error ? error : ""}
            isNew={false}
            formschema={userUpdateSchema}
            usersRefetchRef={usersRefetchRef}
          />
        }
      />

      {/* Add User Dialog */}
      <GenericDialog
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          dispatch(clearError());
        }}
        title={t("usersetup_9_AddUser") || "Add User"}
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
          <CustomUserForm
            editId={0}
            editRow={initialValues}
            handleClose={() => {
              setOpenAdd(false);
              dispatch(clearError());
              setTableRefreshKey((k) => k + 1);
            }}
            error={error ? error : ""}
            isNew={true}
            formschema={userSchema}
            usersRefetchRef={usersRefetchRef}
          />
        }
      />

      {/* Upload Users Dialog */}
      <GenericDialog
        open={openUpload}
        onClose={() => {
          setOpenUpload(false);
          dispatch(clearError());
        }}
        title={t("usersetup_9_ImportUsers") || "Import Users"}
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
            action={uploadUsers}
            handleClose={() => {
              setOpenUpload(false);
              dispatch(clearError());
            }}
            label={t("usersetup_9_UploadUsers") || "Upload Users"}
            title={t("usersetup_9_UploadUsers") || "Upload Users"}
            error={error}
            btnLabel={t("usersetup_9_Cancel") || "Cancel"}
            uploadBtnLabel={t("usersetup_9_Choose") || "Choose Excel File"}
            columnsToRead={[
              "employee_id",
              "user_name",
              "first_name",
              "middle_name",
              "family_name",
              "password_expirty_date",
              "prefered_language",
              "email",
              "group_id",
              "active",
              "locked",
              "password",
            ]}
          />
        }
      />

      {/* Delete Confirmation Dialog */}
      {/* <ConfirmDeleteDialog
        open={openDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteClick}
        title={t("usersetup_9_ConfirmDelete") || "Confirm to delete"}
        message={
          t("usersetup_9_DeleteConfirmation") ||
          "Are you sure you want to delete this USER?"
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
          t("usersetup_9_DeleteConfirmation") ||
          "Are you sure you want to delete this USER?"
        }
        actionColor="error"
      />

      {selectedUser && (
        <Box mt={2} borderTop="1px solid #ccc">
          <UserFacilitySection userId={selectedUser.user_id} />
        </Box>
      )}
    </div>
  );
};
