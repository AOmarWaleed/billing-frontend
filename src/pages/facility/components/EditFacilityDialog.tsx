import { useContext, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { AuthGuardContext, Secure } from "@givc/shared-components";
import { toast } from "react-toastify";

interface EditFacilityDialogProps {
  open: boolean;
  facility: any | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  onFacilityUpdated?: () => void;
}

export default function EditFacilityDialog({ open, facility, onClose, onSave, onFacilityUpdated }: EditFacilityDialogProps) {
  const { t } = useContext(AuthGuardContext);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (facility && open) {
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
        name_locale: facility.name_locale || "",
        street_locale: facility.street_locale || "",
        district_locale: facility.district_locale || "",
        city_locale: facility.city_locale || "",
        region_locale: facility.region_locale || "",
      });
    }
  }, [facility?.facility_id, open]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error("Facility name is required");
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...formData, facility_id: facility.facility_id });
      onFacilityUpdated?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update facility");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {t("facility_49_EditTitle") || "Edit Facility"}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Secure.GLTextField resource_key="facility_49_Name" fullWidth size="small" label={t("facility_49_Name") || "Facility Name *"} name="name" value={formData.name} onChange={handleChange("name")} />
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            <Secure.GLTextField resource_key="facility_49_VatNumber" fullWidth size="small" label={t("facility_49_VatNumber") || "VAT Number"} name="vat_number" value={formData.vat_number} onChange={handleChange("vat_number")} />
            <Secure.GLTextField resource_key="facility_49_Crn" fullWidth size="small" label={t("facility_49_Crn") || "CRN"} name="crn" value={formData.crn} onChange={handleChange("crn")} />
            <Secure.GLTextField resource_key="facility_49_Phone" fullWidth size="small" label={t("facility_49_Phone") || "Phone"} name="phone" value={formData.phone} onChange={handleChange("phone")} />
            <Secure.GLTextField resource_key="facility_49_POBox" fullWidth size="small" label={t("facility_49_POBox") || "P.O. Box"} name="p_o_box" value={formData.p_o_box} onChange={handleChange("p_o_box")} />
            <Secure.GLTextField resource_key="facility_49_Email" fullWidth size="small" label={t("facility_49_Email") || "Email"} name="email" value={formData.email} onChange={handleChange("email")} />
            <Secure.GLTextField resource_key="facility_49_Website" fullWidth size="small" label={t("facility_49_Website") || "Website"} name="website" value={formData.website} onChange={handleChange("website")} />
            <Secure.GLTextField resource_key="facility_49_CchiNo" fullWidth size="small" label={t("facility_49_CchiNo") || "CCHI No"} name="cchi_no" value={formData.cchi_no} onChange={handleChange("cchi_no")} />
            <Secure.GLTextField resource_key="facility_49_NphiesLicense" fullWidth size="small" label={t("facility_49_NphiesLicense") || "NPHIES License"} name="nphies_license" value={formData.nphies_license} onChange={handleChange("nphies_license")} />
          </Box>

          <Divider />

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
            <Secure.GLTextField resource_key="facility_49_Street" fullWidth size="small" label={t("facility_49_Street") || "Street"} name="street" value={formData.street} onChange={handleChange("street")} />
            <Secure.GLTextField resource_key="facility_49_BuildingNumber" fullWidth size="small" label={t("facility_49_BuildingNumber") || "Building No"} name="building_number" value={formData.building_number} onChange={handleChange("building_number")} />
            <Secure.GLTextField resource_key="facility_49_PlotId" fullWidth size="small" label={t("facility_49_PlotId") || "Plot ID"} name="plot_id" value={formData.plot_id} onChange={handleChange("plot_id")} />
            <Secure.GLTextField resource_key="facility_49_District" fullWidth size="small" label={t("facility_49_District") || "District"} name="district" value={formData.district} onChange={handleChange("district")} />
            <Secure.GLTextField resource_key="facility_49_City" fullWidth size="small" label={t("facility_49_City") || "City"} name="city" value={formData.city} onChange={handleChange("city")} />
            <Secure.GLTextField resource_key="facility_49_PostalCode" fullWidth size="small" label={t("facility_49_PostalCode") || "Postal Code"} name="postal_code" value={formData.postal_code} onChange={handleChange("postal_code")} />
            <Secure.GLTextField resource_key="facility_49_Region" fullWidth size="small" label={t("facility_49_Region") || "Region"} name="region" value={formData.region} onChange={handleChange("region")} />
            <Secure.GLTextField resource_key="facility_49_CountryCode" fullWidth size="small" label={t("facility_49_CountryCode") || "Country Code"} name="country_code" value={formData.country_code} onChange={handleChange("country_code")} />
          </Box>

          <Divider />

          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("facility_49_Locale") || "Locale (Arabic)"}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            <Secure.GLTextField resource_key="facility_49_NameLocale" fullWidth size="small" label={t("facility_49_NameLocale") || "Name Locale"} name="name_locale" value={formData.name_locale} onChange={handleChange("name_locale")} />
            <Secure.GLTextField resource_key="facility_49_StreetLocale" fullWidth size="small" label={t("facility_49_StreetLocale") || "Street Locale"} name="street_locale" value={formData.street_locale} onChange={handleChange("street_locale")} />
            <Secure.GLTextField resource_key="facility_49_DistrictLocale" fullWidth size="small" label={t("facility_49_DistrictLocale") || "District Locale"} name="district_locale" value={formData.district_locale} onChange={handleChange("district_locale")} />
            <Secure.GLTextField resource_key="facility_49_CityLocale" fullWidth size="small" label={t("facility_49_CityLocale") || "City Locale"} name="city_locale" value={formData.city_locale} onChange={handleChange("city_locale")} />
            <Secure.GLTextField resource_key="facility_49_RegionLocale" fullWidth size="small" label={t("facility_49_RegionLocale") || "Region Locale"} name="region_locale" value={formData.region_locale} onChange={handleChange("region_locale")} />
          </Box>

          <Divider />

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
            <Secure.GLTextField resource_key="facility_49_OrgId" fullWidth size="small" label={t("facility_49_OrgId") || "Org ID"} name="org_id" value={formData.org_id} onChange={handleChange("org_id")} />
            <Secure.GLTextField resource_key="facility_49_NphiesCsOrgId" fullWidth size="small" label={t("facility_49_NphiesCsOrgId") || "NPHIES CS Org ID"} name="nphies_cs_org_id" value={formData.nphies_cs_org_id} onChange={handleChange("nphies_cs_org_id")} />
            <Secure.GLTextField resource_key="facility_49_DbDriver" fullWidth size="small" label={t("facility_49_DbDriver") || "DB Driver"} name="his_db_driver" value={formData.his_db_driver} onChange={handleChange("his_db_driver")} />
            <Secure.GLTextField resource_key="facility_49_DbHost" fullWidth size="small" label={t("facility_49_DbHost") || "DB Host"} name="his_db_host" value={formData.his_db_host} onChange={handleChange("his_db_host")} />
            <Secure.GLTextField resource_key="facility_49_DbPort" fullWidth size="small" label={t("facility_49_DbPort") || "DB Port"} name="his_db_port" value={formData.his_db_port} onChange={handleChange("his_db_port")} />
            <Secure.GLTextField resource_key="facility_49_DbName" fullWidth size="small" label={t("facility_49_DbName") || "DB Name"} name="his_db_name" value={formData.his_db_name} onChange={handleChange("his_db_name")} />
            <Secure.GLTextField resource_key="facility_49_DbUsername" fullWidth size="small" label={t("facility_49_DbUsername") || "DB Username"} name="his_db_username" value={formData.his_db_username} onChange={handleChange("his_db_username")} />
            <Secure.GLTextField resource_key="facility_49_DbPassword" fullWidth size="small" label={t("facility_49_DbPassword") || "DB Password"} name="his_db_password" value={formData.his_db_password} onChange={handleChange("his_db_password")} type="password" />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Secure.GLButton resource_key="facility_49_CancelButton" onClick={onClose} disabled={saving}>
          {t("facility_49_CancelButton") || "Cancel"}
        </Secure.GLButton>
        <Secure.GLButton resource_key="facility_49_SaveButton" variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : (t("facility_49_SaveButton") || "Save")}
        </Secure.GLButton>
      </DialogActions>
    </Dialog>
  );
}
