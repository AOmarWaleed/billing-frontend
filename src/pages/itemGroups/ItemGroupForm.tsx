import React from "react";
import { Formik, Form, Field, FieldProps } from "formik";
import {
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  MenuItem,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useAppSelector } from "../../hooks/hooks";
import Secure from "../../shared/security";
import GLTextField from "../../shared/security/GLTextField";
// import { t } from "i18next";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { useContext } from "react";
import { mutate } from "swr";
interface ItemGroupFormProps {
  initialValues: any;
  onSubmit: (values: any) => void;
  onClose: () => void;
  error: string;
  isUpdate: boolean;
}

const ItemGroupForm: React.FC<ItemGroupFormProps> = ({
  initialValues,
  onSubmit,
  onClose,
  error,
  isUpdate,
}) => {
  // Get data from Redux store
  const { t } = useContext(AuthGuardContext);
  const {
    payers,
    drugDispensingCodeTypes,
    nphiesBenefitCategoryCodeTypes,
    selectedGroup,
  } = useAppSelector((state) => state.itemGroup);
  // console.log("payers are  ", payers);
  // console.log("it is  ", drugDispensingCodeTypes);
  // const payers = useAppSelector((state) => state.payers.list);
  const validateForm = (values: any) => {
    const errors: any = {};
    if (!values.description.trim()) {
      errors.description = "Description is required";
    }
    return errors;
  };

  return (
    <Box sx={{ maxWidth: 650, mx: "auto", p: 2 }}>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validateForm}
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form>
            <Box sx={{ height: 24 }}>
              {Object.keys(errors).length > 0 && (
                <Typography variant="body2" sx={{ color: "red" }}>
                  {Object.values(errors).join(", ")}
                </Typography>
              )}
            </Box>
            {/* Description Field */}
            <Box mb={3}>
              <Secure.GLTypography
                resource_key="itemGroup_14_descriptionAddGroupItem"
                sx={{ color: "text.obs" }}
                variant="body1"
                fontWeight="bold"
                gutterBottom
              />

              <Field name="description">
                {({ field }: FieldProps) => (
                  <Secure.GLTextField
                    resource_key="itemGroup_14_descriptionAddGroupItem"
                    {...field}
                    fullWidth
                    variant="outlined"
                    color="whiteField"
                    placeholder={t(
                      "itemGroup_14_enterItemGroupDescriptionAddGroupItem",
                    )}
                    error={touched.description && Boolean(errors.description)}
                    // helperText={touched.description && errors.description}
                  />
                )}
              </Field>
            </Box>
            {/* <Secure.GLLabelAndField
              resource_key="itemgroup_14_description"
              wrapperProps={{ mb: 3 }}
              labelProps={{
                sx: { color: "text.obs" },
                variant: "body1",
                fontWeight: "bold",
                gutterBottom: true,
              }}
              name="description"
            >
              {({ field }: FieldProps) => (
                <TextField
                  {...field}
                  fullWidth
                  variant="outlined"
                  color="whiteField"
                  placeholder="Enter item group description"
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                />
              )}
            </Secure.GLLabelAndField> */}

            {/* Drug Dispensing Type */}
            <Box mb={3}>
              <Secure.GLTypography
                resource_key="itemGroup_14_drugDispensingTypeAddGroupItem"
                sx={{ color: "text.obs" }}
                variant="body1"
                fontWeight="bold"
                gutterBottom
              />
              <Field name="drug_dispensing_type">
                {({ field, form }: FieldProps) => (
                  <Secure.GLGenericAutocomplete
                    resource_key="itemGroup_14_drugDispensingTypeAddGroupItem"
                    fullWidth
                    options={drugDispensingCodeTypes}
                    getOptionLabel={(option) =>
                      option
                        ? `${option.user_code} - ${option.description}`
                        : ""
                    }
                    value={
                      drugDispensingCodeTypes.find(
                        (type) => type.code === field.value,
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      form.setFieldValue(
                        field.name,
                        newValue ? newValue.code : "",
                      );
                    }}
                    renderInput={(params) => (
                      <GLTextField
                        resource_key="itemGroup_14_drugDispensingTypeAddGroupItem"
                        {...params}
                        placeholder={t(
                          "itemGroup_14_selectDispensingTypeAddGroupItem",
                        )}
                        variant="outlined"
                        color="whiteField"
                      />
                    )}
                  />
                )}
              </Field>
            </Box>
            {/* <Secure.GLLabelAndField
              wrapperProps={{ mb: 3 }}
              labelProps={{
                sx: { color: "text.obs" },
                variant: "body1",
                fontWeight: "bold",
                gutterBottom: true,
              }}
              resource_key="itemgroup_14_drugDispensingType"
              name="drug_dispensing_type"
            >
              {({ field, form }: FieldProps) => (
                <Autocomplete
                  fullWidth
                  options={drugDispensingCodeTypes}
                  getOptionLabel={(option) =>
                    option ? `${option.user_code} - ${option.description}` : ""
                  }
                  value={
                    drugDispensingCodeTypes.find(
                      (type) => type.code === field.value
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    form.setFieldValue(
                      field.name,
                      newValue ? newValue.code : ""
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Dispensing Type"
                      variant="outlined"
                      color="whiteField"
                    />
                  )}
                />
              )}
            </Secure.GLLabelAndField> */}

            {/* Benefit Category */}
            <Box mb={3}>
              <Secure.GLTypography
                resource_key="itemGroup_14_nphiesBenefitCategoryAddGroupItem"
                sx={{ color: "text.obs" }}
                variant="body1"
                fontWeight="bold"
                gutterBottom
              />

              <Field name="nphies_benefit_category">
                {({ field, form }: FieldProps) => (
                  <Secure.GLGenericAutocomplete
                    resource_key="itemGroup_14_nphiesBenefitCategoryAddGroupItem"
                    fullWidth
                    options={nphiesBenefitCategoryCodeTypes}
                    getOptionLabel={(option) =>
                      option
                        ? `${option.user_code} - ${option.description}`
                        : ""
                    }
                    value={
                      nphiesBenefitCategoryCodeTypes.find(
                        (cat) => cat.user_code === field.value,
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      form.setFieldValue(
                        field.name,
                        newValue ? newValue.user_code : "",
                      );
                    }}
                    renderInput={(params) => (
                      <Secure.GLTextField
                        resource_key="itemGroup_14_nphiesBenefitCategoryAddGroupItem"
                        {...params}
                        placeholder={t(
                          "itemGroup_14_selectBenefitCategoryAddGroupItem",
                        )}
                        variant="outlined"
                        color="whiteField"
                      />
                    )}
                  />
                )}
              </Field>
            </Box>
            {/* <Secure.GLLabelAndField
              resource_key="itemgroup_14_nphiesBenefitCategory"
              wrapperProps={{ mb: 3 }}
              labelProps={{
                sx: { color: "text.obs" },
                variant: "body1",
                fontWeight: "bold",
                gutterBottom: true,
              }}
              name="nphies_benefit_category"
            >
              {({ field, form }: FieldProps) => (
                <Autocomplete
                  fullWidth
                  options={nphiesBenefitCategoryCodeTypes}
                  getOptionLabel={(option) =>
                    option ? `${option.user_code} - ${option.description}` : ""
                  }
                  value={
                    nphiesBenefitCategoryCodeTypes.find(
                      (cat) => cat.user_code === field.value
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    form.setFieldValue(
                      field.name,
                      newValue ? newValue.user_code : ""
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select Benefit Category"
                      variant="outlined"
                      color="whiteField"
                    />
                  )}
                />
              )}
            </Secure.GLLabelAndField> */}
            {/* Payer Selection */}
            <Box mb={3}>
              <Secure.GLTypography
                resource_key="itemGroup_14_payerAddGroupItem"
                sx={{ color: "text.obs" }}
                variant="body1"
                fontWeight="bold"
                gutterBottom
              />

              <Field name="payer_id">
                {({ field, form }: FieldProps) => (
                  <Secure.GLGenericAutocomplete
                    resource_key="itemGroup_14_payerAddGroupItem"
                    options={payers}
                    getOptionLabel={(payer) => {
                      if (!payer) return "";
                      const namePart = payer.name?.trim();
                      const descriptionPart = payer.description?.trim();
                      return namePart
                        ? `${payer.id} - ${namePart}`
                        : `${payer.id} - ${descriptionPart}`;
                    }}
                    value={payers.find((p) => p.id === field.value) || null}
                    onChange={(_, newValue) => {
                      form.setFieldValue(
                        field.name,
                        newValue ? newValue.id : "",
                      );
                    }}
                    renderInput={(params) => (
                      <Secure.GLTextField
                        resource_key="itemGroup_14_payerAddGroupItem"
                        {...params}
                        placeholder={t("itemGroup_14_selectPayerAddGroupItem")}
                        variant="outlined"
                        color="whiteField"
                        error={touched.payer_id && Boolean(errors.payer_id)}
                        helperText={touched.payer_id && errors.payer_id}
                      />
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                  />
                )}
              </Field>
            </Box>
            {/* <Secure.GLLabelAndField
              resource_key="itemgroup_14_payer"
              wrapperProps={{ mb: 3 }}
              labelProps={{
                sx: { color: "text.obs" },
                variant: "body1",
                fontWeight: "bold",
                gutterBottom: true,
              }}
              name="payer_id"
            >
              {({ field, form }: FieldProps) => (
                <Autocomplete
                  options={payers}
                  getOptionLabel={(payer) => {
                    if (!payer) return "";
                    const namePart = payer.name?.trim();
                    const descriptionPart = payer.description?.trim();
                    return namePart
                      ? `${payer.id} - ${namePart}`
                      : `${payer.id} - ${descriptionPart}`;
                  }}
                  value={payers.find((p) => p.id === field.value) || null}
                  onChange={(_, newValue) => {
                    form.setFieldValue(field.name, newValue ? newValue.id : "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select payer"
                      variant="outlined"
                      color="whiteField"
                      error={touched.payer_id && Boolean(errors.payer_id)}
                      helperText={touched.payer_id && errors.payer_id}
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                />
              )}
            </Secure.GLLabelAndField> */}
            <Divider sx={{ my: 3 }} />

            {/* Form Actions */}
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Secure.GLButton
                resource_key="itemGroup_14_cancelAddGroupItem"
                variant="outlined"
                onClick={onClose}
                sx={{ minWidth: 100 }}
              />
              <Secure.GLButton
                resource_key={
                  isUpdate
                    ? "itemGroup_14_updateAddGroupItem"
                    : "itemGroup_14_createAddGroupItem"
                }
                type="submit"
                variant="contained"
                color="primary"
                sx={{ minWidth: 100 }}
              >
                {isUpdate
                  ? t("itemGroup_14_updateAddGroupItem")
                  : t("itemGroup_14_createAddGroupItem")}
              </Secure.GLButton>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default ItemGroupForm;
