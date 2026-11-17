import {
  Box,
  Grid,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Button,
  Card,
  Stack,
  CircularProgress,
  Slide,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import payerSchema from "../../models/payerSchema";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { fetchPayers, updatePayer } from "../../redux/slices/payerSlice";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import Secure from "../../shared/security";
import { GlDatePicker } from "../../shared/forms/StandAlone/GlDatePicker";
import { format } from "date-fns";
interface EditPayerFormProps {
  selectedPayer: any;
  selectedPayerId: any;
  openEditMode: () => void;
  closeEditMode: () => void;
  disable: boolean;
  setDisable: React.Dispatch<React.SetStateAction<boolean>>;
  reftech: React.RefObject<(() => void) | null>;
}

export const EditPayerForm: React.FC<EditPayerFormProps> = ({
  selectedPayer,
  openEditMode,
  closeEditMode,
  disable,
  setDisable,
  reftech,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { nphiesCodeTypes, tpaCodeTypes, shadowBillingCodeTypes } = useSelector(
    (state: RootState) => state.payer,
  );

  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;
  const [refreshKey, setRefreshKey] = useState(0);
  const [formRefresh, setFormRefresh] = useState(0);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState({
    id: null,
    description: "",
    short_name: "",
    payer_bk: "",
    active: "Y",
    cchi_no: "",
    nphies_license: "",
    vat_register_no: null, // ask waleed sir
    is_tpa: "N",
    tpa_id: null as number | null,
    shadow_billing_code: "",
    eligibility_no_days: null,
    eligibility_no_visits: null,
    claim_in_open_episode: "Y",
    claim_out_open_episode: "Y",
    address_1: "",
    address_2: "",
    address_3: "",
    address_4: "",
    street_name: "",
    building_no: "",
    district: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "",
    tel_no: "",
    contact: "",
    email_address: "",
    price_date: "",
    claim_config_id: "",
    provider_id: "",
    account_no: "",
    plot_identification: "",
    description_locale: "",
    street_name_locale: "",
    district_locale: "",
    city_locale: "",
    province_locale: "",
  });
  const newData = (e: any) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    // Clear the validation error for this field as soon as the user edits it
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    console.log(data);
  };

  useEffect(() => {
    setFormErrors({});
    if (selectedPayer) {
      setData({
        id: selectedPayer.payer_id,
        description: selectedPayer.description || "",
        short_name: selectedPayer.short_name || "",
        payer_bk: selectedPayer.payer_bk || "",
        active: selectedPayer.active || "",
        cchi_no: selectedPayer.cchi_no || "", // ✅ Ensure it's an empty string if undefined
        nphies_license: selectedPayer.nphies_license || "",
        vat_register_no: selectedPayer.vat_register_no || "",
        is_tpa: selectedPayer.is_tpa || "",
        tpa_id: selectedPayer.tpa_id || null,
        // non mapped code
        shadow_billing_code: selectedPayer.shadow_billing_code || "",
        eligibility_no_days: selectedPayer.eligibility_no_days || "",
        eligibility_no_visits: selectedPayer.eligibility_no_visits || "",
        claim_in_open_episode: selectedPayer.claim_in_open_episode || "",
        claim_out_open_episode: selectedPayer.claim_out_open_episode || "",
        address_1: selectedPayer.address_1 || "",
        address_2: selectedPayer.address_2 || "",
        address_3: selectedPayer.address_3 || "",
        address_4: selectedPayer.address_4 || "",
        street_name: selectedPayer.street_name || "",
        building_no: selectedPayer.building_no || "",
        district: selectedPayer.district || "",
        city: selectedPayer.city || "",
        province: selectedPayer.province || "",
        postal_code: selectedPayer.postal_code || "",
        country_code: selectedPayer.country_code || "",
        tel_no: selectedPayer.tel_no || "",
        contact: selectedPayer.contact || "",
        email_address: selectedPayer.email_address || "",
        price_date: selectedPayer.price_date || "",
        claim_config_id: selectedPayer.claim_config_id || "",
        provider_id: selectedPayer.provider_id || "",
        account_no: selectedPayer.account_no || "",
        plot_identification: selectedPayer.plot_identification || "",
        description_locale: selectedPayer.description_locale || "",
        street_name_locale: selectedPayer.street_name_locale || "",
        district_locale: selectedPayer.district_locale || "",
        city_locale: selectedPayer.city_locale || "",
        province_locale: selectedPayer.province_locale || "",
      });
      closeEditMode();
    } else {
      setData({
        id: null,
        description: "",
        short_name: "",
        payer_bk: "",
        active: "Y",
        cchi_no: "", // ✅ Reset properly
        nphies_license: "",
        vat_register_no: null,
        is_tpa: "N",
        tpa_id: null,
        shadow_billing_code: "",
        eligibility_no_days: null,
        eligibility_no_visits: null,
        claim_in_open_episode: "Y",
        claim_out_open_episode: "Y",
        address_1: "",
        address_2: "",
        address_3: "",
        address_4: "",
        street_name: "",
        building_no: "",
        district: "",
        city: "",
        province: "",
        postal_code: "",
        country_code: "",
        tel_no: "",
        contact: "",
        email_address: "",
        price_date: "",
        claim_config_id: "",
        provider_id: "",
        account_no: "",
        plot_identification: "",
        description_locale: "",
        street_name_locale: "",
        district_locale: "",
        city_locale: "",
        province_locale: "",
      });
    }
  }, [selectedPayer, formRefresh]);

  useEffect(() => {
    setFormErrors({});
  }, [disable]);

  const handleSaveChanges = async () => {
    // Validate with Joi schema before dispatching
    const { error } = payerSchema.validate(data, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (error) {
      console.log("****************************");
      console.log(error.details);
      const errors: Record<string, string> = {};
      error.details.forEach((err) => {
        errors[String(err.path[0])] = err.message;
      });
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setUpdateLoading(true);
    const dispatchedData = {
      ...data,
      tpa_id: Number(data.tpa_id) || null,
    };
    try {
      const resultAction = await dispatch(
        updatePayer({ id: selectedPayer.payer_id, data: dispatchedData }),
      );
      if (updatePayer.fulfilled.match(resultAction)) {
        closeEditMode();
        reftech?.current?.();
        mutate((e) => apiUtility(e, "payer"));
        setRefreshKey((prev) => prev + 1);
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  /**
   * this effect uses the old api to fetch autocomplete lists
   * it brings back a single page sorted but it is not used any more as glcustomtable fetches its own data
   * In the future the front and back will be refactored
   */
  useEffect(() => {
    dispatch(
      fetchPayers({
        page: 1,
        limit: 10,
        sortField: "payer_id",
        sortOrder: "asc",
        searchField: "",
      }),
    );
  }, [refreshKey]);
  // const openEditMode = ()=>{
  //   setDisable(false)
  // }

  // const closeEditMode = ()=>{
  //   setDisable(true)
  // }

  return (
    <>
      <Box sx={{}}>
        {selectedPayer && (
          <>
            <Card sx={{ p: 1 }}>
              <Stack
                sx={{}}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={0}
                spacing={1}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Secure.GLTypography
                    resource_key="payers_7_PayerDetails"
                    variant="h6"
                    fontWeight="bold"
                  >
                    {t("payers_7_PayerDetails") || "Payer Details"}
                  </Secure.GLTypography>
                  {selectedPayer.icon && (
                    <img
                      src={selectedPayer.icon}
                      alt="Payer Icon"
                      style={{ width: 40, height: 40, borderRadius: 8 }}
                    />
                  )}
                </Stack>

                <Secure.GLButton
                  resource_key="payers_7_Edit"
                  variant="contained"
                  color={disable ? "primary" : "inherit"}
                  startIcon={<ModeEditIcon />}
                  onClick={openEditMode}
                  disabled={!disable}
                  sx={{ textTransform: "none" }}
                >
                  {t("payers_7_Edit") || "Edit"}
                </Secure.GLButton>
              </Stack>

              <Grid container spacing={1} rowSpacing={2} mt={0.5} columns={48}>
                {/* Basic Info */}
                {/* <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {t("payers_7_BasicInfo") || "Basic Info"}
                  </Typography>
                </Grid> */}

                <Grid item xs={3}>
                  <TextField
                    name="id"
                    fullWidth
                    label={t("payers_7_IdField") || "ID"}
                    value={data.id || ""}
                    disabled={disable}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    fullWidth
                    label={t("payers_7_Name") || "Name"}
                    value={data.description || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.description)}
                    helperText={formErrors.description}
                  />
                </Grid>
                <Grid item xs={7}>
                  <TextField
                    name="short_name"
                    fullWidth
                    label={t("payers_7_ShortName") || "Short Name"}
                    value={data.short_name || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.short_name)}
                    helperText={formErrors.short_name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description_locale"
                    fullWidth
                    label={
                      t("payers_7_descriptionInArabic") ||
                      "description in arabic"
                    }
                    value={data.description_locale || ""}
                    onChange={newData}
                    disabled={disable}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    name="account_no"
                    fullWidth
                    label={t("payers_7_accountNo") || "account no"}
                    value={data.account_no || ""}
                    onChange={newData}
                    disabled={disable}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    name="payer_bk"
                    fullWidth
                    label={t("payers_7_Code") || "Code"}
                    value={data.payer_bk || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.payer_bk)}
                    helperText={formErrors.payer_bk}
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.active === "Y"}
                        onChange={(e) =>
                          setData({
                            ...data,
                            active: e.target.checked ? "Y" : "N",
                          })
                        }
                      />
                    }
                    label={t("payers_7_Active") || "Active"}
                    disabled={disable}
                  />
                </Grid>

                {/* Licensing Info */}
                {/* <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t("payers_7_Licensing") || "Licensing"}
                  </Typography>
                </Grid> */}
                <Grid item xs={5}>
                  <TextField
                    name="cchi_no"
                    fullWidth
                    label={t("payers_7_CCHINo") || "CCHI No"}
                    value={data.cchi_no || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.cchi_no)}
                    helperText={formErrors.cchi_no}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    options={nphiesCodeTypes}
                    getOptionLabel={(opt: any) =>
                      `${opt.user_code} - ${opt.description}`
                    }
                    value={
                      nphiesCodeTypes.find(
                        (opt) => opt.user_code === data.nphies_license,
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      setData({
                        ...data,
                        nphies_license: newValue?.user_code || "",
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          t("payers_7_NphiesLicense") || "Nphies License"
                        }
                      />
                    )}
                    disabled={disable}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="vat_register_no"
                    fullWidth
                    label={t("payers_7_VATNumber") || "VAT Number"}
                    value={data.vat_register_no || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.vat_register_no)}
                    helperText={formErrors.vat_register_no}
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.is_tpa === "Y"}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            is_tpa: e.target.checked ? "Y" : "N",
                            tpa_id: e.target.checked ? null : prev.tpa_id,
                          }))
                        }
                      />
                    }
                    label={t("payers_7_TPA") || "TPA"}
                    disabled={disable}
                  />
                </Grid>
                <Grid item xs={8}>
                  <Autocomplete
                    options={tpaCodeTypes.filter(
                      (payer) => payer.payer_id !== selectedPayer.payer_id,
                    )}
                    getOptionLabel={(opt: any) =>
                      `${opt.payer_id} - ${opt.description}`
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.payer_id === value.payer_id
                    }
                    value={
                      tpaCodeTypes.find(
                        (opt) => opt.payer_id === data.tpa_id,
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      setData((prevData: any) => ({
                        ...prevData,
                        tpa_id: newValue?.payer_id || null,
                      }))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={
                          t("payers_7_ManagedByTPA") || "Managed By TPA"
                        }
                      />
                    )}
                    disabled={disable || data.is_tpa === "Y"}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name="claim_config_id"
                    fullWidth
                    label={t("payers_7_claimConfigId") || "claim config id"}
                    type="number"
                    slotProps={{
                      htmlInput: {
                        sx: {
                          "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                            {
                              WebkitAppearance: "none",
                              margin: 0,
                            },
                          "&[type=number]": {
                            MozAppearance: "textfield",
                          },
                        },
                      },
                    }}
                    value={data.claim_config_id || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.claim_config_id)}
                    helperText={formErrors.claim_config_id}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name="provider_id"
                    fullWidth
                    label={t("payers_7_providerId") || "provider id"}
                    value={data.provider_id || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.provider_id)}
                    helperText={formErrors.provider_id}
                  />
                </Grid>
                <Grid item xs={6}>
                  <GlDatePicker
                    name="price_date"
                    format="dd-MM-yyyy"
                    // fullWidth
                    label={t("payers_7_priceDate") || "price date"}
                    value={data.price_date ? new Date(data.price_date) : null}
                    onChange={(newValue) => {
                      setData((prev) => ({
                        ...prev,
                        price_date: newValue
                          ? format(newValue, "yyyy-MM-dd")
                          : "",
                      }));
                    }}
                    disabled={disable}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="street_name"
                    fullWidth
                    label={t("payers_7_streetName") || "street name"}
                    value={data.street_name || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.street_name)}
                    helperText={formErrors.street_name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="street_name_locale"
                    fullWidth
                    label={
                      t("payers_7_streetNameInArabic") ||
                      "street name in arabic"
                    }
                    value={data.street_name_locale || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.street_name_locale)}
                    helperText={formErrors.street_name_locale}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name="building_no"
                    fullWidth
                    label={t("payers_7_buildingNo") || "building no"}
                    value={data.building_no || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.building_no)}
                    helperText={formErrors.building_no}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    name="district"
                    fullWidth
                    label={t("payers_7_district") || "district"}
                    value={data.district || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.district)}
                    helperText={formErrors.district}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="district_locale"
                    fullWidth
                    label={
                      t("payers_7_districtInArabic") || "district in arabic"
                    }
                    value={data.district_locale || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.district_locale)}
                    helperText={formErrors.district_locale}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name="city"
                    fullWidth
                    label={t("payers_7_city") || "city"}
                    value={data.city || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.city)}
                    helperText={formErrors.city}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    name="city_locale"
                    fullWidth
                    label={t("payers_7_cityInArabic") || "city in arabic"}
                    value={data.city_locale || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.city_locale)}
                    helperText={formErrors.city_locale}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="province"
                    fullWidth
                    label={t("payers_7_province") || "province"}
                    value={data.province || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.province)}
                    helperText={formErrors.province}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="province_locale"
                    fullWidth
                    label={
                      t("payers_7_provinceInArabic") || "province in Arabic"
                    }
                    value={data.province_locale || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.province_locale)}
                    helperText={formErrors.province_locale}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name="postal_code"
                    fullWidth
                    label={t("payers_7_postalCode") || "postal code"}
                    value={data.postal_code || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.postal_code)}
                    helperText={formErrors.postal_code}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    name="plot_identification"
                    fullWidth
                    label={
                      t("payers_7_plotIdentification") || "plot identification"
                    }
                    value={data.plot_identification || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.plot_identification)}
                    helperText={formErrors.plot_identification}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    name="country_code"
                    fullWidth
                    label={t("payers_7_countryCode") || "country code"}
                    value={data.country_code || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.country_code)}
                    helperText={formErrors.country_code}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="tel_no"
                    fullWidth
                    label={t("payers_7_telNo") || "tel no"}
                    value={data.tel_no || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.tel_no)}
                    helperText={formErrors.tel_no}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    name="contact"
                    fullWidth
                    label={t("payers_7_contact") || "contact"}
                    value={data.contact || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.contact)}
                    helperText={formErrors.contact}
                  />
                </Grid>
                <Grid item xs={13}>
                  <TextField
                    name="email_address"
                    fullWidth
                    label={t("payers_7_emailAddress") || "email address"}
                    value={data.email_address || ""}
                    onChange={newData}
                    disabled={disable}
                    error={Boolean(formErrors.email_address)}
                    helperText={formErrors.email_address}
                  />
                </Grid>
                <Grid container item spacing={1}>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      name="address_1"
                      label={t("payers_7_Address1") || "Address 1"}
                      value={data.address_1 || ""}
                      onChange={newData}
                      disabled={disable}
                      error={Boolean(formErrors.address_1)}
                      helperText={formErrors.address_1}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      name="address_2"
                      label={t("payers_7_Address2") || "Address 2"}
                      value={data.address_2 || ""}
                      onChange={newData}
                      disabled={disable}
                      error={Boolean(formErrors.address_2)}
                      helperText={formErrors.address_2}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      name="address_3"
                      label={t("payers_7_Address3") || "Address 3"}
                      value={data.address_3 || ""}
                      onChange={newData}
                      disabled={disable}
                      error={Boolean(formErrors.address_3)}
                      helperText={formErrors.address_3}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      name="address_4"
                      label={t("payers_7_Address4") || "Address 4"}
                      value={data.address_4 || ""}
                      onChange={newData}
                      disabled={disable}
                      error={Boolean(formErrors.address_4)}
                      helperText={formErrors.address_4}
                    />
                  </Grid>
                </Grid>

                {/* Billing & Eligibility */}
                {/* <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t("payers_7_BillingEligibility") ||
                      "Billing & Eligibility"}
                  </Typography>
                </Grid> */}
                <Grid container item spacing={1} columns={16}>
                  <Grid item xs={4}>
                    <Autocomplete
                      options={shadowBillingCodeTypes}
                      getOptionLabel={(opt: any) =>
                        `${opt.user_code} - ${opt.description}`
                      }
                      value={
                        shadowBillingCodeTypes.find(
                          (opt) => opt.code === data.shadow_billing_code,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setData({
                          ...data,
                          shadow_billing_code: newValue?.code || "",
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={
                            t("payers_7_ShadowBillingCode") ||
                            "Shadow Billing Code"
                          }
                        />
                      )}
                      disabled={disable}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      name="eligibility_no_days"
                      label={
                        t("payers_7_EligibilityDays") || "Eligibility Days"
                      }
                      type="number"
                      slotProps={{
                        htmlInput: {
                          sx: {
                            "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                              {
                                WebkitAppearance: "none",
                                margin: 0,
                              },
                            "&[type=number]": {
                              MozAppearance: "textfield",
                            },
                          },
                        },
                      }}
                      value={data.eligibility_no_days || ""}
                      onChange={newData}
                      disabled={disable}
                      error={Boolean(formErrors.eligibility_no_days)}
                      helperText={formErrors.eligibility_no_days}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      name="eligibility_no_visits"
                      label={
                        t("payers_7_EligibilityVisits") || "Eligibility Visits"
                      }
                      type="number"
                      slotProps={{
                        htmlInput: {
                          sx: {
                            "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                              {
                                WebkitAppearance: "none",
                                margin: 0,
                              },
                            "&[type=number]": {
                              MozAppearance: "textfield",
                            },
                          },
                        },
                      }}
                      value={data.eligibility_no_visits || ""}
                      onChange={newData}
                      disabled={disable}
                      error={Boolean(formErrors.eligibility_no_visits)}
                      helperText={formErrors.eligibility_no_visits}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <Box display="flex" alignItems="light" gap="9px">
                      <Box sx={{ mt: 1.1 }}>
                        <Typography
                          variant="caption"
                          fontWeight="medium"
                          sx={{ color: `${disable === true ? `gray` : ``}` }}
                        >
                          {t("payers_7_IncludeOpenEpisode") ||
                            "Include Open Episode in Claims"}
                        </Typography>
                      </Box>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={data.claim_in_open_episode === "Y"}
                            onChange={(e) =>
                              setData({
                                ...data,
                                claim_in_open_episode: e.target.checked
                                  ? "Y"
                                  : "N",
                              })
                            }
                          />
                        }
                        label={t("payers_7_Inpatient") || "Inpatient"}
                        disabled={disable}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={data.claim_out_open_episode === "Y"}
                            onChange={(e) =>
                              setData({
                                ...data,
                                claim_out_open_episode: e.target.checked
                                  ? "Y"
                                  : "N",
                              })
                            }
                          />
                        }
                        label={t("payers_7_Outpatient") || "Outpatient"}
                        disabled={disable}
                      />
                    </Box>
                  </Grid>
                </Grid>
                {/* Address Info */}
                {/* <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t("payers_7_Address") || "Address"}
                  </Typography>
                </Grid> */}
              </Grid>

              {/* Save Button */}
              <Slide
                direction="up"
                in={!disable}
                timeout={300}
                mountOnEnter
                unmountOnExit
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-start"
                  gap="10px"
                  // mt={}
                  // sx={{}}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveChanges}
                    disabled={disable}
                    sx={{ textTransform: "none", px: 4 }}
                  >
                    {updateLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      t("payers_7_SaveChanges") || "Save Changes"
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setFormErrors({});
                      setDisable(true);
                      setFormRefresh((prev) => prev + 1);
                    }}
                    disabled={disable}
                    sx={{ textTransform: "none", px: 4 }}
                  >
                    {t("payers_7_Cancel") || "Cancel"}
                  </Button>
                </Box>
              </Slide>
            </Card>
          </>
        )}
      </Box>
    </>
  );
};
