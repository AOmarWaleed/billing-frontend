import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Formik, Form, Field, FieldProps } from "formik";
import {
  TextField,
  Button,
  Box,
  Typography,
  Autocomplete,
} from "@mui/material";
import { useAppSelector } from "../../hooks/hooks";
import axios from "../../utils/Axios";
import ItemSelect, {
  ItemOption,
} from "../../components/paged-autocomplete/ItemSelect";
import { AuthGuardContext } from "../../shared/core/AuthGuard";

interface LimitItemsFormProps {
  initialValues: any;
  onSubmit: (values: any) => void;
  onClose: () => void;
  error?: string;
  isUpdate: boolean;
  parentPackageId: number;
}

interface Item {
  id: number;
  description: string;
  category_code: string | null;
  subCategory: string;
}

const emptyInit = {
  item_id: null,
  limit_quantity: "",
  limit_amount: "",
  limit_day_amount: "",
};

const LimitItemsForm: React.FC<LimitItemsFormProps> = ({
  initialValues,
  onSubmit,
  onClose,
  error,
  isUpdate,
  parentPackageId,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // ✅ local state to hold selected item option for Autocomplete
  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null);

  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;

  const validateForm = (values: any) => {
    const errors: any = {};
    if (!values.item_id) errors.item_id = "Item is required";
    if (
      !values.limit_quantity &&
      !values.limit_amount &&
      !values.limit_day_amount
    ) {
      errors.limit_quantity = "At least one limit is required";
    }
    return errors;
  };

  return (
    <Box sx={{ maxWidth: 600, p: 2 }}>
      {error && (
        <Typography sx={{ color: "red" }} variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      <Formik
        key={isUpdate ? (initialValues?.id ?? "edit") : "create"}
        enableReinitialize
        initialValues={{ ...emptyInit, ...initialValues, relation: "INCLUDE" }}
        validate={validateForm}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors, touched }) => {
          const itemValue =
            items.find((i) => String(i.id) === String(values.item_id)) || null;

          return (
            <Form>
              {!isUpdate ? (
                <Box mb={3}>
                  <Typography
                    sx={{ color: "custom.light" }}
                    variant="body1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {t("packageSetup_15_ItemRequired")}
                  </Typography>
                  <ItemSelect
                    typeId={"NP"}
                    value={selectedItem}
                    onChange={(opt) => {
                      setSelectedItem(opt);
                      setFieldValue("item_id", opt?.id ?? null);
                    }}
                    placeholder={t("packageSetup_15_SelectPlaceholder")}

                    // category={"none"}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    mb: 3,
                  }}
                >
                  <Typography variant="body2" color="text.primary">
                    {`${values.item_id} - ${values.item_description || ""}`}
                  </Typography>
                </Box>
              )}

              <Box mb={3}>
                <Typography
                  sx={{ color: "custom.light" }}
                  variant="body1"
                  fontWeight="bold"
                  gutterBottom
                >
                  {t("packageSetup_15_LimitQuantityRequired")}
                </Typography>
                <Field name="limit_quantity">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      variant="outlined"
                      placeholder="Enter limit quantity"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || Number(value) >= 0) {
                          setFieldValue("limit_quantity", value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key.toLowerCase() === "e") {
                          e.preventDefault();
                        }
                      }}
                      error={touched.limit_quantity && !!errors.limit_quantity}
                      helperText={
                        touched.limit_quantity && errors.limit_quantity
                      }
                    />
                  )}
                </Field>
              </Box>

              <Box mb={3}>
                <Typography
                  sx={{ color: "custom.light" }}
                  variant="body1"
                  fontWeight="bold"
                  gutterBottom
                >
                  {t("packageSetup_15_LimitAmount")}
                </Typography>
                <Field name="limit_amount">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      variant="outlined"
                      placeholder="Enter limit amount"
                      value={field.value ?? ""}
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

              <Box mb={3}>
                <Typography
                  sx={{ color: "custom.light" }}
                  variant="body1"
                  fontWeight="bold"
                  gutterBottom
                >
                  {t("packageSetup_15_DayLimit")}
                </Typography>
                <Field name="limit_day_amount">
                  {({ field }: FieldProps) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      variant="outlined"
                      placeholder="Enter day limit"
                      value={field.value ?? ""}
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

              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={onClose}>
                  {t("packageSetup_15_Cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!values.item_id || !values.limit_quantity}
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

export default LimitItemsForm;
