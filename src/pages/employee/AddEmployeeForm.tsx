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
  Divider,
  IconButton,
  useTheme,
} from "@mui/material";
//Icons
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState, useContext } from "react";
import { Form, Formik } from "formik";
import { createEmployee, fetchCodes } from "../../redux/slices/employeeSlice";
import employeeSchema from "../../models/employeeSchema";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAppSelector } from "../../hooks/hooks";
import { useLanguage } from "../../context/LanguageContext";
import { useTransSlice } from "../../redux/slices/transSlice";
import { createResourceHelpers } from "../../utils/resourceMapping/createResourceHelpers";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import { AuthGuardContext, Secure } from "@givc/shared-components";
import { publicUrl } from "../../utils/publicUrl";

export default function AddEmployeeForm({ refetchTable }: { refetchTable: React.RefObject<() => void | null> }) {
  const {
    nationalityCodeTypes,
    maritalStatusCodeTypes,
    occupationCodeTypes,
    religionCodeTypes,
    employeeJobCodeTypes,
  } = useSelector((state: RootState) => state.employee);

  const dateFormat = useAppSelector((state) => {
    return state.config.values.DATE_FORMAT;
  });
  const dispatch = useDispatch<AppDispatch>();

  //==================  * Resources * ===================
  const { t } = useContext(AuthGuardContext);
  // const { t, i18n } = useTranslation("21");
  // const { resource } = useAppSelector((state) => state.trans);
  // const { language } = useLanguage();
  // const { getPageResources } = useTransSlice();
  // const user = useAppSelector((state) => state.auth.user);
  // const { t, getDisable } = createResourceHelpers(resource.resources);
  //==================  * Resources * ===================

  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const validateFormikWithJoi = (values: any) => {
    const { error } = employeeSchema.validate(values, { abortEarly: false });
    if (!error) return {};

    const errors: any = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    return errors;
  };

  const handleSubmit = (values: any, { setSubmitting }: any) => {
    const dispatchedData = {
      ...values,
      employee_job:     Number(values.employee_job)     || null,
      occupation_code:  Number(values.occupation_code)  || null,
      nationality_code: Number(values.nationality_code) || null,
      marital_code:     Number(values.marital_code)     || null,
      religion_code:    Number(values.religion_code)    || null,
      mobile_no:        values.mobile_no?.trim()        || null,
      email:            values.email?.trim()            || null,
      middle_names:     values.middle_names?.trim()     || null,
    };
    dispatch(createEmployee({ data: dispatchedData }));
    mutate((e) => apiUtility(e, "allempspagedata"));
    setSubmitting(false);
    setOpen(false);
    refetchTable?.current?.();
  };

  const theme = useTheme();
  const mode = theme.palette.mode;

  return (
    <>
      <Secure.GLGenericButton
        resource_key="employee_21_addEmployeeIconButton"
        onClick={handleClickOpen}
         sx={{ height: "100%" }}
        children={
          <Box display="flex" alignItems="center" gap="5px">
            <img src={publicUrl(`themes/${mode}/icons/plus.png`)} alt="Add" />
            <span>{t("employee_21_addEmployeeIconButton")}</span>
          </Box>
        }
      />
        {/* <AddCircleIcon /> */}
        {/* <span style={{ paddingLeft: "10px" }} className="title-text">
          {t("443") || " Add Employee"}
        </span> */}

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="dialog-gradient"
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ position: "relative", p: "3px 6px !important", display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 2, pr: 1, pt: 1, pb: 1 }}
        >
          {/* Icon and Title */}
          <Box display="flex">
            <PersonAddIcon
              sx={{
                backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
                color: "white",
                width: "30px",
                height: "30px",
                marginRight: "10px",
                borderRadius: "50%",
                padding: "5px",
              }}
            />
            {t("employee_21_addEmployeeAddForm")}
          </Box>

          {/* Close Icon */}
          <IconButton
            onClick={handleClose}
            size="small"
            // sx={{
            //   position: "absolute",
            //   right: 0,
            //   top: "40%",
            //   color: "text.obs",
            // }}
          >
            <CloseIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        </DialogTitle>

        <Divider
          sx={{
            alignSelf: "center",
            width: "94%",
            height: "1px",
            backgroundColor: "text.obs",
            my: "4px",
          }}
        />
        <DialogContent
          sx={{
            maxHeight: { xs: "70vh", sm: "none" },
            overflowY: { xs: "auto", sm: "visible" },
            p: '3px 6px !important'
          }}
        >
          <Formik
            initialValues={{
              employee_no: "",
              employee_job: "",
              first_name: "",
              middle_names: "",
              last_name: "",
              date_of_birth: "",
              gender: "M",
              nationality_code: null,
              mobile_no: "",
              email: "",
              marital_code: null,
              occupation_code: "",
              religion_code: null,
            }}
            validate={validateFormikWithJoi}
            onSubmit={handleSubmit}
            validateOnChange={true}
            validateOnBlur={true}
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
                <Grid2 container spacing={1}>
                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="employee_21_firstNameAddForm"
                      sx={{ color: "text.obs" }}
                      fontWeight="bold"
                      gutterBottom
                    />

                    <Secure.GLTextField
                      resource_key="employee_21_firstNameAddForm"
                      name="first_name"
                      color="whiteField"
                      value={values.first_name}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                    />
                    {touched.first_name && Boolean(errors.first_name) && (
                      <div
                        style={{
                          color: "red",
                          marginTop: "5px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {errors.first_name}
                      </div>
                    )}
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="employee_21_middleNameAddForm"
                      sx={{ color: "text.obs" }}
                      variant="body1"
                      fontWeight="bold"
                      gutterBottom
                    />

                    <Secure.GLTextField
                      resource_key="employee_21_middleNameAddForm"
                      name="middle_names"
                      color="whiteField"
                      value={values.middle_names}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="employee_21_lastNameAddForm"
                      sx={{ color: "text.obs" }}
                      variant="body1"
                      fontWeight="bold"
                      gutterBottom
                    />

                    <Secure.GLTextField
                      resource_key="employee_21_lastNameAddForm"
                      name="last_name"
                      color="whiteField"
                      value={values.last_name}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                    />
                    {touched.last_name && Boolean(errors.last_name) && (
                      <div
                        style={{
                          color: "red",
                          marginTop: "5px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {errors.last_name}
                      </div>
                    )}
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="employee_21_mobileNoAddForm"
                      sx={{ color: "text.obs" }}
                      variant="body1"
                      fontWeight="bold"
                      gutterBottom
                    />

                    <Secure.GLTextField
                      resource_key="employee_21_mobileNoAddForm"
                      name="mobile_no"
                      color="whiteField"
                      value={values.mobile_no}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      error={touched.mobile_no && Boolean(errors.mobile_no)}
                    />
                    {touched.mobile_no && errors.mobile_no && (
                      <div
                        style={{
                          color: "red",
                          marginTop: "5px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {errors.mobile_no}
                      </div>
                    )}
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="employee_21_birthDateAddForm"
                      sx={{ color: "text.obs" }}
                      variant="body1"
                      fontWeight="bold"
                      gutterBottom
                    />

                    <Secure.GLDatePicker
                      resource_key="employee_21_birthDateAddForm"
                      format={dateFormat || "dd/MM/yyyy"}
                      value={
                        values.date_of_birth
                          ? new Date(values.date_of_birth)
                          : null
                      }
                      onChange={(newValue: Date | null) => {
                        if (newValue) {
                          const isoDate = newValue.toISOString().split("T")[0];
                          setFieldValue("date_of_birth", isoDate);
                        } else {
                          setFieldValue("date_of_birth", "");
                        }
                      }}
                      sx={{
                        
                        borderRadius: 0.5,
                        display: "flex",
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                        },
                      }}
                    />
                    {touched.date_of_birth && errors.date_of_birth && (
                      <div
                        style={{
                          color: "red",
                          marginTop: "5px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {errors.date_of_birth}
                      </div>
                    )}
                  </Grid2>

                  <Grid2 size={{ xs: 6 }} mt={"4px"}>
                    <Secure.GLTypography
                      resource_key="employee_21_emailAddForm"
                      sx={{ color: "text.obs" }}
                      variant="body1"
                      fontWeight="bold"
                    />

                    <Secure.GLTextField
                      resource_key="employee_21_emailAddForm"
                      name="email"
                      color="whiteField"
                      value={values.email}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      error={touched.email && Boolean(errors.email)}
                    />
                    {touched.email && errors.email && (
                      <div
                        style={{
                          color: "red",
                          marginTop: "5px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {errors.email}
                      </div>
                    )}
                  </Grid2>

                  <Grid2 size={{ xs: 12 }} mt={1} mb={1}>
                    <RadioGroup
                      row
                      name="gender"
                      value={values.gender}
                      onChange={handleChange}
                    >
                      <Box display="flex" flexDirection="row" gap={2}>
                        <Secure.GLGenericFormControlLabel
                          resource_key="employee_21_maleAddForm"
                          value="M"
                          control={<Radio />}
                          label={t("employee_21_maleAddForm")}
                        />
                        <Secure.GLGenericFormControlLabel
                          resource_key="employee_21_femaleAddForm"
                          value="F"
                          control={<Radio />}
                          label={t("employee_21_femaleAddForm")}
                        />
                      </Box>
                    </RadioGroup>
                  </Grid2>

                  {/* Identifiers and Other Info */}
                  <Grid2 size={{ xs: 12 }}>
                    <Secure.GLTypography
                      resource_key="employee_21_otherInformationAddForm"
                      sx={{ color: "text.obs" }}
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      color="primary"
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="employee_21_employeeNoAddForm"
                      sx={{ color: "text.obs" }}
                      variant="body1"
                      fontWeight="bold"
                      gutterBottom
                    />

                    <Secure.GLTextField
                      resource_key="employee_21_employeeNoAddForm"
                      name="employee_no"
                      color="whiteField"
                      value={values.employee_no}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                    />
                    {touched.employee_no && Boolean(errors.employee_no) && (
                      <div
                        style={{
                          color: "red",
                          marginTop: "5px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {errors.employee_no}
                      </div>
                    )}
                  </Grid2>
                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="employee_21_employeeJobAddForm"
                      sx={{ color: "text.obs" }}
                      variant="body1"
                      fontWeight="bold"
                      gutterBottom
                    />
                    <Autocomplete
                      options={employeeJobCodeTypes}
                      getOptionLabel={(option: any) =>
                        `${option.code_type} - ${option.description}` || ""
                      }
                      value={
                        employeeJobCodeTypes.find(
                          (option) => option.code === values.employee_job,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue("employee_job", newValue?.code || "")
                      }
                      renderInput={(params) => (
                        <Secure.GLTextField
                          resource_key="employee_21_employeeJobAddForm"
                          {...params}
                          variant="outlined"
                          fullWidth
                          color="whiteField"
                        />
                      )}
                    />
                    {touched.employee_job && errors.employee_job && (
                      <div
                        style={{
                          color: "red",
                          marginTop: "5px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {errors.employee_job}
                      </div>
                    )}
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="employee_21_maritalStatusAddForm"
                      sx={{ color: "text.obs" }}
                      variant="body1"
                      fontWeight="bold"
                      gutterBottom
                    />
                    <Autocomplete
                      options={maritalStatusCodeTypes}
                      getOptionLabel={(option: any) =>
                        `${option.user_code} - ${option.description}` || ""
                      }
                      value={
                        maritalStatusCodeTypes.find(
                          (option) => option.code === values.marital_code,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue("marital_code", newValue?.code || "")
                      }
                      renderInput={(params) => (
                        <Secure.GLTextField
                          {...params}
                          resource_key="employee_21_maritalStatusAddForm"
                          variant="outlined"
                          fullWidth
                          color="whiteField"
                        />
                      )}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="employee_21_nationalityAddForm"
                      sx={{ color: "text.obs" }}
                      variant="body1"
                      fontWeight="bold"
                      gutterBottom
                    />

                    <Autocomplete
                      options={nationalityCodeTypes}
                      getOptionLabel={(option: any) =>
                        `${option.user_code} - ${option.description}` || ""
                      }
                      value={
                        nationalityCodeTypes.find(
                          (option) => option.code === values.nationality_code,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue("nationality_code", newValue?.code || "")
                      }
                      renderInput={(params) => (
                        <Secure.GLTextField
                          {...params}
                          resource_key="employee_21_nationalityAddForm"
                          variant="outlined"
                          fullWidth
                          color="whiteField"
                        />
                      )}
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 6 }}>
                    <Secure.GLTypography
                      resource_key="employee_21_occupationAddForm"
                      sx={{ color: "text.obs" }}
                      variant="body1"
                      fontWeight="bold"
                      gutterBottom
                    />

                    <Autocomplete
                      options={occupationCodeTypes}
                      getOptionLabel={(option: any) =>
                        `${option.user_code} - ${option.description}` || ""
                      }
                      value={
                        occupationCodeTypes.find(
                          (option) => option.code === values.occupation_code,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue("occupation_code", newValue?.code || "")
                      }
                      renderInput={(params) => (
                        <Secure.GLTextField
                          {...params}
                          resource_key="employee_21_occupationAddForm"
                          variant="outlined"
                          fullWidth
                          color="whiteField"
                        />
                      )}
                    />
                    {touched.occupation_code && errors.occupation_code && (
                      <div
                        style={{
                          color: "red",
                          marginTop: "5px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {errors.occupation_code}
                      </div>
                    )}
                  </Grid2>

                  <Grid2 size={{ xs: 6 }} mb={2}>
                    <Secure.GLTypography
                      resource_key="employee_21_religionAddForm"
                      sx={{ color: "text.obs" }}
                      variant="body1"
                      fontWeight="bold"
                      gutterBottom
                    />
                    <Autocomplete
                      options={religionCodeTypes}
                      getOptionLabel={(option: any) =>
                        `${option.user_code} - ${option.description}` || ""
                      }
                      value={
                        religionCodeTypes.find(
                          (option) => option.code === values.religion_code,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setFieldValue("religion_code", newValue?.code || "")
                      }
                      renderInput={(params) => (
                        <Secure.GLTextField
                          {...params}
                          resource_key="employee_21_religionAddForm"
                          variant="outlined"
                          fullWidth
                          color="whiteField"
                        />
                      )}
                    />
                  </Grid2>
                </Grid2>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  gap="15px"
                >                
                  <Secure.GLGenericButton
                    resource_key="employee_21_cancelAddForm"
                    onClick={() => setOpen(false)}
                    variant="contained"
                    color="error"
                    sx={{
                      // backgroundColor: "text.obs",
                      // color: "primary.main",
                      mt: 3,
                    }}
                  >
                    {t("employee_21_cancelAddForm") || "Cancel"}
                  </Secure.GLGenericButton>

                  <Secure.GLGenericButton
                    resource_key="employee_21_saveAddForm"
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    sx={{ mt: 3 }}
                  >
                    {isSubmitting
                      ? t("employee_21_savingAddForm") || "Saving..."
                      : t("employee_21_saveAddForm") || "Save"}
                  </Secure.GLGenericButton>
                </Box>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
}
