/**
 * @company GIVC
 * @author Engr. Sahar AlHaddad <saharalhaddad2011@gmail.com>
 * @created 2025-02-19
 * @modified 2025-04-19
 */
import {
  DataGrid,
  gridClasses,
  GridToolbar,
  GridPaginationModel,
  GridColDef,
  useGridApiRef,
  GridRowSelectionModel,
  GridRowId,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear"; // Import Clear icon
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import IconFilterAlt from "@mui/icons-material/FilterAlt";
import * as React from "react";
import { useState, useRef, useEffect, useContext, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchItems, deleteItem } from "../../../redux/slices/ItemsSlice";
import { setSelectedItem } from "../../../redux/slices/ItemsSlice";
import { ItemData } from "../../../types/ItemData";

import { RootState, AppDispatch } from "../../../redux/store";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  useTheme,
  debounce as muiDebounce,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CustomRowItem from "./CustomRowItem";
import CustomPagination from "../../../components/CustomPagination/CustomPagination";
import useItemSlice from "../../../redux/hooks/useItemSlice";
import GenericDialog from "../../../components/genericDialog/GenericDialog";
import ConfirmDeleteDialog from "../../../components/deleteDialog/ConfirmDeleteDialog";
import AddItem from "./AddItem";
import { useAppSelector } from "../../../hooks/hooks";
import { useLanguage } from "../../../context/LanguageContext";
import { useTransSlice } from "../../../redux/slices/transSlice";
import { createResourceHelpers } from "../../../utils/resourceMapping/createResourceHelpers";
import GlCustomTable from "../../../shared/tables/GlCustomTable";
import GlPanelTable from "../../../shared/tables/GlPanelTable";
import { mutate } from "swr";
import { apiUtility } from "../../../utils/apiUtility";
import { useTranslation } from "react-i18next";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import { Secure as GalaxySecure, DisplayMsgDialog } from "@givc/shared-components";
import { fetcher } from "../../../utils/Api";
import { publicUrl } from "../../../utils/publicUrl";
import Secure from "../../../shared/security";

// Constants
const DEBOUNCE_DELAY = 500;

const DataGridItem = ({itemsRef}: { itemsRef: React.RefObject<() => void> }) => {
  // useItem
  const {
    page,
    limit,
    items,
    selectedItem,
    errorDelete,
    error,
    selectItem,
    sortDirection,
    sortBy,
    selectSortBy,
    selectSortDirection,
    selectPage,
    selectLimit,
    clearErrorMsg,
    fetchAllItems,
  } = useItemSlice();

  const errRef = useRef<HTMLElement | null>(null);
  // Tracks the selected item id so a data refresh can keep (or drop) the
  // current selection instead of always jumping to the first row.
  const selectedItemIdRef = useRef<number | null>(null);
  const [errMsg, setErrMsg] = useState<String>("");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  // Remembers which row the user picked (id only), so handleDataChange can
  // re-resolve the fresh row after a refetch without wiping in-progress edits.
  const handleRowSelected = useCallback(
    (row: ItemData | null) => {
      selectedItemIdRef.current = row?.item_id ?? null;
      dispatch(setSelectedItem(row ?? null));
    },
    [dispatch],
  );

  const handleDataChange = useCallback(
    (data: any[]) => {
      const selectedId = selectedItemIdRef.current;
      if (selectedId == null) return;

      const freshRow = data?.find((row) => row.item_id === selectedId);
      if (freshRow) {
        // Keep the same item selected (and its details fresh) after a
        // refetch, so saving does not jump back to the first row.
        dispatch(setSelectedItem(freshRow));
      } else {
        // The selected row disappeared (search/page change): clear the
        // selection so the table can auto-select the first result.
        handleRowSelected(null);
      }
    },
    [dispatch, handleRowSelected],
  );

  // const apiRef = useGridApiRef();
  // Role Action
  const [rowId, setRowId] = useState<number[] | null>(null);
  const [row, setRow] = useState<ItemData[] | null>();
  const [rows, setRows] = React.useState<ItemData[]>();
  const [rowModesModel, setRowModesModel] = React.useState({});
  //const items = useSelector((state: RootState) => state.items.items);
  const totalPages = useSelector((state: RootState) => state.items.totalPages);
  const itemStatus = useSelector((state: RootState) => state.items.status);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 13,
  }); // Default pagination model
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    item_id: false, // Hide the 'id' column
    description: false,
    item_bk: false,
    legacy_code: false,
    sub_category_code: false,
    cagetory_code: true,
    actions: true,
  });
  const [deleteId, setDeleteId] = useState<GridRowId | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const theme = useTheme();

  //==================  * Resources * ===================

  const ctx = useContext(AuthGuardContext);

  if (!ctx) {
    return null;
  }

  const { resourcesData, t, userLang } = ctx;

  const inputColumns: GridColDef[] = [
    {
      field: "category_code",
      headerName: "Item",
      flex: 5,
      filterable: true,
      renderCell: (params: any) => <CustomRowItem row={params.row} />,
    },

    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      headerClassName: "super-app-theme--header",
      headerAlign: "right",
      flex: 1,
      sortable: false,
      filterable: false,
      cellClassName: "actions",
      renderCell: (params: any) => {
        return [
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <GalaxySecure.GLIconButton2
              permission="items_5_deleteItem"
              uiText="generic_0_delete"
              fallBackText="Delete Item"
              onClick={handleOpenDelete(params.row.item_id)}
              size="small"
            >
              <img
                src={publicUrl(`themes/${theme.palette.mode}/icons/delete.png`)}
                alt="Delete"
              />
            </GalaxySecure.GLIconButton2>
            {/* <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={handleOpenDelete(params.row.item_id)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip> */}
          </div>,
        ];
      },
    },
  ];

  //==================  * Resources * ===================
  const handleOpenAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    //setIsNew(true);
    setOpenAdd(true);
    clearErrorMsg(); // Clear any previous errors
  };
  const handleCloseAddDialog = () => {
    setOpenAdd(false);
    clearErrorMsg();
  };
  //Open delete dialog
  const handleOpenDelete = (id: GridRowId) => () => {
    clearErrorMsg();
    setDeleteId(id);
    setOpenDelete(true);
  };
  //close delete dialog
  const handleCloseDeleteDialog = () => {
    clearErrorMsg();
    setOpenDelete(false);
    setDeleteId(null);
  };
  const [quickSearchText, setQuickSearchText] = useState("");
  // Debounced value actually sent to the table query (typing stays instant)
  const [debouncedQuickSearchText, setDebouncedQuickSearchText] =
    useState("");
  // COLUMN FILTER
  const [itemId, setItemId] = useState<number | null>();
  const [itemBk, setItemBk] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  // Debounced filter values actually sent to the table query
  const [debouncedItemId, setDebouncedItemId] = useState<number | null>();
  const [debouncedItemBk, setDebouncedItemBk] = useState("");
  const [debouncedCategoryCode, setDebouncedCategoryCode] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleDeleteClick = async () => {
    try {
      await dispatch(deleteItem({ id: deleteId } as any))
        .unwrap() // Unwraps the payload creator's result, throwing any rejected action errors.
        .then(() => {
          setOpenDelete(false);
          mutate((e) => apiUtility(e, "items"));
          itemsRef?.current?.(); 
        });
    } catch (error: any) {
      throw error; // Pass the error to the ConfirmDeleteDialog
    }
  };

  // end

  // Debounced search for table (same standard as BedClassMaster)
  const debouncedTableSearch = useMemo(
    () =>
      muiDebounce((value: string) => {
        setDebouncedQuickSearchText(value);
      }, DEBOUNCE_DELAY),
    [],
  );

  // Debounced apply for ALL column filters (same standard as BedClassMaster)
  const debouncedApplyFilters = useMemo(
    () =>
      muiDebounce(
        (next: {
          itemId?: number | null;
          itemBk: string;
          categoryCode: string;
        }) => {
          setDebouncedItemId(next.itemId ?? null);
          setDebouncedItemBk(next.itemBk);
          setDebouncedCategoryCode(next.categoryCode);
        },
        DEBOUNCE_DELAY,
      ),
    [],
  );

  // Cleanup debounce on component unmount
  useEffect(() => {
    return () => {
      debouncedTableSearch.clear();
      debouncedApplyFilters.clear();
    };
  }, [debouncedTableSearch, debouncedApplyFilters]);

  // Search section
  // Update searchValue state and trigger  search
  const handleQuickSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setQuickSearchText(value);
    debouncedTableSearch(value);
  };

  const handleKeyDownSearch = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  const handleSearch = () => {
    debouncedTableSearch(quickSearchText);
  };
  const handleClearSearch = () => {
    setQuickSearchText("");
    debouncedTableSearch("");
  };
  const handleChangeFilter = () => {
    if (showFilters) {
      handleCloseFilter();
    }
  };
  const handleCloseFilter = () => {
    setItemId(null);
    setItemBk("");
    setCategoryCode("");
    debouncedApplyFilters({ itemId: null, itemBk: "", categoryCode: "" });
  };

  return (
    <>
      <GlPanelTable
        // showFilterIcon={true}
        filterSection={
          <Box sx={{ display: "grid", gap: 1 }}>
            <Stack direction="row" spacing={0}>
              <Secure.GLTextField
                resource_key="items_5_Description"
                value={quickSearchText}
                // onChange={(e) => handleSearchField(e.target.value)}
                // placeholder={t("440") || "Search by ID, Name, Mobile"}
                onChange={handleQuickSearchChange}
                onKeyDown={handleKeyDownSearch}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {quickSearchText && (
                        <IconButton onClick={handleClearSearch}>
                          <ClearIcon />
                        </IconButton>
                      )}
                      <IconButton onClick={() => handleSearch()}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder={t("items_5_Description") || "Description"}
                variant="outlined"
                // fullWidth
                sx={{ width: "50%", flexGrow: "1" }}
              />
              <Secure.GLButton
                resource_key="items_5_ShowFilters"
                startIcon={<IconFilterAlt />}
                onClick={() => {
                  setShowFilters(!showFilters);
                  handleChangeFilter();
                }}
                // variant="outlined"
                sx={{ width: "fit-content" }}
              >
                {showFilters
                  ? t("items_5_HideFilters") || "Hide Filters"
                  : t("items_5_ShowFilters") || "Show Filters"}
              </Secure.GLButton>
            </Stack>
            {showFilters && (
              <Stack
                direction="row"
                //   divider={<Divider orientation="vertical" flexItem />}
                spacing={0}
              >
                <Secure.GLTextField
                  resource_key="items_5_Id"
                  id="itemIdFilter"
                  name="itemId"
                  type="number"
                  placeholder={t("items_5_Id") || "ID"}
                  variant="outlined"
                  sx={{
                    mr: "10px",
                    borderRadius: 2,
                    alignSelf: "center",
                    "& input": { padding: "7px 10px !important" },
                  }}
                  value={itemId ?? ""}
                  style={{ marginRight: 6, marginBottom: "20px", flex: 1 }}
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    // Digits only (IDs are integers): blocks pasted "-5"/"e",
                    // which onKeyDown alone cannot stop
                    const raw = e.target.value;
                    if (!/^\d*$/.test(raw)) return;
                    // Empty string stays null (Number("") is 0, which would
                    // wrongly show/API-send zero on manual clear)
                    const next = raw === "" ? null : Number(raw);
                    setItemId(next);
                    debouncedApplyFilters({
                      itemId: next,
                      itemBk,
                      categoryCode,
                    });
                  }}
                  // onKeyDown={handleKeyDownFilter}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {itemId && (
                          <IconButton
                            onClick={(e) => {
                              setItemId(null);
                              debouncedApplyFilters({
                                itemId: null,
                                itemBk,
                                categoryCode,
                              });
                            }}
                          >
                            <ClearIcon />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
                <Secure.GLTextField
                  resource_key="items_5_CODE"
                  id="itemBkFilter"
                  name="itemBk"
                  placeholder={t("items_5_CODE") || "CODE"}
                  variant="outlined"
                  sx={{
                    mr: "10px",
                    borderRadius: 2,
                    alignSelf: "center",
                    "& input": { padding: "7px 10px !important" },
                  }}
                  value={itemBk}
                  style={{ marginRight: 6, marginBottom: "20px", flex: 1 }}
                  onChange={(e) => {
                    setItemBk(e.target.value);
                    debouncedApplyFilters({
                      itemId,
                      itemBk: e.target.value,
                      categoryCode,
                    });
                  }}
                  // onKeyDown={handleKeyDownFilter}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {itemBk && (
                          <IconButton
                            onClick={(e) => {
                              setItemBk("");
                              debouncedApplyFilters({
                                itemId,
                                itemBk: "",
                                categoryCode,
                              });
                            }}
                          >
                            <ClearIcon />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />{" "}
                <Secure.GLTextField
                  resource_key="items_5_CATEGORYCODE"
                  id="catCodeFilter"
                  name="category_code"
                  placeholder={t("items_5_CATEGORYCODE") || "CATEGORY CODE"}
                  variant="outlined"
                  sx={{
                    mr: "10px",
                    borderRadius: 2,
                    alignSelf: "center",
                    "& input": { padding: "7px 10px !important" },
                  }}
                  value={categoryCode}
                  style={{ marginRight: 6, marginBottom: "20px", flex: 1 }}
                  onChange={(e) => {
                    setCategoryCode(e.target.value);
                    debouncedApplyFilters({
                      itemId,
                      itemBk,
                      categoryCode: e.target.value,
                    });
                  }}
                  // onKeyDown={handleKeyDownFilter}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {categoryCode && (
                          <IconButton
                            onClick={(e) => {
                              setCategoryCode("");
                              debouncedApplyFilters({
                                itemId,
                                itemBk,
                                categoryCode: "",
                              });
                            }}
                          >
                            <ClearIcon />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            )}
          </Box>
        }
      >
        {/*!params => sortBy, sortDirection, searchBasic, usePagedData = true */}
        <Box sx={{ "& .MuiStack-root": {
          alignItems: "center",
        }}}>
          <Secure.GlCustomTable
            // fetcher={fetcher}
            className="exact-40px-rows"
            resource_key="items_5_itemsTable"
            localeText={{ noRowsLabel: "✨ No data available" }}
            customSortColumns={["item_id", "description", "creation_date"]}
            smallSize
            refetchRef={itemsRef}
            handleDataChange={handleDataChange}
            autoSelectFirstRow={!selectedItem}
            actionsSideSort={
              <Box sx={{ display: 'flex', marginLeft: 'auto !important' }}>
                <GalaxySecure.GLButton2
                  permission="items_5_addNewItem"
                  uiText="generic_0_add"
                  fallBackText="Add Item"
                  onClick={handleOpenAdd}
                  size="small"
                  startIcon= {
                    <img
                    src={publicUrl(`themes/${theme.palette.mode}/icons/plus.png`)}
                    width="15px"
                  />
                  }
                />
              </Box>
              // <Secure.GLButton
              //   resource_key="items_5_AddNewItem"
              //   onClick={handleOpenAdd}
              //   startIcon={<AddCircleIcon />}
              //   sx={{}}
              // >
              //   {t("items_5_AddNewItem") || "Add New Item"}
              // </Secure.GLButton>
            }
            loading={false}
            url="/items/new"
            columns={inputColumns}
            getRowId={(row) => row.item_id}
            hideHeader
            onRowSelected={handleRowSelected}
            params={{
              quickSearchText: debouncedQuickSearchText,
              item_id: debouncedItemId,
              item_bk: debouncedItemBk,
              category_code: debouncedCategoryCode,
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
              },
            }}
          />
        </Box>
      </GlPanelTable>

      <GenericDialog
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          clearErrorMsg();
        }}
        title={t("items_5_AddNewItem") || "Add New Item"}
        icon={
          <PersonAddIcon
            sx={{
              // backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
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
          <AddItem
            handlClose={() => {
              setOpenAdd(false);
              clearErrorMsg();
            }}
            itemsRef={itemsRef}
          />
        }
        maxWidth="md"
        sx={{
          "&  .MuiDialog-paper": {
            minWidth: "50vw",
            maxWidth: "60vw",
          },
        }}
      />

      {/* <ConfirmDeleteDialog
        open={openDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteClick}
        title={t("items_5_ConfirmToDelete") || "Confirm to delete"}
        message={
          t("items_5_DeleteConfirmation") ||
          "Are you sure you want to delete this ITEM?"
        }
        errorMsg={errorDelete || null}
      /> */}

      <DisplayMsgDialog 
        open={openDelete}
        onClose={handleCloseDeleteDialog}
        onAction={handleDeleteClick}
        description={
          t("items_5_DeleteConfirmation") ||
          "Are you sure you want to delete this ITEM?"
        }
        status="DELETE"
        getResource={false}
        actionLabel="Delete"
        actionColor="error"
      />
    </>
  );
};

export default DataGridItem;
