import {
  Button,
  Box,
  FormControlLabel,
  Grid2 as Grid,
  Typography,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Form, Formik } from "formik";
import { createPayer } from "../../redux/slices/payerSlice";
import payerSchema from "../../models/payerSchema";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { fetchPayers } from "../../redux/slices/payerSlice";
import SecureBilling from "../../shared/security";
import { Secure } from "@givc/shared-components";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import { publicUrl } from "../../utils/publicUrl";
import AddIcon from "@mui/icons-material/Add";
export const AddPayerForm = ({
  refetchRef,
  onPayerAdded,
}: {
  refetchRef?: React.RefObject<(() => void) | null>;
  onPayerAdded?: () => void;
} = {}) => {
  //==================  * Resources * ===================

  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;

  const { nphiesCodeTypes, tpaCodeTypes, shadowBillingCodeTypes } = useSelector(
    (state: RootState) => state.payer,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [refreshKey, setRefreshKey] = useState(0);

  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
    setSelectedFile(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const validateFormikWithJoi = (values: any) => {
    const { error } = payerSchema.validate(values, { abortEarly: false });
    console.log("Validation Errors:", error?.details || "No errors");
    if (!error) return {};

    const errors: any = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    return errors;
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    console.log("handleSubmit called");
    const dispatchedData = {
      ...values,
      tpa_id: Number(values.tpa_id) || null,
    };
    console.log(dispatchedData);
    try {
      const resultAction = await dispatch(
        createPayer({ data: dispatchedData }),
      );
      // only close and refresh if fulfilled
      if (createPayer.fulfilled.match(resultAction)) {
        // Invalidate all payer-related SWR caches so table refreshes with new record
        await mutate((key) => apiUtility(key, "/payers/new"));
        await mutate((key) => apiUtility(key, "/payers/systemPayers"));
        await mutate((key) => apiUtility(key, "/payers"));
        // Also trigger direct refetch via ref for immediate UI update
        refetchRef?.current?.();
        onPayerAdded?.();
        setRefreshKey((prev) => prev + 1);
        setOpen(false);
      }
    } catch (e) {
      console.error("create payer error", e);
    } finally {
      setSubmitting(false);
    }
  };

  // file uploading stufff
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  // EFFECTS
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

  const {
    palette: { mode },
  } = useTheme();

  return (
    <>
      <Secure.GLButton2
        permission="payers_7_AddPayer"
        fallBackText="Add Payer"
        onClick={handleClickOpen}
        startIcon={
          // <AddIcon />
          <img src={publicUrl(`themes/${mode}/icons/plus.png`)} alt="Add" />
        }
        // style={{ marginLeft: "auto", whiteSpace: "nowrap" }}
        // sx={{
        //   whiteSpace: "nowrap",
        //   minWidth: "max-content",
        //   textTransform: "none",
        //   flexShrink: 0,
        // }}
        sx={{
          p: 0,
        }}
      />
      {/* <span className="title-text" style={{ whiteSpace: "nowrap" }}>
          {t("payers_7_AddPayer") || "Add Payer"}
        </span> */}

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="dialog-gradient"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: "bold" }}>
          {t("payers_7_PayerDetails") || "Payer Details"}
        </DialogTitle>
        <DialogContent sx={{ overflow: "visible" }}>
          <Formik
            initialValues={{
              description: "",
              short_name: "",
              payer_bk: "",
              active: "Y",
              cchi_no: "",
              nphies_license: "",
              vat_register_no: "",
              is_tpa: "N",
              tpa_id: null,
              shadow_billing_code: "",
              eligibility_no_days: null,
              eligibility_no_visits: null,
              facility_id: null,
              claim_in_open_episode: "Y",
              claim_out_open_episode: "Y",
              address_1: "",
              address_2: "",
              address_3: "",
              address_4: "",
            }}
            validate={validateFormikWithJoi}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              values,
              errors,
              touched,
              isSubmitting,
              handleSubmit,
              setFieldValue,
            }) => (
              <Form>
                <Grid container spacing={2} alignItems={"center"}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <SecureBilling.GLTextField
                      resource_key="payers_7_Name"
                      name="description"
                      label={t("payers_7_Name") || "Name"}
                      fullWidth
                      value={values.description}
                      onChange={handleChange}
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                      variant="outlined"
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <SecureBilling.GLTextField
                      resource_key="payers_7_ShortName"
                      name="short_name"
                      label={t("payers_7_ShortName") || "Short Name"}
                      fullWidth
                      value={values.short_name}
                      onChange={handleChange}
                      error={touched.short_name && Boolean(errors.short_name)}
                      helperText={touched.short_name && errors.short_name}
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <SecureBilling.GLTextField
                      resource_key="payers_7_Code"
                      name="payer_bk"
                      label={t("payers_7_Code") || "Code"}
                      fullWidth
                      value={values.payer_bk}
                      onChange={handleChange}
                      error={touched.payer_bk && Boolean(errors.payer_bk)}
                      helperText={touched.payer_bk && errors.payer_bk}
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.active === "Y"}
                          onChange={(e) =>
                            setFieldValue(
                              "active",
                              e.target.checked ? "Y" : "N",
                            )
                          }
                        />
                      }
                      label={t("payers_7_Active") || "Active"}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={2}
                      p={2}
                      border="1px dashed #ccc"
                      borderRadius={2}
                      maxWidth={400}
                      mx="auto"
                    >
                      <input
                        accept="image/*"
                        id="file-upload"
                        type="file"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload">
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                        >
                          {t("payers_7_UploadLogo") || "Upload Logo"}
                        </Button>
                      </label>

                      {selectedFile && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="textSecondary">
                            {selectedFile?.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => setSelectedFile(null)}
                            color="error"
                          >
                            ×
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <SecureBilling.GLTextField
                      resource_key="payers_7_CCHINo"
                      name="cchi_no"
                      label={t("payers_7_CCHINo") || "CCHI No."}
                      fullWidth
                      value={values.cchi_no}
                      onChange={handleChange}
                      error={touched.cchi_no && Boolean(errors.cchi_no)}
                      helperText={touched.cchi_no && errors.cchi_no}
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <SecureBilling.GLGenericAutocomplete
                      resource_key="payers_7_NphiesLicense"
                      options={nphiesCodeTypes}
                      getOptionLabel={(option: any) =>
                        `${option.user_code} - ${option.description}`
                      }
                      value={
                        nphiesCodeTypes.find(
                          (option) =>
                            option.user_code === values.nphies_license,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue(
                          "nphies_license",
                          newValue?.user_code || "",
                        )
                      }
                      renderInput={(params) => (
                        <SecureBilling.GLTextField
                          {...params}
                          resource_key="payers_7_NphiesLicense"
                          label={
                            t("payers_7_NphiesLicense") || "Nphies License"
                          }
                          variant="outlined"
                          fullWidth
                          error={
                            touched.nphies_license &&
                            Boolean(errors.nphies_license)
                          }
                          helperText={
                            touched.nphies_license && errors.nphies_license
                          }
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <SecureBilling.GLTextField
                      resource_key="payers_7_VATNumber"
                      fullWidth
                      name="vat_register_no"
                      label={t("payers_7_VATNumber") || "VAT Number"}
                      value={values.vat_register_no}
                      onChange={handleChange}
                      error={
                        touched.vat_register_no &&
                        Boolean(errors.vat_register_no)
                      }
                      helperText={
                        touched.vat_register_no && errors.vat_register_no
                      }
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.is_tpa === "Y"}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFieldValue("is_tpa", checked ? "Y" : "N");
                            setFieldValue(
                              "tpa_id",
                              checked ? null : values.tpa_id,
                            );
                          }}
                        />
                      }
                      label={t("payers_7_TPA") || "TPA"}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <SecureBilling.GLGenericAutocomplete
                      resource_key="payers_7_ManagedByTPA"
                      options={tpaCodeTypes}
                      getOptionLabel={(option: any) =>
                        `${option.payer_id} - ${option.description}`
                      }
                      value={
                        tpaCodeTypes.find(
                          (option) => option.payer_id === values.tpa_id,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue("tpa_id", newValue?.payer_id || null)
                      }
                      renderInput={(params) => (
                        <SecureBilling.GLTextField
                          {...params}
                          resource_key="payers_7_ManagedByTPA"
                          label={t("payers_7_ManagedByTPA") || "Managed By TPA"}
                          variant="outlined"
                          fullWidth
                          error={touched.tpa_id && Boolean(errors.tpa_id)}
                          helperText={touched.tpa_id && errors.tpa_id}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                      disabled={values.is_tpa === "Y"}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <SecureBilling.GLGenericAutocomplete
                      resource_key="payers_7_ShadowBillingCode"
                      options={shadowBillingCodeTypes}
                      getOptionLabel={(option: any) =>
                        `${option.user_code} - ${option.description}`
                      }
                      value={
                        shadowBillingCodeTypes.find(
                          (option) =>
                            option.code === values.shadow_billing_code,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue(
                          "shadow_billing_code",
                          newValue?.code || "",
                        )
                      }
                      renderInput={(params) => (
                        <SecureBilling.GLTextField
                          {...params}
                          resource_key="payers_7_ShadowBillingCode"
                          label={
                            t("payers_7_ShadowBillingCode") ||
                            "Shadow Billing Code"
                          }
                          variant="outlined"
                          fullWidth
                          error={
                            touched.shadow_billing_code &&
                            Boolean(errors.shadow_billing_code)
                          }
                          helperText={
                            touched.shadow_billing_code &&
                            errors.shadow_billing_code
                          }
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <SecureBilling.GLTextField
                      resource_key="payers_7_EligibilityDays"
                      fullWidth
                      name="eligibility_no_days"
                      label={
                        t("payers_7_EligibilityDays") || "Eligibility Days"
                      }
                      value={values.eligibility_no_days}
                      onChange={handleChange}
                      error={
                        touched.eligibility_no_days &&
                        Boolean(errors.eligibility_no_days)
                      }
                      helperText={
                        touched.eligibility_no_days &&
                        errors.eligibility_no_days
                      }
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <SecureBilling.GLTextField
                      resource_key="payers_7_EligibilityVisits"
                      fullWidth
                      name="eligibility_no_visits"
                      label={
                        t("payers_7_EligibilityVisits") || "Eligibility Visits"
                      }
                      value={values.eligibility_no_visits}
                      onChange={handleChange}
                      error={
                        touched.eligibility_no_visits &&
                        Boolean(errors.eligibility_no_visits)
                      }
                      helperText={
                        touched.eligibility_no_visits &&
                        errors.eligibility_no_visits
                      }
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Box sx={{ display: "flex", gap: 4 }}>
                      <Box sx={{ mt: 1.1 }}>
                        <SecureBilling.GLTypography
                          resource_key="payers_7_IncludeOpenEpisode"
                          variant="caption"
                          fontWeight="medium"
                          sx={{
                            color: (theme) =>
                              theme.palette.mode === "light"
                                ? "text.obs"
                                : "text.obs",
                          }}
                        >
                          {t("payers_7_IncludeOpenEpisode") ||
                            "Include Open Episode in Claims"}
                        </SecureBilling.GLTypography>
                      </Box>

                      <Box>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={values.claim_in_open_episode === "Y"}
                              onChange={(e) =>
                                setFieldValue(
                                  "claim_in_open_episode",
                                  e.target.checked ? "Y" : "N",
                                )
                              }
                            />
                          }
                          label={t("payers_7_Inpatient") || "Inpatient"}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={values.claim_out_open_episode === "Y"}
                              onChange={(e) =>
                                setFieldValue(
                                  "claim_out_open_episode",
                                  e.target.checked ? "Y" : "N",
                                )
                              }
                            />
                          }
                          label={t("payers_7_Outpatient") || "Outpatient"}
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <SecureBilling.GLTextField
                      resource_key="payers_7_Address1"
                      fullWidth
                      name="address_1"
                      label={t("payers_7_Address1") || "Address 1"}
                      value={values.address_1 || ""}
                      onChange={handleChange}
                      error={touched.address_1 && Boolean(errors.address_1)}
                      helperText={touched.address_1 && errors.address_1}
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SecureBilling.GLTextField
                      resource_key="payers_7_Address2"
                      fullWidth
                      name="address_2"
                      label={t("payers_7_Address2") || "Address 2"}
                      value={values.address_2 || ""}
                      onChange={handleChange}
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SecureBilling.GLTextField
                      resource_key="payers_7_Address3"
                      fullWidth
                      name="address_3"
                      label={t("payers_7_Address3") || "Address 3"}
                      value={values.address_3 || ""}
                      onChange={handleChange}
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SecureBilling.GLTextField
                      resource_key="payers_7_Address4"
                      fullWidth
                      name="address_4"
                      label={t("payers_7_Address4") || "Address 4"}
                      value={values.address_4 || ""}
                      onChange={handleChange}
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </Grid>

                <Box
                  display="flex"
                  mt={3}
                  alignItems="center"
                  justifyContent="flex-end"
                  gap="7px"
                >
                  <Button
                    onClick={() => setOpen(false)}
                    variant="contained"
                    color="error"
                  >
                    {t("payers_7_Cancel") || "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? t("payers_7_Saving") || "Saving..."
                      : t("payers_7_Save")}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};
