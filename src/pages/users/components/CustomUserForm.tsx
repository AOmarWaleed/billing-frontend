import { Formik, Form, Field, FieldProps, FormikHelpers } from "formik";
import {
  Button,
  Box,
  Typography,
  Divider,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Autocomplete,
  TextField,
} from "@mui/material";
import userSchema from "../../../models/userSchema";
import { addUserHandler, updateUserHandler } from "./UserDataGrideHandlers";
import { UserDTO } from "../../../types/UserDTO";
import { joiFormikAdapter } from "joi-formik-adapter";
import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import { useEffect, useState } from "react";
import { Group } from "../../../types/Group";
import { fetchGroups } from "../../../redux/slices/userSlice";
import { SelectOption } from "../../../types/SelectOpion";
import { parse, format } from "date-fns";
import Joi from "joi";
import TextExtractorTool from "../../../utils/textExtractor/TextExtractorTool";
import { useLanguage } from "../../../context/LanguageContext";
import { useTransSlice } from "../../../redux/slices/transSlice";
import { createResourceHelpers } from "../../../utils/resourceMapping/createResourceHelpers";
import { useTranslation } from "react-i18next";
import GeniricField from "../../../shared/security/GLTest";
import Secure from "../../../shared/security";

// Define the type for the form values
interface UserFormValues {
  user_name: string;
  first_name: string;
  middle_name: string | null;
  family_name: string;
  group_id: number | null;
  password_expiry_date: Date | null;
  employee_id: number;
  email: string | null;
  password: string;
  confirm_password: string;
}

