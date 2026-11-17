import { useContext } from "react";
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
import { AuthGuardContext, Secure } from "@givc/shared-components";
import { formatDate } from "../../../utils/formatData/formatterv2";

interface ViewFacilityDialogProps {
  open: boolean;
  facility: any | null;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <Box>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body2">{value || "—"}</Typography>
    </Box>
  );
}

export default function ViewFacilityDialog({ open, facility, onClose }: ViewFacilityDialogProps) {
  const { t } = useContext(AuthGuardContext);

  if (!facility) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {t("facility_49_ViewTitle") || "View Facility"}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("facility_49_GeneralInfo") || "General Information"}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            <DetailRow label={t("facility_49_Name") || "Facility Name"} value={facility.name} />
            <DetailRow label={t("facility_49_VatNumber") || "VAT Number"} value={facility.vat_number} />
            <DetailRow label={t("facility_49_Crn") || "CRN"} value={facility.crn} />
            <DetailRow label={t("facility_49_Phone") || "Phone"} value={facility.phone} />
            <DetailRow label={t("facility_49_POBox") || "P.O. Box"} value={facility.p_o_box} />
            <DetailRow label={t("facility_49_Email") || "Email"} value={facility.email} />
            <DetailRow label={t("facility_49_Website") || "Website"} value={facility.website} />
            <DetailRow label={t("facility_49_CchiNo") || "CCHI No"} value={facility.cchi_no} />
            <DetailRow label={t("facility_49_NphiesLicense") || "NPHIES License"} value={facility.nphies_license} />
          </Box>

          <Divider />

          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("facility_49_Address") || "Address"}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
            <DetailRow label={t("facility_49_Street") || "Street"} value={facility.street} />
            <DetailRow label={t("facility_49_BuildingNumber") || "Building No"} value={facility.building_number} />
            <DetailRow label={t("facility_49_PlotId") || "Plot ID"} value={facility.plot_id} />
            <DetailRow label={t("facility_49_District") || "District"} value={facility.district} />
            <DetailRow label={t("facility_49_City") || "City"} value={facility.city} />
            <DetailRow label={t("facility_49_PostalCode") || "Postal Code"} value={facility.postal_code} />
            <DetailRow label={t("facility_49_Region") || "Region"} value={facility.region} />
            <DetailRow label={t("facility_49_CountryCode") || "Country Code"} value={facility.country_code} />
          </Box>

          <Divider />

          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("facility_49_Locale") || "Locale (Arabic)"}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            <DetailRow label={t("facility_49_NameLocale") || "Name Locale"} value={facility.name_locale} />
            <DetailRow label={t("facility_49_StreetLocale") || "Street Locale"} value={facility.street_locale} />
            <DetailRow label={t("facility_49_DistrictLocale") || "District Locale"} value={facility.district_locale} />
            <DetailRow label={t("facility_49_CityLocale") || "City Locale"} value={facility.city_locale} />
            <DetailRow label={t("facility_49_RegionLocale") || "Region Locale"} value={facility.region_locale} />
          </Box>

          <Divider />

          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("facility_49_HisIntegration") || "HIS Integration"}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
            <DetailRow label={t("facility_49_OrgId") || "Org ID"} value={facility.org_id} />
            <DetailRow label={t("facility_49_NphiesCsOrgId") || "NPHIES CS Org ID"} value={facility.nphies_cs_org_id} />
            <DetailRow label={t("facility_49_DbDriver") || "DB Driver"} value={facility.his_db_driver} />
            <DetailRow label={t("facility_49_DbHost") || "DB Host"} value={facility.his_db_host} />
            <DetailRow label={t("facility_49_DbPort") || "DB Port"} value={facility.his_db_port} />
            <DetailRow label={t("facility_49_DbName") || "DB Name"} value={facility.his_db_name} />
            <DetailRow label={t("facility_49_DbUsername") || "DB Username"} value={facility.his_db_username} />
            <DetailRow label={t("facility_49_DbPassword") || "DB Password"} value={"••••••••"} />
          </Box>

          <Divider />

          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("facility_49_Metadata") || "Metadata"}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            <DetailRow label={t("facility_49_CreationDate") || "Creation Date"} value={formatDate(facility.creation_date, "DATE_FORMAT")} />
            <DetailRow label={t("facility_49_CreatedBy") || "Created By"} value={facility.created_by} />
            <DetailRow label={t("facility_49_SelectUser") || "Modified By"} value={facility.modified_by} />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Secure.GLButton resource_key="facility_49_CloseButton" onClick={onClose}>
          {t("facility_49_CloseButton") || "Close"}
        </Secure.GLButton>
      </DialogActions>
    </Dialog>
  );
}
