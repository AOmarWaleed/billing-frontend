import { useContext, useState, useEffect, useRef } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  Button,
  Switch,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { GridColDef } from "@mui/x-data-grid";
import { AuthGuardContext, Secure, DisplayMsgDialog } from "@givc/shared-components";
import { toast } from "react-toastify";
import api, { fetcher } from "../../../utils/Api";
import { publicUrl } from "../../../utils/publicUrl";
import { useAppSelector } from "../../../hooks/hooks";


interface UserFacilitySectionProps {
  userId: number;
}

export type GLGridColDef = GridColDef & {
  permission: string;
  uiText?: string;
};

function UserFacilitySection({ userId }: UserFacilitySectionProps) {
  const ctx = useContext(AuthGuardContext);
  if (!ctx) return null;
  const { t } = ctx;
  const {
    palette: { mode },
  } = useTheme();

  const [userFacilities, setUserFacilities] = useState<any[]>([]);
  const [allFacilities, setAllFacilities] = useState<any[]>([]);
  const userFacilityTableRef = useRef<(() => void) | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getLabel = (key: string, fallback: string) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const { limit } = useAppSelector((state) => state.users);

  const fetchUserFacilities = async () => {
    try {
      const res = await api.get("/api/facility/all");
      const facilities = res.data?.data?.data || res.data?.data || [];
      setAllFacilities(facilities);
    } catch (err) {
      console.error("Error fetching all facilities:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserFacilities();
    }
  }, [userId]);

  const handleAssignFacility = async () => {
    if (!selectedFacilityId) return;
    try {
      const facility = allFacilities.find(
        (f: any) => f.facility_id === selectedFacilityId,
      );
      if (!facility) return;

      const hasCurrentDefault = userFacilities.some(
        (row: any) => row.default_facility === "Y",
      );
      const response = await api.post(
        `/api/facility/${selectedFacilityId}/users`,
        {
          userId,
          admin: "N",
          default_facility: hasCurrentDefault ? "N" : "Y",
        },
      );

      const createdAssignment = response?.data?.data;
      const nextRows = createdAssignment
        ? [...userFacilities, createdAssignment]
        : userFacilities;
      setUserFacilities(nextRows);
      userFacilityTableRef.current?.();
      setOpenDialog(false);
      setSelectedFacilityId(null);
      toast.success("Facility assigned successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || "Error assigning facility");
    }
  };

  const handleRemoveFacility = async (facilityId: number) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/api/facility/${facilityId}/users/${userId}`);
      setUserFacilities((prev) =>
        prev.filter((row: any) => row.facility_id !== facilityId),
      );
      userFacilityTableRef.current?.();
      setDeleteTarget(null);
      toast.success("Facility removed successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || "Error removing facility");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleUserFacility = async (
    facility: any,
    field: "admin" | "default_facility",
    value: string,
  ) => {
    const nextValue = value === "Y" ? "Y" : "N";
    const previousRows = [...userFacilities];

    try {
      const optimisticRows = userFacilities.map((row: any) =>
        row.user_facility_id === facility.user_facility_id
          ? { ...row, [field]: nextValue }
          : row,
      );
      setUserFacilities(optimisticRows);

      await api.put(`/api/facility/${facility.facility_id}/users/${userId}`, {
        [field]: nextValue,
      });

      toast.success("User updated successfully");
      userFacilityTableRef.current?.();
    } catch (err: any) {
      setUserFacilities(previousRows);
      toast.error(
        err?.response?.data?.msg || "Error updating facility assignment",
      );
      userFacilityTableRef.current?.();
    }
  };

  const columns: GLGridColDef[] = [
    {
      field: "facility_name",
      permission: "users_9_facilityName",
      uiText: "generic_0_facility",
      headerName: "Facility",
      flex: 1.8,
      minWidth: 180,
      sortable: false,
    },
    {
      field: "default_facility",
      permission: "users_9_facilityDefault",
      uiText: "generic_0_default",
      headerName: "Default",
      flex: 1,
      minWidth: 110,
      sortable: false,
      renderCell: (params: any) => {
        const uf = params.row;
        return (
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Switch
              key={`${uf.user_facility_id}-${uf.default_facility}`}
              size="small"
              checked={uf.default_facility === "Y"}
              onChange={(e) =>
                handleToggleUserFacility(
                  uf,
                  "default_facility",
                  e.target.checked ? "Y" : "N",
                )
              }
              color="success"
            />
          </Box>
        );
      },
    },
    {
      field: "admin",
      permission: "users_9_facilityAdmin",
      uiText: "generic_0_admin",
      headerName: "Admin",
      flex: 1,
      minWidth: 110,
      sortable: false,
      renderCell: (params: any) => {
        const uf = params.row;
        return (
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Switch
              key={`${uf.user_facility_id}-${uf.admin}`}
              size="small"
              checked={uf.admin === "Y"}
              onChange={(e) =>
                handleToggleUserFacility(
                  uf,
                  "admin",
                  e.target.checked ? "Y" : "N",
                )
              }
              color="success"
            />
          </Box>
        );
      },
    },
    {
      field: "actions",
      permission: "users_9_facilityActions",
      headerName: "Actions",
      uiText: "generic_0_actions",
      type: "custom",
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      align: "right",
      disableColumnMenu: true,
      hideSortIcons: true,
      renderHeader: () => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            justifyContent: "space-between",
          }}
        >
          <span>{getLabel("usersetup_9_Actions", "Actions")}</span>
          {/* <Secure.GLIconButton
            resource_key="usersetup_9_AssignFacility"
            title={t("usersetup_9_AssignFacility") || "Assign Facility"}
            size="small"
            onClick={() => setOpenDialog(true)}
          >
            <img
              src={publicUrl(`themes/${mode}/icons/plus.png`)}
              width="15px"
            />
          </Secure.GLIconButton> */}
          <Secure.GLIconButton2
            permission="users_9_assignFacility"
            fallBackText="Assign Facility"
            onClick={() => setOpenDialog(true)}
            size="small"
          >
            <img src={publicUrl(`themes/${mode}/icons/plus.png`)} />
          </Secure.GLIconButton2>
        </Box>
      ),
      renderCell: (params: any) => {
        const uf = params.row;
        return (
          // <Box
          //   sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
          // >
          //   <IconButton
          //     size="small"
          //     color="inherit"
          //     onClick={() => setDeleteTarget(uf)}
          //   >
          //     {/* <DeleteIcon fontSize="small" /> */}
          //     <img
          //       src={publicUrl(`themes/${mode}/icons/delete.png`)}
          //       alt="Delete"
          //     />
          //   </IconButton>
          // </Box>
          <Secure.GLIconButton2
            permission="users_9_deleteFacility"
            uiText="generic_0_delete"
            fallBackText="Delete Facility"
            onClick={() => setDeleteTarget(uf)}
            size="small"
          >
            <img
              src={publicUrl(`themes/${mode}/icons/delete.png`)}
            />
          </Secure.GLIconButton2>
        );
      },
    },
  ];

  return (
    <Box mt={2}>
      {/* <Box display="flex" alignItems="center" mb={1}>
        <Secure.GLTypography variant="subtitle1" resource_key="usersetup_9_FacilitiesSection">
          {t("usersetup_9_FacilitiesSection") || "Facilities"}
        </Secure.GLTypography>
      </Box> */}

      <Box sx={{ borderRadius: 1, overflow: "hidden" }}>

        <Secure.GlCustomTable
          resource_key="users_9_facilityTable"
          url={userId ? `/api/facility/user/${userId}` : ""}
          limit={limit}
          columns={columns.map((c: any) => ({ ...c, resource_key: c.permission }))}
          fetcher={fetcher}
          getRowId={(row: any) => row.user_facility_id ?? row.facility_id}
          autoSelectFirstRow={false}
          refetchRef={userFacilityTableRef}
          handleDataChange={(rows: any[]) => {
            setUserFacilities(rows || []);
          }}
          smallSize
        />
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("usersetup_9_AssignFacility") || "Assign Facility"}
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            options={allFacilities.filter(
              (f: any) =>
                !userFacilities.some(
                  (uf: any) => uf.facility_id === f.facility_id,
                ),
            )}
            getOptionLabel={(option: any) =>
              `${option.facility_id} - ${option.name}`
            }
            isOptionEqualToValue={(option, value) =>
              option.facility_id === value.facility_id
            }
            value={
              allFacilities.find(
                (f: any) => f.facility_id === selectedFacilityId,
              ) || null
            }
            onChange={(_, value) =>
              setSelectedFacilityId(value?.facility_id || null)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("usersetup_9_Facility") || "Facility"}
                size="small"
                fullWidth
                margin="dense"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenDialog(false)}>
            {getLabel("usersetup_9_Cancel", "Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignFacility}
            disabled={!selectedFacilityId}
          >
            {t("usersetup_9_AssignFacility") || "Assign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await handleRemoveFacility(deleteTarget.facility_id);
          }
        }}
        title="Confirm Delete"
        message="Are you sure you want to delete?"
        errorMsg={null}
        loading={deleteLoading}
      /> */}
      <DisplayMsgDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        getResource={false}
        status="DELETE"
        actionLabel="Delete"
        onAction={async () => {
          if (deleteTarget) {
            await handleRemoveFacility(deleteTarget.facility_id);
          }
        }}
        children={
          <Typography>
            Are you sure you want to delete this facility?
          </Typography>
        }
        actionColor="error"
      />
    </Box>
  );
}

export default UserFacilitySection;
