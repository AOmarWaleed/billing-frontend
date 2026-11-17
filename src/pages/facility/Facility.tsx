import { useContext, useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Tooltip,
  Switch,
  Grid2 as Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  GlPanelTable,
  Secure,
  AuthGuardContext,
  DisplayMsgDialog,
} from "@givc/shared-components";
import { publicUrl } from "../../utils/publicUrl";
import { GridColDef } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import api, { fetcher } from "../../utils/Api";
import { formatDate } from "../../utils/formatData/formatterv2";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  deleteFacility,
  updateFacility,
} from "../../redux/slices/facilitySlice";
import ViewFacilityDialog from "./components/ViewFacilityDialog";
import EditFacilityDialog from "./components/EditFacilityDialog";
import FacilityUserDialog from "./components/FacilityUserDialog";
import AddFacilityForm from "./components/AddFacilityForm";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
type CustomGridColDef = GridColDef & { resource_key: string };

function FacilityUsersSection({ selectedFacility }: { selectedFacility: any }) {
  const { t } = useContext(AuthGuardContext);
  const {
    palette: { mode },
  } = useTheme();
  const [facilityUsers, setFacilityUsers] = useState<any[]>([]);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const facilityUsersTableRef = useRef<(() => void) | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<any>(null);

  const handleRemoveUser = async (userId: number) => {
    try {
      await api.delete(
        `/api/facility/${selectedFacility.facility_id}/users/${userId}`,
      );
      toast.success("User removed successfully");
      setDeleteUserTarget(null);
      facilityUsersTableRef.current?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || "Error removing user");
    }
  };

  const handleToggleUserField = async (
    fu: any,
    field: "admin" | "default_facility",
    value: string,
  ) => {
    const nextValue = value === "Y" ? "Y" : "N";
    const previousRows = [...facilityUsers];

    try {
      setFacilityUsers(
        facilityUsers.map((row: any) =>
          row.user_id === fu.user_id ? { ...row, [field]: nextValue } : row,
        ),
      );
      await api.put(
        `/api/facility/${selectedFacility.facility_id}/users/${fu.user_id}`,
        { [field]: nextValue },
      );
      if (field === "default_facility" && nextValue === "Y") {
        toast.success(
          `${fu.user_name} is now default for ${selectedFacility.name}`,
        );
      } else {
        toast.success("User updated successfully");
      }
      facilityUsersTableRef.current?.();
    } catch (err: any) {
      setFacilityUsers(previousRows);
      toast.error(err?.response?.data?.msg || "Error updating user");
      facilityUsersTableRef.current?.();
    }
  };

  const userColumns: GridColDef[] = [
    {
      field: "user_name",
      headerName: t("facility_49_UserName") || "User Name",
      flex: 2,
      minWidth: 100,
    },
    {
      field: "default_facility",
      headerName: t("facility_49_DefaultFacility") || "Default",
      flex: 1,
      minWidth: 80,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Switch
            size="small"
            checked={params.row.default_facility === "Y"}
            onChange={(e) =>
              handleToggleUserField(
                params.row,
                "default_facility",
                e.target.checked ? "Y" : "N",
              )
            }
            color="success"
          />
        </Box>
      ),
    },
    {
      field: "admin",
      headerName: t("facility_49_Admin") || "Admin",
      flex: 1,
      minWidth: 80,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Switch
            size="small"
            checked={params.row.admin === "Y"}
            onChange={(e) =>
              handleToggleUserField(
                params.row,
                "admin",
                e.target.checked ? "Y" : "N",
              )
            }
            color="success"
          />
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "",
      type: "custom",
      width: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      hideSortIcons: true,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <span>{t("facility_49_Actions") || "Actions"}</span>
          <Secure.GLIconButton
            resource_key="facility_49_AddUserButton"
            title={t("facility_49_AddUserButton") || "Add User"}
            size="small"
            onClick={() => setOpenUserDialog(true)}
          >
            <img
              src={publicUrl(`themes/${mode}/icons/plus.png`)}
              width="15px"
            />
          </Secure.GLIconButton>
        </Box>
      ),
      renderCell: (params: any) => (
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
        >
          <Tooltip title={t("facility_49_RemoveUserButton") || "Remove User"}>
            <Secure.GLIconButton
              resource_key="facility_49_RemoveUserButton"
              size="small"
              onClick={() => setDeleteUserTarget(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </Secure.GLIconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (!selectedFacility) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="textSecondary">
          {t("facility_49_SelectFacilityHint") ||
            "Select a facility from the list"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t("facility_49_UsersSection") || "Users"} — {selectedFacility.name}
        </Typography>
      </Box>

      <Secure.GlCustomTable
        resource_key="facility_49_UsersTable"
        url={`/api/facility/${selectedFacility.facility_id}/users`}
        limit={10}
        columns={userColumns}
        fetcher={fetcher}
        getRowId={(r: any) => r.user_facility_id ?? r.user_id}
        refetchRef={facilityUsersTableRef}
        rows={facilityUsers}
        handleDataChange={(rows: any[]) => setFacilityUsers(rows || [])}
      />

      {openUserDialog && (
        <FacilityUserDialog
          facilityId={selectedFacility.facility_id}
          onClose={() => setOpenUserDialog(false)}
          onUserAdded={() => {
            setOpenUserDialog(false);
            facilityUsersTableRef.current?.();
          }}
        />
      )}

      <DisplayMsgDialog
        open={deleteUserTarget !== null}
        onClose={() => setDeleteUserTarget(null)}
        getResource={false}
        status="WARNING"
        actionLabel={t("facility_49_RemoveUserButton") || "Remove"}
        onAction={async () => {
          if (deleteUserTarget) {
            await handleRemoveUser(deleteUserTarget.user_id);
          }
        }}
        children={
          <Typography>
            {t("facility_49_DeleteConfirmMsg") ||
              "Are you sure you want to remove this user from the facility?"}
          </Typography>
        }
        actionColor="warning"
      />
    </Box>
  );
}

export default function Facility() {
  const { t } = useContext(AuthGuardContext);
  const {
    palette: { mode },
  } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const refetchRef = useRef<(() => void) | null>(null);

  const [nameFilter, setNameFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [facilityTableParams, setFacilityTableParams] = useState<
    Record<string, any>
  >({});

  const [displayFacilities, setDisplayFacilities] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);

  const buildFacilityTableParams = (
    nextName = nameFilter,
    nextCity = cityFilter,
    nextRegion = regionFilter,
  ) => {
    const params: Record<string, any> = {};

    const normalizedName = nextName.trim();
    const normalizedCity = nextCity.trim();
    const normalizedRegion = nextRegion.trim();

    if (normalizedName) params.name = normalizedName;
    if (normalizedCity) params.city = normalizedCity;
    if (normalizedRegion) params.region = normalizedRegion;

    return params;
  };

  const applyFacilityFilters = (
    nextName = nameFilter,
    nextCity = cityFilter,
    nextRegion = regionFilter,
  ) => {
    setFacilityTableParams(
      buildFacilityTableParams(nextName, nextCity, nextRegion),
    );
  };

  const handleFilterInputChange = (
    field: "name" | "city" | "region",
    value: string,
  ) => {
    const nextName = field === "name" ? value : nameFilter;
    const nextCity = field === "city" ? value : cityFilter;
    const nextRegion = field === "region" ? value : regionFilter;

    setNameFilter(nextName);
    setCityFilter(nextCity);
    setRegionFilter(nextRegion);

    if (!nextName.trim() && !nextCity.trim() && !nextRegion.trim()) {
      setFacilityTableParams({});
    }
  };

  const [viewFacility, setViewFacility] = useState<any>(null);
  const [editFacility, setEditFacility] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [addFacilityOpen, setAddFacilityOpen] = useState(false);

  useEffect(() => {
    if (selectedFacility) return;
    if (displayFacilities.length > 0) {
      setSelectedFacility(displayFacilities[0]);
    }
  }, [displayFacilities, selectedFacility]);

  const handleFilter = () => {
    applyFacilityFilters();
  };

  const handleClear = () => {
    setNameFilter("");
    setCityFilter("");
    setRegionFilter("");
    setFacilityTableParams({});
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteFacility({ id: deleteTarget.facility_id })).unwrap();
      toast.success("Facility deleted successfully");
      if (selectedFacility?.facility_id === deleteTarget.facility_id) {
        setSelectedFacility(null);
      }
      setDeleteTarget(null);
      refetchRef.current?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete facility");
    }
  };

  const columns: CustomGridColDef[] = [
    {
      field: "facility_id",
      resource_key: "facility_49_Id",
      headerName: "ID",
      width: 60,
      align: "right",
      headerAlign: "right",
      type: "number",
      sortable: true,
    },
    {
      field: "name",
      resource_key: "facility_49_Name",
      headerName: "Name",
      flex: 1.5,
      minWidth: 150,
      type: "string",
      sortable: true,
    },
    {
      field: "crn",
      resource_key: "facility_49_Crn",
      headerName: "CRN",
      flex: 1,
      minWidth: 100,
      type: "string",
      sortable: false,
    },
    {
      field: "city",
      resource_key: "facility_49_City",
      headerName: "City",
      flex: 1,
      minWidth: 100,
      type: "string",
      sortable: true,
    },
    {
      field: "region",
      resource_key: "facility_49_Region",
      headerName: "Region",
      flex: 1,
      minWidth: 100,
      type: "string",
      sortable: true,
    },
    {
      field: "phone",
      resource_key: "facility_49_Phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 100,
      type: "string",
      sortable: false,
    },
    {
      field: "creation_date",
      resource_key: "facility_49_CreationDate",
      headerName: "Created",
      flex: 1,
      minWidth: 120,
      type: "string",
      sortable: true,
      renderCell: (params: any) => formatDate(params.value, "DATE_FORMAT"),
    },
    {
      field: "actions",
      resource_key: "facility_49_Actions",
      headerName: "",
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <span>{t("facility_49_Actions") || "Actions"}</span>
          <Secure.GLIconButton
            resource_key="facility_49_NewButton"
            title={t("facility_49_NewButton") || "Add"}
            size="small"
            onClick={() => setAddFacilityOpen(true)}
          >
            <img
              src={publicUrl(`themes/${mode}/icons/plus.png`)}
              width="15px"
            />
          </Secure.GLIconButton>
        </Box>
      ),
      renderCell: (params: any) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title={t("facility_49_ViewButton") || "View"}>
            <Secure.GLIconButton
              resource_key="facility_49_ViewButton"
              size="small"
              onClick={() => setViewFacility(params.row)}
            >
              <VisibilityIcon fontSize="small" />
            </Secure.GLIconButton>
          </Tooltip>
          <Tooltip title={t("facility_49_EditButton") || "Edit"}>
            <Secure.GLIconButton
              resource_key="facility_49_EditButton"
              size="small"
              onClick={() => setEditFacility(params.row)}
            >
              <EditIcon fontSize="small" />
            </Secure.GLIconButton>
          </Tooltip>
          <Tooltip title={t("facility_49_DeleteButton") || "Delete"}>
            <Secure.GLIconButton
              resource_key="facility_49_DeleteButton"
              size="small"
              onClick={() => setDeleteTarget(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </Secure.GLIconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <HandleTitle titleKey="FACILITY_MANAGEMENT" />
      <GlPanelTable
        filterSection={
          <Grid
            container
            spacing={2}
            sx={{ width: "100%", alignItems: "center" }}
          >
            <Grid size={{ xs: 12, sm: 3 }}>
              <Secure.GLTextField
                resource_key="facility_49_NameFilter"
                fullWidth
                size="small"
                label={t("facility_49_Name") || "Name"}
                value={nameFilter}
                onChange={(e: any) =>
                  handleFilterInputChange("name", e.target.value)
                }
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") handleFilter();
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Secure.GLTextField
                resource_key="facility_49_CityFilter"
                fullWidth
                size="small"
                label={t("facility_49_City") || "City"}
                value={cityFilter}
                onChange={(e: any) =>
                  handleFilterInputChange("city", e.target.value)
                }
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") handleFilter();
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Secure.GLTextField
                resource_key="facility_49_RegionFilter"
                fullWidth
                size="small"
                label={t("facility_49_Region") || "Region"}
                value={regionFilter}
                onChange={(e: any) =>
                  handleFilterInputChange("region", e.target.value)
                }
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") handleFilter();
                }}
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: "auto" }}
              sx={{ display: "flex", gap: 1, alignItems: "center" }}
            >
              <Secure.GLIconButton
                resource_key="facility_49_SearchButton"
                onClick={handleFilter}
              >
                <SearchIcon />
              </Secure.GLIconButton>
              <Secure.GLIconButton
                resource_key="facility_49_ClearButton"
                onClick={handleClear}
              >
                <ClearIcon />
              </Secure.GLIconButton>
            </Grid>
          </Grid>
        }
      >
        <Secure.GlCustomTable
          resource_key="facility_49_Table"
          key={JSON.stringify(facilityTableParams)}
          url="/api/facility/all"
          limit={10}
          columns={columns}
          fetcher={fetcher}
          refetchRef={refetchRef}
          getRowId={(row: any) => row.facility_id}
          onRowSelected={(row: any) => {
            row && setSelectedFacility(row);
          }}
          autoSelectFirstRow={true}
          params={facilityTableParams}
          handleDataChange={(rows: any[]) => {
            setDisplayFacilities(rows || []);
          }}
        />
      </GlPanelTable>

      <Box sx={{ mt: 2 }}>
        <FacilityUsersSection selectedFacility={selectedFacility} />
      </Box>

      {viewFacility && (
        <ViewFacilityDialog
          open={true}
          facility={viewFacility}
          onClose={() => setViewFacility(null)}
        />
      )}

      {editFacility && (
        <EditFacilityDialog
          open={true}
          facility={editFacility}
          onClose={() => setEditFacility(null)}
          onSave={async (data: any) => {
            await dispatch(updateFacility({ id: data.facility_id, data }));
            refetchRef.current?.();
          }}
          onFacilityUpdated={() => refetchRef.current?.()}
        />
      )}

      <DisplayMsgDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        getResource={false}
        status="WARNING"
        actionLabel={t("facility_49_DeleteButton") || "Delete"}
        onAction={confirmDelete}
        children={
          <Typography>
            {t("facility_49_DeleteConfirmMsg") ||
              `Are you sure you want to delete - ${deleteTarget?.facility_id} - ${deleteTarget?.name}?`}
          </Typography>
        }
        actionColor="warning"
      />

      <AddFacilityForm
        open={addFacilityOpen}
        onClose={() => setAddFacilityOpen(false)}
        onCreated={() => refetchRef.current?.()}
      />
    </Box>
  );
}
