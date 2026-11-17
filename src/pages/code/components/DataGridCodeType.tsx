import {
  GridToolbar,
  GridPaginationModel,
  GridColDef,
  GridRowModesModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import * as React from "react";
import { publicUrl } from "../../../utils/publicUrl";
import { useState, useRef, useEffect, useMemo, ChangeEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCodeTypes,
  deleteCodeType,
  fetchTypes,
  setPage,
  setSortField,
  setSortOrder,
  setLimit,
  setCodeTypes,
} from "../../../redux/slices/CodeTypeSlice";
import { setPage as setCodeDataPage } from "../../../redux/slices/CodeDataSlice";
import {
  setSelectedItem,
  clearError,
} from "../../../redux/slices/CodeTypeSlice";
import { useDebounce } from "../../../redux/hooks/useDebounce";
import { CodeTypeData } from "../../../types/CodeTypeData";
import { RootState, AppDispatch } from "../../../redux/store";
import {
  Box,
  IconButton,
  SelectChangeEvent,
  Stack,
  TextField,
  InputAdornment,
  useTheme,
  Tooltip,
} from "@mui/material";
import { GridRowModes } from "@mui/x-data-grid";
import { CodeTypeDTO } from "../../../types/CodeTypeDTO";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear"; // Import Clear icon
import ConfirmDeleteDialog from "../../../components/deleteDialog/ConfirmDeleteDialog";
import { TypeList } from "../../../types/TypeList";
import CustomFormCodeType from "./CustomFormCodeType";
import GenericDialog from "../../../components/genericDialog/GenericDialog";
import { useGridApiRef } from "@mui/x-data-grid";
import GlPanelTable from "../../../shared/tables/GlPanelTable";
import GlCustomTable from "../../../shared/tables/GlCustomTable";
import { mutate } from "swr";
import { apiUtility } from "../../../utils/apiUtility";
import { useTranslation } from "react-i18next";
import CustomRowCodeType from "./CustomRowCodetype";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";
import { DisplayMsgDialog, Secure as GalaxySecure } from "@givc/shared-components";
import { fetcher } from "../../../utils/Api";
import { GLGridColDef } from "../../users/components/UserFacilitySection";

const DataGridCodeType = () => {
  const {
    palette: { mode },
  } = useTheme();
  const initialData: CodeTypeDTO = {
    code_type: null,
    description: "",
    linked_type: null,
  };
  const initialLinkedData: TypeList = {
    code_type: 0,
    description: "",
  };
  const [data, setData] = useState<CodeTypeDTO>(initialData);
  const [linkedData, setLinkedData] = useState<TypeList>(initialLinkedData);
  const errRef = useRef<HTMLElement | null>(null);
  const [errMsg, setErrMsg] = useState<String>("");
  const error = useSelector((state: RootState) => state.codetypes.error);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  // Role Action
  const [rowId, setRowId] = useState<number[] | null>(null);
  const [row, setRow] = useState<CodeTypeData[] | null>();
  const [rows, setRows] = React.useState<CodeTypeData[]>();
  // const [rowModesModel, setRowModesModel] = React.useState({});
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const codetypes = useSelector(
    (state: RootState) => state.codetypes.codetypes,
  );
  const selectedItem = useSelector(
    (state: RootState) => state.codetypes.selectedItem,
  );
  const totalPages = useSelector(
    (state: RootState) => state.codetypes.totalPages,
  );
  const page = useSelector((state: RootState) => state.codetypes.page);
  const limit = useSelector((state: RootState) => state.codetypes.limit);
  const sortField = useSelector(
    (state: RootState) => state.codetypes.sortField,
  );
  const sortOrder = useSelector(
    (state: RootState) => state.codetypes.sortOrder,
  );
  const codetypestatus = useSelector(
    (state: RootState) => state.codetypes.status,
  );
  const codeType = useSelector(
    (state: RootState) => state.codetypes.selectedItemId,
  );
  const selectedCodeType = useSelector(
    (state: RootState) => state.codetypes.selectedItem,
  );
  const types = useSelector((state: RootState) => state.codetypes.types);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 13,
  }); // Default pagination model

  const [isNewRow, setIsNewRow] = useState(false);
  const [quickSearchText, setQuickSearchText] = useState("");
  const debouncedQuickSearchText = useDebounce(quickSearchText, 500);

  const tableParams = useMemo(() => {
    return {
      quickSearchText: debouncedQuickSearchText,
    };
  }, [debouncedQuickSearchText]);
  const [sortOrderType, setSortOrderType] = useState("asc");
  const [sortOrderDesc, setSortOrderDesc] = useState("asc");
  const [sortOrderDate, setSortOrderDate] = useState("asc");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);
  const apiRef = useGridApiRef();
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(
    null,
  );

  const codeTypesRef = useRef<() => void | null>(null);

  //==================  * Resources * ===================

  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;

  //Open delete dialog
  const openDialog = (id: string) => () => {
    dispatch(clearError());
    setDeleteId(id);
    setDialogOpen(true);
  };
  //close delete dialog
  const closeDialog = () => {
    dispatch(clearError());
    setDialogOpen(false);
    setDeleteId(null);
  };
  //handle change textfield and select
  const handleChange = (
    event: ChangeEvent<HTMLInputElement> | SelectChangeEvent<number>,
  ) => {
    const { name, value } = event.target;
    if (name) {
      setData({ ...data, [name]: value });
    }
  };

  //sort code type data grid
  const sortBy = (field: string, order: string) => {
    dispatch(
      fetchCodeTypes({
        page: 1,
        limit: 14,
        sortField: field,
        sortOrder: order,
        searchField: debouncedQuickSearchText,
      }),
    );
  };

  const toggleSortOrderType = () => {
    const newOrder = sortOrderType === "asc" ? "desc" : "asc";
    setSortOrderType(newOrder);
    sortBy("code_type", newOrder);
    dispatch(setSortField("code_type"));
    dispatch(setSortOrder(newOrder));
  };

  const toggleSortOrderDesc = () => {
    const newOrder = sortOrderDesc === "asc" ? "desc" : "asc";
    setSortOrderDesc(newOrder);
    sortBy("description", newOrder);
    dispatch(setSortField("description"));
    dispatch(setSortOrder(newOrder));
  };
  const toggleSortOrderDate = () => {
    const newOrder = sortOrderDate === "asc" ? "desc" : "asc";
    setSortOrderDate(newOrder);
    sortBy("creation_date", newOrder);
    dispatch(setSortField("creation_date"));
    dispatch(setSortOrder(newOrder));
  };
  //end sort
  const handlePageChange = (currPage: number) => {
    dispatch(setPage(currPage)); // Dispatch Redux action to update page state
    dispatch(setCodeDataPage(1));
  };
  const handleLimitChange = (limit: number) => {
    dispatch(setLimit(limit));
  };
  useEffect(() => {
    dispatch(fetchTypes());
  }, [dispatch]);

  // handle select row from data grid
  const onRowsSelectionHandler = (ids: GridRowSelectionModel) => {
    const selectedRow = codetypes.find((row) => row.code_type === ids[0]);
    if (selectedRow) {
      dispatch(setSelectedItem(selectedRow));
      dispatch(setCodeDataPage(1));
    }
  };

  const handleEditClick = (id: string) => () => {
    setEditId(id);
    setIsNew(false);
    setOpenEdit(true);
    dispatch(clearError());
  };

  const handleDeleteClick = async () => {
    try {
      await dispatch(deleteCodeType({ id: Number(deleteId) }))
        .unwrap() // Unwraps the payload creator's result, throwing any rejected action errors.
        .then(() => {
          setDialogOpen(false);
          mutate((e) => apiUtility(e, "codetype"));
          codeTypesRef?.current?.();
        })
        .catch((error: any) => {
          throw error; // Pass the error to the ConfirmDeleteDialog
        });
    } catch (err: any) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg(" code type  Taken");
      } else {
        setErrMsg("Adding Item Failed");
      }
      errRef.current?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!selectedCodeType || !apiRef.current) return;

    const rowModels = apiRef.current.getRowModels();
    const rowIds = Array.from(rowModels.keys());
    const currentIndex = rowIds.indexOf(selectedCodeType?.code_type);

    if (event.key === "ArrowDown" && currentIndex < rowIds.length - 1) {
      const nextRowId = rowIds[currentIndex + 1];
      const selectedRow = codetypes.find((row) => row.code_type === nextRowId);
      if (selectedRow) {
        dispatch(setSelectedItem(selectedRow));
        dispatch(setCodeDataPage(1));
      }
      apiRef.current.setRowSelectionModel([nextRowId]);
    } else if (event.key === "ArrowUp" && currentIndex > 0) {
      const prevRowId = rowIds[currentIndex - 1];
      const selectedRow = codetypes.find((row) => row.code_type === prevRowId);
      if (selectedRow) {
        dispatch(setSelectedItem(selectedRow));
        dispatch(setCodeDataPage(1));
      }
      apiRef.current.setRowSelectionModel([prevRowId]);
    }
  };
  // Open Add new dialog
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const handleOpenAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsNew(true);
    setOpenAdd(true);
    dispatch(clearError());
  };

  const handleCloseAddDialog = () => {
    setOpenAdd(false);
    dispatch(clearError()); // Clear any previous errors
  };
  const handleCloseEditDialog = () => {
    setOpenEdit(false);
    dispatch(clearError()); // Clear any previous errors
  };
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setData(initialData);
    dispatch(clearError());
    setIsNew(true);
    setOpen(true);
  };

  //close add new dialog
  const handleClose = () => {
    setOpen(false);
    setIsNew(false);
    dispatch(clearError());
  };

  const inputColumns: GLGridColDef[] = [
    {
      field: "code_type",
      headerName: "Code Type",
      permission: "code_8_codeType",
      uiText: "code_8_codeType",
      flex: 4,
      filterable: true,
      editable: false,
      renderCell: (params: any) => {
        return [
          <CustomRowCodeType
            row={params.row}
            data={data}
            handleChange={handleChange}
            isInEditMode={rowModesModel[params.id]?.mode === GridRowModes.Edit}
            types={types}
            isNew={false}
          />,
        ];
      },
    },
    {
      field: "actions",
      type: "actions",
      permission: "code_8_typeActions",
      uiText: "generic_0_actions",
      headerName: "Actions",
      headerClassName: "super-app-theme--header",
      headerAlign: "left",
      align: "right",
      flex: 1,
      sortable: false,
      filterable: false,
      cellClassName: "actions",
      renderCell: (params) => {
        return (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <GalaxySecure.GLIconButton2
              permission="code_8_editCodeType"
              uiText="generic_0_edit"
              fallBackText="Edit Code Type"
              onClick={handleEditClick(params.row.code_type)}
              size="small"
            >
              <img src={publicUrl(`themes/${mode}/icons/pen.png`)} alt="Edit" />
            </GalaxySecure.GLIconButton2>
            {/* <Tooltip title="Edit">
              <IconButton
                onClick={handleEditClick(params.row.code_type)}
                size="small"
                sx={{ padding: "4px" }}
              >
                <img
                  src={publicUrl(`themes/${mode}/icons/pen.png`)}
                  width="15px"
                  height="15px"
                  alt="Edit"
                />
              </IconButton>
            </Tooltip> */}

            <GalaxySecure.GLIconButton2
              permission="code_8_deleteCodeType"
              uiText="generic_0_delete"
              fallBackText="Delete Code Type"
              onClick={openDialog(params.row.code_type)}
              size="small"
            >
              <img
                src={publicUrl(`themes/${mode}/icons/delete.png`)}
                alt="Delete"
              />
            </GalaxySecure.GLIconButton2>

            {/* <Tooltip title="Delete">
              <IconButton
                onClick={openDialog(params.row.code_type)}
                size="small"
                sx={{ padding: "4px" }}
              >
                <img
                  src={publicUrl(`themes/${mode}/icons/delete.png`)}
                  width="15px"
                  height="15px"
                  alt="Delete"
                />
              </IconButton>
            </Tooltip> */}
          </Stack>
        );
      },
    },
  ];
  // Update searchValue state and trigger  search
  // (query itself is debounced via useDebounce above — typing never hits the API directly)
  const handleQuickSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setQuickSearchText(value); // Update local state
    if (value === "") {
      handleClearSearch(); // Trigger the function to reload data
    }
  };

  const handleKeyDownSearch = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  const handleSearch = () => {
    setQuickSearchText(quickSearchText);
  };
  const handleClearSearch = () => {
    setQuickSearchText("");
  };

  const CustomColumnHeaders = React.forwardRef((props, ref) => {
    return <div ref={ref}>{/* Your custom column headers content */}</div>;
  });
  const slots = {
    toolbar: GridToolbar,
    //columnHeaders: () => null,
    columnHeaders: CustomColumnHeaders,
    noRowsOverlay: () => (
      <Stack height="100%" alignItems="center" justifyContent="center">
        <span className="title-text">NO DATA FOUND</span>
      </Stack>
    ),
    noResultsOverlay: () => (
      <Stack height="100%" alignItems="center" justifyContent="center">
        Local filter returns no result
      </Stack>
    ),
  };
  return (
    <>
      {/* <ConfirmDeleteDialog
        open={isDialogOpen}
        onClose={closeDialog}
        onConfirm={handleDeleteClick}
        title={t("codetype_8_ConfirmToDelete") || "Confirm to delete"}
        message={
          t("codetype_8_DeleteConfirmation") ||
          "Are you sure you want to delete this Code Data?"
        }
        errorMsg={error || null}
      /> */}

      <DisplayMsgDialog 
        open={isDialogOpen}
        onClose={closeDialog}
        onAction={handleDeleteClick}
        description={t("codetype_8_DeleteConfirmation") || "Are you sure you want to delete this Code Data?"}
        getResource={false}
        status="DELETE"
        actionLabel="Delete"
        actionColor="error"
      />
      <GenericDialog
        open={openEdit}
        onClose={handleCloseEditDialog}
        title={t("codetype_8_UpdateCodeType") || "Update Code Type"}
        icon={
          <EditIcon
            sx={{
              backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
              color: "white",
              border: "0",
              width: "30px", // Set width of the circle
              height: "30px", // Set height of the circle
              borderRadius: "50%", // Makes it circular
              padding: "5px", // Optional padding inside the circle
              display: "flex", // Ensures proper alignment
              alignItems: "center", // Centers the icon vertically
              justifyContent: "center", // Centers the icon horizontally
            }}
          />
        }
        content={
          <>
            {error && (
              <div style={{ color: "red", marginBottom: "15px" }}>
                {error}
              </div>
            )}
            <CustomFormCodeType
              row={{
                code_type: "",
                description: "",
                linked_type: "",
                linked_description: "",
              }}
              editId={Number(editId)}
              isInEditMode={true}
              linkeddata={linkedData}
              types={types}
              isNew={isNew}
              handleClose={handleCloseEditDialog}
              codeTypesRef={codeTypesRef}
            />
          </>
        }
      />
      <GenericDialog
        open={openAdd}
        onClose={handleCloseAddDialog}
        title={t("codetype_8_AddCodeType") || "Add Code Type"}
        icon={
          <PlaylistAddIcon
            sx={{
              backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
              color: "white",
              border: "0",
              width: "30px", // Set width of the circle
              height: "30px", // Set height of the circle
              borderRadius: "50%", // Makes it circular
              padding: "5px", // Optional padding inside the circle
              display: "flex", // Ensures proper alignment
              alignItems: "center", // Centers the icon vertically
              justifyContent: "center", // Centers the icon horizontally
            }}
          />
        }
        content={
          <>
            {error && (
              <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>
            )}
            <CustomFormCodeType
              row={{
                code_type: "",
                description: "",
                linked_type: "",
                linked_description: "",
              }}
              editId={Number(editId)}
              isInEditMode={true}
              linkeddata={linkedData}
              types={types}
              isNew={isNew}
              handleClose={handleCloseAddDialog}
              codeTypesRef={codeTypesRef}
            />
          </>
        }
      />

      <GlPanelTable
        filterSection={
          <>
            <Secure.GLTextField
              id="quickSearch"
              placeholder={t("codetype_8_Search") || "Search"}
              resource_key="codetype_8_Search"
              variant="outlined"
              sx={{
                mr: "10px",
                borderRadius: 2,
                alignSelf: "center",
                "& input": { padding: "7px 10px !important" },
                "& .MuiOutlinedInput-root": {
                  paddingRight: "0px !important",
                },
              }}
              value={quickSearchText}
              // style={{ marginRight: 6, marginBottom: "20px", flex: 1 }}
              onChange={handleQuickSearchChange}
              onKeyDown={handleKeyDownSearch}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {quickSearchText && (
                      <IconButton onClick={handleClearSearch} size="small">
                        <ClearIcon />
                      </IconButton>
                    )}
                    <IconButton onClick={() => handleSearch()} size="small">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        }
      >
        <Box sx={{ "& .MuiStack-root": { alignItems: "center" } }}>
          <GalaxySecure.GLCustomTable2
            className="exact-40px-rows"
            permission="code_8_codeTypesTable"
            fetcher={fetcher}
            handleDataChange={(d) => {
              dispatch(setCodeTypes(d));
              if (d.length === 0) {
                dispatch(setSelectedItem(null));
              }
            }}
            columns={inputColumns}
            smallSize
            refetchRef={codeTypesRef}
            limit={10}
            hideHeader
            url="codetype/new"
            getRowId={(r) => r.code_type}
            customSortColumns={["code_type", "description", "creation_date"]}
            actionsSideSort={
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <GalaxySecure.GLIconButton2
                  permission="code_8_addCodeType"
                  uiText="generic_0_add"
                  fallBackText="Add Code Type"
                  onClick={handleOpenAdd}
                  sx={{ alignContent: "right" }}
                  size="small"
                >
                  <img
                    src={publicUrl(`themes/${mode}/icons/plus.png`)}
                    alt="Add"
                  />
                  <span style={{ paddingLeft: "10px" }} className="title-text">
                    {t("code_8_addCodeType") || "Add Code"}
                  </span>
                </GalaxySecure.GLIconButton2>
              </div>
            }
            onRowSelected={(r: any) => {
              dispatch(setSelectedItem(r ?? null));
              setLinkedData(r ?? initialLinkedData);
            }}
            params={{
              quickSearchText: debouncedQuickSearchText,
            }}
            localeText={{
              noRowsLabel: "✨ No data available",
              noResultsOverlayLabel: "✨ No data available",
            }}
            sx={{
              "& .MuiDataGrid-virtualScroller .MuiDataGrid-topContainer": {
                height: "0px !important",
              },
              "& .MuiDataGrid-virtualScroller .MuiDataGrid-row--firstVisible": {
                marginTop: "0px !important",
              },
              "& .MuiDataGrid-overlayWrapper": {
                top: "0px !important",
                height: "50px !important",
                minHeight: "50px !important",
              },
              "& .MuiDataGrid-overlay": {
                height: "50px !important",
                minHeight: "50px !important",
              },
              "&:has(.MuiDataGrid-overlayWrapper) .MuiDataGrid-virtualScroller": {
                height: "50px !important",
                minHeight: "50px !important",
              },
              "&:has(.MuiDataGrid-overlayWrapper) .MuiDataGrid-virtualScrollerContent": {
                height: "50px !important",
                minHeight: "50px !important",
              },
            }}
          />
        </Box>
      </GlPanelTable>
      {/* </Box> */}
      {/* // End- code- type - datagrid */}
    </>
  );
};

export default DataGridCodeType;
