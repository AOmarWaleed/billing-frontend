import React, { useEffect, useState } from "react";
import { Formik, Form, Field, FieldProps, useFormikContext } from "formik";
import {
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  Autocomplete,
  Chip,
  Grid2 as Grid,
} from "@mui/material";
import { isBefore, isAfter } from "date-fns";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { DesktopDatePicker } from "@mui/x-date-pickers";





interface PolicyFormProps {
  initialValues: any;
  onSubmit: (values: any) => void;
  onClose: () => void;
  error: string;
  priceLists: any[];
  coverages: any[];
}

const CoverageAutofillHandler: React.FC<{ coverages: any[] }> = ({
  coverages,
}) => {
  const { values, setFieldValue } = useFormikContext<any>();
  const prevCoverageIdRef = React.useRef<number | null>(null);

  useEffect(() => {
    const selectedId = values.coverage_id;

    if (
      selectedId &&
      selectedId !== prevCoverageIdRef.current &&
      coverages.length > 0
    ) {
      const selectedCoverage = coverages.find(
        (c) => c.coverage_id === selectedId,
      );
      if (selectedCoverage) {
        setFieldValue("network", selectedCoverage.network || "");
        setFieldValue("class_name", selectedCoverage.class_name || "");
        setFieldValue("copay_percent", selectedCoverage.copay_percent || "");
        setFieldValue("copay_max", selectedCoverage.copay_max || "");
        setFieldValue("policy_holder", selectedCoverage.policy_holder || "");
        setFieldValue("sponsor_number", selectedCoverage.sponsor_number || "");
        setFieldValue(
          "policy_number",
          selectedCoverage.policy_number || values.policy_number || "",
        );
        prevCoverageIdRef.current = selectedId;
      }
    }
  }, [values.coverage_id, coverages, setFieldValue]);

  return null;
};

