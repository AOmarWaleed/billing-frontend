import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  IconButton,
  Divider,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
  Tooltip,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import { useSystemRulesSlice } from "../../redux/slices/systemSlice";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import { Module, SystemRule, FilterValues } from "./types/settings.types";
import { AddSystemRuleForm } from "./Components/AddSettingsForm";
import { UpdateSystemRuleForm } from "./Components/UpdateSettingsForm";
import { AddCircle } from "@mui/icons-material";
import GlPanelTable from "../../shared/tables/GlPanelTable";
import { Edit, Delete, RestartAlt, ContentCopy } from "@mui/icons-material";
import { ClearIcon } from "@mui/x-date-pickers";
import SearchIcon from "@mui/icons-material/Search";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { GridColDef } from "@mui/x-data-grid";
import Secure from "../../shared/security";
import { Secure as GalaxySecure } from "@givc/shared-components";
import { publicUrl } from "../../utils/publicUrl";
import { formatDate } from "../../utils/formatData/formatterv2";
import { DisplayMsgDialog } from "@givc/shared-components";

interface Page {
  pageid: number;
  description: string;
}

interface Group {
  group_id: number;
  group_name: string;
}

type CustomGridColDef = GridColDef & {
  id?: string;
  name?: string;
  resource_key: string;
};
export default function SystemRules({
  facility_id,
  selectedFacility,
}: {
  facility_id?: string | number;
  selectedFacility?: string;
}) {
  const {
    systemRulesSliceData,
    getSystemRulesFn,
    getModulesFn,
    deleteSystemRuleFn,
    resetSystemRuleFn,
    updateSystemRuleFn,
    addSystemRuleFn,
  } = useSystemRulesSlice();

  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }

  const { resourcesData, t, userLang } = ctx;
  const theme = useTheme();
  const {
    palette: { mode },
  } = theme;
  const refetchRef = useRef<(() => void) | null>(null);

  const viewedFacility = facility_id ?? selectedFacility ?? null;

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilterValue = (value: string) => {
    setActiveFilters((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    );
  };

  const handleToggleOverridden = () => {
    toggleFilterValue("overridden");
  };

  const handleToggleInherited = () => {
    toggleFilterValue("inherited");
  };

  const statusFilter =
    activeFilters.length === 0 ? null : [...activeFilters].sort().join(",");

  const [filters, setFilters] = useState({ search: "", module_id: "" });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const handleFilterInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    if (!nextFilters.search.trim() && !nextFilters.module_id) {
      setAppliedFilters({ search: "", module_id: "" });
    }
  };

  const handleFilter = () => {
    setAppliedFilters(filters);
  };

  const handleFilterKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") handleFilter();
  };

  const handleClear = () => {
    setFilters({ search: "", module_id: "" });
    setAppliedFilters({ search: "", module_id: "" });
  };

  const tableParams = useMemo(
    () => ({
      ...(viewedFacility ? { facility_id: viewedFacility } : {}),
      ...(statusFilter ? { config_status: statusFilter } : {}),
      ...(appliedFilters.search ? { _search: appliedFilters.search } : {}),
      ...(appliedFilters.module_id ? { module_id: appliedFilters.module_id } : {}),
    }),
    [viewedFacility, statusFilter, appliedFilters],
  );

  const tableKey = `${viewedFacility ?? "default"}_${statusFilter ?? "all"}_${appliedFilters.search}_${appliedFilters.module_id}`;

  const [applyFilter, setApplyFilter] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [params, setParams] = useState<FilterValues | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);

  const [confKeyToDelete, setConfKeyToDelete] = useState<string | null>(null);
  const [facilityIdToDelete, setFacilityIdToDelete] = useState<
    number | string | null
  >(null);
  const [rowToReset, setRowToReset] = useState<SystemRule | null>(null);
  const [rowToOverride, setRowToOverride] = useState<SystemRule | null>(null);
  const [rowToUpdate, setRowToUpdate] = useState<SystemRule>({
    conf_key: "",
    conf_value: "",
    description: "",
    module_id: "",
  });

  const isSystemRow = (row: SystemRule) => Number(row.facility_id) === 0;

  const textAlign: "left" | "right" = userLang === "ar" ? "right" : "left";

  const columns = useMemo((): CustomGridColDef[] => {
    const baseColumns: CustomGridColDef[] = [
      {
        field: "conf_key",
        flex: 1.2,
        minWidth: 140,
        align: textAlign,
        resource_key: "systemRules_3_ConfKey",
        id: "9697",
      },
      {
        field: "description",
        flex: 1.8,
        minWidth: 200,
        align: textAlign,
        resource_key: "systemRules_3_Description",
      },
      {
        field: "conf_value",
        flex: 1.8,
        minWidth: 180,
        align: textAlign,
        resource_key: "systemRules_3_ConfValue",

        renderCell: (params) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minWidth: 0, // مهم جدا
              width: "100%",
            }}
          >
            <span
              style={{
                whiteSpace: "normal",
                overflowWrap: "anywhere", // modern fix
                wordBreak: "break-all", // fallback aggressive break
                display: "block",
                width: "100%",
              }}
            >
              {params.value}
            </span>
          </Box>
        ),
      },
      {
        field: "module_id",
        flex: 0.6,
        minWidth: 100,
        align: textAlign,
        renderCell: (params) => {
          const id = params.row.module_id;
          const module = modules.find((module) => module.module_id === id);
          return <>{module ? `${id} -  ${module.description}` : id}</>;
        },
        resource_key: "systemRules_3_ModuleId",
      },
      {
        field: "created_by_name",
        flex: 0.6,
        minWidth: 100,
        align: textAlign,
        resource_key: "systemRules_3_CreatedBy",
        renderCell: (params) => <>{params.value || "—"}</>,
      },
      {
        field: "creation_date",
        flex: 0.6,
        minWidth: 110,
        align: textAlign,
        resource_key: "systemRules_3_CreationDate",
        renderCell: (params) => (
          <>{params.value ? formatDate(params.value, "DATE_FORMAT") : "—"}</>
        ),
      },
      {
        field: "modified_by_name",
        flex: 0.6,
        minWidth: 100,
        align: textAlign,
        resource_key: "systemRules_3_ModifiedBy",
        renderCell: (params) => <>{params.value || "—"}</>,
      },
      {
        field: "modification_date",
        flex: 0.6,
        minWidth: 110,
        align: textAlign,
        resource_key: "systemRules_3_ModificationDate",
        renderCell: (params) => (
          <>{params.value ? formatDate(params.value, "DATE_FORMAT") : "—"}</>
        ),
      },

      {
        field: "actions",
        width: 150,
        sortable: false,
        cellClassName: "actions-cell" /* inline styles */,
        renderHeader: () => (
          <Box display="flex" alignItems="center" gap={1} sx={{ width: "100%" }}>
            <Tooltip title={t("systemRules_3_Actions") || "actions"}>
              <Typography fontWeight="bold">actions</Typography>
            </Tooltip>
            <Box sx={{ flexGrow: 1 }} />
            <GalaxySecure.GLIconButton2
              permission="systemRules_3_AddSystemRule"
              uiText="systemRules_3_AddSystemRule"
              fallBackText="Add System Rule"
              onClick={() => {
                setAddOpen(true);
              }}
              size="small"
            >
              <img
                src={publicUrl(`themes/${mode}/icons/plus.png`)}
                width="15px"
                alt="add"
              />
            </GalaxySecure.GLIconButton2>
          </Box>
        ),
        renderCell: (params) => (
          <Box
            sx={{
              display: "flex",
              gap: 0,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {isSystemRow(params.row) ? (
              <GalaxySecure.GLIconButton2
                permission="systemRules_3_Override"
                uiText="systemRules_3_Override"
                fallBackText="Override to facility"
                onClick={() => {
                  setRowToOverride(params.row);
                  setOverrideOpen(true);
                }}
                size="small"
                sx={{
                  px: "8px" /* inline styles */,
                }}
              >
                <ContentCopy fontSize="small" />
              </GalaxySecure.GLIconButton2>
            ) : (
              <>
                <GalaxySecure.GLIconButton2
                  permission="systemRules_3_Edit"
                  uiText="systemRules_3_Edit"
                  fallBackText="Edit"
                  onClick={() => {
                    setRowToUpdate(params.row);
                    setEditOpen(true);
                  }}
                  size="small"
                  sx={{
                    px: "8px" /* inline styles */,
                  }}
                >
                  {/* <Edit fontSize="small" /> */}
                  <img src={publicUrl(`themes/${mode}/icons/pen.png`)} alt="Edit" />
                </GalaxySecure.GLIconButton2>
                <GalaxySecure.GLIconButton2
                  permission="systemRules_3_Reset"
                  uiText="systemRules_3_Reset"
                  fallBackText="Reset to default"
                  onClick={() => {
                    setRowToReset(params.row);
                    setResetOpen(true);
                  }}
                  size="small"
                  sx={{
                    px: "8px" /* inline styles */,
                  }}
                >
                  <RestartAlt fontSize="small" />
                </GalaxySecure.GLIconButton2>
                <GalaxySecure.GLIconButton2
                  permission="systemRules_3_Delete"
                  uiText="systemRules_3_Delete"
                  fallBackText="Delete"
                  onClick={() => {
                    setConfKeyToDelete(params.row.conf_key);
                    setFacilityIdToDelete(params.row.facility_id);
                    setDeleteOpen(true);
                  }}
                  size="small"
                  sx={{
                    px: "8px" /* inline styles */,
                  }}
                >
                  {/* <Delete fontSize="small" /> */}
                  <img
                    src={publicUrl(`themes/${mode}/icons/delete.png`)}
                    alt="Delete"
                  />
                </GalaxySecure.GLIconButton2>
              </>
            )}
          </Box>
        ),
        resource_key: "systemRules_3_Actions",
      },
    ];
    return baseColumns.map((col) =>
      col.renderHeader
        ? col
        : {
          ...col,
          renderHeader: (headerParams: any) => (
            <Tooltip
              title={headerParams.colDef.headerName || col.field}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {headerParams.colDef.headerName || col.field}
              </span>
            </Tooltip>
          ),
        },
    );
  }, [userLang, t, theme, mode, modules]);

  useEffect(() => {
    getModulesFn()
      .unwrap()
      .then((r) => {
        setModules(r.data);
      });
  }, []);

  useEffect(() => {
    if (applyFilter) return;
    setParams(null);
  }, [applyFilter]);

  const getServerMsg = (result: any, fallback: string) =>
    (result?.payload as any)?.err?.response?.data?.msg || fallback;

  const deleteRule = () => {
    if (confKeyToDelete) {
      deleteSystemRuleFn({
        conf_key: confKeyToDelete,
        facility_id: facilityIdToDelete ?? undefined,
      }).then((result: any) => {
        if (result?.type === "systemRules/delete/rejected") {
          toast.error(
            getServerMsg(result, "Failed to delete system rule"),
          );
          return;
        }
        toast.success("System rule deleted successfully");
        setDeleteOpen(false);
        mutate((e) => apiUtility(e, "api/systemRules"));
        refetchRef.current?.();
      });
    }
  };

  const resetRule = async () => {
    if (!rowToReset) return;
    const result = await resetSystemRuleFn({
      conf_key: rowToReset.conf_key,
      facility_id: rowToReset.facility_id ?? undefined,
    });
    if (result.type === "systemRules/reset/rejected") {
      toast.error(
        getServerMsg(
          result,
          t("systemRules_3_ResetFailed") ||
          "Reset failed: no System Default exists for this configuration",
        ),
      );
    } else {
      toast.success("Configuration reset to System Default value");
      setResetOpen(false);
      setRowToReset(null);
      mutate((e) => apiUtility(e, "api/systemRules"));
      refetchRef.current?.();
    }
  };

  const handleAddSystemRule = async (values: SystemRule) => {
    try {
      const result = await addSystemRuleFn(
        viewedFacility ? { ...values, facility_id: viewedFacility } : values,
      );
      if (result.type === "systemRules/add/rejected") {
        toast.error(
          getServerMsg(
            result,
            t("systemRules_3_ConfKeyExists") ||
            "The conf_key already exists, please try another one",
          ),
        );
      } else {
        toast.success("System rule added successfully");
        setAddOpen(false);
        mutate((e) => apiUtility(e, "api/systemRules"));
        refetchRef.current?.();
      }
    } catch (error) {
      console.error("Error adding system rule:", error);
    }
  };

  const handleOverrideSystemRule = async (values: SystemRule) => {
    if (!rowToOverride) return;
    try {
      const result = await addSystemRuleFn({
        ...values,
        conf_key: rowToOverride.conf_key,
        module_id: rowToOverride.module_id,
        ...(viewedFacility ? { facility_id: viewedFacility } : {}),
      });
      if (result.type === "systemRules/add/rejected") {
        toast.error(
          getServerMsg(
            result,
            t("systemRules_3_ConfKeyExists") ||
            "The conf_key already exists, please try another one",
          ),
        );
      } else {
        toast.success("System Default overridden for the facility");
        setOverrideOpen(false);
        setRowToOverride(null);
        setActiveFilters([]);
        mutate((e) => apiUtility(e, "api/systemRules"));
        refetchRef.current?.();
      }
    } catch (error) {
      console.error("Error overriding system rule:", error);
    }
  };

  const handleUpdateSystemRule = async (values: SystemRule) => {
    try {
      const result = await updateSystemRuleFn(rowToUpdate.conf_key, {
        ...values,
        facility_id: rowToUpdate.facility_id ?? undefined,
      });
      if (result.type === "systemRules/update/rejected") {
        toast.error(t("systemRules_3_PleaseTryAgain") || "Please try again");
      } else {
        toast.success("System rule updated successfully");
        setEditOpen(false);
        mutate((e) => apiUtility(e, "api/systemRules"));
        refetchRef.current?.();
      }
    } catch (error) {
      console.error("Error updating system rule:", error);
    }
  };

  return (
    <div>
      <HandleTitle titleKey="SYSTEM_RULES" />
      {/* <TextExtractorTool function_id={3} /> */}
      <GlPanelTable
        filterSection={
          <Stack direction="row" spacing={1} alignItems="center">
            <Secure.GLTextField
              resource_key="systemRules_3_Search"
              placeholder={t("systemRules_3_Search") || "Search by key, description, value"}
              variant="outlined"
              name="search"
              value={filters.search}
              onChange={handleFilterInputChange}
              onKeyDown={handleFilterKeyDown}
              size="small"
              type="search"
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
            <Secure.GLAutocomplete
              resource_key="systemRules_3_ModuleID"
              options={modules}
              getOptionLabel={(module: Module) =>
                `${module.module_id} - ${module.description}`
              }
              value={
                modules.find(
                  (module) =>
                    String(module.module_id) === filters.module_id,
                ) || null
              }
              onChange={(_: any, newValue: Module | null) => {
                const nextFilters = {
                  ...filters,
                  module_id: newValue ? String(newValue.module_id) : "",
                };
                setFilters(nextFilters);
                if (!nextFilters.search.trim() && !nextFilters.module_id) {
                  setAppliedFilters({ search: "", module_id: "" });
                }
              }}
              renderInput={(params: any) => (
                <TextField
                  label={t("systemRules_3_ModuleID") || "Module"}
                  {...params}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              )}
              isOptionEqualToValue={(option: Module, value: Module) =>
                option.module_id === value.module_id
              }
              sx={{
                width: 250,
                "& .MuiOutlinedInput-root": {
                  height: 32,
                  paddingRight: 1,
                },
                "& input": {
                  padding: "6px 10px !important",
                  fontSize: "0.875rem",
                  height: "100%",
                  boxSizing: "border-box",
                },
              }}
            />
            {(filters.search || filters.module_id) && (
              <Secure.GLIconButton
                resource_key="systemRules_3_ClearButton"
                onClick={handleClear}
              >
                <ClearIcon fontSize="small" />
              </Secure.GLIconButton>
            )}
            <Secure.GLIconButton
              resource_key="systemRules_3_SearchButton"
              onClick={handleFilter}
            >
              <SearchIcon />
            </Secure.GLIconButton>
            <Tooltip title={t("systemRules_3_Overridden") || "Overridden"}>
              <span>
                <GalaxySecure.GLSecureInputs.Checkbox
                  permission="systemRules_3_tabOverridden"
                  uiText="systemRules_3_Overridden"
                  label="Overridden"
                  sx={{
                    p: 0.5,
                    color: "grey.500",
                    "&.Mui-checked": { color: "grey.600" },
                  }}
                  checked={activeFilters.includes("overridden")}
                  onChange={handleToggleOverridden}
                  name="overridden"
                />
              </span>
            </Tooltip>
            <Tooltip title={t("systemRules_3_Inherited") || "Inherited"}>
              <span>
                <GalaxySecure.GLSecureInputs.Checkbox
                  permission="systemRules_3_tabInherited"
                  uiText="systemRules_3_Inherited"
                  label="Inherited"
                  sx={{
                    p: 0.5,
                    color: "primary.main",
                    "&.Mui-checked": { color: "primary.main" },
                  }}
                  checked={activeFilters.includes("inherited")}
                  onChange={handleToggleInherited}
                  name="inherited"
                />
              </span>
            </Tooltip>
          </Stack>
        }
      >
        <Secure.GlCustomTable
          key={tableKey}
          resource_key="systemRules_3_SettingsTable"
          columns={columns}
          url="api/systemRules"
          getRowId={(r) => `${r.conf_key}_${r.facility_id}`}
          autoSelectFirstRow={false}
          getRowClassName={(params: any) =>
            Number(params.row.facility_id) === 0 &&
              params.row.config_status === "inherited"
              ? "conf-inherited"
              : Number(params.row.facility_id) === 0 &&
                params.row.config_status === "overridden"
                ? "conf-overridden"
                : ""
          }
          limit={25}
          refetchRef={refetchRef}
          params={tableParams}
          /* inline styles */
          sx={{
            "& .actions-cell": {
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: 0,
            },
            "& .conf-inherited, & .MuiDataGrid-row.conf-inherited, & .MuiDataGrid-row.conf-inherited .MuiDataGrid-cell": {
              backgroundColor: (theme: any) =>
                `${alpha(theme.palette.primary.main, 0.14)} !important`,
              "&:hover": {
                backgroundColor: (theme: any) =>
                  `${alpha(theme.palette.primary.main, 0.22)} !important`,
              },
              "&.Mui-selected": {
                backgroundColor: (theme: any) =>
                  `${alpha(theme.palette.primary.main, 0.25)} !important`,
              },
              "&.Mui-selected:hover": {
                backgroundColor: (theme: any) =>
                  `${alpha(theme.palette.primary.main, 0.32)} !important`,
              },
            },
            "& .conf-overridden, & .MuiDataGrid-row.conf-overridden, & .MuiDataGrid-row.conf-overridden .MuiDataGrid-cell": {
              backgroundColor: (theme: any) =>
                mode === "dark"
                  ? `${alpha(theme.palette.grey[700], 0.35)} !important`
                  : `${theme.palette.grey[300]} !important`,
              "&:hover": {
                backgroundColor: (theme: any) =>
                  mode === "dark"
                    ? `${alpha(theme.palette.grey[700], 0.5)} !important`
                    : `${theme.palette.grey[400]} !important`,
              },
              "&.Mui-selected": {
                backgroundColor: (theme: any) =>
                  mode === "dark"
                    ? `${alpha(theme.palette.grey[700], 0.6)} !important`
                    : `${theme.palette.grey[400]} !important`,
              },
              "&.Mui-selected:hover": {
                backgroundColor: (theme: any) =>
                  mode === "dark"
                    ? `${alpha(theme.palette.grey[700], 0.7)} !important`
                    : `${theme.palette.grey[500]} !important`,
              },
            },
          }}
        ></Secure.GlCustomTable>
      </GlPanelTable>

      <DisplayMsgDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        getResource={false}
        status="WARNING"
        actionLabel="Delete"
        onAction={deleteRule}
        children={
          <Typography>{t("systemRules_3_DeleteConfirmation")}</Typography>
        }
        actionColor="warning"
      />

      <DisplayMsgDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        getResource={false}
        status="WARNING"
        actionLabel={t("systemRules_3_Reset") || "Reset"}
        onAction={resetRule}
        children={
          <Typography>
            {t("systemRules_3_ResetConfirmation") ||
              "Reset this configuration's value to the System Default value? The facility configuration will be kept."}
          </Typography>
        }
        actionColor="warning"
      />

      <GenericDialog
        title={t("systemRules_3_AddRule")}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        icon={<PersonAddIcon />}
        content={
          <AddSystemRuleForm
            modules={modules}
            onClose={() => setAddOpen(false)}
            onSubmit={handleAddSystemRule}
          // content={content}
          />
        }
      />

      <GenericDialog
        title={t("systemRules_3_UpdateRule")}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        icon={<PersonAddIcon />}
        content={
          <UpdateSystemRuleForm
            initialValues={{
              conf_key: rowToUpdate.conf_key,
              conf_value: rowToUpdate.conf_value,
              description: rowToUpdate.description,
              module_id: rowToUpdate.module_id,
            }}
            modules={modules}
            onClose={() => setEditOpen(false)}
            onSubmit={handleUpdateSystemRule}
          // content={content}
          />
        }
      />

      <GenericDialog
        title={t("systemRules_3_OverrideRule") || "Override System Default"}
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        icon={<PersonAddIcon />}
        content={
          rowToOverride ? (
            <UpdateSystemRuleForm
              initialValues={{
                conf_key: rowToOverride.conf_key,
                conf_value: rowToOverride.conf_value,
                description: rowToOverride.description,
                module_id: rowToOverride.module_id,
              }}
              modules={modules}
              onClose={() => setOverrideOpen(false)}
              onSubmit={handleOverrideSystemRule}
            />
          ) : (
            <></>
          )
        }
      />
    </div>
  );
}
