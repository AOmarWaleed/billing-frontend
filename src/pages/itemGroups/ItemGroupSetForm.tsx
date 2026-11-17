import React, { useContext, useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, FieldProps } from "formik";
import {
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import Secure from "../../shared/security";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import { useDispatch } from "react-redux";
import { fetchCodeDataListByCodeType } from "../../redux/slices/packageSetupSlice";
interface ItemGroupSetFormProps {
  initialValues: any;
  onSubmit: (values: any) => void;
  onClose: () => void;
  error: string;
  isUpdate: boolean;
}

const ItemGroupSetForm: React.FC<ItemGroupSetFormProps> = ({
  initialValues,
  onSubmit,
  onClose,
  error,
  isUpdate,
}) => {
  const {
    itemGroups,
    itemGroupSetCodeTypes,
    itemCategoryCodeTypes,
    itemGroupCodeTypes,
    selectedGroup,
  } = useAppSelector((state) => state.itemGroup);
  const { t } = useContext(AuthGuardContext);
  console.log("eeee", itemGroupSetCodeTypes, itemCategoryCodeTypes, itemGroupCodeTypes);
  const statusOptions = useMemo(
    () => [
      { label: t("itemGroup_14_activeSetForm"), value: "A" },
      { label: t("itemGroup_14_inactiveSetForm"), value: "I" },
      { label: t("itemGroup_14_draftSetForm"), value: "D" },
    ],
    [],
  );
  const validateForm = (values: any) => {
    const errors: any = {};
    if (!isUpdate && !values.set_type) {
      errors.set_type = t("itemGroup_14_setTypeIsRequiredSetTable");
    }
    if (!values.status)
      errors.status = t("itemGroup_14_statusIsRequiredSetTable");
    if (!values.process_type)
      errors.process_type = t("itemGroup_14_actionIsRequiredSetTable");
    if (values.set_type === "SUB-CATEGORY" && !values.parent_category) {
      errors.parent_category = t(
        "itemGroup_14_categoryIsRequiredForSubCategorySetTable",
      );
    }
    if (values.set_type === "CATEGORY" && !values.set_code) {
      errors.set_code = t("itemGroup_14_setCodeIsRequiredSetTable");
    }
    if (values.set_type === "SUB-CATEGORY" && values.parent_category && !values.set_code_actual) {
      errors.set_code = t("itemGroup_14_setCodeIsRequiredSetTable");
    }
    if (values.set_type === "ITEM-GROUP" && !values.set_code) {
      const filteredGroups = itemGroups.filter(
        (g) => String(g.group_id) !== String(selectedGroup?.group_id),
      );
      if (filteredGroups.length === 0) {
        errors.set_code = t(
          "itemGroup_14_thereIsNoOtherItemGroupsToBeAddedToSetTable",
        );
      } else {
        errors.set_code = t("itemGroup_14_setCodeIsRequiredSetTable");
      }
    }
    return errors;
  };
  const dispatch = useAppDispatch();


  return (
    <Box sx={{ maxWidth: 650, mx: "auto", p: 2 }}>
      {error && (
        <Typography sx={{ color: "red" }} variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={(values) => {
          const { set_code_actual, _subOptions, ...valuesToBackend } = values;
          const finalSetCode = values.set_type === "SUB-CATEGORY"
            ? set_code_actual
            : values.set_code;
          onSubmit({
            ...valuesToBackend,
            set_code: finalSetCode,
            group_id: selectedGroup?.group_id || "",
          });
        }}
        validate={validateForm}
      >
        {({ values, errors, touched, setFieldValue }) => {
          const getSetTypeDisplay = () => values.set_type || " ";

          const getSetCodeDisplay = () => {
            let options: any[] = [];
            switch (values.set_type) {
              case "ITEM-GROUP":
                options = itemGroupCodeTypes;
                break;
              case "CATEGORY":
                options = itemCategoryCodeTypes;
                break;
              case "SUB-CATEGORY":
                const parent = itemCategoryCodeTypes.find(
                  (c) => c.code === values.parent_category,
                );
                options = parent?.sub_codes || [];
                break;
              default:
                options = [];
            }

            const option = options.find(
              (opt) => opt.code.toString() === values.set_code?.toString(),
            );
            return option
              ? `${option.code} - ${option.description}`
              : values.set_code || " ";
          };



          return (
            <Form>
              {/* Group Display */}
              <Box mb={3}>
                <Secure.GLTypography
                  resource_key="itemGroup_14_groupSetForm"
                  sx={{ color: "text.obs" }}
                  variant="body1"
                  fontWeight="bold"
                  gutterBottom
                >
                  Group
                </Secure.GLTypography>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "text.obs",
                    borderRadius: 1,
                    color: "text.obs",
                  }}
                >
                  <Secure.GLTypography
                    resource_key="itemGroup_14_groupSetForm"
                    variant="body2"
                  >
                    <strong>{selectedGroup?.group_id ?? " "}</strong> —{" "}
                    {selectedGroup?.description ??
                      t("itemGroup_14_noDescriptionSetForm")}
                  </Secure.GLTypography>
                </Box>
              </Box>

              {/* Set Type */}
              <Box mb={3}>
                <Secure.GLTypography
                  resource_key="itemGroup_14_setTypeSetForm"
                  sx={{ color: "text.obs" }}
                  variant="body1"
                  fontWeight="bold"
                  gutterBottom
                />

                {isUpdate ? (
                  <Typography
                    variant="body2"
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "text.obs",
                      borderRadius: 1,
                      color: "text.obs",
                    }}
                  >
                    {getSetTypeDisplay()}
                  </Typography>
                ) : (
                  <Field name="set_type">
                    {({ field, form }: FieldProps) => {
                      const selectedOption =
                        itemGroupSetCodeTypes.find(
                          (opt) => opt.user_code === field.value,
                        ) || null;
                      return (
                        <Secure.GLGenericAutocomplete
                          resource_key="itemGroup_14_setTypeSetForm"
                          fullWidth
                          options={itemGroupSetCodeTypes}
                          getOptionLabel={(option) =>
                            `${option.user_code} - ${option.description}`
                          }
                          isOptionEqualToValue={(option, value) =>
                            option.user_code === value.user_code
                          }
                          value={selectedOption}
                          onChange={(_, newValue) => {
                            form.setFieldValue(
                              field.name,
                              newValue?.user_code || "",
                            );
                            form.setFieldValue("set_code", "");
                            form.setFieldValue("parent_category", "");
                          }}
                          renderInput={(params) => (
                            <Secure.GLTextField
                              resource_key="itemGroup_14_setTypeSetForm"
                              {...params}
                              placeholder={t(
                                "itemGroup_14_selectSetTypeSetForm",
                              )}
                              color="whiteField"
                              error={
                                !!(
                                  form.touched.set_type && form.errors.set_type
                                )
                              }
                              helperText={
                                form.touched.set_type && form.errors.set_type
                              }
                            />
                          )}
                        />
                      );
                    }}
                  </Field>
                )}
              </Box>

              {/* Set Selection */}
              <Box mb={3}>
                <Secure.GLTypography
                  resource_key="itemGroup_14_setSelectionSetForm"
                  sx={{ color: "text.obs" }}
                  variant="body1"
                  fontWeight="bold"
                  gutterBottom
                />

                {isUpdate ? (
                  <Typography
                    variant="body2"
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "text.obs",
                      borderRadius: 1,
                      color: "text.obs",
                    }}
                  >
                    {getSetCodeDisplay()}
                  </Typography>
                ) : (
                  <>
                    {/* ITEM-GROUP */}
                    {values.set_type === "ITEM-GROUP" && (
                      <Field name="set_code">
                        {({ field, form }: FieldProps) => {
                          const filteredGroups = itemGroups.filter(
                            (g) =>
                              String(g.group_id) !==
                              String(selectedGroup?.group_id),
                          );
                          const selectedOption =
                            filteredGroups.find(
                              (opt) => opt.group_id === field.value,
                            ) || null;
                          return (
                            <Secure.GLGenericAutocomplete
                              resource_key="itemGroup_14_setSelectionSetForm"
                              fullWidth
                              options={filteredGroups}
                              getOptionLabel={(option) =>
                                `${option.group_id} - ${option.description}`
                              }
                              isOptionEqualToValue={(option, value) =>
                                option.group_id === value.group_id
                              }
                              value={selectedOption}
                              onChange={(_, newValue) =>
                                form.setFieldValue(
                                  field.name,
                                  newValue?.group_id || "",
                                )
                              }
                              renderInput={(params) => (
                                <Secure.GLTextField
                                  resource_key="itemGroup_14_setSelectionSetForm"
                                  {...params}
                                  placeholder={t(
                                    "itemGroup_14_selectItemGroupSetForm",
                                  )}
                                  color="whiteField"
                                  error={
                                    !!(
                                      form.touched.set_code &&
                                      form.errors.set_code
                                    )
                                  }
                                  helperText={
                                    form.touched.set_code &&
                                    form.errors.set_code
                                  }
                                />
                              )}
                            />
                          );
                        }}
                      </Field>
                    )}

                    {/* CATEGORY */}
                    {values.set_type === "CATEGORY" && (
                      <Field name="set_code">
                        {({ field, form }: FieldProps) => {
                          const selectedOption =
                            itemCategoryCodeTypes.find(
                              (opt) => opt.code === field.value,
                            ) || null;
                          return (
                            <Secure.GLGenericAutocomplete
                              resource_key="itemGroup_14_setSelectionSetForm"
                              fullWidth
                              options={itemCategoryCodeTypes}
                              getOptionLabel={(option) =>
                                `${option.user_code} - ${option.description}`
                              }
                              isOptionEqualToValue={(option, value) =>
                                option.code === value.code
                              }
                              value={selectedOption}
                              onChange={(_, newValue) =>
                                form.setFieldValue(
                                  field.name,
                                  newValue?.code || "",
                                )
                              }
                              renderInput={(params) => (
                                <Secure.GLTextField
                                  resource_key="itemGroup_14_setSelectionSetForm"
                                  {...params}
                                  placeholder={t(
                                    "itemGroup_14_selectCategorySetForm",
                                  )}
                                  color="whiteField"
                                />
                              )}
                            />
                          );
                        }}
                      </Field>
                    )}

                    {/* SUB-CATEGORY */}
                    {values.set_type === "SUB-CATEGORY" && (
                      <>
                        {/* First Category */}
                        <Field name="parent_category">
                          {({ field, form }: FieldProps) => {
                            const selectedCategory =
                              itemCategoryCodeTypes.find(
                                (opt) => opt.code === field.value,
                              ) || null;
                            return (
                              <Secure.GLGenericAutocomplete
                                resource_key="itemGroup_14_setSelectionSetForm"
                                fullWidth
                                options={itemCategoryCodeTypes}
                                getOptionLabel={(option) =>
                                  `${option.user_code} - ${option.description}`
                                }
                                isOptionEqualToValue={(option, value) =>
                                  option.code === value.code
                                }
                                value={selectedCategory}
                                onChange={async (_, newValue) => {
                                  form.setFieldValue(field.name, newValue?.code || "");
                                  form.setFieldValue("set_code", "");
                                  form.setFieldValue("set_code_actual", "");
                                  form.setFieldValue("_subOptions", []);

                                  if (newValue?.sub_code_type) {
                                    const result = await dispatch(
                                      fetchCodeDataListByCodeType(newValue.sub_code_type)
                                    ).unwrap();
                                    form.setFieldValue("_subOptions", result?.codedata ?? []);
                                  }
                                }}
                                renderInput={(params) => (
                                  <Secure.GLTextField
                                    resource_key="itemGroup_14_setSelectionSetForm"
                                    {...params}
                                    placeholder={t(
                                      "itemGroup_14_selectCategoryFirstSetForm",
                                    )}
                                    color="whiteField"
                                    error={
                                      !!(
                                        form.touched.parent_category &&
                                        form.errors.parent_category
                                      )
                                    }
                                    helperText={
                                      form.touched.parent_category &&
                                      form.errors.parent_category
                                    }
                                  />
                                )}
                              />
                            );
                          }}
                        </Field>
                        {/* Then Subcategory */}
                        {values.parent_category && (
                          <Field name="set_code">
                            {({ field, form }: FieldProps) => {
                              const subOptions: any[] = form.values._subOptions ?? [];
                              const selectedSub = subOptions.find((opt) => opt.user_code === field.value) ?? null;
                              return (
                                <Secure.GLGenericAutocomplete
                                  resource_key="itemGroup_14_setSelectionSetForm"
                                  fullWidth
                                  options={subOptions}
                                  getOptionLabel={(option) =>
                                    `${option.user_code} - ${option.description}`
                                  }
                                  isOptionEqualToValue={(option, value) =>
                                    option.user_code === value.user_code
                                  }
                                  value={selectedSub}
                                  onChange={(_, newValue) => {
                                    // Store user_code so the find() lookup and display stay consistent
                                    form.setFieldValue(field.name, newValue?.user_code || "");
                                    // Store the actual code to use when submitting
                                    form.setFieldValue("set_code_actual", newValue?.code || "");
                                  }}
                                  renderInput={(params) => (
                                    <Secure.GLTextField
                                      resource_key="itemGroup_14_setSelectionSetForm"
                                      {...params}
                                      placeholder={t(
                                        "itemGroup_14_selectSubCategorySetForm",
                                      )}
                                      color="whiteField"
                                      disabled={!form.values.parent_category}
                                      error={
                                        !!(
                                          form.touched.set_code &&
                                          form.errors.set_code
                                        )
                                      }
                                      helperText={
                                        form.touched.set_code &&
                                        form.errors.set_code
                                      }
                                    />
                                  )}
                                />
                              );
                            }}
                          </Field>
                        )}
                      </>
                    )}
                  </>
                )}
              </Box>

              {/* Status */}

              <Box mb={3}>
                <Secure.GLTypography
                  resource_key="itemGroup_14_statusSetForm"
                  sx={{ color: "text.obs" }}
                  variant="body1"
                  fontWeight="bold"
                  gutterBottom
                />
                <Secure.GLGenericAutocomplete
                  resource_key="itemGroup_14_statusSetForm"
                  fullWidth
                  options={statusOptions}
                  getOptionLabel={(option) => option.label}
                  value={
                    statusOptions.find((opt) => opt.value === values.status) ||
                    null
                  }
                  onChange={(_, newValue) =>
                    setFieldValue("status", newValue?.value || "")
                  }
                  renderInput={(params) => (
                    <Secure.GLTextField
                      resource_key="itemGroup_14_statusSetForm"
                      color="whiteField"
                      {...params}
                      placeholder={t("itemGroup_14_selectStatusSetForm")}
                      error={!!(touched.status && errors.status)}
                      helperText={touched.status && errors.status}
                    />
                  )}
                />
              </Box>

              {/* Action & Auto Add */}
              <Box
                mb={3}
                display="flex"
                gap={4}
                flexWrap="wrap"
                alignItems="flex-start"
              >
                {/* Action */}
                <Box flex={1} minWidth={200}>
                  <Secure.GLTypography
                    resource_key="itemGroup_14_actionSetForm"
                    sx={{ color: "text.obs" }}
                    variant="body1"
                    fontWeight="bold"
                    gutterBottom
                  />

                  <Field name="process_type">
                    {({ field }: FieldProps) => (
                      <RadioGroup row {...field}>
                        <Secure.GLGenericFormControlLabel
                          resource_key="itemGroup_14_addSetForm"
                          value="ADD"
                          control={
                            <Radio
                              sx={{
                                // color: "white",
                                // "&.Mui-checked": { color: "white" },
                              }}
                            />
                          }
                          label={t("itemGroup_14_addSetForm")}
                          // sx={{ color: "white" }}
                        />
                        <Secure.GLGenericFormControlLabel
                          resource_key="itemGroup_14_removeSetForm"
                          value="REMOVE"
                          control={
                            <Radio
                            />
                          }
                          label={t("itemGroup_14_removeSetForm")}
                        />
                      </RadioGroup>
                    )}
                  </Field>
                  {touched.process_type && errors.process_type && (
                    <Typography variant="caption" color="error">
                      {errors.process_type}
                    </Typography>
                  )}
                </Box>

                {/* Auto Add */}
                <Box flex={1} minWidth={200}>
                  <Secure.GLTypography
                    resource_key="itemGroup_14_autoAddNewItemsSetForm"
                    sx={{ color: "text.obs" }}
                    variant="body1"
                    fontWeight="bold"
                    gutterBottom
                  />

                  <Field name="auto_sync">
                    {({ field }: FieldProps) => (
                      <RadioGroup row {...field}>
                        <FormControlLabel
                          value="Y"
                          control={
                            <Radio
                            />
                          }
                          label={t("itemGroup_14_yesSetForm")}
                          
                        />
                        <FormControlLabel
                          value="N"
                          control={
                            <Radio
                            />
                          }
                          label={t("itemGroup_14_noSetForm")}   
                        />
                      </RadioGroup>
                    )}
                  </Field>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Buttons */}
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Secure.GLButton
                  resource_key="itemGroup_14_cancelSetForm"
                  variant="outlined"
                  onClick={onClose}
                />
                <Secure.GLButton
                  resource_key={
                    isUpdate
                      ? "itemGroup_14_updateSetSetForm"
                      : "itemGroup_14_createSetSetForm"
                  }
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  {isUpdate
                    ? t("itemGroup_14_updateSetSetForm")
                    : t("itemGroup_14_createSetSetForm")}
                </Secure.GLButton>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default ItemGroupSetForm;