interface CustomUserFormProps {
  isNew: boolean; // Optional flag to indicate a new row
  editId: number;
  editRow: any;
  handleClose: () => void;
  error: string;
  formschema: Joi.ObjectSchema;
  usersRefetchRef: React.RefObject<() => void | null>;
}
// Form Component
const CustomUserForm: React.FC<CustomUserFormProps> = ({
  isNew,
  editId,
  editRow,
  handleClose,
  error,
  formschema,
  usersRefetchRef,
}) => {
  //==================  * Resources * ===================
  const { t } = useTranslation("9");

  // const { resource } = useAppSelector((state) => state.trans);
  // const { language } = useLanguage();
  // const { getPageResources } = useTransSlice();
  // const user = useAppSelector((state) => state.auth.user);
  // const { t, getDisable } = createResourceHelpers(resource.resources);

  //==================  * Resources * ===================
  const groups = useAppSelector((state) => state.users.groups);
  //  const users = useAppSelector((state) => state.users.users);
  const [groupOptions, setGroupOptions] = useState<SelectOption[]>(
    groups.map((type) => ({
      label: `${type.group_id} - ${type.group_name}`,
      id: type.group_id,
    })),
  );
  const dispatch = useAppDispatch();
  // Assuming editRow is of type UserFormValues or similar
  const [row, setRow] = useState<UserFormValues>({
    user_name: editRow.user_name ?? "",
    first_name: editRow.first_name ?? "",
    middle_name: editRow.middle_name ?? null,
    family_name: editRow.family_name ?? "",
    group_id: editRow.group_id ?? null,
    password_expiry_date: editRow.password_expiry_date ?? null,
    employee_id: editRow.employee_id ?? null,
    password: "",
    confirm_password: "",
    email: editRow.email ?? null,
  });

  const handleSubmit = (values: any, { setSubmitting }: FormikHelpers<any>) => {

    // Transform UserFormValues into UserDTO
    const transformedValues: UserDTO = {
      user_name: values.user_name,
      first_name: values.first_name,
      middle_name: values.middle_name || null,
      family_name: values.family_name,
      group_id: values.group_id || null,
      password_expiry_date: values.password_expiry_date || null,
      employee_id: values.employee_id || null,
      password: values.password,
      email: values.email || null,
    };
    // Call addUserHandler with the transformed values
    if (isNew) {
      addUserHandler(dispatch, transformedValues, handleClose, usersRefetchRef);
    } else {
      updateUserHandler(dispatch, editId, transformedValues, handleClose, usersRefetchRef);
    }
    setSubmitting(false); // Reset submitting state
  };
  // Helper function to validate form values using Joi
  const validate = (
    values: UserFormValues,
  ): Partial<Record<keyof UserFormValues, string>> => {
    const { error } = formschema.validate(values, { abortEarly: false });
    const errors: Partial<Record<keyof UserFormValues, string>> = {};

    if (error) {
      error.details.forEach((detail) => {
        const key = detail.path[0] as keyof UserFormValues;
        // Remove everything before (and including) "fails to match"
        const message = detail.message.replace(/^.*fails to match /, "");
        errors[key] = message;
      });
    }
    return errors;
  };

  return (
    <Box sx={{ maxWidth: 650, mx: "auto" }}>
      {/* <TextExtractorTool function_id={9} /> */}
      {error && <span style={{ color: "#ef5350" }}>{error}</span>}
      <Formik
        initialValues={row}
        enableReinitialize
        validate={validate}
        //validationSchema={joiFormikAdapter(formschema)}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            {/* First Name and Middle Name */}
            <Box display="flex" gap={2} mb={2} mt={2}>
              {/* <Box flex={1}>
                <Typography variant="body1" gutterBottom>
                  {t("239") || "First Name"}
                </Typography>
                <Field name="first_name">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      error={touched.first_name && Boolean(errors.first_name)}
                      helperText={touched.first_name && errors.first_name}
                      sx={
                        {
                          // "& .MuiFormHelperText-root": {
                          //   color: touched.first_name && errors.first_name ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                          // },
                        }
                      }
                    />
                  )}
                </Field>
              </Box> */}
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                labelProps={{ variant: "body1", gutterBottom: true }}
                resource_key="usersetup_9_FirstName"
                name="first_name"
                withLabel={false}
              >
                {({ field }: FieldProps) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    error={touched.first_name && Boolean(errors.first_name)}
                    helperText={touched.first_name && errors.first_name}
                    sx={
                      {
                        // "& .MuiFormHelperText-root": {
                        //   color: touched.first_name && errors.first_name ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                        // },
                      }
                    }
                  />
                )}
              </Secure.GLLabelAndField>
              {/* <Box flex={1}>
                <Typography variant="body1" gutterBottom>
                  {t("240") || "Middle Name"}
                </Typography>
                <Field name="middle_name">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      error={touched.middle_name && Boolean(errors.middle_name)}
                      helperText={touched.middle_name && errors.middle_name}
                      sx={
                        {
                          // "& .MuiFormHelperText-root": {
                          //   color: touched.middle_name && errors.middle_name ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                          // },
                        }
                      }
                    />
                  )}
                </Field>
              </Box> */}
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                labelProps={{ variant: "body1", gutterBottom: true }}
                resource_key="usersetup_9_MiddleName"
                name="middle_name"
                withLabel={false}
              >
                {({ field }: FieldProps) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    label="Middle Name"
                    error={touched.middle_name && Boolean(errors.middle_name)}
                    helperText={touched.middle_name && errors.middle_name}
                    sx={
                      {
                        // "& .MuiFormHelperText-root": {
                        //   color: touched.middle_name && errors.middle_name ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                        // },
                      }
                    }
                  />
                )}
              </Secure.GLLabelAndField>
            </Box>

            {/* Family Name and Employee ID */}
            <Box display="flex" gap={2} mb={2}>
              {/* <Box flex={1}>
                <Typography variant="body1" gutterBottom>
                  {t("231") || "Family Name"}
                </Typography>
                <Field name="family_name">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      error={touched.family_name && Boolean(errors.family_name)}
                      helperText={touched.family_name && errors.family_name}
                      sx={
                        {
                          // "& .MuiFormHelperText-root": {
                          //   color: touched.family_name && errors.family_name ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                          // },
                        }
                      }
                    />
                  )}
                </Field>
              </Box> */}
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                labelProps={{ variant: "body1", gutterBottom: true }}
                resource_key="test"
                name="family_name"
                withLabel={false}
              >
                {({ field }: FieldProps) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    label="Family Name"
                    error={touched.family_name && Boolean(errors.family_name)}
                    helperText={touched.family_name && errors.family_name}
                    sx={
                      {
                        // "& .MuiFormHelperText-root": {
                        //   color: touched.family_name && errors.family_name ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                        // },
                      }
                    }
                  />
                )}
              </Secure.GLLabelAndField>
              {/* <Box flex={1}>
                <Typography variant="body1" gutterBottom>
                  {t("232") || "Employee ID"}
                </Typography>
                <Field name="employee_id">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      error={touched.employee_id && Boolean(errors.employee_id)}
                      helperText={touched.employee_id && errors.employee_id}
                      sx={
                        {
                          // "& .MuiFormHelperText-root": {
                          //   color: touched.employee_id && errors.employee_id ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                          // },
                        }
                      }
                    />
                  )}
                </Field>
              </Box> */}
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                labelProps={{ variant: "body1", gutterBottom: true }}
                resource_key="usersetup_9_EmployeeId"
                name="employee_id"
                withLabel={false}
              >
                {({ field }: FieldProps) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    label="Employee ID"
                    error={touched.employee_id && Boolean(errors.employee_id)}
                    helperText={touched.employee_id && errors.employee_id}
                    sx={
                      {
                        // "& .MuiFormHelperText-root": {
                        //   color: touched.employee_id && errors.employee_id ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                        // },
                      }
                    }
                  />
                )}
              </Secure.GLLabelAndField>
            </Box>

            {/* Email and User Name */}
            <Box display="flex" gap={2} mb={2}>
              {/* <Box flex={1}>
                <Typography variant="body1" gutterBottom>
                  {t("233") || "Email"}
                </Typography>
                <Field name="email">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      type="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      sx={
                        {
                          // "& .MuiFormHelperText-root": {
                          //   color: touched.email && errors.email ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                          // },
                        }
                      }
                    />
                  )}
                </Field>
              </Box> */}
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                labelProps={{ variant: "body1", gutterBottom: true }}
                resource_key="usersetup_9_Email"
                name="email"
                withLabel={false}
              >
                {({ field }: FieldProps) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    type="email"
                    label="Email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    sx={
                      {
                        // "& .MuiFormHelperText-root": {
                        //   color: touched.email && errors.email ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                        // },
                      }
                    }
                  />
                )}
              </Secure.GLLabelAndField>
              {/* <Box flex={1}>
                <Typography variant="body1" gutterBottom>
                  {t("234") || "User Name"}
                </Typography>
                <Field name="user_name">
                  {({ field }: FieldProps) => (
                    <TextField
                      disabled={!isNew}
                      {...field}
                      fullWidth
                      variant="outlined"
                      error={touched.user_name && Boolean(errors.user_name)}
                      helperText={touched.user_name && errors.user_name}
                      sx={
                        {
                          // "& .MuiFormHelperText-root": {
                          //   color: touched.user_name && errors.user_name ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                          // },
                        }
                      }
                    />
                  )}
                </Field>
              </Box> */}
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                resource_key="usersetup_9_UsernameForm"
                name="user_name"
                withLabel={false}
              >
                {({ field }: FieldProps) => (
                  <TextField
                    disabled={!isNew}
                    {...field}
                    fullWidth
                    variant="outlined"
                    label="User Name"
                    error={touched.user_name && Boolean(errors.user_name)}
                    helperText={touched.user_name && errors.user_name}
                    sx={
                      {
                        // "& .MuiFormHelperText-root": {
                        //   color: touched.user_name && errors.user_name ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                        // },
                      }
                    }
                  />
                )}
              </Secure.GLLabelAndField>
            </Box>

            {/* Password and Confirm Password */}
            <Box display="flex" gap={2} mb={2}>
              {/* <Box flex={1}>
                <Typography variant="body1" gutterBottom>
                  {t("235") || "Password"}
                </Typography>
                <Field name="password">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      type="password"
                      error={touched.password && Boolean(errors.password)}
                      helperText={
                        (touched.password && errors.password) ||
                        (!isNew && "Leave password blank,to keep the old one")
                      }
                      sx={
                        {
                          // "& .MuiFormHelperText-root": {
                          //   // color: touched.password && errors.password ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                          // },
                        }
                      }
                    />
                  )}
                </Field>
              </Box> */}
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                resource_key="usersetup_9_Password"
                name="password"
                withLabel={false}
              >
                {({ field }: FieldProps) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    type="password"
                    label="Password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={
                      (touched.password && errors.password) ||
                      (!isNew && "Leave password blank,to keep the old one")
                    }
                    sx={
                      {
                        // "& .MuiFormHelperText-root": {
                        //   // color: touched.password && errors.password ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                        // },
                      }
                    }
                  />
                )}
              </Secure.GLLabelAndField>
              {/* <Box flex={1}>
                <Typography variant="body1" gutterBottom>
                  {t("236") || "Confirm Password"}
                </Typography>
                <Field name="confirm_password">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="outlined"
                      type="password"
                      error={
                        touched.confirm_password &&
                        Boolean(errors.confirm_password)
                      }
                      helperText={
                        touched.confirm_password && errors.confirm_password
                          ? errors.confirm_password // Your custom message (optional)
                          : "" // Your help text (optional)
                      }
                      sx={
                        {
                          // "& .MuiFormHelperText-root": {
                          //   // color: touched.confirm_password && errors.confirm_password ? "yellow !important" : "yellow !important", // Red for errors, gray for help text
                          // },
                        }
                      }
                    />
                  )}
                </Field>
              </Box> */}
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                resource_key="usersetup_9_ConfirmPassword"
                name="confirm_password"
                withLabel={false}
              >
                {({ field }: FieldProps) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    type="password"
                    label="Confirm Password"
                    error={
                      touched.confirm_password &&
                      Boolean(errors.confirm_password)
                    }
                    helperText={
                      touched.confirm_password && errors.confirm_password
                        ? errors.confirm_password // Your custom message (optional)
                        : "" // Your help text (optional)
                    }
                    sx={
                      {
                        // "& .MuiFormHelperText-root": {
                        //   // color: touched.confirm_password && errors.confirm_password ? "yellow !important" : "yellow !important", // Red for errors, gray for help text
                        // },
                      }
                    }
                  />
                )}
              </Secure.GLLabelAndField>
            </Box>

            <Box display="flex" gap={2} mb={2}>
              {/* Password Expiry Date (Date Picker) */}
              {/* <Box flex={1}>
                <Typography variant="body1" gutterBottom>
                  {t("237") || "Password Expiry Date"}
                </Typography>
                <Field name="password_expiry_date">
                  {({ field, form }: FieldProps) => {
                    return (
                      <TextField
                        {...field}
                        id="password_expiry_date"
                        type="date"
                        variant="outlined"
                        fullWidth
                        value={field.value || ""} // Use the raw value for the input
                        onChange={(e) => {
                          // Update the form value with the raw date (yyyy-MM-dd)
                          form.setFieldValue(
                            "password_expiry_date",
                            e.target.value
                          );
                        }}
                        error={
                          form.touched.password_expiry_date &&
                          Boolean(form.errors.password_expiry_date)
                        }
                        helperText={
                          form.touched.password_expiry_date &&
                          typeof form.errors.password_expiry_date === "string"
                            ? form.errors.password_expiry_date
                            : ""
                        }
                        sx={
                          {
                            // "& .MuiFormHelperText-root": {
                            //   color: touched.password_expiry_date && errors.password_expiry_date ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                            // },
                          }
                        }
                      />
                    );
                  }}
                </Field>
              </Box> */}
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                resource_key="usersetup_9_PasswordExpiry"
                name="password_expiry_date"
                withLabel={false}
              >
                {({ field, form }: FieldProps) => {
                  return (
                    <TextField
                      {...field}
                      id="password_expiry_date"
                      type="date"
                      label="Password Expiry Date"
                      variant="outlined"
                      fullWidth
                      value={field.value || ""}
                      onChange={(e) => {
                        form.setFieldValue(
                          "password_expiry_date",
                          e.target.value,
                        );
                      }}
                      error={
                        form.touched.password_expiry_date &&
                        Boolean(form.errors.password_expiry_date)
                      }
                      helperText={
                        form.touched.password_expiry_date &&
                        typeof form.errors.password_expiry_date === "string"
                          ? form.errors.password_expiry_date
                          : ""
                      }
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                    />
                  );
                }}
              </Secure.GLLabelAndField>
              {/* Group Name (Select Dropdown) */}
              {/* <Box flex={1}>
                <Typography variant="body1" gutterBottom>
                  {t("238") || "Group Name"}
                </Typography>
                <Field name="group_id">
                  {({ field, form }: FieldProps) => {
                    const selectedOption =
                      groupOptions.find(
                        (option) => option.id === field.value
                      ) || null;

                    return (
                      <Autocomplete
                        value={selectedOption || null}
                        onChange={(
                          event,
                          newValue: { label: string; id: number } | null
                        ) => {
                          form.setFieldValue(
                            field.name,
                            newValue ? newValue.id : ""
                          ); // Update Formik's value
                        }}
                        options={groupOptions}
                        getOptionLabel={(option) => option.label || ""}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="SELECT GROUP"
                            fullWidth
                            error={Boolean(
                              form.touched.group_id && form.errors.group_id
                            )}
                            helperText={
                              form.touched.group_id &&
                              typeof form.errors.group_id === "string"
                                ? form.errors.group_id
                                : ""
                            }
                            sx={
                              {
                                // "& .MuiFormHelperText-root": {
                                //   color: touched.group_id && errors.group_id ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                                // },
                              }
                            }
                          />
                        )}
                        sx={{ width: "100%" }}
                      />
                    );
                  }}
                </Field>
              </Box> */}
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                resource_key="Group_Id"
                name="group_id"
                withLabel={false}
              >
                {({ field, form }: FieldProps) => {
                  const selectedOption =
                    groupOptions.find((option) => option.id === field.value) ||
                    null;

                  return (
                    <Autocomplete
                      value={selectedOption || null}
                      onChange={(
                        event,
                        newValue: { label: string; id: number } | null,
                      ) => {
                        form.setFieldValue(
                          field.name,
                          newValue ? newValue.id : "",
                        ); // Update Formik's value
                      }}
                      options={groupOptions}
                      getOptionLabel={(option) => option.label || ""}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Group Name"
                          placeholder="SELECT GROUP"
                          fullWidth
                          error={Boolean(
                            form.touched.group_id && form.errors.group_id,
                          )}
                          helperText={
                            form.touched.group_id &&
                            typeof form.errors.group_id === "string"
                              ? form.errors.group_id
                              : ""
                          }
                          sx={
                            {
                              // "& .MuiFormHelperText-root": {
                              //   color: touched.group_id && errors.group_id ? "yellow !important" : "yellow !important", // Yellow for errors, gray for help text
                              // },
                            }
                          }
                        />
                      )}
                      sx={{ width: "100%" }}
                    />
                  );
                }}
              </Secure.GLLabelAndField>
            </Box>
            {/* Divider */}
            <Divider
              sx={{
                mt: 6,
                mb: 4,
                backgroundColor: "text.obs",
                maxWidth: "100%",
              }}
            />

            {/* Buttons */}
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Secure.GLButton
                resource_key="usersetup_9_Cancel"
                onClick={handleClose}
                variant="contained"
                color="error"
              />

              {isNew ? (
                <Secure.GLButton
                  resource_key="usersetup_9_Save"
                  sx={{ width: "80px" }}
                  type="submit"
                  variant="contained"
                  color="primary"
                />
              ) : (
                <Secure.GLButton
                  resource_key="Update"
                  type="submit"
                  variant="contained"
                  color="primary"
                />
              )}
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default CustomUserForm;