const PolicyForm: React.FC<PolicyFormProps> = ({
  initialValues,
  onSubmit,
  onClose,
  error,
  priceLists,
  coverages,
}) => {
  const dispatch = useAppDispatch();
  const dateFormat = useAppSelector((state) => state.config.values.DATE_FORMAT);

  const validateForm = (values: any) => {
    const errors: any = {};
    if (!values.policy_number)
      errors.policy_number = "Policy Number is required";
    if (!values.description) errors.description = "Description is required";
    if (!values.start_date) errors.start_date = "Start Date is required";

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
        <Typography  variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validateForm}
        validateOnBlur={true}
        validateOnChange={true}
        validateOnMount={true}
      >
        {({
          values,
          handleChange,
          setFieldValue,
          errors,
          touched,
          isValid,
        }) => (
          <Form>
            <Grid container spacing={2}>
              {/* Policy Number and Description */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Field name="policy_number">
                  {({ field, form }: FieldProps) => (
                    <TextField
                      
                      {...field}
                      fullWidth
                      variant="outlined"
                      label="Policy Number"
                      placeholder="Enter policy number"
                      required
                      error={
                        form.touched.policy_number &&
                        Boolean(form.errors.policy_number)
                      }
                      helperText={
                        form.touched.policy_number && form.errors.policy_number
                      }
                    />
                  )}
                </Field>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Field name="description">
                  {({ field, form }: FieldProps) => (
                    <TextField
                      
                      {...field}
                      fullWidth
                      variant="outlined"
                      label="Description"
                      placeholder="Enter description"
                      required
                      error={
                        form.touched.description &&
                        Boolean(form.errors.description)
                      }
                      helperText={
                        form.touched.description && form.errors.description
                      }
                    />
                  )}
                </Field>
              </Grid>

              {/* Price List Dropdown */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  fullWidth
                  options={priceLists}
                  getOptionLabel={(option) =>
                    option?.description
                      ? `${option.price_list_id} - ${option.description}`
                      : ""
                  }
                  value={
                    priceLists.find(
                      (p) => p.price_list_id == values.price_list_id,
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    setFieldValue(
                      "price_list_id",
                      newValue?.price_list_id || "",
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Price List"
                      placeholder="Select Price List"
                      variant="outlined"
                      
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.price_list_id === value.price_list_id
                  }
                />
              </Grid>

              {/* Coverage Dropdown */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  fullWidth
                  options={coverages}
                  getOptionLabel={(option) =>
                    option?.payer_name
                      ? `${option.payer_name} - ${option.policy_number}`
                      : `${option.class_name} - ${option.coverage_type}`
                  }
                  value={
                    coverages.find(
                      (c) => c.coverage_id === values.coverage_id,
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    setFieldValue("coverage_id", newValue?.coverage_id || "");
                  }}
                  renderOption={(props, option) => {
                    const startDate = option.coverage_period_start
                      ? new Date(
                          option.coverage_period_start,
                        ).toLocaleDateString()
                      : " ";
                    const endDate = option.coverage_period_end
                      ? new Date(
                          option.coverage_period_end,
                        ).toLocaleDateString()
                      : " ";
                    const copayInfo = option.copay_percent
                      ? `${option.copay_percent}% copay${
                          option.copay_max ? ` (Max $${option.copay_max})` : ""
                        }`
                      : "No copay";

                    return (
                      <li {...props} key={option.coverage_id}>
                        <Box sx={{ width: "100%" }}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography fontWeight="bold">
                              {option.payer_name}
                            </Typography>
                            <Chip
                              label={option.member_status || "Active"}
                              color={
                                option.member_status === "Active"
                                  ? "success"
                                  : option.member_status === "Expired"
                                    ? "error"
                                    : "default"
                              }
                              sx={{
                                fontSize: "0.75rem",
                                height: 20,
                                fontWeight: "bold",
                              }}
                            />
                          </Box>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            mt={1}
                          >
                            <Typography variant="body2">
                              <strong>Policy:</strong>{" "}
                              {option.policy_number || " "}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Type:</strong>{" "}
                              {option.coverage_type || " "}
                            </Typography>
                          </Box>
                          <Typography variant="body2" mt={0.5}>
                            <strong>Period:</strong> {startDate} - {endDate}
                          </Typography>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            mt={1}
                          >
                            <Typography
                              variant="body2"
                              sx={{ maxWidth: "60%" }}
                            >
                              <strong>Network:</strong>{" "}
                              {option.network || "Standard"}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="primary.main"
                              fontWeight="medium"
                            >
                              {copayInfo}
                            </Typography>
                          </Box>
                          {option.class_name && (
                            <Typography
                              variant="body2"
                              mt={0.5}
                              sx={{ fontStyle: "italic" }}
                            >
                              {option.class_name}
                            </Typography>
                          )}
                        </Box>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Coverage"
                      placeholder="Select Coverage"
                      variant="outlined"
                      
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.coverage_id === value.coverage_id
                  }
                />
              </Grid>

              {/* Start Date and End Date */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Field name="start_date">
                  {({ field, form }: FieldProps) => (
                    <DesktopDatePicker
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
                          variant: "outlined",
                         
                          label: "Start Date",
                          required: true,
                          error:
                            form.touched.start_date &&
                            Boolean(form.errors.start_date),
                          helperText:
                            form.touched.start_date && form.errors.start_date,
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "transparent",
                            },
                            "& .MuiInputBase-root": {
                              backgroundColor: "transparent",
                            },
                          },
                        },
                      }}
                    />
                  )}
                </Field>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Field name="end_date">
                  {({ field, form }: FieldProps) => (
                    <DesktopDatePicker
                      format={dateFormat || "dd/MM/yyyy"}
                      value={field.value ? new Date(field.value) : null}
                      minDate={
                        values.start_date
                          ? new Date(values.start_date)
                          : undefined
                      }
                      onChange={(date) => setFieldValue("end_date", date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                          
                          label: "End Date",
                          error: touched.end_date && Boolean(errors.end_date),
                          helperText: touched.end_date && errors.end_date,
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "transparent",
                            },
                            "& .MuiInputBase-root": {
                              backgroundColor: "transparent",
                            },
                          },
                        },
                      }}
                    />
                  )}
                </Field>
              </Grid>

              {/* Network and Class */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Field name="network">
                  {({ field }: FieldProps) => (
                    <TextField
                      
                      {...field}
                      fullWidth
                      variant="outlined"
                      label="Network"
                      placeholder="Enter network"
                    />
                  )}
                </Field>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Field name="class_name">
                  {({ field }: FieldProps) => (
                    <TextField
                      
                      {...field}
                      fullWidth
                      variant="outlined"
                      label="Class"
                      placeholder="Enter class"
                    />
                  )}
                </Field>
              </Grid>

              {/* Copay Fields */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Field name="copay_percent">
                  {({ field, form }: FieldProps) => (
                    <TextField
                      
                      fullWidth
                      variant="outlined"
                      label="Copay Percent"
                      placeholder="0.00"
                      type="number"
                      inputProps={{ step: "0.01", min: "0" }}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const parsedValue = val === "" ? "" : parseFloat(val);
                        form.setFieldValue("copay_percent", parsedValue);
                      }}
                    />
                  )}
                </Field>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Field name="copay_max">
                  {({ field, form }: FieldProps) => (
                    <TextField
                      
                      fullWidth
                      variant="outlined"
                      label="Copay Max"
                      placeholder="0.00"
                      type="number"
                      inputProps={{ step: "0.01", min: "0" }}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const parsedValue = val === "" ? "" : parseFloat(val);
                        form.setFieldValue("copay_max", parsedValue);
                      }}
                    />
                  )}
                </Field>
              </Grid>

              {/* Sponsor Number and Policy Holder */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Field name="sponsor_number">
                  {({ field }: FieldProps) => (
                    <TextField
                      
                      {...field}
                      fullWidth
                      variant="outlined"
                      label="Sponsor Number"
                      placeholder="Enter sponsor number"
                    />
                  )}
                </Field>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Field name="policy_holder">
                  {({ field }: FieldProps) => (
                    <TextField
                      
                      {...field}
                      fullWidth
                      variant="outlined"
                      label="Policy Holder"
                      placeholder="Enter policy holder"
                    />
                  )}
                </Field>
              </Grid>
            </Grid>

            {/* Autofill handler for coverage changes */}
            <CoverageAutofillHandler coverages={coverages} />

            <Divider sx={{ mt: 1, mb: 1 }}   />

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                onClick={onClose}
                variant="contained"
                sx={{}}
                color="error"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isValid}
              >
                {initialValues.policy_id ? "Update Policy" : "Add Policy"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default PolicyForm;