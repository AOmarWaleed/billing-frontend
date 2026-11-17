import React, { useContext, useEffect, useState } from "react";
import { Formik, Form, Field, FieldProps } from "formik";
import {
  TextField,
  Button,
  Box,
  Typography,
  Autocomplete,
} from "@mui/material";
import { useAppSelector } from "../../hooks/hooks";
import api from "../../utils/Api";
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
} from "@mui/material";
import { PackageItem } from "../../types/PackageSetup";
import { AuthGuardContext } from "../../shared/core/AuthGuard";

interface Category {
  code: string;
  user_code: string;
  description: string;
}

interface Item {
  id: number;
  description: string;
  category_code: string;
}

// interface LimitCategoryValues {
//   item_category: string | null;
//   relation: string;
//   limit_amount: string;
//   limit_day_amount: string;
//     limit_amount_exclude?: "EXCEEDED" | "ALL";

// }

interface LimitCategoryFormProps {
  initialValues: Partial<PackageItem>;
  onSubmit: (values: PackageItem) => void;
  onClose: () => void;
  error?: string;
  isUpdate: boolean;
}

const emptyInit: PackageItem = {
  item_category: null,
  relation: "",
  limit_quantity: null,
  limit_amount: null,
  limit_day_amount: null,
  limit_amount_exclude: "ALL",
  package_conf_id: "",
  package_item_id: "",
  payer_id: "",
  item_id: "",
  status: "ACTIVE",
  // created_by: null,
  // facility_id: null,
  // creation_date: null,
};

const LimitCategoryForm: React.FC<LimitCategoryFormProps> = ({
  initialValues,
  onSubmit,
  onClose,
  error,
  isUpdate,
}) => {
  const { category } = useAppSelector((state) => state.package); // ✅ array
  const [items, setItems] = useState<Item[]>([]);

  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;

  useEffect(() => {
    if (initialValues.item_category) {
      api
        .get(
          `/api/itemgroup/items?category_code=${initialValues.item_category}`,
        )
        .then((res) => setItems(res.data.data || []));
    }
  }, [initialValues.item_category]);

  const validateForm = (values: PackageItem) => {
    const errors: any = {};
    if (!values.item_category) errors.item_category = "Category is required";
    // if (!values.relation) errors.relation = "Relation is required";
    if (!values.limit_amount && !values.limit_day_amount) {
      errors.at_lest_one = "At least one limit is required";
    }
    return errors;
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 2 }}>
      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      <Formik
        enableReinitialize
        initialValues={{ ...emptyInit, ...initialValues }}
        validate={validateForm}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors, touched }) => {
          const selectedCategory =
            category.find((c) => c.code === values.item_category) || null;

          return (
            <Form>
              <Typography color="error" variant="body2" mb={2}>
                {(touched.limit_amount || touched.limit_day_amount) &&
                errors.at_lest_one
                  ? "At least one limit is required"
                  : ""}
              </Typography>

              {/* Category */}
              <Box mb={2}>
                <Typography>{t("packageSetup_15_CategoryRequired")}</Typography>
                <Field name="item_category">
                  {() => (
                    <Autocomplete
                      options={category}
                      getOptionLabel={(option) =>
                        `${option.code} - ${option.user_code} - ${option.description}`
                      }
                      value={selectedCategory}
                      onChange={(_, newValue) => {
                        setFieldValue("item_category", newValue?.code || null);
                        // setFieldValue("exclude_items", []);
                        // setItems([]);
                        // if (newValue) {
                        //   api
                        //     .get(
                        //       `/api/itemgroup/items?category_code=${newValue.user_code}`
                        //     )
                        //     .then((res) => setItems(res.data.data));
                        // }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select category"
                          error={
                            touched.item_category && !!errors.item_category
                          }
                          helperText={
                            touched.item_category && errors.item_category
                          }
                        />
                      )}
                    />
                  )}
                </Field>
              </Box>

              {/* Limits */}
              {/* <Box mb={2}>
                <Typography>Limit Quantity </Typography>
                <Field name="limit_quantity">
                  {({ field }: FieldProps) => (
                    <TextField {...field} type="number" fullWidth />
                  )}
                </Field>
              </Box> */}

              <Box mb={2}>
                <Typography>{t("packageSetup_15_LimitAmount")}</Typography>
                <Field name="limit_amount">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || Number(value) >= 0) {
                          setFieldValue("limit_amount", value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key.toLowerCase() === "e") {
                          e.preventDefault();
                        }
                      }}
                    />
                  )}
                </Field>
              </Box>

              <Box mb={2}>
                {t("packageSetup_15_DayLimit")}
                <Typography></Typography>
                <Field name="limit_day_amount">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || Number(value) >= 0) {
                          setFieldValue("limit_day_amount", value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key.toLowerCase() === "e") {
                          e.preventDefault();
                        }
                      }}
                    />
                  )}
                </Field>
              </Box>

              {/* Exclude Items */}
              {/* {items.length > 0 && (
                <Box mb={2}>
                  <Typography>Exclude Items</Typography>
                  <Field name="exclude_items">
                    {() => (
                      <Autocomplete
                        multiple
                        options={items}
                        getOptionLabel={(option) => `${option.id} - ${option.description}`}
                        value={items.filter((i) => values.exclude_items.includes(i.id))}
                        onChange={(_, newValue) =>
                          setFieldValue(
                            "exclude_items",
                            newValue.map((i) => i.id)
                          )
                        }
                        renderInput={(params) => <TextField {...params} placeholder="Select items" />}
                      />
                    )}
                  </Field>
                </Box>
              )} */}

              <Box mb={2}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    {" "}
                    {t("packageSetup_15_LimitAmountExclude")}
                  </FormLabel>
                  <Field name="limit_amount_exclude">
                    {({ field }: FieldProps) => (
                      <RadioGroup
                        row
                        {...field}
                        value={field.value || "ALL"}
                        onChange={(e) =>
                          setFieldValue("limit_amount_exclude", e.target.value)
                        }
                      >
                        <FormControlLabel
                          value="EXCEEDED"
                          control={<Radio size="small" />}
                          label={t("packageSetup_15_EXCEEDED")}
                        />
                        <FormControlLabel
                          value="ALL"
                          control={<Radio size="small" />}
                          label={t("packageSetup_15_ALL")}
                        />
                      </RadioGroup>
                    )}
                  </Field>
                </FormControl>
              </Box>
              {/* Actions */}
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={onClose}>
                  {t("packageSetup_15_Cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!values.item_category || !values.limit_amount}
                >
                  {isUpdate
                    ? t("packageSetup_15_Update")
                    : t("packageSetup_15_Save")}
                </Button>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default LimitCategoryForm;
