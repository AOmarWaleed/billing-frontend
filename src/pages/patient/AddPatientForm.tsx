import {
  Autocomplete,
  Button,
  Box,
  FormControlLabel,
  Grid2,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  RadioGroup,
  Radio,
  useTheme,
  IconButton,
} from "@mui/material";
import { useState, useContext } from "react";
import { Form, Formik } from "formik";
import { createPatient } from "../../redux/slices/patientSlice";
import patientSchema from "../../models/patientModel";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAppSelector } from "../../hooks/hooks";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { useTranslation } from "react-i18next";
import Secure from "../../shared/security";
import { publicUrl } from "../../utils/publicUrl";
import CloseIcon from "@mui/icons-material/Close";
export const AddPatientForm = ({
  refetchRef,
}: {
  refetchRef: React.RefObject<() => void | null>;
}) => {
  // const { t } = useTranslation("20");
  const { t } = useContext(AuthGuardContext);
  const {
    nationalityCodeTypes,
    maritalStatusCodeTypes,
    occupationCodeTypes,
    religionCodeTypes,
    identityCodeTypes,
    genderCodeTypes,
  } = useSelector((state: RootState) => state.patient);

  const dateFormat = useAppSelector((state) => {
    return state.config.values.DATE_FORMAT;
  });
  const dispatch = useDispatch<AppDispatch>();

  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const validateFormikWithJoi = (values: any) => {
    const { error } = patientSchema.validate(values, { abortEarly: false });
    if (!error) return {};

    const errors: any = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    return errors;
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    const resultAction = await dispatch(createPatient({ data: values }));
    if (createPatient.fulfilled.match(resultAction)) {
      setOpen(false);
      refetchRef?.current?.();
    }
    setSubmitting(false);
  };

  const theme = useTheme();

  return (
    <>
      <Secure.GLGenericButton
        resource_key="patients_20_patientDetails"
        onClick={handleClickOpen}
      >
        {/* <AddCircleIcon /> */}
        <img
          src={publicUrl(`themes/${theme.palette.mode}/icons/plus.png`)}
          alt="Add"
        />
        <span style={{ paddingLeft: "10px" }} className="title-text">
          {t("patients_20_addPatient") || "Add Patient"}
        </span>
      </Secure.GLGenericButton>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="dialog-gradient"
      >
        <DialogTitle id="alert-dialog-title"
          sx={{ p: "3px 6px !important", display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 2, pr: 1, pt: 1, pb: 1 }}
        >
          {t("patients_20_patientDetails") || "Patient Details"}
          <IconButton
            onClick={handleClose}
            size="small"
          >
            <CloseIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{p: '3px 6px !important'}}
        >
          <Formik
            initialValues={{
              identityType: "",
              identityValue: "",
              identitySystem: "",

              mrn: "",
              first_name: "",
              middle_names: "",
              last_name: "",
              birth_date: "",
              gender: "",
              nationality: "",
              phone: "",
              marital_status: "",
              address_line: "",
              street: "",
              city: "",
              district: "",
              state: "",
              postal_code: "",
              country: "",
              occupation: "",
              religion: "",
              health_id: "",
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
              setFieldValue,
            }) => (
              <Form>
                {/* <pre>{JSON.stringify({ errors, touched, values }, null, 2)}</pre> */}

                <Grid2 container spacing={2}>
                  {/* Basic Details */}
                  {/* <Grid2 size={{ xs: 12 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {t("patients_20_basicInformation") || "Basic Information"}
                    </Typography>
                  </Grid2> */}

                  <Grid2 size={{ xs: 6 }}>
                    <Box display="flex" alignItems="center">
                      <Secure.GLTypography
                        resource_key="patients_20_firstName"
                        sx={{ color: "text.obs" }}
                        variant="subtitle2"
                        fontWeight="bold"
                        fallBackText="First Name"
                      />
                      <Typography component="span" sx={{ color: "red", ml: 0.5, fontWeight: "bold" }}>*</Typography>
                    </Box>

                    <Secure.GLTextField
                      resource_key="patients_20_firstName"
                      name="first_name"
                      color="whiteField"
                      value={values.first_name}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      error={touched.first_name && Boolean(errors.first_name)}
                      helperText={touched.first_name && errors.first_name}
                      sx={{
                        "& .MuiFormHelperText-root": {
                          color: "red !important",
                        },
                      }}
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_middleName"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                      fallBackText="Middle Name"
                    />

                    <Secure.GLTextField
                      resource_key="patients_20_middleName"
                      name="middle_names"
                      color="whiteField"
                      value={values.middle_names}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Box display="flex" alignItems="center">
                      <Secure.GLTypography
                        resource_key="patients_20_lastName"
                        sx={{ color: "text.obs" }}
                        variant="subtitle2"
                        fontWeight="bold"
                        fallBackText="Last Name"
                      />
                      <Typography component="span" sx={{ color: "red", ml: 0.5, fontWeight: "bold" }}>*</Typography>
                    </Box>
                    <Secure.GLTextField
                      resource_key="patients_20_lastName"
                      name="last_name"
                      color="whiteField"
                      value={values.last_name}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      error={touched.last_name && Boolean(errors.last_name)}
                      helperText={touched.last_name && errors.last_name}
                      sx={{
                        "& .MuiFormHelperText-root": {
                          color: "red !important",
                        },
                      }}
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_birthDate"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                      fallBackText="Birth Date"
                    />
                    <Secure.GLDatePicker
                      resource_key="patients_20_birthDate"
                      format={dateFormat || "dd/MM/yyyy"}
                      value={
                        values.birth_date ? new Date(values.birth_date) : null
                      }
                      onChange={(newValue: Date | null) => {
                        if (newValue) {
                          // Format date to YYYY-MM-DD (ISO date format)
                          const isoDate = newValue.toISOString().split("T")[0];
                          setFieldValue("birth_date", isoDate);
                        } else {
                          setFieldValue("birth_date", "");
                        }
                      }}
                      slotProps={{
                        textField: {
                          size: "small", // <- Add this line to match height
                          error:
                            touched.birth_date && Boolean(errors.birth_date),
                          helperText: touched.birth_date && errors.birth_date,
                          sx: {
                            background: "white",
                            "& .MuiFormHelperText-root": {
                              color:
                                touched.birth_date && errors.birth_date
                                  ? "red"
                                  : "red",
                            },
                          },
                        },
                      }}
                    />
                  </Grid2>

                  {/* Other Personal Details */}

                  <Grid2 size={{ xs: 6 }}>
                    <Box display="flex" alignItems="center">
                      <Secure.GLTypography
                        resource_key="patients_20_phoneNumber"
                        sx={{ color: "text.obs" }}
                        variant="subtitle2"
                        fontWeight="bold"
                        fallBackText="Phone Number"
                      />
                      <Typography component="span" sx={{ color: "red", ml: 0.5, fontWeight: "bold" }}>*</Typography>
                    </Box>
                    <Secure.GLTextField
                      resource_key="patients_20_phoneNumber"
                      name="phone"
                      color="whiteField"
                      value={values.phone}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                      sx={{
                        "& .MuiFormHelperText-root": {
                          color: "red !important",
                        },
                      }}
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_maritalStatus"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                      fallBackText="Marital Status"
                    />
                    <Secure.GLGenericAutocomplete
                      resource_key="patients_20_maritalStatus"
                      options={maritalStatusCodeTypes}
                      getOptionLabel={(option: any) =>
                        option.user_code + ` - ` + option.description || ""
                      }
                      value={
                        maritalStatusCodeTypes.find(
                          (option) =>
                            option.user_code === values.marital_status,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue(
                          "marital_status",
                          newValue?.user_code || "",
                        )
                      }
                      renderInput={(params) => (
                        <Secure.GLTextField
                          {...params}
                          resource_key="patients_20_maritalStatus"
                          variant="outlined"
                          fullWidth
                          color="whiteField"
                        />
                      )}
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Box display="flex" alignItems="center">
                      <Secure.GLTypography
                        variant="subtitle2"
                        sx={{ mb: 0.5 }}
                        resource_key="patients_20_gender"
                        fallBackText="Gender"
                      />
                      <Typography component="span" sx={{ color: "red", ml: 0.5, fontWeight: "bold", mb: 0.5 }}>*</Typography>
                    </Box>

                    <Secure.GLGenericAutocomplete
                      resource_key="patients_20_gender"
                      options={genderCodeTypes}
                      getOptionLabel={(option: any) => option.description || ""}
                      value={
                        genderCodeTypes?.find(
                          (option) => option.user_code === values.gender,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue("gender", newValue?.user_code || "")
                      }
                      renderInput={(params) => (
                        <Secure.GLTextField
                          {...params}
                          resource_key="patients_20_gender"
                          placeholder={"Gender"}
                          variant="outlined"
                          fullWidth
                          color="whiteField"
                          error={touched.gender && Boolean(errors.gender)}
                          helperText={touched.gender && errors.gender}
                          sx={{
                            "& .MuiFormHelperText-root": {
                              color: "red !important",
                            },
                          }}
                        />
                      )}
                    />
                  </Grid2>

                  {/* Address Section */}
                  <Grid2 size={{ xs: 12 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_address"
                      sx={{ color: "text.obs" }}
                      variant="h6"
                      fontWeight="bold"
                      fallBackText="Address"
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 12 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_addressLine"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                      fallBackText="Address Line"
                    />

                    <Secure.GLTextField
                      resource_key="patients_20_addressLine"
                      name="address_line"
                      color="whiteField"
                      value={values.address_line}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 4 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_district"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                      fallBackText="District"
                    />

                    <Secure.GLTextField
                      resource_key="patients_20_district"
                      name="district"
                      color="whiteField"
                      value={values.district}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 4 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_postalCode"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                      fallBackText="Postal Code"
                    />

                    <Secure.GLTextField
                      resource_key="patients_20_postalCode"
                      name="postal_code"
                      value={values.postal_code}
                      onChange={handleChange}
                      color="whiteField"
                      fullWidth
                      size="small"
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 4 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_nationality"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                      fallBackText="Nationality"
                    />
                    <Secure.GLGenericAutocomplete
                      resource_key="patients_20_nationality"
                      options={nationalityCodeTypes}
                      getOptionLabel={(option: any) =>
                        option.user_code + ` - ` + option.description || ""
                      }
                      value={
                        nationalityCodeTypes.find(
                          (option) => option.user_code === values.nationality,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue("nationality", newValue?.user_code || "")
                      }
                      renderInput={(params) => (
                        <Secure.GLTextField
                          {...params}
                          resource_key="patients_20_nationality"
                          variant="outlined"
                          fullWidth
                          color="whiteField"
                        />
                      )}
                    />
                  </Grid2>

                  {/* Identifiers and Other Info */}
                  <Grid2 size={{ xs: 12 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_otherInformation"
                      sx={{ color: "text.obs" }}
                      variant="h6"
                      fontWeight="bold"
                      fallBackText="Other Information"
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_occupation"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                      fallBackText="Occupation"
                    />

                    <Secure.GLGenericAutocomplete
                      resource_key="patients_20_occupation"
                      options={occupationCodeTypes}
                      getOptionLabel={(option: any) =>
                        option.user_code + ` - ` + option.description || ""
                      }
                      value={
                        occupationCodeTypes.find(
                          (option) => option.user_code === values.occupation,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue("occupation", newValue?.user_code || "")
                      }
                      renderInput={(params) => (
                        <Secure.GLTextField
                          {...params}
                          resource_key="patients_20_occupation"
                          variant="outlined"
                          fullWidth
                          color="whiteField"
                        />
                      )}
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_religion"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                      fallBackText="Religion"
                    />
                    <Secure.GLGenericAutocomplete
                      resource_key="patients_20_religion"
                      options={religionCodeTypes}
                      getOptionLabel={(option: any) =>
                        option.user_code + ` - ` + option.description || ""
                      }
                      value={
                        religionCodeTypes.find(
                          (option) => option.user_code === values.religion,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue("religion", newValue?.user_code || "")
                      }
                      renderInput={(params) => (
                        <Secure.GLTextField
                          {...params}
                          resource_key="patients_20_religion"
                          variant="outlined"
                          fullWidth
                          color="whiteField"
                        />
                      )}
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_healthID"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                      fallBackText="Health ID"
                    />
                    <Secure.GLTextField
                      resource_key="patients_20_healthID"
                      name="health_id"
                      color="whiteField"
                      value={values.health_id}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_mrnNo"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                      fallBackText="MRN No"
                    />
                    <Secure.GLTextField
                      resource_key="patients_20_mrnNo"
                      name="mrn"
                      color="whiteField"
                      value={values.mrn}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                    />
                  </Grid2>

                  {/* !!!!!! idintity */}
                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_identityType"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                      fallBackText="Identity Type"
                    />

                    <Secure.GLAutocomplete
                      resource_key="patients_20_identityType"
                      options={identityCodeTypes}
                      getOptionLabel={(option: any) =>
                        option.user_code + ` - ` + option.description || ""
                      }
                      value={
                        identityCodeTypes.find(
                          (option) => option.user_code === values.identityType,
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        setFieldValue(
                          "identitySystem",
                          newValue?.description || "",
                        );
                        setFieldValue(
                          "identityType",
                          newValue?.user_code || "",
                        );
                      }}
                      renderInput={(params) => (
                        <Secure.GLTextField
                          {...params}
                          resource_key="patients_20_identityType"
                          variant="outlined"
                          fullWidth
                          color="whiteField"
                        />
                      )}
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="patients_20_identityValue"
                      sx={{ color: "text.obs" }}
                      variant="subtitle2"
                      fontWeight="bold"
                    />
                    <Secure.GLTextField
                      resource_key="patients_20_identityValue"
                      name="identityValue"
                      color="whiteField"
                      value={values.identityValue}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                    />
                  </Grid2>
                </Grid2>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  gap="7px"
                  sx={{ mt: 2 }}
                >
                  <Secure.GLButton
                    onClick={() => setOpen(false)}
                    variant="contained"
                    color="error"
                    resource_key="patients_20_cancelForm"
                  />
                  <Secure.GLGenericButton
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? t("patients_20_saving") || "Saving..."
                      : t("patients_20_save") || "Save"}
                  </Secure.GLGenericButton>
                </Box>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};
