import React, { useContext } from "react";
import { Box, Typography, Divider } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Module, SystemRule } from "../types/settings.types";
import Secure from "../../../shared/security";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";

interface UpdateSystemRuleFormProps {
  initialValues: SystemRule;
  modules: Module[];
  onClose: () => void;
  onSubmit: (values: SystemRule) => Promise<void>;
  // content: any;
}

const validationSchema = Yup.object().shape({
  conf_value: Yup.string().required("Conf Value is required"),
  description: Yup.string().required("Description is required"),
});

export const UpdateSystemRuleForm: React.FC<UpdateSystemRuleFormProps> = ({
  initialValues,
  modules,
  onClose,
  onSubmit,
}) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
      //amer
    },
    enableReinitialize: true,
  });
  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);

  if (!ctx) {
    return null;
  }

  const { resourcesData, t, userLang } = ctx;

  //==================  * Resources * ===================
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      {/* <TextExtractorTool function_id={3} /> */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          // "&  .mui-ku1p89-MuiFormHelperText-root.Mui-error": {
          //   // color: "warning.light",
          // },
        }}
      >
        {/* Module ID Field (Autocomplete) */}
        <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
          <Typography sx={{ color: "text.obs" }}>
            {t("systemRules_3_ModuleIdLower") || "Module id"}
          </Typography>
          <Secure.GLAutocomplete
            options={modules}
            resource_key="systemRules_3_ModuleID"
            getOptionLabel={(module) => module.description}
            value={
              modules.find(
                (module) => module.module_id === formik.values.module_id,
              ) || null
            }
            disabled
            renderInput={(params) => (
              <Secure.GLTextField
                {...params}
                placeholder={t("systemRules_3_ModuleID") || "Module Id"}
                resource_key="systemRules_3_ModuleID"
                variant="outlined"
                color="whiteField"
                size="small"
                fullWidth
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option.module_id === value.module_id
            }
          />
        </Box>

        {/* Conf Key Field */}
        <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
          <Typography sx={{ color: "text.obs" }}>
            {t("systemRules_3_confKey") || "conf key"}
          </Typography>
          <Secure.GLTextField
            disabled
            name="conf_key"
            placeholder={t("systemRules_3_confKey") || "Conf Key"}
            resource_key="systemRules_3_confKey"
            variant="outlined"
            color="whiteField"
            sx={{
              borderRadius: 2,
              alignSelf: "center",
              // "& input": { padding: "7px 10px !important" },
            }}
            size="small"
            fullWidth
            value={formik.values.conf_key}
          />
        </Box>

        {/* Description Field */}
        <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
          <Typography sx={{ color: "text.obs" }}>
            {t("systemRules_3_description") || "Description"}
          </Typography>
          <Secure.GLTextField
            name="description"
            placeholder={t("systemRules_3_description") || "Description"}
            resource_key="systemRules_3_description"
            sx={{
              borderRadius: 2,
              alignSelf: "center",
              // "& input": { padding: "7px 10px !important" },
            }}
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
        </Box>

        {/* Conf Value Field */}
        <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
          <Typography sx={{ color: "text.obs" }}>
            {t("systemRules_3_confValue") || "conf value"}
          </Typography>
          <Secure.GLTextField
            name="conf_value"
            placeholder={t("systemRules_3_confValue") || "Conf Value"}
            resource_key="systemRules_3_confValue"
            sx={{
              borderRadius: 2,
              alignSelf: "center",
              // "& input": { padding: "7px 10px !important" },
            }}
            variant="outlined"
            color="whiteField"
            size="small"
            fullWidth
            value={formik.values.conf_value}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.conf_value && Boolean(formik.errors.conf_value)
            }
            helperText={
              formik.touched.conf_value &&
              formik.errors.conf_value &&
              formik.errors.conf_value
            }
          />
        </Box>

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
          color="error"
          variant="contained"
          onClick={onClose}
          resource_key="systemRules_3_Close"
        />
        <Secure.GLButton
          variant="contained"
          type="submit"
          resource_key="systemRules_3_UpdateSystemRule"
        />
      </Box>
    </Box>
  );
};
