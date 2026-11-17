import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
  setSelectedSet,
  setSelectedMapping,
  fetchCodeMappingData,
  clearError,
  fetchMappings,
  createMapping,
  updateMapping,
  createMappedSet,
  updateMappedSet,
  clearSetError,
  deleteMapping,
  resetMappingState,
} from "../../redux/slices/codeMappingSlice";
import AddEditSetForm from "./AddEditSetForm";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Divider,
  Checkbox,
  Button,
  Snackbar,
  Alert,
  Menu,
  Grid2,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Tooltip } from "@mui/material";
import { MappingRow } from "../../types/CodeMappingIndex";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MapIcon from "@mui/icons-material/Map";
import LayersIcon from "@mui/icons-material/Layers";
import LayersClearIcon from "@mui/icons-material/LayersClear";

import GenericDialog from "../../components/genericDialog/GenericDialog";
import AddEditMappingForm from "./AddEditMappingForm";

import { useGridApiRef } from "@mui/x-data-grid";
import CustomPagination from "../../components/CustomPagination/CustomPagination";
import ExportButtonV3 from "../../components/exportButton/ExportButtonV3";
import ConfirmDeleteDialog from "../../components/deleteDialog/ConfirmDeleteDialog";
import { useContext } from "react";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import Secure from "../../shared/security";
import { GLGridColDef } from "../../shared/security/GLCustomTable";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import CloseIcon from "@mui/icons-material/Close";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
// Define the interface for grid rows

