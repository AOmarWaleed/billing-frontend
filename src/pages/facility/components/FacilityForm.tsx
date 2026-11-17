import { useContext, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Switch,
  Stack,
  Divider,
} from "@mui/material";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import { AuthGuardContext, Secure, GlCustomTable } from "@givc/shared-components";
import { GridColDef } from "@mui/x-data-grid";

interface FacilityFormProps {
  facility: any;
  facilityUsers: any[];
  loading: boolean;
  onSave: (data: any) => Promise<void>;
  onAddUser: () => void;
  onRemoveUser: (userId: number) => Promise<void>;
  onUpdateUser?: (userId: number, data: { admin?: string; default_facility?: string }) => Promise<void>;
  onUsersChange?: (users: any[]) => void;
}

function FacilityForm({ facility, facilityUsers, loading, onSave, onAddUser, onRemoveUser, onUpdateUser }: FacilityFormProps) {
  const ctx = useContext(AuthGuardContext);
  if (!ctx) return null;
  const { t } = ctx;

  const [localFacilityUsers, setLocalFacilityUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    vat_number: "",
    crn: "",
    phone: "",
    p_o_box: "",
    email: "",
    website: "",
    street: "",
    building_number: "",
    plot_id: "",
    district: "",
    city: "",
    postal_code: "",
    region: "",
    country_code: "",
    cchi_no: "",
    nphies_license: "",
    org_id: "",
    his_db_driver: "",
    his_db_host: "",
    his_db_port: "",
    his_db_name: "",
    his_db_username: "",
    his_db_password: "",
    nphies_cs_org_id: "",
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
    setLocalFacilityUsers(facilityUsers);
    if (facility) {
      setFormData({
        name: facility.name || "",
        vat_number: facility.vat_number || "",
        crn: facility.crn || "",
        phone: facility.phone || "",
        p_o_box: facility.p_o_box || "",
        email: facility.email || "",
        website: facility.website || "",
        street: facility.street || "",
        building_number: facility.building_number || "",
        plot_id: facility.plot_id || "",
        district: facility.district || "",
        city: facility.city || "",
        postal_code: facility.postal_code || "",
        region: facility.region || "",
        country_code: facility.country_code || "",
        cchi_no: facility.cchi_no || "",
        nphies_license: facility.nphies_license || "",
        org_id: facility.org_id || "",
        his_db_driver: facility.his_db_driver || "",
        his_db_host: facility.his_db_host || "",
        his_db_port: facility.his_db_port || "",
        his_db_name: facility.his_db_name || "",
        his_db_username: facility.his_db_username || "",
        his_db_password: facility.his_db_password || "",
        nphies_cs_org_id: facility.nphies_cs_org_id || "",
      });
    }
  }, [facility, facilityUsers]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    onSave({ ...formData, facility_id: facility?.facility_id });
  };

  const handleUpdateUserFacility = async (userId: number, field: "admin" | "default_facility", value: "Y" | "N") => {
    if (!onUpdateUser) {
      setLocalFacilityUsers((prev) => prev.map((row: any) => row.user_id === userId ? { ...row, [field]: value } : row));
      return;
    }

    const currentRows = localFacilityUsers;

    if (field === "default_facility" && value === "N") {
      const hasAnotherDefault = currentRows.some((row: any) => row.user_id !== userId && row.default_facility === "Y");
      if (!hasAnotherDefault) {
        setLocalFacilityUsers((prev) => prev.map((row: any) => row.user_id === userId ? { ...row, default_facility: "N" } : row));
        toast.info("Default facility cleared locally. Set another facility as default to persist it.");
        return;
      }
    }

    try {
      let previousDefaults: any[] = [];
      if (field === "default_facility" && value === "Y") {
        previousDefaults = currentRows.filter((row: any) => row.user_id !== userId && row.default_facility === "Y");
        if (previousDefaults.length > 0) {
          await Promise.all(previousDefaults.map((row: any) => onUpdateUser(row.user_id, { default_facility: "N" })));
        }
      }

      await onUpdateUser(userId, { [field]: value });
      setLocalFacilityUsers((prev) => prev.map((row: any) => {
        if (row.user_id === userId) {
          return { ...row, [field]: value };
        }
        if (field === "default_facility" && value === "Y") {
          const isPreviousDefault = previousDefaults.some((item: any) => item.user_id === row.user_id);
          return isPreviousDefault ? { ...row, default_facility: "N" } : row;
        }
        return row;
      }));
      toast.success("User updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || "Error updating user facility");
    }
  };

  const columns: GridColDef[] = [
    {
      field: "user_name",
      headerName: t("facility_49_UserName") || "User Name",
      flex: 2,
      type: "string",
    },
    {
      field: "default_facility",
      headerName: t("facility_49_DefaultFacility") || "Default",
      flex: 1,
      type: "string",
      renderCell: (params: any) => {
        const fu = params.row;
        return (
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Switch
              size="small"
              checked={fu.default_facility === "Y"}
              onChange={(e) => handleUpdateUserFacility(fu.user_id, "default_facility", e.target.checked ? "Y" : "N")}
              color="success"
            />
          </Box>
        );
      },
    },
    {
      field: "admin",
      headerName: t("facility_49_Admin") || "Admin",
      flex: 1,
      type: "string",
      renderCell: (params: any) => {
        const fu = params.row;
        return (
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Switch
              size="small"
              checked={fu.admin === "Y"}
              onChange={(e) => handleUpdateUserFacility(fu.user_id, "admin", e.target.checked ? "Y" : "N")}
              color="success"
            />
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: t("facility_49_Actions") || "Actions",
      type: "custom",
      sortable: false,
      filterable: false,
      flex: 0.55,
      align: "left",
      headerAlign: "left",
      renderCell: (params: any) => {
        const fu = params.row;
        return (
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
            <Secure.GLIconButton
              resource_key="facility_49_DeleteButton"
              size="small"
              onClick={() => onRemoveUser(fu.user_id)}
            >
              <DeleteIcon fontSize="small" />
            </Secure.GLIconButton>
            <Secure.GLIconButton
              resource_key="facility_49_EditButton"
              size="small"
              color="primary"
              onClick={() => toast.info("Use the switches directly")}
            >
              <EditIcon fontSize="small" />
            </Secure.GLIconButton>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          {t("facility_49_PageTitle") || "Facility Management"}
        </Typography>
        <Box display="flex" gap={1}>
          <Secure.GLButton
            resource_key="facility_49_EditButton"
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => setEditing(true)}
            disabled={editing || loading}
          >
            {t("facility_49_EditButton") || "Edit"}
          </Secure.GLButton>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          {t("facility_49_GeneralInfo") || "General Information"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Secure.GLTextField resource_key="facility_49_Name" fullWidth size="small" label={t("facility_49_Name") || "Facility Name"} value={formData.name} onChange={handleChange("name")} disabled={!editing} />
          </Grid>
          <Grid item xs={4}>
            <Secure.GLTextField resource_key="facility_49_VatNumber" fullWidth size="small" label={t("facility_49_VatNumber") || "VAT Number"} value={formData.vat_number} onChange={handleChange("vat_number")} disabled={!editing} />
          </Grid>
          <Grid item xs={4}>
            <Secure.GLTextField resource_key="facility_49_Crn" fullWidth size="small" label="CRN" value={formData.crn} onChange={handleChange("crn")} disabled={!editing} />
          </Grid>
          <Grid item xs={4}>
            <Secure.GLTextField resource_key="facility_49_Phone" fullWidth size="small" label={t("facility_49_Phone") || "Phone"} value={formData.phone} onChange={handleChange("phone")} disabled={!editing} />
          </Grid>
          <Grid item xs={4}>
            <Secure.GLTextField resource_key="facility_49_POBox" fullWidth size="small" label="P.O. Box" value={formData.p_o_box} onChange={handleChange("p_o_box")} disabled={!editing} />
          </Grid>
          <Grid item xs={4}>
            <Secure.GLTextField resource_key="facility_49_Email" fullWidth size="small" label={t("facility_49_Email") || "Email"} value={formData.email} onChange={handleChange("email")} disabled={!editing} />
          </Grid>
          <Grid item xs={4}>
            <Secure.GLTextField resource_key="facility_49_Website" fullWidth size="small" label="Website" value={formData.website} onChange={handleChange("website")} disabled={!editing} />
          </Grid>
          <Grid item xs={4}>
            <Secure.GLTextField resource_key="facility_49_CchiNo" fullWidth size="small" label="CCHI No" value={formData.cchi_no} onChange={handleChange("cchi_no")} disabled={!editing} />
          </Grid>
          <Grid item xs={4}>
            <Secure.GLTextField resource_key="facility_49_NphiesLicense" fullWidth size="small" label="NPHIES License" value={formData.nphies_license} onChange={handleChange("nphies_license")} disabled={!editing} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          {t("facility_49_Address") || "Address"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_Street" fullWidth size="small" label={t("facility_49_Street") || "Street"} value={formData.street} onChange={handleChange("street")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_BuildingNumber" fullWidth size="small" label="Building No" value={formData.building_number} onChange={handleChange("building_number")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_PlotId" fullWidth size="small" label="Plot ID" value={formData.plot_id} onChange={handleChange("plot_id")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_District" fullWidth size="small" label="District" value={formData.district} onChange={handleChange("district")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_City" fullWidth size="small" label={t("facility_49_City") || "City"} value={formData.city} onChange={handleChange("city")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_PostalCode" fullWidth size="small" label="Postal Code" value={formData.postal_code} onChange={handleChange("postal_code")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_Region" fullWidth size="small" label={t("facility_49_Region") || "Region"} value={formData.region} onChange={handleChange("region")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_CountryCode" fullWidth size="small" label="Country Code" value={formData.country_code} onChange={handleChange("country_code")} disabled={!editing} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          {t("facility_49_HisIntegration") || "HIS Integration"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_OrgId" fullWidth size="small" label="Org ID" value={formData.org_id} onChange={handleChange("org_id")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_NphiesCsOrgId" fullWidth size="small" label="NPHIES CS Org ID" value={formData.nphies_cs_org_id} onChange={handleChange("nphies_cs_org_id")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_DbDriver" fullWidth size="small" label="DB Driver" value={formData.his_db_driver} onChange={handleChange("his_db_driver")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_DbHost" fullWidth size="small" label="DB Host" value={formData.his_db_host} onChange={handleChange("his_db_host")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_DbPort" fullWidth size="small" label="DB Port" value={formData.his_db_port} onChange={handleChange("his_db_port")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_DbName" fullWidth size="small" label="DB Name" value={formData.his_db_name} onChange={handleChange("his_db_name")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_DbUsername" fullWidth size="small" label="DB Username" value={formData.his_db_username} onChange={handleChange("his_db_username")} disabled={!editing} />
          </Grid>
          <Grid item xs={3}>
            <Secure.GLTextField resource_key="facility_49_DbPassword" fullWidth size="small" label="DB Password" value={formData.his_db_password} onChange={handleChange("his_db_password")} disabled={!editing} type="password" />
          </Grid>
        </Grid>

        {editing && (
          <Box display="flex" gap={1} justifyContent="flex-start" alignItems="center" mt={2}>
            <Secure.GLButton resource_key="facility_49_SaveButton" variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={loading}>
              {t("facility_49_SaveButton") || "Save"}
            </Secure.GLButton>
            <Secure.GLButton resource_key="facility_49_CancelButton" variant="outlined" startIcon={<CancelIcon />} onClick={() => setEditing(false)} disabled={loading}>
              {t("facility_49_CancelButton") || "Cancel"}
            </Secure.GLButton>
          </Box>
        )}
      </Paper>

      {facility && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Secure.GLTypography variant="subtitle1" resource_key="facility_49_UsersSection">
              {t("facility_49_UsersSection") || "Users"}
            </Secure.GLTypography>
            <Secure.GLButton resource_key="facility_49_AddUserButton" variant="contained" size="small" startIcon={<AddIcon />} onClick={onAddUser}>
              {t("facility_49_AddUserButton") || "Add User"}
            </Secure.GLButton>
          </Box>
          <GlCustomTable
            rows={localFacilityUsers}
            totalCount={localFacilityUsers.length}
            columns={columns}
            getRowId={(r: any) => r.user_facility_id ?? r.user_id}
            enableKeyboardNavigation={false}
            autoSelectFirstRow={false}
          />
        </>
      )}
    </Box>
  );
}

export default FacilityForm;
