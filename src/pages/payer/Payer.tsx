import { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Stack,
  IconButton,
  InputAdornment,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Menu,
  Tooltip,
  TextField,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

import { EditPayerForm } from "./EditPayerForm";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import {
  fetchPayers,
  setPage,
  setSelectedId,
  setSortField,
  setSortOrder,
} from "../../redux/slices/payerSlice";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import DeletePayerDialog from "./DeletePayerDialog";
import { ClearIcon } from "@mui/x-date-pickers";
import SearchIcon from "@mui/icons-material/Search";
import {
  GlPanelTable,
  Secure,
  GlCustomTable,
  DisplayMsgDialog,
} from "@givc/shared-components";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import PolicyComponent from "./PolicyComponent";
import api, { fetcher } from "../../utils/Api";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import { AddPayerForm } from "./AddPayerForm";
import { publicUrl } from "../../utils/publicUrl";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UpdateIcon from "@mui/icons-material/Update";
import ImportExportIcon from "@mui/icons-material/ImportExport";

const CustomTable = GlCustomTable as React.ComponentType<any>;

function Payer({ facility_id }: { facility_id?: number | string | null }) {
  //==================  * Resources * ===================

  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;

  const dispatch = useDispatch<AppDispatch>();
  const {
    payers,
    loading,
    totalPages,
    page,
    limit,
    selectedPayerId,
    sortField,
    sortOrder,
  } = useSelector((state: RootState) => state.payer);
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderId, setSortOrderId] = useState("desc");
  const [sortOrderDesc, setSortOrderDesc] = useState("desc");
  const [sortOrderDate, setSortOrderDate] = useState("desc");
  const [isImporting, setIsImporting] = useState(false);
  const payersRefetchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (payersRefetchRef.current && facility_id) {
      payersRefetchRef.current();
    }
  }, [facility_id]);
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [systemPayers, setSystemPayers] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isUpdatingCHINo, setIsUpdatingCHINo] = useState(false);
  const [payerTableKey, setPayerTableKey] = useState(0);
  const openActionMenu = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const inputColumns: GridColDef[] = [
    {
      field: "more_info",
      headerName: "",
      flex: 5,
      sortable: false,
      renderCell: (params: any) => {
        const payer = params.row;

        return (
          <Box
            display="flex"
            alignItems="center"
            width="100%"
            height="100%"
            gap={1}
            px={0.5}
            sx={{ height: "100%", alignItems: "center" }}
          >
            {/* Icon */}
            {payer.icon_file_name ? (
              <Box
                component="img"
                src={publicUrl(`payer_logo/${payer.icon_file_name}`)}
                alt="Icon"
                sx={{
                  width: 28,
                  height: 28,
                  minWidth: 28,
                  objectFit: "contain",
                  borderRadius: 1,
                  boxShadow: 1,
                  alignSelf: "center",
                  my: "auto",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  minWidth: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 1,
                  boxShadow: 1,
                  bgcolor: "#f0f0f0",
                  fontSize: 8,
                  color: "text.secondary",
                  alignSelf: "center",
                  my: "auto",
                }}
              >
                <Typography fontSize={7} variant="caption" noWrap>
                  No Icon
                </Typography>
              </Box>
            )}

            {/* Info */}
            <Box
              display="flex"
              alignItems="center"
              gap={0.75}
              flex={1}
              minWidth={0}
              sx={{ alignSelf: "center" }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                noWrap
                sx={{ fontSize: 12 }}
              >
                {payer.payer_id} - {payer.description || payer.short_name}
              </Typography>
              {payer.tpa_id && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ fontSize: 11 }}
                >
                  (Managed by TPA)
                </Typography>
              )}
              {payer.is_tpa === "Y" && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ fontSize: 11 }}
                >
                  (TPA)
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    // {
    //   field: "actions",
    //   headerName: "",
    //   width: 45,
    //   sortable: false,
    //   filterable: false,
    //   disableColumnMenu: true,
    //   renderCell: (params: any) => {
    //     const payer = params.row;
    //     return (
    //       <Box
    //         sx={{
    //           display: "flex",
    //           justifyContent: "flex-end",
    //           alignItems: "center",
    //           width: "100%",
    //         }}
    //       >
    //         <DeletePayerDialog
    //           selectedPayer={payer}
    //           onDeleted={handlePayerDeleted}
    //         />
    //       </Box>
    //     );
    //   },
    // },
  ];

  const sortBy = (field: string, order: string) => {
    dispatch(
      fetchPayers({
        page: page,
        limit: limit,
        sortField: field,
        sortOrder: order,
        searchField: searchValue,
      }),
    );
  };

  const [selectedPayer, setSelectedPayer] = useState(null);

  // useEffect(() => {
  //   dispatch(
  //     fetchPayers({
  //       page: page,
  //       limit: limit,
  //       sortField: sortField,
  //       sortOrder: sortOrder,
  //       searchField: searchValue,
  //     })
  //   );
  // }, []);

  const handlePageChange = (currPage: number) => {
    dispatch(setPage(currPage));
  };

  const handleSelectPayerId = (payerId: number | null) => {
    dispatch(setSelectedId(payerId));
  };

  const handlePayerDeleted = () => {
    handleSelectPayerId(null);
    setSelectedPayer(null);
    payersRefetchRef.current?.();
  };

  const handleValueSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    // setPage(1);
    setSearchValue(value); // Update local state
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
    setSearchValue(searchValue);
    dispatch(
      fetchPayers({
        page: 1,
        limit: limit,
        sortField: sortField,
        sortOrder: sortOrder,
        searchField: searchValue,
      }),
    );
    dispatch(setPage(1));
  };
  const handleClearSearch = () => {
    setSearchValue("");
  };

  const [disable, setDisable] = useState(true);

  const openEditMode = () => {
    setDisable(false);
  };

  const closeEditMode = () => {
    setDisable(true);
  };

  const columns = [
    {
      field: "more_info",
      headerName: "",
      width: 450,
      sortable: false,
      renderCell: (params: any) => {
        const payer = params.row;
        return (
          <Stack py={1} spacing={1}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap="10px"
            >
              {/* Info Section */}
              <Box flexGrow={1}>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" width="400px">
                      <b>
                        {payer.payer_id} - {payer.short_name}
                      </b>
                    </Typography>
                  </Grid>

                  <Grid item xs={4}></Grid>

                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      {payer.is_tpa === "N" ? "" : "Managed By TPA"}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      CCHI No: {payer.cchi_no || "-"}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Code: {payer.payer_bk || "-"}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Nphies Lic: {payer.nphies_license || "-"}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              {/* Icon Section */}
              {payer.icon_file_name ? (
                <Box ml={2}>
                  <img
                    src={publicUrl(`payer_logo/${payer.icon_file_name}`)}
                    alt="Icon"
                    style={{
                      width: 50,
                      height: 50,
                      objectFit: "contain",
                      borderRadius: 8,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                </Box>
              ) : (
                <Box ml={8}></Box>
              )}
              {selectedPayer && (
                <DeletePayerDialog
                  selectedPayer={selectedPayer}
                  onDeleted={handlePayerDeleted}
                />
              )}
            </Box>
          </Stack>
        );
      },
    },
  ];

  const toggleSortOrderId = () => {
    const newOrder = sortOrderId === "desc" ? "asc" : "desc";
    setSortOrderId(newOrder);
    sortBy("payer_id", newOrder);
    dispatch(setSortField("payer_id"));
    dispatch(setSortOrder(newOrder));
  };

  const toggleSortOrderDesc = () => {
    const newOrder = sortOrderDesc === "desc" ? "asc" : "desc";
    setSortOrderDesc(newOrder);
    sortBy("description", newOrder);
    dispatch(setSortField("description"));
    dispatch(setSortOrder(newOrder));
  };

  const toggleSortOrderDate = () => {
    const newOrder = sortOrderDate === "desc" ? "asc" : "desc";
    setSortOrderDate(newOrder);
    sortBy("creation_date", newOrder);
    dispatch(setSortField("creation_date"));
    dispatch(setSortOrder(newOrder));
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      handleMenuClose();
      setErrorMsg("");
      setSuccessMsg("");
      const result = await api.get("/payers/importFromHIS");
      setOpen(true);
      setSuccessMsg(`${result.data.rowCount} were imported`);
      payersRefetchRef?.current?.();
      mutate((key) => apiUtility(key, "/payers/new"));
      mutate((key) => apiUtility(key, "/payers/systemPayers"));
    } catch (error: any) {
      setOpen(true);
      setErrorMsg(
        error?.response?.data?.error ||
          error?.message ||
          "Error while importing payers from HIS",
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleUpdateChiNo = async () => {
    try {
      setIsUpdatingCHINo(true);
      handleMenuClose();
      setErrorMsg("");
      setSuccessMsg("");
      const result = await api.get("/payers/updateChiNo");
      setOpen(true);
      setSuccessMsg(`${result.data.rowCount} CHI numbers were updated`);
      payersRefetchRef?.current?.();
      mutate((key) => apiUtility(key, "/payers/new"));
      mutate((key) => apiUtility(key, "/payers/systemPayers"));
      mutate((key) => apiUtility(key, "/payers"));
      console.log("updaating ..............");
    } catch (error: any) {
      setOpen(true);
      setErrorMsg(
        error?.response?.data?.error ||
          error?.message ||
          "Error while updating CHI numbers",
      );
    } finally {
      setIsUpdatingCHINo(false);
    }
  };
  return (
    <Box display="flex" width="100%">
      <DisplayMsgDialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        getResource={false}
        status={errorMsg ? "ERROR" : "INFO"}
        description={errorMsg || successMsg}
      />
      <HandleTitle titleKey="PAYERS" />
      {/* <TextExtractorTool function_id={7} /> */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {/* Sidebar */}
      <Box
        sx={{
          width: "30%",
          pr: 2,
          "& .MuiStack-root": {
            pb: "0px !important",
            paddingBottom: "0px !important",
            mb: "0px !important",
            marginBottom: "0px !important",
          },
        }}
        borderRight="1px solid #ccc"
      >
        <Box sx={{ minHeight: 600 }}>
          <GlPanelTable
            // showFilterIcon={true}
            filterSection={
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  mb: 0,
                  pb: 0,
                }}
              >
                <TextField
                  id="quickSearch"
                  size="small"
                  fullWidth
                  placeholder={t("payers_7_Description") || "Description"}
                  variant="outlined"
                  value={searchValue}
                  onChange={handleValueSearchChange}
                  onKeyDown={handleKeyDownSearch}
                  sx={{
                    mb: 0,
                    "& .MuiOutlinedInput-root": {
                      paddingRight: "4px",
                    },
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          {searchValue && (
                            <IconButton
                              onClick={handleClearSearch}
                              size="small"
                            >
                              <ClearIcon />
                            </IconButton>
                          )}
                          <IconButton
                            onClick={() => handleSearch()}
                            size="small"
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box>
                    <Secure.GLIconButton2
                      permission="payers_7_payersActionsMenu"
                      fallBackText="Actions Menu"
                    >
                      <IconButton onClick={handleMenuOpen}>
                        <MoreVertIcon />
                      </IconButton>
                    </Secure.GLIconButton2>
                    <Menu
                      anchorEl={anchorEl}
                      open={openActionMenu}
                      onClose={handleMenuClose}
                    >
                      <MenuItem>
                        <Secure.GLButton2
                          permission="payers_7_importPayers"
                          disabled={isImporting}
                          onClick={handleImport}
                          fallBackText={
                            isImporting
                              ? t("payers_7_importingPayers")
                              : t("payers_7_importPayers")
                          }
                          sx={{
                            p: 0,
                          }}
                          startIcon={<ImportExportIcon />}
                        />
                      </MenuItem>

                      <MenuItem>
                        <Secure.GLButton2
                          permission="payers_7_UpdateCHINo"
                          disabled={isUpdatingCHINo}
                          onClick={handleUpdateChiNo}
                          fallBackText={
                            isUpdatingCHINo
                              ? t("payers_7_updatingCHI")
                              : t("payers_7_UpdateCHINo")
                          }
                          sx={{
                            p: 0,
                          }}
                          startIcon={<UpdateIcon />}
                        />
                      </MenuItem>

                      {/* <MenuItem>
                        <Button
                          variant="outlined"
                          disabled={isImporting}
                          onClick={handleImport}
                          sx={{ width: "120px" }}
                        >
                          {isImporting ? "importing..." : "import"}
                        </Button>
                      </MenuItem> */}
                      {/* <MenuItem>
                        <Button
                          variant="outlined"
                          disabled={isUpdatingCHINo}
                          onClick={handleUpdateChiNo}
                          sx={{ width: "120px" }}
                        >
                          {isUpdatingCHINo ? "updating..." : "Update CHI No"}
                        </Button>
                      </MenuItem> */}

                      <MenuItem>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <AddPayerForm
                            refetchRef={payersRefetchRef}
                            onPayerAdded={() => setPayerTableKey((k) => k + 1)}
                          />
                        </Box>
                      </MenuItem>
                      {selectedPayer && (
                        <MenuItem>
                          <DeletePayerDialog
                            selectedPayer={selectedPayer}
                            onDeleted={handlePayerDeleted}
                          />
                        </MenuItem>
                      )}
                      {/*amer*/}
                    </Menu>
                  </Box>
                </Box>
              </Box>
            }
          >
            <CustomTable
              className="exact-40px-rows"
              key={payerTableKey}
              fetcher={fetcher}
              refetchRef={payersRefetchRef}
              localeText={{
                noRowsLabel: "✨ No data available",
                noResultsOverlayLabel: "✨ No data available",
              }}
              customSortColumns={["payer_id", "description", "creation_date"]}
              actionsSideSort={
                <FormControlLabel
                  sx={{ m: 0 }}
                  label="System Payers"
                  control={
                    <Checkbox
                      checked={systemPayers}
                      onChange={(event) => {
                        setSystemPayers(event.target.checked);
                        setPayerTableKey((k) => k + 1);
                      }}
                    />
                  }
                />
              }
              smallSize
              // smallSize={true}
              loading={false}
              // string + _sort
              // autoSelectFirstRow
              url={systemPayers ? "/payers/systemPayers" : "/payers/new"}
              limit={15}
              columns={inputColumns}
              getRowId={(row: any) => row.payer_id}
              getRowClassName={(params: any) =>
                params.row.facility_id === 0 ? "system-payer" : ""
              }
              hideHeader
              sx={{
                "& .MuiDataGrid-virtualScroller .MuiDataGrid-topContainer": {
                  height: "0px !important",
                },
                "& .MuiDataGrid-virtualScroller .MuiDataGrid-row--firstVisible":
                  {
                    marginTop: "0px !important",
                  },
                "& .MuiDataGrid-overlayWrapper": {
                  top: "0px !important",
                  height: "100px !important",
                  minHeight: "100px !important",
                },
                "& .MuiDataGrid-overlay": {
                  height: "100px !important",
                  minHeight: "100px !important",
                },
                "&:has(.MuiDataGrid-overlayWrapper) .MuiDataGrid-virtualScroller":
                  {
                    height: "100px !important",
                    minHeight: "100px !important",
                  },
                "&:has(.MuiDataGrid-overlayWrapper) .MuiDataGrid-virtualScrollerContent":
                  {
                    height: "100px !important",
                    minHeight: "100px !important",
                  },
                "& .system-payer": {
                  backgroundColor: "#21b80d !important",
                },
                "& .system-payer:hover": {
                  backgroundColor: "#7cf708 !important",
                },
              }}
              onRowSelected={(row: any) => {
                handleSelectPayerId(row?.payer_id ?? null);
                setSelectedPayer(row ?? null);
              }}
              params={{
                searchValue,
              }}
              pageSizeOptions={[5, 10, 15, 20, 25, 50]}
            ></CustomTable>
          </GlPanelTable>
        </Box>
      </Box>
      {/* Main Form */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          pl: 2,
          gap: 1,
          width: "70%",
        }}
      >
        <EditPayerForm
          selectedPayer={selectedPayer}
          selectedPayerId={selectedPayerId}
          openEditMode={openEditMode}
          closeEditMode={closeEditMode}
          disable={disable}
          setDisable={setDisable}
          reftech={payersRefetchRef}
        />
        {selectedPayer && (
          <>
            <PolicyComponent />
          </>
        )}
      </Box>
      {/* <PolicyComponent /> */}
    </Box>
  );
}

export default Payer;
