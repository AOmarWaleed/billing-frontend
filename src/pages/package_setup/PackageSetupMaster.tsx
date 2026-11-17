/**
 * @company GIVC
 * @author Engr. Sahar AlHaddad <saharalhaddad2011@gmail.com>
 * @created 2025-08-31
 * @modified
 */

import React, { useEffect, useState, useRef, useContext } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
  clearError,
  createPackage,
  setSelectedPackage,
  deleteParentPackage,
  fetchCodeDataListByCodeType,
  fetchPackagesDeps,
  setSelectedItem,
  clearSelectedItem,
  addPackage,
} from "../../redux/slices/packageSetupSlice";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PackageTabs from "./PackageTabs";
import CategoryIcon from "@mui/icons-material/Category";
import { ClearIcon } from "@mui/x-date-pickers";
import SearchIcon from "@mui/icons-material/Search";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import ConfirmDeleteDialog from "../../components/deleteDialog/ConfirmDeleteDialog";
import { Cancel, CheckCircle } from "@mui/icons-material";
import CustomPackageRow from "./CustomPackageRow";
import ItemSelect from "../../components/paged-autocomplete/ItemSelect";
import GlCustomTable from "../../shared/tables/GlCustomTable";
import { CustomGridColDef } from "../../types/Columns";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import Secure from "../../shared/security";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
const PackageSetupMaster: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    packages,
    loading,
    error,
    selectedPackage,
    selectedItem,
    fetchError,
    sortField,
    sortOrder,
  } = useAppSelector((state) => state.package);

  const [searchValue, setSearchValue] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [apiParams, setApiParams] = useState<Record<string, any>>({
    sortField: sortField,
    sortOrder: sortOrder,
    searchField: "",
  });

  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;

  const refetchRef = useRef<(() => void) | null>(null);

  const apiUrl = `/api/package/new`;

  useEffect(() => {
    console.log({ selectedPackage });
  }, [selectedPackage]);

  useEffect(() => {
    dispatch(fetchCodeDataListByCodeType(7));
    dispatch(fetchPackagesDeps());
  }, [dispatch]);

  useEffect(() => {
    if (packages?.length) {
      dispatch(setSelectedPackage(selectedPackage || packages[0]));
    } else {
      dispatch(setSelectedPackage(null));
    }
  }, [packages, dispatch]);

  useEffect(() => {
    if (selectedPackage) {
      if (packages.length === 0) {
        dispatch(addPackage(selectedPackage));
      }
    }
  }, [selectedPackage, packages.length, dispatch]);

  const handleValueSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setSearchValue(value);
    // Trigger search immediately on change
    // setApiParams({
    //   ...apiParams,
    //   searchField: value,
    // });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setApiParams({
        ...apiParams,
        searchField: searchValue,
      });
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchValue]);

  const handleKeyDownSearch = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = () => {
    // Update apiParams to trigger refetch
    setApiParams({
      ...apiParams,
      searchField: searchValue,
    });
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setApiParams({
      ...apiParams,
      searchField: "",
    });
    dispatch(clearSelectedItem());
  };

  const handleAddClick = async (e: React.MouseEvent) => {
    dispatch(clearError());
    setOpenAddDialog(true);
  };

  const handleAddPackage = async (values: any) => {
    await dispatch(createPackage(values))
      .unwrap()
      .then(() => {
        setOpenAddDialog(false);
        // Trigger refetch
        if (refetchRef.current) {
          refetchRef.current();
        }
      })
      .catch((error) => {
        throw error;
      });
  };

  const handleDeleteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(clearError());
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (!selectedPackage) return;
    await dispatch(
      deleteParentPackage(selectedPackage.package_item_id.toString()),
    )
      .unwrap()
      .then(() => {
        setOpenDeleteDialog(false);
        // Trigger refetch
        if (refetchRef.current) {
          refetchRef.current();
        }
      })
      .catch((error: any) => {
        throw error;
      });
  };

  const handleRowSelected = (selectedRow: any) => {
    if (selectedRow) {
      dispatch(setSelectedPackage(selectedRow));
    } else {
      dispatch(setSelectedPackage(null));
    }
  };

  const handleDataChange = (data: any[]) => {
    // Optional: handle data changes if needed
    console.log("Data updated:", data);
  };

  const columns: CustomGridColDef[] = [
    {
      field: "packageInfo",
      headerName: t("packageSetup_15_PackageInfo"),
      resource_key: "packageSetup_15_PackageInfo",
      flex: 8,
      renderCell: (params) => <CustomPackageRow {...params.row} />,
    },
    {
      field: "status",
      headerName: t("packageSetup_15_Status"),
      resource_key: "packageSetup_15_Status",

      flex: 1,
      renderCell: (params) =>
        params.value === "ACTIVE" ? (
          <CheckCircle style={{ color: "#4caf50", fontSize: "1.2rem" }} />
        ) : (
          <Cancel style={{ color: "#f44336", fontSize: "1.2rem" }} />
        ),
    },
  ];

  return (
    <Box display="flex" width="100%">
      <HandleTitle titleKey="PACKAGE_SETUP" />
      <Box flex={2} p={1} borderRight="1px solid #ccc">
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            fontWeight: 600,
            fontSize: "1.1rem",
          }}
        >
          <CategoryIcon
            sx={{ mr: 1, color: "primary.main", fontSize: "1.2rem" }}
          />
          {(t("packageSetup_15_PackageSetUp") || "Package Setup").replace(
            "SetUp",
            "Setup",
          )}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Secure.GLTextField
            resource_key=""
            id="quickSearch"
            placeholder={t("packageSetup_15_Description")}
            variant="outlined"
            value={searchValue || ""}
            disabled={selectedItem !== null}
            onChange={handleValueSearchChange}
            onKeyDown={handleKeyDownSearch}
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {searchValue && (
                    <IconButton
                      onClick={handleClearSearch}
                      size="small"
                      sx={{ padding: "4px" }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={handleSearch}
                    size="small"
                    sx={{ padding: "4px" }}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Tooltip title={t("packageSetup_15_SetUpPackage")}>
            <Secure.GLIconButton
              resource_key="packageSetup_15_SetUpPackage"
              sx={{
                height: 32,
                width: 32,
                borderRadius: 1,
                padding: "4px",
              }}
              onClick={handleAddClick}
            >
              <SettingsSuggestIcon fontSize="small" />
            </Secure.GLIconButton>
          </Tooltip>
        </Stack>

        <Box mt={2} sx={{ minHeight: 600 }}>
          <Secure.GlCustomTable
            className="exact-50px-rows"
            resource_key="packageSetup_15_PackageSetUp"
            url={apiUrl}
            params={apiParams}
            limit={10}
            columns={columns}
            getRowId={(row) => row.package_item_id.toString()}
            loading={loading}
            onRowSelected={handleRowSelected}
            handleDataChange={handleDataChange}
            refetchRef={refetchRef}
            enableKeyboardNavigation={true}
            autoSelectFirstRow={true}
            smallSize
          />
          {fetchError && <div style={{ color: "red" }}>{fetchError}</div>}
        </Box>
      </Box>

      <Box flex={5} sx={{ flexDirection: "column", gap: 1 }}>
        <PackageTabs
          packageId={selectedPackage?.package_item_id || 0}
          limited={selectedPackage?.limited || []}
          excluded={selectedPackage?.excluded || []}
          category={selectedPackage?.category || []}
        />
      </Box>

      <GenericDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          dispatch(clearError());
        }}
        title={t("packageSetup_15_SetUpPackage")}
        icon={<CategoryIcon />}
        content={
          <>
            <Box mb={3}>
              <Typography
                sx={{ color: "custom.light" }}
                variant="body1"
                fontWeight="bold"
                gutterBottom
              >
                {t("packageSetup_15_ItemRequired")}
              </Typography>

              <ItemSelect
                typeId="P"
                value={selectedItem}
                onChange={(opt) => {
                  dispatch(setSelectedItem(opt));
                }}
                placeholder={t("packageSetup_15_SelectItem")}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  my: 2,
                }}
              >
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => setOpenAddDialog(false)}
                >
                  {t("packageSetup_15_Cancel")}
                </Button>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  disabled={!selectedItem}
                  onClick={() => {
                    if (selectedItem) {
                      console.log({ selectedItem });
                      const itemDescription = selectedItem?.description;
                      setSearchValue(itemDescription);
                      setApiParams({
                        ...apiParams,
                        searchField: itemDescription,
                      });
                      setOpenAddDialog(false);
                    }
                  }}
                >
                  {t("packageSetup_15_SelectItemButton")}
                </Button>
              </Box>
            </Box>
          </>
        }
      />

      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          dispatch(clearError());
        }}
        onConfirm={handleDeleteConfirm}
        title={t("packageSetup_15_ConfirmToDelete")}
        message={t("packageSetup_15_DeletePackageConfirmation")}
        errorMsg={error || null}
      />
    </Box>
  );
};

export default PackageSetupMaster;
