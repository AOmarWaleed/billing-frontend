import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Grid2,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import { ItemData } from "../../../types/ItemData";
import "../../../assets/css/Style.css";
import { Checkbox } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import { formatDate } from "../../../utils/formatData/formatterv2";
import {
  Field,
  FieldProps,
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
} from "formik";
import useItemSlice from "../../../redux/hooks/useItemSlice";
import { toast } from "react-toastify";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { ItemDTO } from "../../../types/ItemDTO";
import itemSchema from "../../../models/itemSchema";
import { useAppSelector } from "../../../hooks/hooks";
import { useLanguage } from "../../../context/LanguageContext";
import { useTransSlice } from "../../../redux/slices/transSlice";
import { createResourceHelpers } from "../../../utils/resourceMapping/createResourceHelpers";
import { mutate } from "swr";
import { apiUtility } from "../../../utils/apiUtility";
import { useTranslation } from "react-i18next";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";
import { Secure as GalaxySecure } from "@givc/shared-components";

interface ItemDetailProps {
  // item: ItemData | null;
  openEditMode: () => void;
  closeEditMode: () => void;
  disable: boolean;
  setDisable: React.Dispatch<React.SetStateAction<boolean>>;
  itemsRef: React.RefObject<() => void>;
}
interface IFormValues {
  description?: string;
  long_description?: string;
  item_bk?: string;
  legacy_code?: string;
  category_code?: string;
  sub_category_code?: string;
  generic_id?: number;
  //item_type?: string;
  pharmacy_type?: "N" | "Y"; // Assuming it's a flag
  orderable?: "N" | "Y";
  inventory?: "N" | "Y";
  inventory_price?: "N" | "Y";
  //stocked_uom_code?: string;
  sales_uom_code?: string;
  sales_conv_factor?: number;
  product_ind?: string;
  activity_indicator?: "N" | "Y";
  stocked_indicator?: "N" | "Y";
  image_id?: number;
  brand_generic_id?: number;
  external_doctor_price_editable?: "N" | "Y";
  standard_price_editable?: "N" | "Y";
  national_drug_code?: string;
  vat_cat_type?: string;
  nphies_service_type?: string;
  drug_dispensing_type?: string;
  scientific_code?: string;
}

