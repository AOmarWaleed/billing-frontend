import React, { useContext } from "react";
import { Box, TextField, Typography, Divider } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Module, SystemRule } from "../types/settings.types";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";

interface AddSystemRuleFormProps {
  modules: Module[];
  onClose: () => void;
  onSubmit: (values: SystemRule) => Promise<void>;
  // content: any;
}

const validationSchema = Yup.object().shape({
  conf_key: Yup.string()
    .required("Conf Key is required")
    .matches(/^[A-Z_]+$/, "Only uppercase letters and underscores are allowed"),
  conf_value: Yup.string().required("Conf Value is required"),
  description: Yup.string().required("Description is required"),
  module_id: Yup.string().required("Module is required"),
});

export const AddSystemRuleForm: React.FC<AddSystemRuleFormProps> = ({
  modules,
  onClose,
  onSubmit,
  // content,
}) => {
  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);

  if (!ctx) {
    return null;
  }

  const { resourcesData, t, userLang } = ctx;

  const formik = useFormik({
    initialValues: {
      conf_key: "",
      conf_value: "",
      description: "",
      module_id: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  const handleConfKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and remove any invalid characters
    const value = e.target.value.toUpperCase().replace(/[^A-Z_]/g, "");
    formik.setFieldValue("conf_key", value);
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      {/* <TextExtractorTool function_id={3} /> */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          // "&  .mui-ku1p89-MuiFormHelperText-root.Mui-error": {
          //   color: "warning.light",
          // },
        }}
      >
        {/* Module ID Field (Autocomplete) */}
        {/* <Typography sx={{ color: "text.obs" }}>
            {t("systemRules_3_ModuleIdLower") || "Module id"}
          </Typography> */}
        <Secure.GLAutocomplete
          resource_key="systemRules_3_ModuleID"
          options={modules}
          getOptionLabel={(module) => module.description}
          value={
            modules.find(
              (module) => module.module_id === formik.values.module_id,
            ) || null
          }
          onChange={(event, newValue) => {
            formik.setFieldValue(
              "module_id",
              newValue ? newValue.module_id : "",
            );
          }}
          renderInput={(params) => (
            <TextField
              label={t("systemRules_3_ModuleIdLower") || "Module id"}
              {...params}
              name="module_id"
              placeholder={t("systemRules_3_ModuleID") || "Module ID"}
              variant="outlined"
              color="whiteField"
              sx={{
                borderRadius: 2,
                alignSelf: "center",
                // "& input": { padding: "7px 10px !important" },
              }}
              size="small"
              fullWidth
              onBlur={formik.handleBlur}
              error={
                formik.touched.module_id && Boolean(formik.errors.module_id)
              }
              helperText={formik.touched.module_id && formik.errors.module_id}
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.module_id === value.module_id
          }
        />
        {/* Conf Key Field */}
        {/* <Typography sx={{ color: "text.obs" }}>
            {t("systemRules_3_confKey") || "conf key"}
          </Typography> */}
        <Secure.GLTextField
          label={t("systemRules_3_confKey") || "conf key"}
          name="conf_key"
          placeholder={t("systemRules_3_ConfKey") || "Conf Key"}
          variant="outlined"
          color="whiteField"
          resource_key="systemRules_3_ConfKey"
          sx={{
            borderRadius: 2,
            alignSelf: "center",
            // "& input": {
            //   padding: "7px 10px !important",
            //   textTransform: "uppercase",
            // },
          }}
          size="small"
          fullWidth
          value={formik.values.conf_key}
          onChange={handleConfKeyChange}
          onBlur={formik.handleBlur}
          error={formik.touched.conf_key && Boolean(formik.errors.conf_key)}
          helperText={formik.touched.conf_key && formik.errors.conf_key}
          inputProps={{
            pattern: "^[A-Z_]*$", // HTML5 pattern validation
            title: "Only uppercase letters and underscores are allowed",
          }}
        />

        {/* Description Field */}
        {/* <Typography sx={{ color: "text.obs" }}>
            {t("systemRules_3_description") || "Description"}
          </Typography> */}
        <Secure.GLTextField
          label={t("systemRules_3_description") || "Description"}
          sx={{
            borderRadius: 2,
            alignSelf: "center",
            // "& input": { padding: "7px 10px !important" },
          }}
          name="description"
          placeholder={t("systemRules_3_description") || "Description"}
          resource_key="systemRules_3_description"
          variant="outlined"
          color="whiteField"
          size="small"
          fullWidth
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.description && Boolean(formik.errors.description)
          }
          helperText={formik.touched.description && formik.errors.description}
        />

        {/* Rest of the form remains the same */}
        {/* Conf Value Field */}
        {/* <Typography sx={{ color: "text.obs" }}>
            {t("systemRules_3_confValue") || "conf value"}
          </Typography> */}
        <Secure.GLTextField
          label={t("systemRules_3_confValue") || "conf value"}
          sx={{
            borderRadius: 2,
            alignSelf: "center",
            // "& input": { padding: "7px 10px !important" },
          }}
          name="conf_value"
          placeholder={t("systemRules_3_confValue") || "Conf Value"}
          resource_key="systemRules_3_confValue"
          variant="outlined"
          color="whiteField"
          size="small"
          fullWidth
          value={formik.values.conf_value}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.conf_value && Boolean(formik.errors.conf_value)}
          helperText={formik.touched.conf_value && formik.errors.conf_value}
        />

        <Divider sx={{ backgroundColor: "text.obs" }} />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 3,
          // pt: 2,
        }}
      >
        <Secure.GLButton
          variant="contained"
          color="error"
          onClick={onClose}
          resource_key="systemRules_3_Close"
        />

        <Secure.GLButton
          variant="contained"
          type="submit"
          resource_key="systemRules_3_AddSystemRuleSpace"
        />
      </Box>
    </Box>
  );
};
