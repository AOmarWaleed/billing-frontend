import { useContext, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
  Autocomplete,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { AuthGuardContext, Secure } from "@givc/shared-components";
import { toast } from "react-toastify";
import api from "../../../utils/Api";

interface FacilityUserDialogProps {
  facilityId: number;
  onClose: () => void;
  onUserAdded: () => Promise<void>;
}

function FacilityUserDialog({ facilityId, onClose, onUserAdded }: FacilityUserDialogProps) {
  const ctx = useContext(AuthGuardContext);
  if (!ctx) return null;
  const { t } = ctx;

  const [availableUsers, setAvailableUsers] = useState<{ user_id: number; user_name: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ user_id: number; user_name: string } | null>(null);
  const [defaultFacility, setDefaultFacility] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDefaultFacility(false);
    setAdmin(false);
    let cancelled = false;
    const fetchAvailableUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/facility/available-users", {
          params: { facilityId },
        });
        if (!cancelled) {
          setAvailableUsers(res.data?.data?.data || res.data?.data || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          toast.error(err?.response?.data?.msg || "Error fetching available users");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchAvailableUsers();
    return () => { cancelled = true; };
  }, [facilityId]);

  const handleAddUser = async () => {
    if (!selectedUser) {
      toast.error(t("facility_49_SelectUser") || "Please select a user");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/facility/${facilityId}/users`, {
        userId: selectedUser.user_id,
        admin: admin ? "Y" : "N",
        default_facility: defaultFacility ? "Y" : "N",
      });
      toast.success("User added successfully");
      await onUserAdded();
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || "Error adding user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open maxWidth="sm" fullWidth onClose={onClose}>
      <DialogTitle>
        {t("facility_49_AddUserButton") || "Add User"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Autocomplete
            options={availableUsers}
            loading={loading}
            getOptionLabel={(option: any) => option.user_name || ""}
            isOptionEqualToValue={(option: any, value: any) => option.user_id === value.user_id}
            value={selectedUser}
            onChange={(_, newValue) => setSelectedUser(newValue)}
            renderInput={(params: any) => (
              <TextField
                {...params}
                label={t("facility_49_SelectUser") || "Select User"}
                placeholder={t("facility_49_SearchPlaceholder") || "Search by name..."}
                variant="outlined"
                fullWidth
              />
            )}
          />
          {!loading && availableUsers.length === 0 && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: "block" }}>
              {t("facility_49_NoUsersAvailable") || "No users available"}
            </Typography>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={defaultFacility}
                  onChange={(_, checked) => setDefaultFacility(checked)}
                  color="success"
                />
              }
              label={t("facility_49_DefaultFacility") || "Default Facility"}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={admin}
                  onChange={(_, checked) => setAdmin(checked)}
                  color="success"
                />
              }
              label={t("facility_49_Admin") || "Admin"}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Secure.GLButton
          resource_key="facility_49_CancelButton"
          variant="outlined"
          onClick={onClose}
        >
          {t("facility_49_CancelButton") || "Cancel"}
        </Secure.GLButton>
        <Secure.GLButton
          resource_key="facility_49_AddUserButton"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
          disabled={!selectedUser || submitting}
        >
          {t("facility_49_AddUserButton") || "Add"}
        </Secure.GLButton>
      </DialogActions>
    </Dialog>
  );
}

export default FacilityUserDialog;
