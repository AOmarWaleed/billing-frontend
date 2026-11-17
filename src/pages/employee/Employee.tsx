import { useEffect, useState, useRef, useContext } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid2,
  CircularProgress,
  Stack,
  IconButton,
  InputAdornment,
  useTheme,
} from "@mui/material";
//Icons
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import {
  AuthGuardContext,
  Secure,
  GlPanelTable,
  GlCustomTable,
  DisplayMsgDialog,
} from "@givc/shared-components";
import SearchIcon from "@mui/icons-material/Search";

import {
  // fetchEmployees,
  deleteEmployee,
  setPage,
  setSelectedId,
  setLimit,
  setSortField,
  setSortOrder,
  fetchCodes,
  fetchEmployees,
} from "../../redux/slices/employeeSlice";
import { EditEmployeeForm } from "../employee/EditEmployeeForm";
import { DataGrid, GridRowId } from "@mui/x-data-grid";
import AddEmployeeForm from "../employee/AddEmployeeForm";
import { useAppSelector } from "../../hooks/hooks";
import { useLanguage } from "../../context/LanguageContext";
import { useTransSlice } from "../../redux/slices/transSlice";
import { createResourceHelpers } from "../../utils/resourceMapping/createResourceHelpers";
import ConfirmDeleteDialog from "../../components/deleteDialog/ConfirmDeleteDialog";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import { publicUrl } from "../../utils/publicUrl";
import { fetcher } from "../../utils/Api";
// context || red
export default function Employee() {
  const { t } = useContext(AuthGuardContext);

  const dispatch = useDispatch<AppDispatch>();
  const {
    employees,
    loading,
    totalPages,
    page,
    limit,
    selectedEmployeeId,
    sortField,
    sortOrder,
  } = useSelector((state: RootState) => state.employee);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const [searchValue, setSearchValue] = useState("");
  const [sortOrderId, setSortOrderId] = useState<"asc" | "desc">("desc");
  const [sortOrderEmployee, setSortOrderEmployee] = useState<"asc" | "desc">(
    "desc",
  );
  const [sortOrderName, setSortOrderName] = useState<"asc" | "desc">("desc");
  const [deleteId, setDeleteId] = useState<GridRowId | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [errMsg, setErrMsg] = useState<String>("");
  const theme = useTheme();

  useEffect(() => {
    dispatch(
      fetchEmployees({
        page,
        limit,
        sortBy: sortField,
        sortDirection: sortOrder,
        searchBasic: searchBasic,
        usePagedData: true,
      }),
    );
  }, []);

  //open delete dialog
  const openDialog = (id: GridRowId) => () => {
    setDeleteId(id);
    setDialogOpen(true);
  };

  //close delete dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setDeleteId(null);
  };

  // const { resource } = useAppSelector((state) => state.trans);
  // const { language } = useLanguage();
  // const { getPageResources } = useTransSlice();
  // const user = useAppSelector((state) => state.auth.user);
  // const { t } = createResourceHelpers(resource.resources);

  const inputColumns = [
    {
      field: "employee_id",
      headerName: "Employee",
      sortable: true,
      flex: 5,
      renderCell: (params: any) => {
        const employee = params.row;
        return (
          <Box
            display="flex"
            alignItems="center"
            width="100%"
            gap={1}
            px={1}
            py={0.5}
            sx={{ minHeight: 0 }}
          >
            <Box
              display="flex"
              flexDirection="column"
              gap={0}
              flex={1}
              minWidth={0}
            >
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  noWrap
                  sx={{ fontSize: 12 }}
                >
                  {employee.employee_id} -{" "}
                  {(employee.first_name || "") +
                    " " +
                    (employee.middle_names || "") +
                    " " +
                    (employee.last_name || "")}
                </Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={2}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ fontSize: 11 }}
                >
                  {t("employee_21_employeeNo") || "Employee No:"}{" "}
                  {employee.employee_no || "-"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ fontSize: 11 }}
                >
                  {t("employee_21_mobileNo") || "Mobile No:"}{" "}
                  {employee.mobile_no || "-"}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params: any) => {
        return (
          <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
            <Secure.GLIconButton
                resource_key="employee_21_deleteEmployee"
                onClick={openDialog(params.row.employee_id)}
              >
                <img
                  src={publicUrl(`themes/${theme.palette.mode}/icons/delete.png`)}
                  alt="Delete"
                />
              </Secure.GLIconButton>
          </Box>
        );
      }
    }
  ];

  //==================  * Resources * ===================
  // const [sortParam, setSortParam] = useState(""); //! sort

  // const toggleSortOrderId = () => {
  //   const newOrder = sortOrderId === "asc" ? "desc" : "asc";
  //   setSortOrderId(newOrder);

  //   // dispatch(setSortField("employee_id"));
  //   // dispatch(setSortOrder(newOrder));
  //   // dispatch(
  //   //   fetchEmployees({
  //   //     page,
  //   //     limit,
  //   //     sortBy: "employee_id",
  //   //     sortDirection: newOrder,
  //   //     searchBasic: searchValue,
  //   //   })
  //   // );
  // };

  // const toggleSortEmployee = () => {
  //   const newOrder = sortOrderEmployee === "asc" ? "desc" : "asc";
  //   setSortOrderEmployee(newOrder);

  //   dispatch(setSortField("employee_no"));
  //   dispatch(setSortOrder(newOrder));
  //   dispatch(
  //     fetchEmployees({
  //       page,
  //       limit,
  //       sortBy: "employee_no",
  //       sortDirection: newOrder,
  //       searchBasic: searchValue,
  //     })
  //   );
  // };

  // const toggleSortName = () => {
  //   const newOrder = sortOrderName === "asc" ? "desc" : "asc";
  //   setSortOrderName(newOrder);

  //   dispatch(setSortField("first_name"));
  //   dispatch(setSortOrder(newOrder));
  //   dispatch(
  //     fetchEmployees({
  //       page,
  //       limit,
  //       sortBy: "first_name",
  //       sortDirection: newOrder,
  //       searchBasic: searchValue,
  //     })
  //   );
  // };

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1111
  const [disable, setDisable] = useState(true);
  const refetchTable = useRef<() => void | null>(null);

  const openEditMode = () => {
    setDisable(false);
  };

  const closeEditMode = () => {
    setDisable(true);
  };

  // let selectedEmployee = employees.find(
  //   (employee) => employee.employee_id === selectedEmployeeId
  // );

  // const handlePageChange = (currPage: number) => {
  //   dispatch(setPage(currPage));
  // };

  const handleSelectEmployeeId = (employeeId: number) => {
    dispatch(setSelectedId(employeeId));
  };

  // const handleLimitChange = (limit: number) => {
  //   dispatch(setLimit(limit));
  // };

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  const handleDeleteClick = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteEmployee({ id: deleteId }))
        .unwrap()
        .then(() => {
          setDialogOpen(false);
          // refetchTable.current && refetchTable.current();
          mutate((e) => apiUtility(e, "allempspagedata"));
          refetchTable?.current?.();
          // Refresh employee list after delete
          // dispatch(
          //   fetchEmployees({
          //     page,
          //     limit,
          //     sortBy: "employee_id",
          //     sortDirection: sortOrder,
          //     searchBasic: searchValue,
          //   })
          // );
        });
    } catch (err: any) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg("Employee already taken");
      } else {
        setErrMsg("Deleting employee failed");
      }
      errRef.current?.focus();
    }
  };

  const [searchBasic, setSearchBasic] = useState("");
  const handleSearchField = (e: string) => {
    if (e.trim() === "" && e !== "") return;

    setSearchValue(e);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      setSearchBasic(e.trim());
      // dispatch(
      //   fetchEmployees({
      //     page,
      //     limit,
      //     sortBy: sortField,
      //     sortDirection: sortOrder,
      //     searchBasic: e.trim(),
      //   })
      // );
    }, 500);
  };

  // useEffect(() => {
  //   dispatch(
  //     fetchEmployees({
  //       page,
  //       limit,
  //       sortBy: sortField,
  //       sortDirection: sortOrder,
  //       searchBasic: searchValue,
  //     })
  //   );
  // }, [dispatch, page, limit, sortField, sortOrder, searchValue]);

  useEffect(() => {
    dispatch(fetchCodes());
  }, [dispatch]);

  return (
    <Box display="flex" width="100%" p={2}>
      <HandleTitle titleKey="EMPLOYEE" />
      {/* <TextExtractorTool function_id={21} /> */}
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
      <Box sx={{ width: "30%", pr: 2 }} borderRight="1px solid #ccc">
        <Box sx={{ minHeight: 600 }}>
          <GlPanelTable
            // showFilterIcon={true}
            filterSection={
              <Box sx={{ width: "100%", display: "flex" }}>
                <TextField
                  value={searchValue}
                  type="search"
                  onChange={(e) => handleSearchField(e.target.value)}
                  placeholder={
                    t("employee_21_searchByIdNameMobile") ||
                    "Search by ID, Name, Mobile"
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{ width: "100%" }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            }
          >
            {/*!params => sortBy, sortDirection, searchBasic, usePagedData = true */}
            <GlCustomTable
              className="exact-40px-rows"
              refetchRef={refetchTable}
              fetcher={fetcher}
              localeText={{
                noRowsLabel: "✨ No data available",
                noResultsOverlayLabel: "✨ No data available",
              }}
              customSortColumns={[
                // "employee_no",
                "first_name",
                "employee_id",
                "creation_date",
                // "last_name",
              ]}
              smallSize
              limit={10}
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
              url="/api/employee/allempspagedata"
              columns={inputColumns}
              loading={false}
              getRowId={(row: any) => row.employee_id}
              hideHeader
              handleDataChange={(d: any[]) => {
                if (d.length === 0) {
                  setSelectedEmployee(null);
                }
              }}
              onRowSelected={(row: any) => {
                setSelectedEmployee(row ?? null);
                if (row) handleSelectEmployeeId(row.employee_id);
              }}
              params={{
                searchBasic: searchBasic,
              }}
              actionsSideSort={
                <>
                  <Box sx={{ marginLeft: "auto !important" }}>
                    <AddEmployeeForm refetchTable={refetchTable} />
                  </Box>
                </>
              }
            />
          </GlPanelTable>

          {/* <DataGrid
            rows={employees}
            columns={inputColumns}
            onRowClick={(params) =>
              handleSelectEmployeeId(params.row.employee_id)
            }
            getRowClassName={(params) =>
              params.row.employee_id === selectedEmployeeId
                ? "selected-row"
                : ""
            }
            slots={{
              pagination: () => {
                return (
                  <Box
                    sx={{
                      padding: "10px 0px",
                      display: "flex",
                      width: "100%",
                      justifyContent: "start",
                    }}
                  >
                    <CustomPagination
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      currentPage={page}
                      limit={limit}
                      setLimit={handleLimitChange}
                    />
                  </Box>
                );
              },
            }}
            rowHeight={49}
            autoHeight
            sx={{
              ".MuiDataGrid-columnHeaders": {
                display: "none",
              },
            }}
          /> */}
        </Box>
      </Box>

      {/* Main Form */}
      <EditEmployeeForm
        selectedEmployee={selectedEmployee}
        selectedEmployeeId={selectedEmployeeId}
        openEditMode={openEditMode}
        closeEditMode={closeEditMode}
        disable={disable}
        setDisable={setDisable}
        updateTable={refetchTable}
        refetchTable={refetchTable}
      />

      {/* <ConfirmDeleteDialog
        open={isDialogOpen}
        onClose={closeDialog}
        onConfirm={handleDeleteClick}
        title={t("employee_21_confirmToDelete") || "Confirm to delete"}
        message={
          t("employee_21_areYouSureYouWantToDeleteThisEmployee") ||
          "Are you sure you want to delete this Employee?"
        }
        errorMsg={null}
      /> */}
      <DisplayMsgDialog 
        open={isDialogOpen}
        onClose={closeDialog}
        onAction={handleDeleteClick}
        description={t("employee_21_areYouSureYouWantToDeleteThisEmployee") || "Are you sure you want to delete this Employee?"}
        actionColor="error"
        actionLabel="Delete"
      />
    </Box>
  );
}
