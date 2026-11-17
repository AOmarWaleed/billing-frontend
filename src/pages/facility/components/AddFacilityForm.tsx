import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import { useContext, useRef, useState } from "react";
import { Form, Formik } from "formik";
import { createFacility } from "../../../redux/slices/facilitySlice";
import facilitySchema from "../../../models/facilitySchema";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import { AuthGuardContext, Secure } from "@givc/shared-components";
import { toast } from "react-toastify";

interface AddFacilityFormProps {
  open?: boolean;
  onClose?: () => void;
  onCreated?: () => void;
}

const initialFormValues = {
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
  name_locale: "",
  street_locale: "",
  district_locale: "",
  city_locale: "",
  region_locale: "",
};

const AddFacilityForm = ({ open: openProp, onClose: onCloseProp, onCreated }: AddFacilityFormProps) => {
  const ctx = useContext(AuthGuardContext);
  if (!ctx) return null;
  const { t } = ctx;

  const dispatch = useDispatch<AppDispatch>();
  const [openInternal, setOpenInternal] = useState(false);
  const submitInFlightRef = useRef(false);

  const open = openProp !== undefined ? openProp : openInternal;

  const handleClose = () => {
    if (onCloseProp) {
      onCloseProp();
    } else {
      setOpenInternal(false);
    }
  };

  const validateFormikWithJoi = (values: any) => {
    const { error } = facilitySchema.validate(values, { abortEarly: false });
    if (!error) return {};
    const errors: any = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    return errors;
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    if (submitInFlightRef.current) return;
    submitInFlightRef.current = true;
    try {
      const result = await dispatch(createFacility({ data: values }));
      if (createFacility.rejected.match(result)) {
        return;
      }
      toast.success("Facility created successfully");
      resetForm();
      handleClose();
      onCreated?.();
    } finally {
      submitInFlightRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            {t("facility_49_AddTitle") || "Add Facility"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={initialFormValues}
            validate={validateFormikWithJoi}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, isSubmitting, submitForm }) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t("facility_49_GeneralInfo") || "General Information"}</Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
                    <Secure.GLTextField resource_key="facility_49_Name" fullWidth size="small" label={t("facility_49_Name") || "Facility Name *"} name="name" value={values.name} onChange={handleChange} error={!!touched.name && !!errors.name} helperText={touched.name && errors.name} />
                    <Secure.GLTextField resource_key="facility_49_VatNumber" fullWidth size="small" label={t("facility_49_VatNumber") || "VAT Number"} name="vat_number" value={values.vat_number} onChange={handleChange} error={!!touched.vat_number && !!errors.vat_number} helperText={touched.vat_number && errors.vat_number} />
                    <Secure.GLTextField resource_key="facility_49_Crn" fullWidth size="small" label={t("facility_49_Crn") || "CRN"} name="crn" value={values.crn} onChange={handleChange} error={!!touched.crn && !!errors.crn} helperText={touched.crn && errors.crn} />
                    <Secure.GLTextField resource_key="facility_49_Phone" fullWidth size="small" label={t("facility_49_Phone") || "Phone"} name="phone" value={values.phone} onChange={handleChange} error={!!touched.phone && !!errors.phone} helperText={touched.phone && errors.phone} />
                    <Secure.GLTextField resource_key="facility_49_POBox" fullWidth size="small" label={t("facility_49_POBox") || "P.O. Box"} name="p_o_box" value={values.p_o_box} onChange={handleChange} error={!!touched.p_o_box && !!errors.p_o_box} helperText={touched.p_o_box && errors.p_o_box} />
                    <Secure.GLTextField resource_key="facility_49_Email" fullWidth size="small" label={t("facility_49_Email") || "Email"} name="email" value={values.email} onChange={handleChange} error={!!touched.email && !!errors.email} helperText={touched.email && errors.email} />
                    <Secure.GLTextField resource_key="facility_49_Website" fullWidth size="small" label={t("facility_49_Website") || "Website"} name="website" value={values.website} onChange={handleChange} error={!!touched.website && !!errors.website} helperText={touched.website && errors.website} />
                    <Secure.GLTextField resource_key="facility_49_CchiNo" fullWidth size="small" label={t("facility_49_CchiNo") || "CCHI No"} name="cchi_no" value={values.cchi_no} onChange={handleChange} error={!!touched.cchi_no && !!errors.cchi_no} helperText={touched.cchi_no && errors.cchi_no} />
                    <Secure.GLTextField resource_key="facility_49_NphiesLicense" fullWidth size="small" label={t("facility_49_NphiesLicense") || "NPHIES License"} name="nphies_license" value={values.nphies_license} onChange={handleChange} error={!!touched.nphies_license && !!errors.nphies_license} helperText={touched.nphies_license && errors.nphies_license} />
                  </Box>

                  <Divider />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t("facility_49_Address") || "Address"}</Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
                    <Secure.GLTextField resource_key="facility_49_Street" fullWidth size="small" label={t("facility_49_Street") || "Street"} name="street" value={values.street} onChange={handleChange} error={!!touched.street && !!errors.street} helperText={touched.street && errors.street} />
                    <Secure.GLTextField resource_key="facility_49_BuildingNumber" fullWidth size="small" label={t("facility_49_BuildingNumber") || "Building No"} name="building_number" value={values.building_number} onChange={handleChange} error={!!touched.building_number && !!errors.building_number} helperText={touched.building_number && errors.building_number} />
                    <Secure.GLTextField resource_key="facility_49_PlotId" fullWidth size="small" label={t("facility_49_PlotId") || "Plot ID"} name="plot_id" value={values.plot_id} onChange={handleChange} error={!!touched.plot_id && !!errors.plot_id} helperText={touched.plot_id && errors.plot_id} />
                    <Secure.GLTextField resource_key="facility_49_District" fullWidth size="small" label={t("facility_49_District") || "District"} name="district" value={values.district} onChange={handleChange} error={!!touched.district && !!errors.district} helperText={touched.district && errors.district} />
                    <Secure.GLTextField resource_key="facility_49_City" fullWidth size="small" label={t("facility_49_City") || "City"} name="city" value={values.city} onChange={handleChange} error={!!touched.city && !!errors.city} helperText={touched.city && errors.city} />
                    <Secure.GLTextField resource_key="facility_49_PostalCode" fullWidth size="small" label={t("facility_49_PostalCode") || "Postal Code"} name="postal_code" value={values.postal_code} onChange={handleChange} error={!!touched.postal_code && !!errors.postal_code} helperText={touched.postal_code && errors.postal_code} />
                    <Secure.GLTextField resource_key="facility_49_Region" fullWidth size="small" label={t("facility_49_Region") || "Region"} name="region" value={values.region} onChange={handleChange} error={!!touched.region && !!errors.region} helperText={touched.region && errors.region} />
                    <Secure.GLTextField resource_key="facility_49_CountryCode" fullWidth size="small" label={t("facility_49_CountryCode") || "Country Code"} name="country_code" value={values.country_code} onChange={handleChange} error={!!touched.country_code && !!errors.country_code} helperText={touched.country_code && errors.country_code} />
                  </Box>

                  <Divider />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t("facility_49_Locale") || "Locale (Arabic)"}</Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
                    <Secure.GLTextField resource_key="facility_49_NameLocale" fullWidth size="small" label={t("facility_49_NameLocale") || "Name Locale"} name="name_locale" value={values.name_locale} onChange={handleChange} error={!!touched.name_locale && !!errors.name_locale} helperText={touched.name_locale && errors.name_locale} />
                    <Secure.GLTextField resource_key="facility_49_StreetLocale" fullWidth size="small" label={t("facility_49_StreetLocale") || "Street Locale"} name="street_locale" value={values.street_locale} onChange={handleChange} error={!!touched.street_locale && !!errors.street_locale} helperText={touched.street_locale && errors.street_locale} />
                    <Secure.GLTextField resource_key="facility_49_DistrictLocale" fullWidth size="small" label={t("facility_49_DistrictLocale") || "District Locale"} name="district_locale" value={values.district_locale} onChange={handleChange} error={!!touched.district_locale && !!errors.district_locale} helperText={touched.district_locale && errors.district_locale} />
                    <Secure.GLTextField resource_key="facility_49_CityLocale" fullWidth size="small" label={t("facility_49_CityLocale") || "City Locale"} name="city_locale" value={values.city_locale} onChange={handleChange} error={!!touched.city_locale && !!errors.city_locale} helperText={touched.city_locale && errors.city_locale} />
                    <Secure.GLTextField resource_key="facility_49_RegionLocale" fullWidth size="small" label={t("facility_49_RegionLocale") || "Region Locale"} name="region_locale" value={values.region_locale} onChange={handleChange} error={!!touched.region_locale && !!errors.region_locale} helperText={touched.region_locale && errors.region_locale} />
                  </Box>

                  <Divider />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t("facility_49_HisIntegration") || "HIS Integration"}</Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
                    <Secure.GLTextField resource_key="facility_49_OrgId" fullWidth size="small" label={t("facility_49_OrgId") || "Org ID"} name="org_id" value={values.org_id} onChange={handleChange} error={!!touched.org_id && !!errors.org_id} helperText={touched.org_id && errors.org_id} />
                    <Secure.GLTextField resource_key="facility_49_NphiesCsOrgId" fullWidth size="small" label={t("facility_49_NphiesCsOrgId") || "NPHIES CS Org ID"} name="nphies_cs_org_id" value={values.nphies_cs_org_id} onChange={handleChange} error={!!touched.nphies_cs_org_id && !!errors.nphies_cs_org_id} helperText={touched.nphies_cs_org_id && errors.nphies_cs_org_id} />
                    <Secure.GLTextField resource_key="facility_49_DbDriver" fullWidth size="small" label={t("facility_49_DbDriver") || "DB Driver"} name="his_db_driver" value={values.his_db_driver} onChange={handleChange} error={!!touched.his_db_driver && !!errors.his_db_driver} helperText={touched.his_db_driver && errors.his_db_driver} />
                    <Secure.GLTextField resource_key="facility_49_DbHost" fullWidth size="small" label={t("facility_49_DbHost") || "DB Host"} name="his_db_host" value={values.his_db_host} onChange={handleChange} error={!!touched.his_db_host && !!errors.his_db_host} helperText={touched.his_db_host && errors.his_db_host} />
                    <Secure.GLTextField resource_key="facility_49_DbPort" fullWidth size="small" label={t("facility_49_DbPort") || "DB Port"} name="his_db_port" value={values.his_db_port} onChange={handleChange} error={!!touched.his_db_port && !!errors.his_db_port} helperText={touched.his_db_port && errors.his_db_port} />
                    <Secure.GLTextField resource_key="facility_49_DbName" fullWidth size="small" label={t("facility_49_DbName") || "DB Name"} name="his_db_name" value={values.his_db_name} onChange={handleChange} error={!!touched.his_db_name && !!errors.his_db_name} helperText={touched.his_db_name && errors.his_db_name} />
                    <Secure.GLTextField resource_key="facility_49_DbUsername" fullWidth size="small" label={t("facility_49_DbUsername") || "DB Username"} name="his_db_username" value={values.his_db_username} onChange={handleChange} error={!!touched.his_db_username && !!errors.his_db_username} helperText={touched.his_db_username && errors.his_db_username} />
                    <Secure.GLTextField resource_key="facility_49_DbPassword" fullWidth size="small" label={t("facility_49_DbPassword") || "DB Password"} name="his_db_password" value={values.his_db_password} onChange={handleChange} type="password" error={!!touched.his_db_password && !!errors.his_db_password} helperText={touched.his_db_password && errors.his_db_password} />
                  </Box>

                  <Box display="flex" gap={1} justifyContent="flex-end">
                    <Secure.GLButton resource_key="facility_49_CancelButton" variant="outlined" onClick={handleClose} disabled={isSubmitting}>
                      {t("facility_49_CancelButton") || "Cancel"}
                    </Secure.GLButton>
                    <Secure.GLButton resource_key="facility_49_SaveButton" variant="contained" onClick={submitForm} disabled={isSubmitting}>
                      {t("facility_49_SaveButton") || "Save"}
                    </Secure.GLButton>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddFacilityForm;