interface SetOption {
  set_id: number;
  set_description: string;
}
export default function MappingCode() {
  const { t } = useContext(AuthGuardContext);
  const dispatch = useAppDispatch();
  const apiRef = useGridApiRef();
  const {
    sets: backendSets,
    coding: backendCoding,
    AllCodeTypes,
    loading,
    error,
    gridData,
    gridLoading,
    gridError,
    externalCodes,
    createMappingLoading,
    updateMappingLoading,
    setOperationError,
    setOperationLoading,
    selectedMapping,
    selectedSet,
  } = useAppSelector((state) => state.codeMapping);

  // State variables - all initialized as null/empty
  const [selectedSetOption, setSelectedSetOption] = useState<SetOption | null>(
    null,
  );
  const [selectedCodeType, setSelectedCodeType] = useState<string | null>(null);
  const [coding, setCoding] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [codingOptions, setCodingOptions] = useState<string[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, string[]>>({});
  const [codeTypes, setCodeTypes] = useState<string[]>([]);

  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [mapOption, setMapOption] = useState("all");
  const [codeFilter, setCodeFilter] = useState("all");
  const [minSimilarity, setMinSimilarity] = useState("80");
  const [applyFromDate, setApplyFromDate] = useState(false);
  const [actionDate, setActionDate] = useState<Date | null>(null);
  const [selectedSetDetails, setSelectedSetDetails] = useState<any | null>(
    null,
  );
  const dateFormat = useAppSelector((state) => state.config.values.DATE_FORMAT);
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<GridRowId | null>(null);

  //Open delete dialog
  const handleOpenDelete = (id: GridRowId) => () => {
    dispatch(clearError());
    setDeleteId(id);
    setOpenDelete(true);
  };

  //close delete dialog
  const handleCloseDeleteDialog = () => {
    dispatch(clearError());
    setOpenDelete(false);
    setDeleteId(null);
  };

  // ADD DIALOG STATE
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // DIALOG STATE
  const [openMappingDialog, setOpenMappingDialog] = useState(false);
  //const [dialogType, setDialogType] = useState<"create" | "edit">("create");
  const [columnFilters, setColumnFilters] = useState({
    id: "",
    app_code: "",
    description: "",
    map_to_code_id: "",
    ext_code: "",
    ext_description: "",
    app_sub_code: "",
    sub_description: "",
  });

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 12,
  });
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!selectedMapping || !apiRef.current) return;

    const rowModels = apiRef.current.getRowModels();
    const rowIds = Array.from(rowModels.keys());
    const currentIndex = rowIds.indexOf(selectedMapping?.id);

    if (event.key === "ArrowDown" && currentIndex < rowIds.length - 1) {
      const nextRowId = rowIds[currentIndex + 1];
      const selectedRow = gridData.find((row) => row.id === nextRowId);
      if (selectedRow) {
        //console.log("selected Row :" + JSON.stringify(selectedRow));
        dispatch(setSelectedMapping(selectedRow));
      }
      apiRef.current.setRowSelectionModel([nextRowId]);
    } else if (event.key === "ArrowUp" && currentIndex > 0) {
      //console.log(initialRows[currentIndex - 1]);
      const prevRowId = rowIds[currentIndex - 1];
      const selectedRow = gridData.find((row) => row.id === prevRowId);
      if (selectedRow) {
        //console.log("selected Row :" + JSON.stringify(selectedRow));
        dispatch(setSelectedMapping(selectedRow));
      }
      apiRef.current.setRowSelectionModel([prevRowId]);
    }
  };

  // HANDLE DIALOG OPEN/CLOSE
  const handleOpenDialog = (type: "create" | "edit", row: MappingRow) => {
    //setDialogType(type);
    //setSelectedRow(row);
    setOpenMappingDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenMappingDialog(false);
    //setSelectedRow(null);
  };

  // HANDLE FORM SUBMISSION
  const handleSubmitMapping = (data: {
    map_to_code_id: number;
    start_date?: string;
    end_date?: string;
  }) => {
    if (!selectedMapping) return;
    //handleMenuClose();
    const isEdit = !!selectedMapping.map_to_code_id;

    if (!isEdit) {
      dispatch(
        createMapping({
          set_id: selectedSet?.set_id,
          code: selectedMapping.app_code,
          type_code: null,
          ...data,
        }),
      )
        .unwrap()
        .then(() => {
          handleCloseDialog();
          handleSearch(); // Refresh data
        })
        .catch((error) => {});
    } else {
      dispatch(
        updateMapping({
          mapId: selectedMapping.map_id,
          data,
        }),
      )
        .unwrap()
        .then(() => {
          handleCloseDialog();
          handleSearch(); // Refresh data
        })
        .catch((error) => {});
    }
  };

  const handleRowSelection = (ids: GridRowSelectionModel) => {
    //const selectedId = newSelection[0] as number;
    const row = gridData.find((r) => r.id.toString() === ids[0]);
    if (row) dispatch(setSelectedMapping(row));
  };
  // const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, row: MappingRow | null) => {
  //   // event.stopPropagation();
  //   setAnchorEl(event.currentTarget);
  //   dispatch(setSelectedMapping(row));
  // };

  // const handleMenuClose = () => {
  //   setAnchorEl(null);
  //   //setSelectedRow(null);
  // };

  const handleMapSingle = (row: MappingRow) => {
    if (selectedMapping) handleMapSingle(row);
    //();
  };

  const handleMapAll = (row: MappingRow) => {
    // Implement your actual map all logic here
    console.log("Map All for row:", row);
    //handleMenuClose();
  };

  const [openSetDialog, setOpenSetDialog] = useState(false);
  const [setDialogMode, setSetDialogMode] = useState<"create" | "edit">(
    "create",
  );

  const handleOpenSetDialog = (mode: "create" | "edit") => {
    setSetDialogMode(mode);
    setOpenSetDialog(true);
    dispatch(clearSetError());
  };

  const handleCloseSetDialog = () => {
    setOpenSetDialog(false);
  };

  const handleSubmitSet = (data: any) => {
    if (setDialogMode === "create") {
      dispatch(createMappedSet(data))
        .unwrap()
        .then(() => {
          handleCloseSetDialog();
        })
        .catch(() => {
          // Error handled in slice
        });
    } else if (selectedSet) {
      dispatch(
        updateMappedSet({
          setId: selectedSet.set_id,
          data,
        }),
      )
        .unwrap()
        .then(() => {
          handleCloseSetDialog();
        })
        .catch(() => {
          // Error handled in slice
        });
    }
  };

  // Find selected set details from existing state
  // const selectedSetDetails = selectedSet ? backendSets.find((set) => set.set_id === selectedSet.set_id) : null;

  // Initialize options from fetched data (without selecting anything)
  useEffect(() => {
    dispatch(resetMappingState());
    dispatch(fetchCodeMappingData());
  }, [dispatch]);

  useEffect(() => {
    if (backendSets.length > 0) {
      // Only set the options, don't select anything
      setCodingOptions([]);
      setCategoryMap({});
    }

    if (backendCoding.length > 0) {
      // Extract unique coding options
      const options = [
        ...new Set(backendCoding.map((item) => item.base_description)),
      ];
      setCodingOptions(options);

      // Build category map without selecting anything
      const newCategoryMap: Record<string, string[]> = {};
      backendCoding.forEach((item) => {
        newCategoryMap[item.base_description] = item.categories.map(
          (cat) => cat.description,
        );
      });
      setCategoryMap(newCategoryMap);
    }
  }, [backendSets, backendCoding]);

  // Handle set selection change
  useEffect(() => {
    if (selectedSet && backendSets.length > 0) {
      const currentSet = backendSets.find(
        (set) => set.set_id === selectedSet.set_id,
      );
      setSelectedSetDetails(currentSet || null);
      if (currentSet) {
        //setSelectedSetId(currentSet.set_id);
        const types = currentSet.code_data
          .map((item) => item.sub_code_type?.toString())
          .filter(Boolean) as string[];

        setCodeTypes(types);
        setSelectedCodeType(types.length > 0 ? types[0] : null);
      }
    } else {
      setSelectedSetDetails(null);
      setCodeTypes([]);
      setSelectedCodeType(null);
    }
  }, [selectedSet, backendSets]);

  // Handle category change to update category ID
  const handleCategoryChange = (value: string) => {
    setCategory(value);

    // Find and set the category ID
    if (coding && backendCoding.length > 0) {
      const codingItem = backendCoding.find(
        (item) => item.base_description === coding,
      );
      if (codingItem) {
        const categoryItem = codingItem.categories.find(
          (cat) => cat.description === value,
        );
        if (categoryItem) {
          setCategoryId(categoryItem.code);
        }
      }
    }
  };

  // Check if search should be enabled
  const isSearchEnabled =
    selectedSet !== null && categoryId !== null && fromDate !== null;

  // Handle search button click
  const handleSearch = () => {
    if (!isSearchEnabled) return;

    // Format date
    const formattedDate = fromDate
      ? `${fromDate.getFullYear()}-${(fromDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${fromDate.getDate().toString().padStart(2, "0")}`
      : undefined;

    dispatch(
      fetchMappings({
        setId: selectedSet.set_id,
        categoryId: categoryId as number,
        codeType: selectedCodeType || undefined,
        pDate: formattedDate,
      }),
    );
  };

  // Handle edit action
  const handleEdit = (row: MappingRow) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
  };

  // Handle delete action
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await dispatch(deleteMapping({ mapId: deleteId }))
        .unwrap() // Unwraps the payload creator's result, throwing any rejected action errors.
        .then(() => {
          setOpenDelete(false);
        });
    } catch (error: any) {
      throw error; // Pass the error to the ConfirmDeleteDialog
    }
  };

  // Define grid columns
  const columns: GLGridColDef[] = [
    {
      field: "id",
      headerName: "Id",
      flex: 1,
      resource_key: "codeMapping_13_id",
    },
    {
      field: "app_code",
      headerName: "Code",
      flex: 1,
      resource_key: "codeMapping_13_codeForm",
    },

    {
      field: "description",
      headerName: "Description",
      flex: 2,
      resource_key: "codeMapping_13_descriptionTable",
    },

    {
      field: "map_to_code_id",
      headerName: "Map to Code Id",
      flex: 1,
      resource_key: "codeMapping_13_mapToCodeId",
    },
    {
      field: "ext_code",
      headerName: "Ext Code",
      flex: 2,
      resource_key: "codeMapping_13_extCode",
    },
    {
      field: "ext_description",
      headerName: "Ext Description",
      flex: 2,
      resource_key: "codeMapping_13_extDescription",
    },
    {
      field: "app_sub_code",
      headerName: "Alternative Code",
      flex: 1,
      resource_key: "codeMapping_13_alternativeCode",
    },
    {
      field: "sub_description",
      headerName: "SUB Description",
      flex: 2,
      resource_key: "codeMapping_13_subDescription",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      resource_key: "codeMapping_13_actions",
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(
          null,
        );
        const open = Boolean(anchorEl);

        const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
          setAnchorEl(event.currentTarget);
          dispatch(setSelectedMapping(params.row));
        };

        const handleMenuClose = () => {
          setAnchorEl(null);
        };

        return (
          <div style={{ display: "flex", gap: "4px" }}>
            <Tooltip title="Mapping options">
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                disabled={gridLoading}
                color="primary"
                aria-label="mapping-options"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              elevation={3}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {params.row.map_to_code_id ? (
                <MenuItem
                  onClick={() => {
                    handleOpenDialog("edit", params.row);
                    handleMenuClose();
                  }}
                  dense
                >
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit Mapping</ListItemText>
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => {
                    handleOpenDialog("create", params.row);
                    handleMenuClose();
                  }}
                  dense
                >
                  <ListItemIcon>
                    <MapIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Map Single Row</ListItemText>
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  handleMapAll(params.row);
                  handleMenuClose();
                }}
                dense
              >
                <ListItemIcon>
                  <LayersIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Map All Same Sub Code</ListItemText>
              </MenuItem>
            </Menu>

            <Tooltip title="Delete Map">
              <IconButton
                onClick={handleOpenDelete(params.row.map_id)}
                size="small"
                disabled={gridLoading || !params.row.map_to_code_id}
              >
                <LayersClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  // Handle loading and error states
  if (loading) {
    return (
      <Box
        p={3}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={300}
      >
        <Typography variant="h6">Loading mapping data...</Typography>
      </Box>
    );
  }

  const filteredGridData = gridData.filter((row) => {
    const matchesDate =
      !applyFromDate ||
      !actionDate ||
      (row.start_date && new Date(row.start_date) >= actionDate);
    const matchesMapStatus =
      codeFilter === "all" ||
      (codeFilter === "with" && row.map_to_code_id !== null) ||
      (codeFilter === "without" && row.map_to_code_id === null);

    const matchesColumnFilters = Object.entries(columnFilters).every(
      ([field, value]) => {
        if (!value) return true;
        const fieldValue = row[field as keyof MappingRow];
        return fieldValue
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      },
    );

    return matchesDate && matchesMapStatus && matchesColumnFilters;
  });

  return (
    <Box p={3}>
      <HandleTitle titleKey="CODE_MAPPING" />
      <Grid container spacing={3} alignItems="stretch">
        {/* System Card */}
        <Grid item xs={12} md={6} display="flex">
          <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ pb: "16px !important", height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Secure.GLTypography
                  resource_key="codeMapping_13_system"
                  variant="h6"
                  gutterBottom
                />
                <Tooltip
                  title="Add Set"
                  style={{ display: "flex", marginLeft: "auto" }}
                >
                  <span>
                    <Secure.GLIconButton
                      resource_key="codeMapping_13_addSetIcon"
                      size="small"
                      color="success"
                      onClick={() => handleOpenSetDialog("create")}
                      disabled={loading || !!error}
                    >
                      <AddIcon fontSize="small" />
                    </Secure.GLIconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Edit Set">
                  <span>
                    <Secure.GLIconButton
                      resource_key="codeMapping_13_editSetIcon"
                      size="small"
                      color="primary"
                      onClick={() => handleOpenSetDialog("edit")}
                      disabled={!selectedSet || loading || !!error}
                    >
                      <EditIcon fontSize="small" />
                    </Secure.GLIconButton>
                  </span>
                </Tooltip>
              </Box>

              <Stack spacing={2} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Secure.GLTypography
                    resource_key="codeMapping_13_set"
                    sx={{ minWidth: 100 }}
                  />

                  <Secure.GLGenericAutocomplete
                    resource_key="codeMapping_13_systemAutoComplete"
                    options={backendSets}
                    value={selectedSet}
                    onChange={(e, value) => {
                      setSelectedSetOption(value);
                      dispatch(setSelectedSet(value)); // should be full CodeSet object
                    }}
                    getOptionLabel={(option) =>
                      option
                        ? `${option.set_id} - ${option.set_description}`
                        : ""
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Select a set"
                      />
                    )}
                    sx={{ flex: 1, ml: "0 !important" }}
                    disabled={loading || !!error}
                  />
                </Stack>

                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ height: 40 }}
                >
                  <Secure.GLTypography
                    resource_key="codeMapping_13_codeTypeLabel"
                    sx={{ minWidth: 100 }}
                  />
                  <Secure.GLTypography
                    resource_key="codeMapping_13_codeTypeLabel"
                    sx={{ ml: "0 !important" }}
                  >
                    {/* {selectedSet?.code_type && ( */}
                    <>
                      {selectedSet?.code_type}
                      {" - "}
                      {selectedSet?.code_type &&
                        AllCodeTypes.find(
                          (c) =>
                            String(c.code_type) ===
                            String(selectedSet?.code_type),
                        )?.description}
                    </>
                    {/* )} */}
                  </Secure.GLTypography>
                  {/* <TextField fullWidth size="small" type="number" defaultValue={selectedSet?.code_type} sx={{ flex: 1 }} disabled={true} />
                   */}
                  {/* <Autocomplete
                    options={codeTypes}
                    value={selectedCodeType}
                    onChange={(e, value) => setSelectedCodeType(value)}
                    renderInput={(params) => <TextField {...params} size="small" />}
                    sx={{ flex: 1 }}
                    disabled={!selectedSet || loading || !!error}
                  /> */}
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Secure.GLTypography
                    resource_key="codeMapping_13_minSimilarity"
                    sx={{ minWidth: 100 }}
                  />

                  <Secure.GLTextField
                    resource_key="codeMapping_13_minSimilarity"
                    fullWidth
                    size="small"
                    type="number"
                    value={minSimilarity}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (Number(value) >= 0) {
                        setMinSimilarity(value);
                      }
                    }}
                    sx={{ flex: 1, ml: "0 !important" }}
                    disabled={loading || !!error}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* External Card */}
        <Grid item xs={12} md={6} display="flex">
          <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Secure.GLTypography
                  resource_key="codeMapping_13_external"
                  variant="h6"
                  gutterBottom
                />
                {/* <Tooltip title="Add Coding" style={{ display: "flex", marginLeft: "auto" }}>
                  <span>
                    <Secure.GLIconButton
                      resource_key="codeMapping_13_addCoddingIcon"
                      size="small"
                      color="success"
                      disabled={loading || !!error}
                    >
                      <AddIcon fontSize="small" />
                    </Secure.GLIconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Edit Coding">
                  <span>
                    <Secure.GLIconButton
                      resource_key="codeMapping_13_editCoddingIcon"
                      size="small"
                      color="primary"
                      disabled={!coding || loading || !!error}
                    >
                      <EditIcon fontSize="small" />
                    </Secure.GLIconButton>
                  </span>
                </Tooltip> */}
              </Box>

              <Stack spacing={2} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Secure.GLTypography
                    resource_key="codeMapping_13_coding"
                    sx={{ minWidth: 100 }}
                  />
                  <Secure.GLFormControl
                    resource_key="codeMapping_13_coding"
                    fullWidth
                    size="small"
                    disabled={loading || !!error}
                    sx={{ ml: "0 !important" }}
                  >
                    <Select
                      value={coding}
                      onChange={(e) => {
                        const value = e.target.value as string;
                        setCoding(value);
                        setCategory("");

                        setCategoryId(null); // Reset categoryId
                      }}
                    >
                      {codingOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </Secure.GLFormControl>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Secure.GLTypography
                    resource_key="codeMapping_13_category"
                    sx={{ minWidth: 100 }}
                  />
                  <Secure.GLFormControl
                    resource_key="codeMapping_13_category"
                    fullWidth
                    size="small"
                    disabled={!coding || loading || !!error}
                    sx={{ ml: "0 !important" }}
                  >
                    <Secure.GLGenericAutocomplete
                      resource_key="codeMapping_13_selectOrTypeCategory"
                      fullWidth
                      options={categoryMap[coding] || []}
                      value={category}
                      disabled={!coding}
                      // onChange={(event, newValue) => {
                      //   const selectedCategory = newValue || "";
                      //   setCategory(selectedCategory);

                      //   const cat = categoryMap[coding]?.find((c) => c === selectedCategory);
                      //   const catId = cat?.category_id || null;
                      //   setCategoryId(catId);

                      //   handleCategoryChange(selectedCategory, catId); // ✅ Call your handler here
                      // }}
                      onChange={(event, newValue) => {
                        const selectedCategory = newValue || "";
                        setCategory(selectedCategory);

                        // Find and set the category ID
                        if (coding && backendCoding.length > 0) {
                          const codingItem = backendCoding.find(
                            (item) => item.base_description === coding,
                          );
                          if (codingItem) {
                            const categoryItem = codingItem.categories.find(
                              (cat) => cat.description === selectedCategory,
                            );
                            if (categoryItem) {
                              setCategoryId(categoryItem.code);
                            } else {
                              setCategoryId(null);
                            }
                          }
                        }
                      }}
                      renderInput={(params) => (
                        <Secure.GLTextField
                          resource_key="codeMapping_13_selectOrTypeCategory"
                          {...params}
                          placeholder={t("codeMapping_13_selectOrTypeCategory")}
                        />
                      )}
                    />
                  </Secure.GLFormControl>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Secure.GLTypography
                    resource_key="codeMapping_13_fromDate"
                    sx={{ minWidth: 100 }}
                  />
                  <Box sx={{ ml: "0 !important" }}>
                    <Secure.GLDatePicker
                      resource_key="codeMapping_13_fromDate"
                      format={dateFormat || "dd/MM/yyyy"}
                      value={fromDate}
                      onChange={setFromDate}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: { minWidth: 200 },
                        },
                      }}
                      disabled={loading || !!error}
                    />
                  </Box>

                  <RadioGroup
                    row
                    value={mapOption}
                    onChange={(e) => setMapOption(e.target.value)}
                    sx={{ ml: 2 }}
                  >
                    <Secure.GLGenericFormControlLabel
                      resource_key="codeMapping_13_all"
                      value="all"
                      control={<Radio size="small" />}
                      label={t("codeMapping_13_all")}
                      disabled={loading || !!error}
                    />
                    <Secure.GLGenericFormControlLabel
                      resource_key="codeMapping_13_notMapped"
                      value="notMapped"
                      control={<Radio size="small" />}
                      label={t("codeMapping_13_notMapped")}
                      disabled={loading || !!error}
                    />
                  </RadioGroup>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
              <Secure.GLGenericFormControlLabel
                resource_key="codeMapping_13_applyFromDate"
                control={
                  <Checkbox
                    checked={applyFromDate}
                    onChange={(e) => setApplyFromDate(e.target.checked)}
                    disabled={loading || !!error}
                  />
                }
                label={t("codeMapping_13_applyFromDate")}
                sx={{ minWidth: "max-content" }}
              />

              <Secure.GLDatePicker
                resource_key="codeMapping_13_applyFromDate"
                format={dateFormat || "dd/MM/yyyy"}
                disabled={!applyFromDate || loading || !!error}
                value={actionDate}
                onChange={setActionDate}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { minWidth: 160 },
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              {/* <Divider orientation="vertical" sx={{ height: 32, mx: 1 }} /> */}

              <RadioGroup
                row
                value={codeFilter}
                onChange={(e) => setCodeFilter(e.target.value)}
              >
                <Secure.GLGenericFormControlLabel
                  resource_key="codeMapping_13_allMappings"
                  value="all"
                  control={<Radio size="small" />}
                  label={t("codeMapping_13_allMappings")}
                  disabled={loading || !!error}
                />
                <Secure.GLGenericFormControlLabel
                  resource_key="codeMapping_13_withExternalCode"
                  value="with"
                  control={<Radio size="small" />}
                  label={t("codeMapping_13_withExternalCode")}
                  disabled={loading || !!error}
                />
                <Secure.GLGenericFormControlLabel
                  resource_key="codeMapping_13_withoutExternalCode"
                  value="without"
                  control={<Radio size="small" />}
                  label={t("codeMapping_13_withoutExternalCode")}
                  disabled={loading || !!error}
                />
              </RadioGroup>
              {/* <Secure.GLButton
                resource_key="codeMapping_13_resetFilters"
                variant="outlined"
                color="error"
                size="small"
                onClick={() => {
                  setCodeFilter("all");
                  setApplyFromDate(false);
                  setActionDate(null);
                }}
                disabled={loading || !!error}
              /> */}

              <Tooltip
                title={t("codeMapping_13_resetFilters")}
                placement="bottom"
              >
                <span>
                  <Secure.GLIconButton
                    resource_key="codeMapping_13_resetFilters"
                    size="small"
                    onClick={() => {
                      setCodeFilter("all");
                      setApplyFromDate(false);
                      setActionDate(null);
                    }}
                    disabled={loading || !!error}
                  >
                    <CloseIcon />
                  </Secure.GLIconButton>
                </span>
              </Tooltip>

              <Divider orientation="vertical" sx={{ height: 32, mx: 1 }} />

              {/* <Secure.GLButton
                resource_key="codeMapping_13_importExcel"
                variant="outlined"
                color="info"
                size="small"
                disabled={loading || !!error}
              /> */}

              <Tooltip
                title={t("codeMapping_13_importExcel")}
                placement="bottom"
              >
                <span>
                  <Secure.GLIconButton
                    resource_key="codeMapping_13_importExcel"
                    size="small"
                    disabled={loading || !!error}
                  >
                    <GetAppRoundedIcon />
                  </Secure.GLIconButton>
                </span>
              </Tooltip>

              <Tooltip title="Download Map Data" placement="bottom">
                <span>
                  <Secure.GLIconButton
                    resource_key="codeMapping_13_uploadButton"
                    sx={{ p: 0 }}
                  >
                    <ExportButtonV3
                      items={filteredGridData}
                      fileName="MappingCode"
                      exportButtonProps={{
                        sx: { color: "primary.main", p: "5px" },
                        disabled: filteredGridData.length === 0,
                      }}
                    />
                  </Secure.GLIconButton>
                </span>
              </Tooltip>
              {/* <Button variant="outlined" color="info" size="small" disabled={loading || !!error}>
              Export Excel
            </Button> */}

              <Divider orientation="vertical" sx={{ height: 32, mx: 1 }} />

              <Secure.GLButton
                resource_key="codeMapping_13_suggestions"
                variant="contained"
                color="secondary"
                size="small"
                disabled={loading || !!error}
              />

              <Secure.GLButton
                resource_key="codeMapping_13_search"
                variant="contained"
                color="primary"
                size="small"
                onClick={handleSearch}
                disabled={!isSearchEnabled || loading || !!error || gridLoading}
              >
                {gridLoading
                  ? t("codeMapping_13_searching")
                  : t("codeMapping_13_search")}
              </Secure.GLButton>
            </Box>
          </Stack>
        </Grid>

        {/* DataGrid - Starts empty */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" mb={1} width="100%">
                {columns.map((col) => (
                  <Box key={col.field} flex={col.flex || 1} px={0.5}>
                    {col.field !== "actions" ? (
                      <TextField
                        fullWidth
                        size="small"
                        label={col.headerName}
                        value={
                          columnFilters[
                            col.field as keyof typeof columnFilters
                          ] || ""
                        }
                        onChange={(e) =>
                          setColumnFilters((prev) => ({
                            ...prev,
                            [col.field]: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      // Placeholder to preserve layout alignment

                      <Box sx={{ height: 40 }} />
                    )}
                  </Box>
                ))}
              </Box>

              <Box tabIndex={0} onKeyDown={handleKeyDown} height={500}>
                <DataGrid<MappingRow>
                  onRowClick={(params) => {
                    dispatch(setSelectedMapping(params.row));
                  }}
                  apiRef={apiRef}
                  rows={filteredGridData}
                  columns={columns}
                  disableColumnMenu
                  disableColumnFilter
                  disableColumnSelector
                  disableDensitySelector
                  hideFooterSelectedRowCount
                  rowSelectionModel={
                    selectedMapping ? [selectedMapping.id] : []
                  }
                  onRowSelectionModelChange={(ids) => handleRowSelection(ids)}
                  pageSizeOptions={[5, 10, 25]}
                  loading={gridLoading}
                  getRowId={(row) => row.id}
                  sx={{
                    "& .MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                  }}
                  // initialState={{
                  //   pagination: {
                  //     paginationModel: { page: 0, pageSize: 5 },
                  //   },
                  // }}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  slots={{
                    pagination: () => (
                      <Box
                        sx={{
                          padding: "10px 0px",
                          display: "flex",
                          width: "100%",
                          justifyContent: "start",
                        }}
                      >
                        <CustomPagination
                          totalPages={Math.ceil(
                            filteredGridData.length / paginationModel.pageSize,
                          )}
                          currentPage={paginationModel.page + 1}
                          limit={paginationModel.pageSize}
                          onPageChange={(newPage) =>
                            setPaginationModel((prev) => ({
                              ...prev,
                              page: newPage - 1,
                            }))
                          }
                          setLimit={(newLimit) =>
                            setPaginationModel({ page: 0, pageSize: newLimit })
                          }
                        />
                      </Box>
                    ),
                  }}
                  //pageSizeOptions={[]} // Disable default page size options
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* MAPPING DIALOG */}
      <GenericDialog
        open={openMappingDialog}
        onClose={handleCloseDialog}
        title={
          !selectedMapping?.map_to_code_id
            ? t("codeMapping_13_mapRow")
            : t("codeMapping_13_editMap")
        }
        icon={
          <MapIcon
            sx={{
              backgroundImage: "linear-gradient(#2764AF, #55C5D6)",
              color: "white",
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
          selectedMapping && (
            <AddEditMappingForm
              mapping={selectedMapping}
              dialogType={!selectedMapping?.map_to_code_id ? "create" : "edit"}
              externalCodes={externalCodes}
              onSubmit={handleSubmitMapping}
              onCancel={handleCloseDialog}
              loading={
                !selectedMapping?.map_to_code_id
                  ? createMappingLoading
                  : updateMappingLoading
              }
            />
          )
        }
        maxWidth="md"
        sx={{
          "& .MuiDialog-paper": {
            minWidth: "50vw",
            maxWidth: "60vw",
          },
        }}
      />
      <GenericDialog
        open={openSetDialog}
        onClose={handleCloseSetDialog}
        title={setDialogMode === "create" ? "Add New Set" : "Edit Set"}
        icon={
          <LayersIcon
            sx={{
              backgroundImage: "linear-gradient(#2764AF, #55C5D6)",
              color: "white",
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
          <AddEditSetForm
            mode={setDialogMode}
            currentSet={setDialogMode === "create" ? null : selectedSet}
            onSubmit={handleSubmitSet}
            onCancel={handleCloseSetDialog}
            loading={setOperationLoading}
            error={setOperationError}
            allCodeTypes={AllCodeTypes}
          />
        }
        maxWidth="md"
        sx={{
          "& .MuiDialog-paper": {
            minWidth: "40vw",
            maxWidth: "50vw",
          },
        }}
      />

      <ConfirmDeleteDialog
        open={openDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
        title={"Confirm to delete"}
        message={"Are you sure you want to delete this MAP ?"}
        errorMsg={error || null}
      />
    </Box>
  );
}
