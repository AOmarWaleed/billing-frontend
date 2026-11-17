import {
  Box,
  Grid2,
  Typography,
  TextField,
  FormControlLabel,
  Button,
  RadioGroup,
  Radio,
  Card,
  Autocomplete,
} from "@mui/material";
import React, { useEffect, useState, useContext } from "react";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { updateEmployee } from "../../redux/slices/employeeSlice";
import employeeSchema from "../../models/employeeSchema";
import { useAppSelector } from "../../hooks/hooks";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import { AuthGuardContext, Secure } from "@givc/shared-components";

interface EditEmployeeFormProps {
  selectedEmployee: any;
  selectedEmployeeId: any;
  openEditMode: () => void;
  closeEditMode: () => void;
  updateTable: any;
  refetchTable: React.RefObject<() => void | null>;
  disable: boolean;
  setDisable: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EditEmployeeForm: React.FC<EditEmployeeFormProps> = ({
  selectedEmployee,
  openEditMode,
  closeEditMode,
  disable,
  setDisable,
  updateTable,
  refetchTable,
}) => {
  // const { t } = useTranslation("21");
  const { t } = useContext(AuthGuardContext);
  const dispatch = useDispatch<AppDispatch>();
  const {
    nationalityCodeTypes,
    maritalStatusCodeTypes,
    occupationCodeTypes,
    religionCodeTypes,
    employeeJobCodeTypes,
  } = useSelector((state: RootState) => state.employee);
  //==================  * Resources * ===================

  // const { resource } = useAppSelector((state) => state.trans);
  // const { language } = useLanguage();
  // const { getPageResources } = useTransSlice();
  // const user = useAppSelector((state) => state.auth.user);
  // const { t } = createResourceHelpers(resource.resources);
  //==================  * Resources * ===================
  const dateFormat = useAppSelector((state) => {
    return state.config.values.DATE_FORMAT;
  });
  const [data, setData] = useState({
    employee_id: null,
    employee_no: "",
    employee_job: "",
    first_name: "",
    middle_names: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    mobile_no: "",
    email: "",
    marital_code: null,
    nationality_code: null,
    occupation_code: "",
    religion_code: null,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const clearFieldError = (fieldName: string) => {
    if (formErrors[fieldName]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  const newData = (e: any) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    clearFieldError(name);
  };

  useEffect(() => {
    setFormErrors({});
    if (selectedEmployee) {
      setData({
        employee_id: selectedEmployee.employee_id,
        employee_no: selectedEmployee.employee_no || "",
        employee_job: selectedEmployee.employee_job || "",
        first_name: selectedEmployee.first_name || "",
        middle_names: selectedEmployee.middle_names || "",
        last_name: selectedEmployee.last_name || "",
        date_of_birth: new Date(selectedEmployee.date_of_birth).toISOString(),
        gender: selectedEmployee.gender || "",
        email: selectedEmployee.email || "",
        mobile_no: selectedEmployee.mobile_no || "",
        marital_code: selectedEmployee.marital_code || null,
        nationality_code: selectedEmployee.nationality_code || null,
        occupation_code: selectedEmployee.occupation_code || "",
        religion_code: selectedEmployee.religion_code || null,
      });
      closeEditMode();
    } else {
      setData({
        employee_id: null,
        employee_no: "",
        employee_job: "",
        first_name: "",
        middle_names: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        mobile_no: "",
        email: "",
        marital_code: null,
        nationality_code: null,
        occupation_code: "",
        religion_code: null,
      });
    }
  }, [selectedEmployee]);

  useEffect(() => {
    setFormErrors({});
  }, [disable]);

  const handleSaveChanges = async () => {
    // Validate with Joi schema before dispatching
    const { error } = employeeSchema.validate(data, { abortEarly: false, allowUnknown: true });
    if (error) {
      const errors: Record<string, string> = {};
      error.details.forEach((err) => {
        errors[String(err.path[0])] = err.message;
      });
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    // Transform optional string/numeric fields: convert "" to null before sending to server
    const dispatchedData = {
      ...data,
      employee_job: Number(data.employee_job) || null,
      occupation_code: Number(data.occupation_code) || null,
      nationality_code: Number(data.nationality_code) || null,
      marital_code: Number(data.marital_code) || null,
      religion_code: Number(data.religion_code) || null,
      mobile_no: data.mobile_no?.trim() || null,
      email: data.email?.trim() || null,
      middle_names: data.middle_names?.trim() || null,
    };

    const resultAction = await dispatch(
      updateEmployee({ id: selectedEmployee.employee_id, data: dispatchedData }),
    );
    if (updateEmployee.fulfilled.match(resultAction)) {
      mutate((key) => {
        return apiUtility(key, "employee");
      });
      refetchTable?.current?.();
      closeEditMode();
    }
  };

  // Reset the Form if user Cancel
  const resetForm = () => {
    if (selectedEmployee) {
      setData({
        employee_id: selectedEmployee.employee_id,
        employee_no: selectedEmployee.employee_no || "",
        employee_job: selectedEmployee.employee_job || "",
        first_name: selectedEmployee.first_name || "",
        middle_names: selectedEmployee.middle_names || "",
        last_name: selectedEmployee.last_name || "",
        date_of_birth: new Date(selectedEmployee.date_of_birth).toISOString(),
        gender: selectedEmployee.gender || "",
        email: selectedEmployee.email || "",
        mobile_no: selectedEmployee.mobile_no || "",
        marital_code: selectedEmployee.marital_code || null,
        nationality_code: selectedEmployee.nationality_code || null,
        occupation_code: selectedEmployee.occupation_code || "",
        religion_code: selectedEmployee.religion_code || null,
      });
    }
  };

  // Handle date changes
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const isoDate = date.toISOString().split("T")[0];
      setData((prev) => ({ ...prev, date_of_birth: isoDate }));
    } else {
      setData((prev) => ({ ...prev, date_of_birth: "" }));
    }
    clearFieldError("date_of_birth");
  };

  return (
    <>
      <Box flex={1} ml={2}>
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            mb: 2,
          }}
        >
          {selectedEmployee && (
            <Secure.GLButton
              resource_key="employee_21_edit"
              variant="contained"
              color={disable ? "primary" : "inherit"}
              startIcon={<ModeEditIcon />}
              onClick={openEditMode}
              disabled={!disable}
              sx={{ textTransform: "none" }}
            />
          )}
        </Box> */}
        {selectedEmployee && (
          <>
            <Card sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Secure.GLTypography
                  resource_key="employee_21_employeeDetails"
                  variant="h6"
                  fontWeight="bold"
                  sx={{ display: "flex" }}
                />

                <Secure.GLButton
                  resource_key="employee_21_edit"
                  variant="contained"
                  color={disable ? "primary" : "inherit"}
                  startIcon={<ModeEditIcon />}
                  onClick={openEditMode}
                  disabled={!disable}
                  sx={{ textTransform: "none" }}
                />
              </Box>

              <Grid2 container mt={1.5} justifyContent="start" spacing={2}>
                {/* Row 1: Identification & Contact */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <Secure.GLTextField
                    resource_key="employee_21_employeeId"
                    name="employee_id"
                    fullWidth
                    label={t("employee_21_employeeId") || "Employee ID"}
                    size="small"
                    value={data.employee_id || ""}
                    onChange={(e) => newData(e)}
                    disabled={true}
                    color="whiteField"
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    name="employee_no"
                    fullWidth
                    label={
                      t("employee_21_employeeNo") || "Employee NO"
                    }
                    size="small"
                    value={data.employee_no || ""}
                    onChange={(e) => newData(e)}
                    disabled={disable}
                    color="whiteField"
                    error={Boolean(formErrors.employee_no)}
                    helperText={formErrors.employee_no}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    name="mobile_no"
                    fullWidth
                    label={t("employee_21_mobileNo") || "Mobile No."}
                    size="small"
                    value={data.mobile_no || ""}
                    onChange={(e) => newData(e)}
                    disabled={disable}
                    color="whiteField"
                    error={Boolean(formErrors.mobile_no)}
                    helperText={formErrors.mobile_no}
                  />
                </Grid2>

                {/* Row 2: Names */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <Secure.GLTextField
                    resource_key="employee_21_firstName"
                    name="first_name"
                    fullWidth
                    label={t("employee_21_firstName") || "First Name"}
                    size="small"
                    value={data.first_name || ""}
                    onChange={(e) => newData(e)}
                    disabled={disable}
                    color="whiteField"
                    error={Boolean(formErrors.first_name)}
                    helperText={formErrors.first_name}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <Secure.GLTextField
                    resource_key="employee_21_middleName"
                    name="middle_names"
                    fullWidth
                    label={t("employee_21_middleName") || "Middle Name"}
                    size="small"
                    value={data.middle_names || ""}
                    onChange={(e) => newData(e)}
                    disabled={disable}
                    color="whiteField"
                    error={Boolean(formErrors.middle_names)}
                    helperText={formErrors.middle_names}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <Secure.GLTextField
                    resource_key="employee_21_lastName"
                    name="last_name"
                    fullWidth
                    label={t("employee_21_lastName") || "Last Name"}
                    size="small"
                    value={data.last_name || ""}
                    onChange={(e) => newData(e)}
                    disabled={disable}
                    color="whiteField"
                    error={Boolean(formErrors.last_name)}
                    helperText={formErrors.last_name}
                  />
                </Grid2>

                {/* Row 3: Email & Job */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    name="email"
                    fullWidth
                    label={t("employee_21_email") || "Email"}
                    size="small"
                    value={data.email || ""}
                    onChange={(e) => newData(e)}
                    disabled={disable}
                    color="whiteField"
                    error={Boolean(formErrors.email)}
                    helperText={formErrors.email}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <Autocomplete
                    options={employeeJobCodeTypes}
                    getOptionLabel={(option: any) =>
                      `${option.code_type} - ${option.description}` || ""
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.code === value?.code
                    }
                    value={
                      employeeJobCodeTypes.find(
                        (item) =>
                          Number(item.code) === Number(data.employee_job),
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      setData({
                        ...data,
                        employee_job: newValue?.code || "",
                      });
                      clearFieldError("employee_job");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("employee_21_employeeJob") || "Employee Job"}
                        placeholder={t("employee_21_employeeJob") || "Employee Job"}
                        variant="outlined"
                        size="small"
                        fullWidth
                        color="whiteField"
                        error={Boolean(formErrors.employee_job)}
                        helperText={formErrors.employee_job}
                      />
                    )}
                    disabled={disable}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <Autocomplete
                    options={occupationCodeTypes}
                    getOptionLabel={(option: any) =>
                      `${option.user_code} - ${option.description}` || ""
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.code === value?.code
                    }
                    value={
                      occupationCodeTypes.find(
                        (item) =>
                          Number(item.code) === Number(data.occupation_code),
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      setData({
                        ...data,
                        occupation_code: newValue?.code || "",
                      });
                      clearFieldError("occupation_code");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("employee_21_occupation") || "Occupation"}
                        placeholder={
                          t("employee_21_occupation") || "Occupation"
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                        color="whiteField"
                        error={Boolean(formErrors.occupation_code)}
                        helperText={formErrors.occupation_code}
                      />
                    )}
                    disabled={disable}
                  />
                </Grid2>

                {/* Row 4: Demographics */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <Autocomplete
                    options={nationalityCodeTypes}
                    getOptionLabel={(option: any) =>
                      `${option.user_code} - ${option.description}` || ""
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.code === value?.code
                    }
                    value={
                      nationalityCodeTypes.find(
                        (item) =>
                          Number(item.code) === Number(data.nationality_code),
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      setData({
                        ...data,
                        nationality_code: newValue?.code || "",
                      });
                      clearFieldError("nationality_code");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("employee_21_nationality") || "Nationality"}
                        placeholder={
                          t("employee_21_nationality") || "Nationality"
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                        color="whiteField"
                        error={Boolean(formErrors.nationality_code)}
                        helperText={formErrors.nationality_code}
                      />
                    )}
                    disabled={disable}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <Autocomplete
                    options={maritalStatusCodeTypes}
                    getOptionLabel={(option: any) =>
                      `${option.user_code} - ${option.description}` || ""
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.code === value?.code
                    }
                    value={
                      maritalStatusCodeTypes.find(
                        (item) =>
                          Number(item.code) === Number(data.marital_code),
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      setData({ ...data, marital_code: newValue?.code || "" });
                      clearFieldError("marital_code");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("employee_21_maritalStatus") || "Marital Status"}
                        placeholder={
                          t("employee_21_maritalStatus") || "Marital Status"
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                        color="whiteField"
                        error={Boolean(formErrors.marital_code)}
                        helperText={formErrors.marital_code}
                      />
                    )}
                    disabled={disable}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <Autocomplete
                    options={religionCodeTypes}
                    getOptionLabel={(option: any) =>
                      `${option.user_code} - ${option.description}` || ""
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.code === value?.code
                    }
                    value={
                      religionCodeTypes.find(
                        (item) =>
                          Number(item.code) === Number(data.religion_code),
                        ) || null
                    }
                    onChange={(_, newValue) => {
                      setData({
                        ...data,
                        religion_code: newValue?.code || "",
                      });
                      clearFieldError("religion_code");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("employee_21_religion") || "Religion"}
                        placeholder={t("employee_21_religion") || "Religion"}
                        variant="outlined"
                        size="small"
                        fullWidth
                        color="whiteField"
                        error={Boolean(formErrors.religion_code)}
                        helperText={formErrors.religion_code}
                      />
                    )}
                    disabled={disable}
                  />
                </Grid2>

                {/* Row 5: Birth Date & Gender */}
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                  <Secure.GLDatePicker
                    resource_key="employee_21_birthDate"
                    label={t("employee_21_birthDate") || "Birth Date"}
                    format={dateFormat ? dateFormat : "dd/MM/yyyy"}
                    value={
                      data.date_of_birth ? new Date(data.date_of_birth) : null
                    }
                    onChange={handleDateChange}
                    disabled={disable}
                    sx={{ width: "100%" }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        error: Boolean(formErrors.date_of_birth),
                        helperText: formErrors.date_of_birth,
                      },
                    }}
                  />
                  {formErrors.date_of_birth && (
                    <Typography variant="caption" color="error">
                      {formErrors.date_of_birth}
                    </Typography>
                  )}
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 8 }}>
                  <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
                    <RadioGroup
                      row
                      name="gender"
                      value={data.gender}
                      onChange={(e) => {
                        setData({
                          ...data,
                          gender: e.target.value,
                        });
                        clearFieldError("gender");
                      }}
                    >
                      <Box display="flex" flexDirection="row" gap={2} alignItems="center">
                        <Secure.GLGenericFormControlLabel
                          resource_key="employee_21_male"
                          value="M"
                          control={<Radio disabled={disable} />}
                          label={t("employee_21_male") || "Male"}
                        />
                        <Secure.GLGenericFormControlLabel
                          resource_key="employee_21_female"
                          value="F"
                          control={<Radio disabled={disable} />}
                          label={t("employee_21_female") || "Female"}
                        />
                      </Box>
                    </RadioGroup>
                    {formErrors.gender && (
                      <Typography variant="caption" color="error">
                        {formErrors.gender}
                      </Typography>
                    )}
                  </Box>
                </Grid2>
              </Grid2>

              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                gap="10px"
                mt={4}
              >
                <Secure.GLButton
                  resource_key="employee_21_cancel"
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    resetForm();
                    setDisable(true);
                  }}
                  disabled={disable}
                  sx={{ textTransform: "none", px: 4 }}
                />

                <Secure.GLButton
                  resource_key="employee_21_saveChanges"
                  variant="contained"
                  color="primary"
                  onClick={handleSaveChanges}
                  disabled={disable}
                />
              </Box>
            </Card>
          </>
        )}
      </Box>
    </>
  );
};
