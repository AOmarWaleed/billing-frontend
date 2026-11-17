import React, { useEffect, useState } from "react";
import { Formik, Form, Field, FieldProps } from "formik";
import {
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  Autocomplete,
} from "@mui/material";
import { useAppSelector } from "../../hooks/hooks";
import axios from "../../utils/Api";
import Secure from "../../shared/security";
import { useContext } from "react";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
interface Category {
  code_type: number;
  code: string;
  user_code: string;
  description: string;
  sub_codes: Category[];
}
interface Item {
  id: number;
  description: string;
  category_code: string;
  subCategory: string;
}
interface ItemGroupDetails {
  id?: string;
  item_id: string;
  group_id: string;
  auto_proceed: "ADD" | "REMOVE";
  category_code?: string;
  sub_category_code?: string | null;
}

interface ItemGroupActionFormProps {
  initialValues: ItemGroupDetails;
  onSubmit: (values: ItemGroupDetails) => void;
  onClose: () => void;
  error: string;
  isUpdate: boolean;
  currentGroupId: string;
}

const ItemGroupActionForm: React.FC<ItemGroupActionFormProps> = ({
  initialValues,
  onSubmit,
  onClose,
  error,
}) => {
  const { category } = useAppSelector((state) => state.itemGroup);
  const { t } = useContext(AuthGuardContext);
  // dynamic item list
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    axios
      .get(`/api/itemgroup/items?limit=100`)
      .then((res) => setItems(res.data.data || []));
  }, []);
  const validateForm = (values: any) => {
    const errors: any = {};
    if (!values.item_id.trim()) {
      errors.item_id = "Item is required";
    }
    return errors;
  };
  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 2 }}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validateForm}
      >
        {({ values, setFieldValue, errors, touched }) => {
          const selectedCategory = category.find(
            (c) => c.code === values.category_code,
          );
          const subCategories = selectedCategory?.sub_codes || [];

          return (
            <Form>
              <Box sx={{ height: 24 }}>
                {Object.keys(errors).length > 0 && (
                  <Typography variant="body2" sx={{ color: "red" }}>
                    {Object.values(errors).join(", ")}
                  </Typography>
                )}
              </Box>
              {/* Item */}
              <Box mb={2}>
                <Secure.GLTypography
                  resource_key="itemGroup_14_itemAddItem"
                  variant="body1"
                  sx={{ color: "text.obs" }}
                  gutterBottom
                />

                <Field name="item_id">
                  {({ field }: FieldProps) => (
                    <Secure.GLGenericAutocomplete
                      resource_key="itemGroup_14_itemAddItem"
                      options={items}
                      getOptionLabel={(option) =>
                        `${option.id} - ${option.description}` || ""
                      }
                      value={items.find((i) => i.id === field.value) || null}
                      onChange={(_, newValue) =>
                        setFieldValue("item_id", newValue?.id || "")
                      }
                      onInputChange={(_, inputValue, reason) => {
                        if (
                          reason === "input" &&
                          inputValue.trim().length > 1
                        ) {
                          // if NO category/subcategory selected -> search server
                          if (
                            !values.category_code &&
                            !values.sub_category_code
                          ) {
                            axios
                              .get(
                                `/api/itemgroup/items?search=${encodeURIComponent(
                                  inputValue,
                                )}`,
                              )
                              .then((res) => setItems(res.data.data || []));
                          }
                        }
                      }}
                      renderInput={(params) => (
                        <Secure.GLTextField
                          resource_key="itemGroup_14_itemAddItem"
                          {...params}
                          color="whiteField"
                          placeholder={t("itemGroup_14_itemAddItem")}
                          error={touched.item_id && !!errors.item_id}
                        />
                      )}
                    />
                  )}
                </Field>
              </Box>
              {/* Category */}
              <Box mb={2}>
                <Secure.GLTypography
                  resource_key="itemGroup_14_categoryAddItem"
                  variant="body1"
                  sx={{ color: "text.obs" }}
                  gutterBottom
                />

                <Field name="category_code">
                  {({ field }: FieldProps) => (
                    <Secure.GLGenericAutocomplete
                      resource_key="itemGroup_14_categoryAddItem"
                      options={category}
                      getOptionLabel={(option) =>
                        `${option.user_code} - ${option.description}` || ""
                      }
                      value={
                        category.find((c) => c.code === field.value) || null
                      }
                      onChange={(_, newValue) => {
                        setFieldValue("category_code", newValue?.code || "");
                        setFieldValue("sub_category_code", "");
                        setFieldValue("item_id", "");
                        setItems([]);

                        if (newValue) {
                          // check if subcategories exist
                          if (
                            newValue.sub_codes &&
                            newValue.sub_codes.length > 0
                          ) {
                            // wait for user to select subcategory
                          } else {
                            // no subcategories -> fetch items for category
                            axios
                              .get(
                                `/api/itemgroup/items?category_code=${newValue.user_code}`,
                              )
                              .then((res) => setItems(res.data.data));
                          }
                        }
                      }}
                      renderInput={(params) => (
                        <Secure.GLTextField
                          resource_key="itemGroup_14_categoryAddItem"
                          {...params}
                          color="whiteField"
                          placeholder={t("itemGroup_14_categoryAddItem")}
                        />
                      )}
                    />
                  )}
                </Field>
              </Box>
              {/* <Secure.GLLabelAndField
                resource_key="itemgroup_14_category"
                wrapperProps={{ mb: 2 }}
                labelProps={{
                  variant: "body1",
                  sx: { color: "text.obs" },
                  gutterBottom: true,
                }}
                name="category_code"
              >
                {({ field }: FieldProps) => (
                  <Autocomplete
                    options={category}
                    getOptionLabel={(option) =>
                      `${option.user_code} - ${option.description}` || ""
                    }
                    value={category.find((c) => c.code === field.value) || null}
                    onChange={(_, newValue) => {
                      setFieldValue("category_code", newValue?.code || "");
                      setFieldValue("sub_category_code", "");
                      setFieldValue("item_id", "");
                      setItems([]);

                      if (newValue) {
                        // check if subcategories exist
                        if (
                          newValue.sub_codes &&
                          newValue.sub_codes.length > 0
                        ) {
                          // wait for user to select subcategory
                        } else {
                          // no subcategories -> fetch items for category
                          axios
                            .get(
                              `/api/itemgroup/items?category_code=${newValue.user_code}`
                            )
                            .then((res) => setItems(res.data.data));
                        }
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        color="whiteField"
                        placeholder="Category"
                      />
                    )}
                  />
                )}
              </Secure.GLLabelAndField> */}
              {/* Sub-Category (from selectedCategory.sub_codes) */}
              <Box mb={2}>
                <Secure.GLTypography
                  resource_key="itemGroup_14_subCategoryAddItem"
                  variant="body1"
                  sx={{ color: "text.obs" }}
                  gutterBottom
                />
                <Field name="sub_category_code">
                  {({ field }: FieldProps) => (
                    <Secure.GLGenericAutocomplete
                      resource_key="itemGroup_14_subCategoryAddItem"
                      options={subCategories}
                      getOptionLabel={(option) =>
                        `${option.user_code} - ${option.description}` || ""
                      }
                      value={
                        subCategories.find((sc) => sc.code === field.value) ||
                        null
                      }
                      onChange={(_, newValue) => {
                        setFieldValue(
                          "sub_category_code",
                          newValue?.code || "",
                        );
                        setFieldValue("item_id", "");
                        setItems([]);

                        const category = values.category_code;
                        if (newValue) {
                          // subcategory selected -> fetch by category + subcategory
                          axios
                            .get(
                              `/api/itemgroup/items?category_code=${category}&sub_category_code=${newValue.code}`,
                            )
                            .then((res) => setItems(res.data.data));
                        } else if (category) {
                          // subcategory cleared -> fetch by category
                          axios
                            .get(
                              `/api/itemgroup/items?category_code=${category}`,
                            )
                            .then((res) => setItems(res.data.data));
                        }
                      }}
                      renderInput={(params) => (
                        <Secure.GLTextField
                          resource_key="itemGroup_14_subCategoryAddItem"
                          {...params}
                          color="whiteField"
                          placeholder={t("itemGroup_14_subCategoryAddItem")}
                        />
                      )}
                    />
                  )}
                </Field>
              </Box>
              {/* <Secure.GLLabelAndField
                resource_key="itemgroup_14_subCategory"
                wrapperProps={{ mb: 2 }}
                labelProps={{
                  variant: "body1",
                  sx: { color: "text.obs" },
                  gutterBottom: true,
                }}
                name="sub_category_code"
              >
                {({ field }: FieldProps) => (
                  <Autocomplete
                    options={subCategories}
                    getOptionLabel={(option) =>
                      `${option.user_code} - ${option.description}` || ""
                    }
                    value={
                      subCategories.find((sc) => sc.code === field.value) ||
                      null
                    }
                    onChange={(_, newValue) => {
                      setFieldValue("sub_category_code", newValue?.code || "");
                      setFieldValue("item_id", "");
                      setItems([]);

                      const category = values.category_code;
                      if (newValue) {
                        // subcategory selected -> fetch by category + subcategory
                        axios
                          .get(
                            `/api/itemgroup/items?category_code=${category}&sub_category_code=${newValue.code}`
                          )
                          .then((res) => setItems(res.data.data));
                      } else if (category) {
                        // subcategory cleared -> fetch by category
                        axios
                          .get(`/api/itemgroup/items?category_code=${category}`)
                          .then((res) => setItems(res.data.data));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        color="whiteField"
                        placeholder="Sub-Category"
                      />
                    )}
                  />
                )}
              </Secure.GLLabelAndField> */}
              {/* <Secure.GLLabelAndField
                resource_key="itemgroup_14_item"
                wrapperProps={{ mb: 2 }}
                labelProps={{
                  variant: "body1",
                  sx: { color: "text.obs" },
                  gutterBottom: true,
                }}
                name="item_id"
              >
                {({ field }: FieldProps) => (
                  <Autocomplete
                    options={items}
                    getOptionLabel={(option) =>
                      `${option.id} - ${option.description}` || ""
                    }
                    value={items.find((i) => i.id === field.value) || null}
                    onChange={(_, newValue) =>
                      setFieldValue("item_id", newValue?.id || "")
                    }
                    onInputChange={(_, inputValue, reason) => {
                      if (reason === "input" && inputValue.trim().length > 1) {
                        // if NO category/subcategory selected -> search server
                        if (
                          !values.category_code &&
                          !values.sub_category_code
                        ) {
                          axios
                            .get(
                              `/api/itemgroup/items?search=${encodeURIComponent(
                                inputValue
                              )}`
                            )
                            .then((res) => setItems(res.data.data || []));
                        }
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        color="whiteField"
                        placeholder="Item"
                      />
                    )}
                  />
                )}
              </Secure.GLLabelAndField> */}
              <Divider sx={{ my: 3 }} />
              {/* Actions */}
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Secure.GLButton
                  resource_key="itemGroup_14_cancelAddItem"
                  variant="outlined"
                  onClick={onClose}
                />

                <Secure.GLButton
                  resource_key="itemGroup_14_saveAddItem"
                  type="submit"
                  variant="contained"
                  color="primary"
                />
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default ItemGroupActionForm;
