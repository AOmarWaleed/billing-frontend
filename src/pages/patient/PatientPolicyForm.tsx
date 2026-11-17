// src/components/policy/PatientPolicyForm.jsx
import React, { useContext, useEffect } from "react";
import { Formik, Form, Field, FieldProps } from "formik";
import { Button, Box, Typography, Divider, FormControl } from "@mui/material";
import { isBefore, isAfter } from "date-fns";
import { useAppSelector, useAppDispatch } from "../../hooks/hooks";
import { Policy } from "../../types/Policy";
import { RootState } from "../../redux/store";
import { formatDate } from "../../utils/formatData/formatterv2";
import Secure from "../../shared/security";
import { AuthGuardContext } from "../../shared/core/AuthGuard";

interface PatientPolicyFormProps {
  initialValues: any;
  onSubmit: (values: any) => void;
  onClose: () => void;
  error?: string;
  isUpdate: boolean;
}
interface PatientPolicyFormValues {
  policy_id?: number | string;
  description?: string;
  start_date: Date | null;
  end_date: Date | null;
}

const PatientPolicyForm: React.FC<PatientPolicyFormProps> = ({
  initialValues,
  onSubmit,
  onClose,
  error,
  isUpdate,
}) => {
  const dateFormat = useAppSelector((state) => state.config.values.DATE_FORMAT);
  const allPolicies = useAppSelector(
    (state: RootState) => state.payerPolicy.allPolicies
  );
  const currPatient = useAppSelector(
    (state) => state.patient.selectedPatientId
  );
  const { t } = useContext(AuthGuardContext);
  // Validation function
  const validateForm = (values: PatientPolicyFormValues) => {
    const errors: Partial<Record<keyof PatientPolicyFormValues, string>> = {};

    if (!isUpdate && !values.policy_id) {
      errors.policy_id = t("patients_20_policySelectionIsRequired");
    }
    if (!values.start_date) {
      errors.start_date = t("patients_20_startDateIsRequired");
    }
    if (!values.end_date) {
      errors.end_date = t("patients_20_endDateIsRequired");
    }

    if (values.start_date && values.end_date) {
      const startDate = new Date(values.start_date);
      const endDate = new Date(values.end_date);

      if (isAfter(startDate, endDate)) {
        errors.end_date = "End date must be after start date";
      }
    }

    return errors;
  };

  return (
    <Box sx={{ maxWidth: 650, mx: "auto" }}>
      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validateForm}
        validateOnMount={true}
      >
        {({ values, setFieldValue, errors, touched, isValid }) => (
          <Form>
            {!isUpdate && (
              <Box display="flex" gap={2} mb={1}>
                <Box flex={1}>
                  {currPatient && (
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ color: "text.obs" }}
                    >
                      Patient ID: {currPatient}
                    </Typography>
                  )}
                  <Secure.GLTypography
                    resource_key={
                      isUpdate
                        ? "patients_20_selectPolicyEditForm"
                        : "patients_20_selectPolicyAddForm"
                    }
                    variant="body1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ color: "text.obs" }}
                  />

                  <FormControl fullWidth>
                    <Field name="policy_id">
                      {({ field, form, meta }: any) => (
                        <Secure.GLGenericAutocomplete
                          resource_key={
                            isUpdate
                              ? "patients_20_selectPolicyEditForm"
                              : "patients_20_selectPolicyAddForm"
                          }
                          options={allPolicies}
                          getOptionLabel={(policy: Policy) =>
                            `#${policy.policy_id} - ${policy.description}`
                          }
                          isOptionEqualToValue={(
                            option: Policy,
                            value: Policy
                          ) => option.policy_id === value.policy_id}
                          value={
                            allPolicies.find(
                              (p) => p.policy_id === field.value
                            ) || null
                          }
                          onChange={(event, newValue) => {
                            form.setFieldValue(
                              "policy_id",
                              newValue ? newValue.policy_id : ""
                            );
                          }}
                          renderOption={(props, policy: Policy) => (
                            <Box
                              component="li"
                              {...props}
                              // sx={{ backgroundColor: "white" }}
                            >
                              <Box display="flex" flexDirection="column">
                                <Typography variant="body1" fontWeight="bold">
                                  {`#${policy.policy_id} - ${policy.description}`}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {`Payer: #${policy.payer_id} - ${policy.payer_description}`}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {`${formatDate(
                                    policy.start_date,
                                    "DATE_FORMAT"
                                  )} → ${formatDate(
                                    policy.end_date,
                                    "DATE_FORMAT"
                                  )}`}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                          renderInput={(params) => (
                            <Secure.GLTextField
                              resource_key={
                                isUpdate
                                  ? "patients_20_selectPolicyEditForm"
                                  : "patients_20_selectPolicyAddForm"
                              }
                              {...params}
                              error={Boolean(meta.touched && meta.error)}
                              placeholder="Select a policy"
                              helperText={meta.touched && meta.error}
                              // sx={{ backgroundColor: "white" }}
                            />
                          )}
                        />
                      )}
                    </Field>

                    {touched.policy_id && errors.policy_id && (
                      <Typography color="error" variant="caption">
                        {errors.policy_id}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
              </Box>
            )}

            <Box display="flex" gap={2} mb={1}>
              <Box flex={1}>
                <Secure.GLTypography
                  resource_key={
                    isUpdate
                      ? "patients_20_descriptionAddForm"
                      : "patients_20_descriptionEditForm"
                  }
                  variant="body1"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ color: "text.obs" }}
                />

                <Field name="description">
                  {({ field, form }: FieldProps) => (
                    <Secure.GLTextField
                      resource_key={
                        isUpdate
                          ? "patients_20_descriptionAddForm"
                          : "patients_20_descriptionEditForm"
                      }
                      color="whiteField"
                      {...field}
                      fullWidth
                      variant="outlined"
                      placeholder="Enter policy description"
                      error={
                        form.touched.description &&
                        Boolean(form.errors.description)
                      }
                      helperText={
                        form.touched.description &&
                        typeof form.errors.description === "string"
                          ? form.errors.description
                          : ""
                      }
                    />
                  )}
                </Field>
              </Box>
            </Box>

            <Box display="flex" gap={2} mb={1}>
              <Box flex={1}>
                <Secure.GLTypography
                  sx={{ color: "text.obs" }}
                  variant="body1"
                  fontWeight="bold"
                  gutterBottom
                  resource_key={
                    isUpdate
                      ? "patients_20_startDateEditForm"
                      : "patients_20_startDateAddForm"
                  }
                />

                <Field name="start_date">
                  {({ field, form }: FieldProps) => (
                    <Secure.GLDatePicker
                      resource_key={
                        isUpdate
                          ? "patients_20_startDateEditForm"
                          : "patients_20_startDateAddForm"
                      }
                      format={dateFormat || "dd/MM/yyyy"}
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => {
                        setFieldValue("start_date", date);

                        if (values.end_date && date) {
                          const endDate = new Date(values.end_date);
                          if (isBefore(endDate, date)) {
                            setFieldValue("end_date", "");
                          }
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          variant: "outlined",
                          required: true,
                          error:
                            form.touched.start_date &&
                            typeof form.errors.start_date === "string",
                          helperText:
                            form.touched.start_date &&
                            typeof form.errors.start_date === "string"
                              ? form.errors.start_date
                              : undefined,
                        },
                      }}
                      sx={{
                        // background: "white",
                        "& .MuiPickersInputBase-sectionsContainer": {
                          padding: "0 !important",
                        },
                      }}
                    />
                  )}
                </Field>
              </Box>

              <Box flex={1}>
                <Secure.GLTypography
                  resource_key={
                    isUpdate
                      ? "patients_20_endDateEditForm"
                      : "patients_20_endDateAddForm"
                  }
                  sx={{ color: "text.obs" }}
                  variant="body1"
                  fontWeight="bold"
                  gutterBottom
                />

                <Field name="end_date">
                  {({ field }: FieldProps) => (
                    <>
                      <Secure.GLDatePicker
                        resource_key={
                          isUpdate
                            ? "patients_20_endDateEditForm"
                            : "patients_20_endDateAddForm"
                        }
                        format={dateFormat || "dd/MM/yyyy"}
                        value={field.value ? new Date(field.value) : null}
                        minDate={
                          values.start_date
                            ? new Date(values.start_date)
                            : undefined
                        }
                        onChange={(date) => {
                          setFieldValue("end_date", date);
                        }}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            variant: "outlined",
                            error: touched.end_date && Boolean(errors.end_date),
                            helperText: touched.end_date && errors.end_date,
                          },
                        }}
                        sx={{
                          // background: "white",
                          "& .MuiPickersInputBase-sectionsContainer": {
                            padding: "0 !important",
                          },
                        }}
                      />

                      {touched.end_date && errors.end_date && (
                        <Typography color="error" variant="caption">
                          {errors.end_date}
                        </Typography>
                      )}
                    </>
                  )}
                </Field>
              </Box>
            </Box>

            <Divider />

            <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
              <Secure.GLButton
                resource_key="patients_20_cancelForm"
                onClick={onClose}
                variant="outlined"
                sx={{ backgroundColor: "text.obs", color: "primary.main" }}
              />

              <Secure.GLGenericButton
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isValid}
                resource_key={
                  isUpdate
                    ? "patients_20_updatePolicyForm"
                    : "patients_20_addPolicyForm"
                }
              >
                {isUpdate
                  ? t("patients_20_updatePolicyForm")
                  : t("patients_20_addPolicyForm")}
              </Secure.GLGenericButton>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default PatientPolicyForm;
