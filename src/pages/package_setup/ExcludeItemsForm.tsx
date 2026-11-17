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
import ItemSelect, {
  ItemOption,
} from "../../components/paged-autocomplete/ItemSelect";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
//import axios from "../../utils/Axios";

interface ExcludeItemsFormProps {
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
};

const ExcludeItemsForm: React.FC<ExcludeItemsFormProps> = ({
  initialValues,
  onSubmit,
  onClose,
  error,
  isUpdate,
  parentPackageId,
}) => {
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
        initialValues={{ ...emptyInit, ...initialValues, relation: "EXCLUDE" }}
        validate={validateForm}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors, touched }) => {
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
                    // category="none"
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

              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={onClose}>
                  {t("packageSetup_15_Cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!values.item_id}
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

export default ExcludeItemsForm;