const ItemDetail: React.FC<ItemDetailProps> = ({
  openEditMode,
  closeEditMode,
  disable,
  setDisable,
  itemsRef,
}) => {
  const [formValues, setFormValues] = useState<any>({});
  const {
    groups,
    vats,
    nphies,
    selectedItem,
    modifyItem,
    fetchGroups,
    fetchNphies,
    fetchVatCats,
    clearErrorMsg,
  } = useItemSlice();
  const formikRef = useRef<FormikProps<any>>(null);
  //==================  * Resources * ===================

  const ctx = useContext(AuthGuardContext);

  if (!ctx) {
    return null;
  }

  const { resourcesData, t, userLang } = ctx;

  //==================  * Resources * ===================

  // Keep the form's initial values stable when the same item is merely refreshed
  // (e.g. after a save), so in-progress edits are not wiped.
  // Mirrors EditPatientForm's lastSelectedPatientIdRef guard.
  const lastSelectedItemIdRef = useRef<number | null>(null);
  const [initialValues, setInitialValues] = useState<any>({});

  useEffect(() => {
    if (!selectedItem) return;
    // Skip re-initializing the form when the same item's row is refreshed,
    // otherwise in-progress edits would be wiped.
    if (lastSelectedItemIdRef.current === selectedItem.item_id) return;
    lastSelectedItemIdRef.current = selectedItem.item_id;
    setInitialValues(selectedItem);
  }, [selectedItem]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikProps<any>["setFieldValue"],
  ) => {
    const { name, value, type, checked } = event.target;

    if (type === "checkbox") {
      setFieldValue(name, checked ? "Y" : "N");
    } else if (type === "number") {
      setFieldValue(name, Number(value) || 0);
    } else {
      setFieldValue(name, value);
    }
  };
  const validate = (values: any): Partial<Record<string, string>> => {
    // allowUnknown: edit values are full DB rows (created_by, dates, ...);
    // validate known fields strictly, ignore metadata keys
    const { error } = itemSchema.validate(values, {
      abortEarly: false,
      allowUnknown: true,
    });
    const errors: Partial<Record<string, string>> = {};
    if (error) {
      error.details.forEach((detail) => {
        const key = detail.path[0] as string;
        // Remove everything before (and including) "fails to match"
        const message = detail.message.replace(/^.*fails to match /, "");
        errors[key] = message;
      });
    }
    return errors;
  };

  const handleCancle = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    setDisable(true);

    formikRef.current?.resetForm({ values: selectedItem });
  };

  const handleSubmit = (values: any, { setSubmitting }: FormikHelpers<any>) => {
    try {
      clearErrorMsg();
      const transformValues: ItemDTO = {
        //item_id: 0, // Typically generated by database
        description: values.description,
        long_description: values.long_description,
        item_bk: values.item_bk,
        legacy_code: values.legacy_code,
        category_code: values.category_code || null,
        sub_category_code: values.sub_category_code || null,
        generic_id: values.generic_id != null ? Number(values.generic_id) : null,
        //item_type: values.item_type || "",
        pharmacy_type: values.pharmacy_type || "N",
        orderable: values.orderable || "N",
        inventory: values.inventory || "N",
        inventory_price: values.inventory_price || "N",
        //stocked_uom_code: values.stocked_uom_code || "",
        sales_uom_code: values.sales_uom_code || "",
        sales_conv_factor: values.sales_conv_factor != null
          ? Number(values.sales_conv_factor)
          : null,
        activity_indicator: values.activity_indicator || "Y",
        stocked_indicator: values.stocked_indicator || "N",
        image_id: values.image_id ? Number(values.image_id) : null,
        brand_generic_id: values.brand_generic_id != null
          ? Number(values.brand_generic_id)
          : null,
        external_doctor_price_editable:
          values.external_doctor_price_editable || "N",
        standard_price_editable: values.standard_price_editable || "N",
        national_drug_code: values.national_drug_code || null,
        vat_cat_type: values.vat_cat_type || null,
        nphies_service_type: values.nphies_service_type || null,
        drug_dispensing_type: values.drug_dispensing_type || null,
        scientific_code: values.scientific_code || null,
      };
      setFormValues(transformValues);
      modifyItem(selectedItem?.item_id, transformValues).then((res) => {
        if (!res?.success) {
          toast.error(res?.error || "Failed to update item");
          return;
        }
        toast.success("Item has been updated successfully!");
        closeEditMode();
        mutate((e) => apiUtility(e, "item"));
        itemsRef?.current?.();
      });
    } catch (error: any) {
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const {
    palette: { mode },
  } = useTheme();

  const dateFormat = useAppSelector((state) => {
    return state.config.values.DATE_FORMAT;
  });

  if (selectedItem) {
    return (
      <>
        <Box>
          {/* <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
              mb: 1,
            }}
          > */}
          {/* <Secure.GLButton
              resource_key="items_5_Edit"
              variant="contained"
              color={disable ? "primary" : "inherit"}
              startIcon={<ModeEditIcon />}
              onClick={openEditMode}
              disabled={!disable}
            >
              {t("items_5_Edit") || "Edit"}
            </Secure.GLButton> */}
          {/* </Box> */}
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            enableReinitialize={true}
            validate={validate}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values, isSubmitting }) => {
              return (
                <Form>
                  {/* frist Fieldset */}
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack direction="column" gap={1.5}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{ display: "flex" }}
                          >
                            {t("items_5_ItemDetail") || "Item's Detail"}
                          </Typography>
                          {disable && (
                            <GalaxySecure.GLIconButton2
                              permission="items_5_editItem"
                              uiText="generic_0_edit"
                              fallBackText="Edit"
                              onClick={openEditMode}
                              disabled={!disable}
                              size="small"
                            >
                              <img
                                src={`./themes/${mode}/icons/pen.png`}
                                alt="Edit Item"
                              />
                            </GalaxySecure.GLIconButton2>
                          )}
                          {!disable && (
                            <Box
                              display="flex"
                              justifyContent="flex-end"
                              gap={2}
                            >
                              <GalaxySecure.GLIconButton2
                                permission="items_5_cancelEdit"
                                uiText="generic_0_cancel"
                                fallBackText="Cancel"
                                onClick={handleCancle}
                                disabled={disable}
                                size="small"
                              >
                                <img
                                  src={`./themes/${mode}/icons/clear.png`}
                                  alt="Cancel"
                                  style={{ width: "16px", height: "16px" }}
                                />
                              </GalaxySecure.GLIconButton2>

                              <GalaxySecure.GLIconButton2
                                permission="items_5_saveChangesEdit"
                                uiText="generic_0_save"
                                fallBackText="Save Changes"
                                type="submit"
                                disabled={disable}
                                size="small"
                              >
                                <img
                                  src={`./themes/${mode}/icons/save.png`}
                                  alt="Save Changes"
                                  style={{ width: "16px", height: "16px" }}
                                />
                              </GalaxySecure.GLIconButton2>
                            </Box>
                          )}
                        </Box>
                        <Grid2
                          container
                          columns={48}
                          mt={1.5}
                          justifyContent="start"
                          alignItems="flex-start"
                          spacing={1.5}
                          rowSpacing={2}
                        >
                          <Grid2
                            size={{ xs: 15 }}
                            container
                            columns={12}
                            spacing={1.5}
                          >
                            <Stack spacing={1.5} width="100%" direction="row">
                              <Grid2 size={{ xs: 5 }}>
                                <Field name="item_bk">
                                  {({ field }: FieldProps) => (
                                    <TextField
                                      label={t("items_5_Code") || "Code"}
                                      disabled={disable}
                                      {...field}
                                      value={field.value ?? ""}
                                      id="item_bk"
                                      type="text"
                                      variant="outlined"
                                      fullWidth
                                      error={
                                        touched.item_bk &&
                                        Boolean(errors.item_bk)
                                      }
                                      helperText={
                                        touched.item_bk && errors.item_bk
                                          ? errors.item_bk
                                          : ""
                                      }
                                      sx={{
                                        "& .MuiFormHelperText-root": {
                                          color:
                                            touched.item_bk && errors.item_bk
                                              ? "red !important"
                                              : undefined,
                                        },
                                      }}
                                    />
                                  )}
                                </Field>
                              </Grid2>
                              <Grid2 size={{ xs: 5 }}>
                                <Field name="legacy_code">
                                  {({ field }: FieldProps) => (
                                    <TextField
                                      label={
                                        t("items_5_LegacyCode") || "Legacy code"
                                      }
                                      disabled={disable}
                                      {...field}
                                      value={field.value ?? ""}
                                      id="legacy_code"
                                      type="text"
                                      variant="outlined"
                                      fullWidth
                                      error={
                                        touched.legacy_code &&
                                        Boolean(errors.legacy_code)
                                      }
                                      helperText={
                                        touched.legacy_code &&
                                        errors.legacy_code
                                          ? errors.legacy_code
                                          : ""
                                      }
                                      sx={{
                                        "& .MuiFormHelperText-root": {
                                          color:
                                            touched.legacy_code &&
                                            errors.legacy_code
                                              ? "red !important"
                                              : undefined,
                                        },
                                      }}
                                    />
                                  )}
                                </Field>
                              </Grid2>
                              <Grid2 size={{ xs: 5 }}>
                                <Field name="national_drug_code">
                                  {({ field }: FieldProps) => (
                                    <TextField
                                      label={
                                        t("items_5_SFDACode") || "SFDA Code"
                                      }
                                      disabled={disable}
                                      {...field}
                                      value={field.value ?? ""}
                                      id="national_drug_code"
                                      variant="outlined"
                                      fullWidth
                                      type="text"
                                      error={
                                        touched.national_drug_code &&
                                        Boolean(errors.national_drug_code)
                                      }
                                      helperText={
                                        touched.national_drug_code &&
                                        errors.national_drug_code
                                          ? errors.national_drug_code
                                          : ""
                                      }
                                      sx={{
                                        "& .MuiFormHelperText-root": {
                                          color:
                                            touched.national_drug_code &&
                                            errors.national_drug_code
                                              ? "red !important"
                                              : undefined,
                                        },
                                      }}
                                      slotProps={{
                                        inputLabel: {
                                          shrink: true,
                                        },
                                      }}
                                    />
                                  )}
                                </Field>
                              </Grid2>
                            </Stack>

                            <Stack width="100%" direction="row" spacing={1.5}>
                              <Field name="scientific_code">
                                {({ field }: FieldProps) => (
                                  <TextField
                                    label={
                                      t("items_5_ScientificCode") ||
                                      "Scientific Code"
                                    }
                                    type="text"
                                    disabled={disable}
                                    {...field}
                                    value={field.value ?? ""}
                                    id="scientific_code"
                                    variant="outlined"
                                    fullWidth
                                    error={
                                      touched.scientific_code &&
                                      Boolean(errors.scientific_code)
                                    }
                                    helperText={
                                      touched.scientific_code &&
                                      errors.scientific_code
                                        ? errors.scientific_code
                                        : ""
                                    }
                                    sx={{
                                      "& .MuiFormHelperText-root": {
                                        color:
                                          touched.scientific_code &&
                                          errors.scientific_code
                                            ? "red !important"
                                            : undefined,
                                      },
                                    }}
                                    slotProps={{
                                      inputLabel: {
                                        shrink: true,
                                      },
                                    }}
                                  />
                                )}
                              </Field>
                              <Grid2 size={{ xs: 5 }}>
                                <Field name="his_item_id">
                                  {({ field }: FieldProps) => (
                                    <TextField
                                      label={
                                        t("items_5_HISItemId") || "HIS Item ID"
                                      }
                                      disabled={disable}
                                      {...field}
                                      value={field.value ?? ""}
                                      id="his_item_id"
                                      variant="outlined"
                                      fullWidth
                                      type="text"
                                      error={
                                        touched.his_item_id &&
                                        Boolean(errors.his_item_id)
                                      }
                                      helperText={
                                        touched.his_item_id &&
                                        errors.his_item_id
                                          ? errors.his_item_id
                                          : ""
                                      }
                                      sx={{
                                        "& .MuiFormHelperText-root": {
                                          color:
                                            touched.his_item_id &&
                                            errors.his_item_id
                                              ? "red !important"
                                              : undefined,
                                        },
                                      }}
                                      slotProps={{
                                        inputLabel: {
                                          shrink: true,
                                        },
                                      }}
                                    />
                                  )}
                                </Field>
                              </Grid2>
                            </Stack>

                            <Stack spacing={1.5} width="100%" direction="row">
                              <Grid2 size={{ xs: 7.5 }}>
                                <Field name="sales_uom_code">
                                  {({ field }: FieldProps) => (
                                    <TextField
                                      {...field}
                                      value={field.value ?? ""}
                                      label={
                                        t("items_5_SalesUOM") || "Sales UOM :"
                                      }
                                      id="sales_uom_code"
                                      variant="outlined"
                                      disabled={disable}
                                      fullWidth
                                      error={
                                        touched.sales_uom_code &&
                                        Boolean(errors.sales_uom_code)
                                      }
                                      helperText={
                                        touched.sales_uom_code &&
                                        errors.sales_uom_code
                                          ? errors.sales_uom_code
                                          : ""
                                      }
                                      sx={{
                                        "& .MuiFormHelperText-root": {
                                          color:
                                            touched.sales_uom_code &&
                                            errors.sales_uom_code
                                              ? "red !important"
                                              : undefined,
                                        },
                                      }}
                                    />
                                  )}
                                </Field>
                              </Grid2>
                              <Grid2 size={{ xs: 7.5 }}>
                                <Field name="sales_conv_factor">
                                  {({ field, form }: FieldProps) => (
                                    <TextField
                                      {...field}
                                      value={field.value ?? ""}
                                      label={
                                        t("items_5_ConvFactor") ||
                                        "Conv Factor :"
                                      }
                                      disabled={disable}
                                      id="sales_conv_factor"
                                      type="number"
                                      onChange={(event: any) => {
                                        const value = event.target.value;
                                        if (/^\d*\.?\d*$/.test(value)) {
                                          form.setFieldValue(
                                            "sales_conv_factor",
                                            value === "" ? "" : Number(value),
                                          );
                                        }
                                      }}
                                      onKeyDown={(event: any) => {
                                        if (
                                          ["-", "+", "e", "E"].includes(
                                            event.key,
                                          )
                                        ) {
                                          event.preventDefault();
                                        }
                                      }}
                                      inputProps={{ min: 0 }}
                                      variant="outlined"
                                      fullWidth
                                      error={
                                        touched.sales_conv_factor &&
                                        Boolean(errors.sales_conv_factor)
                                      }
                                      helperText={
                                        touched.sales_conv_factor &&
                                        errors.sales_conv_factor
                                          ? errors.sales_conv_factor
                                          : ""
                                      }
                                      sx={{
                                        "& .MuiFormHelperText-root": {
                                          color:
                                            touched.sales_conv_factor &&
                                            errors.sales_conv_factor
                                              ? "red !important"
                                              : undefined,
                                        },
                                      }}
                                      slotProps={{
                                        inputLabel: {
                                          shrink: true,
                                        },
                                      }}
                                    />
                                  )}
                                </Field>
                              </Grid2>
                            </Stack>

                            <Stack spacing={1.5} width="100%" direction="row">
                              <Grid2 size={{ xs: 5 }}>
                                <Field name="pharmacy_type">
                                  {({ field, form }: FieldProps) => (
                                    <FormControlLabel
                                      sx={{
                                        color: disable ? "lightGray" : "black",
                                        transition: "color 0.3s ease",
                                        flex: 1,
                                      }}
                                      control={
                                        <Checkbox
                                          disabled={disable}
                                          {...field}
                                          id="pharmacy_type"
                                          name="pharmacy_type"
                                          checked={
                                            form.values.pharmacy_type === "Y"
                                          }
                                          onChange={(e) =>
                                            handleChange(e, form.setFieldValue)
                                          }
                                        />
                                      }
                                      label={
                                        t("items_5_Pharmacy") || "Pharmacy"
                                      }
                                      labelPlacement="end"
                                    />
                                  )}
                                </Field>
                              </Grid2>
                              <Grid2 size={{ xs: 10 }}>
                                <Field name="drug_dispensing_type">
                                  {({ field }: FieldProps) => (
                                    <TextField
                                      disabled={disable}
                                      {...field}
                                      value={field.value ?? ""}
                                      label={
                                        t("items_5_DragDispensing") ||
                                        "Drag Dispensing"
                                      }
                                      id="drug_dispensing_type"
                                      variant="outlined"
                                      fullWidth
                                      error={
                                        touched.drug_dispensing_type &&
                                        Boolean(errors.drug_dispensing_type)
                                      }
                                      helperText={
                                        touched.drug_dispensing_type &&
                                        errors.drug_dispensing_type
                                          ? errors.drug_dispensing_type
                                          : ""
                                      }
                                      sx={{
                                        "& .MuiFormHelperText-root": {
                                          color:
                                            touched.drug_dispensing_type &&
                                            errors.drug_dispensing_type
                                              ? "red !important"
                                              : undefined,
                                        },
                                      }}
                                      slotProps={{
                                        inputLabel: {
                                          shrink: true,
                                        },
                                      }}
                                    />
                                  )}
                                </Field>
                              </Grid2>
                            </Stack>
                          </Grid2>

                          <Grid2
                            size={{ xs: 21 }}
                            container
                            columns={21}
                            spacing={1.5}
                          >
                            <Field name="nphies_service_type">
                              {({ field, form }: FieldProps) => (
                                <Autocomplete
                                  disabled={disable}
                                  id="nphies_service_type"
                                  options={nphies}
                                  getOptionLabel={(option) =>
                                    `${option.user_code} - ${option.description}`
                                  }
                                  value={
                                    nphies.find(
                                      (c) => c.user_code === field.value,
                                    ) || null
                                  }
                                  onChange={(_, newValue) => {
                                    form.setFieldValue(
                                      "nphies_service_type",
                                      newValue?.user_code || "",
                                    );
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      disabled={disable}
                                      {...params}
                                      label={
                                        t("items_5_NphiesType") || "Nphies Type"
                                      }
                                      slotProps={{
                                        inputLabel: {
                                          shrink: true,
                                        },
                                      }}
                                      placeholder={
                                        t("items_5_SelectCategory") ||
                                        "Select a category"
                                      }
                                      variant="outlined"
                                    />
                                  )}
                                  isOptionEqualToValue={(option, value) =>
                                    option.user_code === value.user_code
                                  }
                                  fullWidth
                                />
                              )}
                            </Field>
                            <Stack spacing={1.5} direction="row" width="100%">
                              <Field name="inventory">
                                {({ field, form }: FieldProps) => (
                                  <FormControlLabel
                                    sx={{
                                      color: disable ? "lightGray" : "black",
                                      transition: "color 0.3s ease",
                                    }}
                                    control={
                                      <Checkbox
                                        disabled={disable}
                                        {...field}
                                        id="inventory"
                                        name="inventory"
                                        checked={form.values.inventory === "Y"}
                                        onChange={(e) =>
                                          handleChange(e, form.setFieldValue)
                                        }
                                      />
                                    }
                                    label={
                                      t("items_5_Inventory") || "Inventory"
                                    }
                                    labelPlacement="end"
                                  />
                                )}
                              </Field>
                              <Field name="inventory_price">
                                {({ field, form }: FieldProps) => (
                                  <FormControlLabel
                                    sx={{
                                      color: disable ? "lightGray" : "black",
                                      transition: "color 0.3s ease",
                                    }}
                                    control={
                                      <Checkbox
                                        disabled={disable}
                                        {...field}
                                        id="inventory_price"
                                        name="inventory_price"
                                        checked={
                                          form.values.inventory_price === "Y"
                                        }
                                        onChange={(e) =>
                                          handleChange(e, form.setFieldValue)
                                        }
                                      />
                                    }
                                    label={
                                      t("items_5_InventoryPrice") ||
                                      "Inventory Price"
                                    }
                                    labelPlacement="end"
                                  />
                                )}
                              </Field>

                              <Field name="stocked_indicator">
                                {({ field, form }: FieldProps) => (
                                  <FormControlLabel
                                    sx={{
                                      color: disable ? "lightGray" : "black",
                                      transition: "color 0.3s ease",
                                    }}
                                    control={
                                      <Checkbox
                                        disabled={disable}
                                        {...field}
                                        id="stocked_indicator"
                                        name="stocked_indicator"
                                        checked={
                                          form.values.stocked_indicator === "Y"
                                        }
                                        onChange={(e) =>
                                          handleChange(e, form.setFieldValue)
                                        }
                                      />
                                    }
                                    label={
                                      t("items_5_StockedIndicator") ||
                                      "Stocked Indicator"
                                    }
                                    labelPlacement="end"
                                  />
                                )}
                              </Field>
                            </Stack>

                            <Stack spacing={1.5} width="100%" direction="row">
                              <Field name="category_code">
                                {({ field, form }: FieldProps) => (
                                  <Autocomplete
                                    disabled={disable}
                                    id="category_code"
                                    options={groups}
                                    getOptionLabel={(option) =>
                                      `${option.user_code} - ${option.description}`
                                    }
                                    value={
                                      groups.find(
                                        (c) => c.user_code === field.value,
                                      ) || null
                                    }
                                    onChange={(_, newValue) => {
                                      form.setFieldValue(
                                        "category_code",
                                        newValue?.user_code || "",
                                      );
                                      form.setFieldValue(
                                        "sub_category_code",
                                        "",
                                      );
                                    }}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        label={
                                          t("items_5_Category") || "Category"
                                        }
                                        InputLabelProps={{ shrink: true }}
                                        placeholder={
                                          t("items_5_SelectCategory") ||
                                          "Select a category"
                                        }
                                        variant="outlined"
                                      />
                                    )}
                                    isOptionEqualToValue={(option, value) =>
                                      option.user_code === value.user_code
                                    }
                                    fullWidth
                                  />
                                )}
                              </Field>

                              <Field name="sub_category_code">
                                {({ field, form }: FieldProps) => {
                                  const filteredSubcategories = form.values
                                    .category_code
                                    ? groups.find(
                                        (c) =>
                                          c.user_code ===
                                          form.values.category_code,
                                      )?.sub_codes || []
                                    : [];

                                  return (
                                    <Autocomplete
                                      id="sub_category_code"
                                      options={filteredSubcategories}
                                      getOptionLabel={(option) =>
                                        `${option.user_code} - ${option.description}`
                                      }
                                      value={
                                        filteredSubcategories.find(
                                          (c) => c.user_code === field.value,
                                        ) || null
                                      }
                                      onChange={(_, newValue) => {
                                        form.setFieldValue(
                                          "sub_category_code",
                                          newValue?.user_code || "",
                                        );
                                      }}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label={
                                            t("items_5_SubCategory") ||
                                            "Sub Category"
                                          }
                                          InputLabelProps={{ shrink: true }}
                                          placeholder={
                                            t("items_5_SelectSubcategory") ||
                                            "Select a subcategory"
                                          }
                                          variant="outlined"
                                          disabled={
                                            !form.values.category_code ||
                                            disable
                                          }
                                        />
                                      )}
                                      isOptionEqualToValue={(option, value) =>
                                        option.user_code === value.user_code
                                      }
                                      disabled={
                                        disable || !form.values.category_code
                                      }
                                      fullWidth
                                    />
                                  );
                                }}
                              </Field>
                            </Stack>

                            <Field name="vat_cat_type">
                              {({ field, form }: FieldProps) => (
                                <Autocomplete
                                  disabled={disable}
                                  id="vat_cat_type"
                                  options={vats}
                                  getOptionLabel={(option) =>
                                    `${option.user_code} - ${option.description}`
                                  }
                                  value={
                                    vats.find(
                                      (c) => c.user_code === field.value,
                                    ) || null
                                  }
                                  onChange={(_, newValue) => {
                                    form.setFieldValue(
                                      "vat_cat_type",
                                      newValue?.user_code || "",
                                    );
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label={
                                        t("items_5_VatCategory") ||
                                        " Vat Category"
                                      }
                                      slotProps={{
                                        inputLabel: {
                                          shrink: true,
                                        },
                                      }}
                                      placeholder={
                                        t("items_5_SelectCategory") ||
                                        "Select a category"
                                      }
                                      variant="outlined"
                                    />
                                  )}
                                  isOptionEqualToValue={(option, value) =>
                                    option.user_code === value.user_code
                                  }
                                  fullWidth
                                />
                              )}
                            </Field>
                          </Grid2>

                          <Grid2 size={{ xs: 6 }}>
                            <Stack spacing={1.5}>
                              <Field name="activity_indicator">
                                {({ field, form }: FieldProps) => (
                                  <FormControlLabel
                                    sx={{
                                      color: disable ? "lightGray" : "black",
                                      transition: "color 0.3s ease",
                                      flex: 1,
                                    }}
                                    control={
                                      <Checkbox
                                        disabled={disable}
                                        name="activity_indicator"
                                        id="activity_indicator"
                                        checked={
                                          form.values.activity_indicator === "Y"
                                        }
                                        onChange={(e) =>
                                          handleChange(e, form.setFieldValue)
                                        }
                                      />
                                    }
                                    label={t("items_5_Active") || "Active"}
                                    labelPlacement="end"
                                  />
                                )}
                              </Field>

                              <Field name="orderable">
                                {({ field, form }: FieldProps) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        disabled={disable}
                                        id="orderable"
                                        name="orderable"
                                        checked={form.values.orderable === "Y"}
                                        onChange={(e) =>
                                          handleChange(e, form.setFieldValue)
                                        }
                                      />
                                    }
                                    label={
                                      t("items_5_Orderable") || "Orderable"
                                    }
                                    labelPlacement="end"
                                  />
                                )}
                              </Field>

                              <Field name="generic_id">
                                {({ field, form }: FieldProps) => (
                                  <TextField
                                    {...field}
                                    value={field.value ?? ""}
                                    label={t("items_5_Generic") || "Generic :"}
                                    id="generic_id"
                                    disabled={disable}
                                    type="number"
                                    onChange={(event: any) => {
                                      const value = event.target.value;
                                      if (/^\d*\.?\d*$/.test(value)) {
                                        form.setFieldValue(
                                          "generic_id",
                                          value === "" ? "" : Number(value),
                                        );
                                      }
                                    }}
                                    onKeyDown={(event: any) => {
                                      if (
                                        ["-", "+", "e", "E"].includes(event.key)
                                      ) {
                                        event.preventDefault();
                                      }
                                    }}
                                    inputProps={{ min: 0 }}
                                    variant="outlined"
                                    fullWidth
                                    error={
                                      touched.generic_id &&
                                      Boolean(errors.generic_id)
                                    }
                                    helperText={
                                      touched.generic_id && errors.generic_id
                                        ? errors.generic_id
                                        : ""
                                    }
                                    sx={{
                                      "& .MuiFormHelperText-root": {
                                        color:
                                          touched.generic_id &&
                                          errors.generic_id
                                            ? "red !important"
                                            : undefined,
                                      },
                                    }}
                                    slotProps={{
                                      inputLabel: {
                                        shrink: true,
                                      },
                                    }}
                                  />
                                )}
                              </Field>

                              <Field name="brand_generic_id">
                                {({ field, form }: FieldProps) => (
                                  <TextField
                                    {...field}
                                    value={field.value ?? ""}
                                    label={
                                      t("items_5_BrandGeneric") ||
                                      "Brand Generic :"
                                    }
                                    disabled={disable}
                                    id="brand_generic_id"
                                    type="number"
                                    onChange={(event: any) => {
                                      const value = event.target.value;
                                      if (/^\d*\.?\d*$/.test(value)) {
                                        form.setFieldValue(
                                          "brand_generic_id",
                                          value === "" ? "" : Number(value),
                                        );
                                      }
                                    }}
                                    onKeyDown={(event: any) => {
                                      if (
                                        ["-", "+", "e", "E"].includes(event.key)
                                      ) {
                                        event.preventDefault();
                                      }
                                    }}
                                    inputProps={{ min: 0 }}
                                    variant="outlined"
                                    fullWidth
                                    error={
                                      touched.brand_generic_id &&
                                      Boolean(errors.brand_generic_id)
                                    }
                                    helperText={
                                      touched.brand_generic_id &&
                                      errors.brand_generic_id
                                        ? errors.brand_generic_id
                                        : ""
                                    }
                                    sx={{
                                      "& .MuiFormHelperText-root": {
                                        color:
                                          touched.brand_generic_id &&
                                          errors.brand_generic_id
                                            ? "red !important"
                                            : undefined,
                                      },
                                    }}
                                    slotProps={{
                                      inputLabel: {
                                        shrink: true,
                                      },
                                    }}
                                  />
                                )}
                              </Field>
                            </Stack>
                          </Grid2>

                          <Grid2 size={{ xs: 6 }}>
                            <Stack spacing={1.5}>
                              <Secure.GLTextField
                                resource_key="items_5_CreatedBy"
                                fullWidth
                                name="created_by"
                                label={t("items_5_CreatedBy") || "Created By"}
                                size="small"
                                value={selectedItem?.created_by?.user_name ?? ""}
                                disabled={true}
                                color="whiteField"
                              />

                              <Secure.GLTextField
                                resource_key="items_5_CreationDate"
                                fullWidth
                                name="creation_date"
                                label={
                                  t("items_5_CreationDate") || "Creation Date"
                                }
                                size="small"
                                value={
                                  selectedItem?.creation_date
                                    ? formatDate(
                                        selectedItem.creation_date,
                                        "DATE_FORMAT",
                                      )
                                    : ""
                                }
                                disabled={true}
                                color="whiteField"
                              />

                              <Secure.GLTextField
                                resource_key="items_5_ModifyBy"
                                fullWidth
                                name="modified_by"
                                label={t("items_5_ModifyBy") || "Modify By"}
                                size="small"
                                value={selectedItem?.modified_by?.user_name ?? ""}
                                disabled={true}
                                color="whiteField"
                              />
                              <Secure.GLTextField
                                resource_key="items_5_ModificationDate"
                                fullWidth
                                name="modification_date"
                                label={
                                  t("items_5_ModificationDate") ||
                                  "Modification Date"
                                }
                                size="small"
                                value={
                                  selectedItem?.modification_date
                                    ? formatDate(
                                        selectedItem.modification_date,
                                        "DATE_FORMAT",
                                      )
                                    : ""
                                }
                                disabled={true}
                                color="whiteField"
                              />
                            </Stack>
                          </Grid2>

                          <Grid2
                            size={{ xs: 48 }}
                            container
                            columns={48}
                            spacing={1.5}
                          >
                            <Grid2 size={{ xs: 15 }} container spacing={1.5} columns={15}>
                              <Stack direction="row" spacing={1.5} width="100%">
                                <Grid2 size={{ xs: 7.5 }}>
                                  <Field name="standard_price_editable">
                                    {({ field, form }: FieldProps) => (
                                      <FormControlLabel
                                        sx={{
                                          color: disable
                                            ? "lightGray"
                                            : "black",
                                          transition: "color 0.3s ease",
                                          width: "100%",
                                        }}
                                        control={
                                          <Checkbox
                                            disabled={disable}
                                            {...field}
                                            id="standard_price_editable"
                                            checked={
                                              form.values
                                                .standard_price_editable === "Y"
                                            }
                                            onChange={(e) =>
                                              handleChange(
                                                e,
                                                form.setFieldValue,
                                              )
                                            }
                                          />
                                        }
                                        label={
                                          t("items_5_StandardPriceEditable") ||
                                          "Standard Price Editable"
                                        }
                                        labelPlacement="end"
                                      />
                                    )}
                                  </Field>
                                </Grid2>

                                <Grid2 size={{ xs: 7.5 }}>
                                  <Field name="external_doctor_price_editable">
                                    {({ field, form }: FieldProps) => (
                                      <FormControlLabel
                                        sx={{
                                          color: disable
                                            ? "lightGray"
                                            : "black",
                                          transition: "color 0.3s ease",
                                        }}
                                        control={
                                          <Checkbox
                                            disabled={disable}
                                            {...field}
                                            id="external_doctor_price_editable"
                                            name="external_doctor_price_editable"
                                            checked={
                                              form.values
                                                .external_doctor_price_editable ===
                                              "Y"
                                            }
                                            onChange={(e) =>
                                              handleChange(
                                                e,
                                                form.setFieldValue,
                                              )
                                            }
                                          />
                                        }
                                        label={
                                          t(
                                            "items_5_ExternalDoctorPriceEditable",
                                          ) || "External Doctor Price Editable"
                                        }
                                        labelPlacement="end"
                                      />
                                    )}
                                  </Field>
                                </Grid2>
                              </Stack>
                            </Grid2>
                            <Grid2 size={{ xs: 20 }}>
                              <Field name="long_description">
                                {({ field }: FieldProps) => (
                                  <TextField
                                    disabled={disable}
                                    {...field}
                                    value={field.value ?? ""}
                                    label={
                                      t("items_5_LongDescription") ||
                                      "Long Description"
                                    }
                                    id="long_description"
                                    type="text"
                                    // value={formValues.long_description}
                                    variant="outlined"
                                    fullWidth
                                    error={
                                      touched.long_description &&
                                      Boolean(errors.long_description)
                                    }
                                    helperText={
                                      touched.long_description &&
                                      errors.long_description
                                        ? errors.long_description
                                        : ""
                                    }
                                    sx={{
                                      mb: 2,
                                      "& .MuiFormHelperText-root": {
                                        color:
                                          touched.long_description &&
                                          errors.long_description
                                            ? "red !important"
                                            : undefined,
                                      },
                                    }}
                                  />
                                )}
                              </Field>
                            </Grid2>
                            <Grid2 size={{ xs: 13 }}>
                              <Field name="description">
                                {({ field }: FieldProps) => (
                                  <TextField
                                    label={
                                      t("items_5_DescriptionColon") ||
                                      " Description :"
                                    }
                                    disabled={disable}
                                    {...field}
                                    value={field.value ?? ""}
                                    id="description"
                                    type="text"
                                    variant="outlined"
                                    fullWidth
                                    error={
                                      touched.description &&
                                      Boolean(errors.description)
                                    }
                                    helperText={
                                      touched.description && errors.description
                                        ? errors.description
                                        : ""
                                    }
                                    sx={{
                                      "& .MuiFormHelperText-root": {
                                        color:
                                          touched.description &&
                                          errors.description
                                            ? "red !important"
                                            : undefined,
                                      },
                                    }}
                                  />
                                )}
                              </Field>
                            </Grid2>
                          </Grid2>
                        </Grid2>
                      </Stack>
                    </CardContent>
                  </Card>
                </Form>
              );
            }}
          </Formik>
        </Box>
      </>
    );
  }
};
export default ItemDetail;
