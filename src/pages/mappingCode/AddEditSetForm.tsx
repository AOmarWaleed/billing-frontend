import {
  TextField,
  Button,
  Stack,
  CircularProgress,
  Typography,
  Autocomplete,
  Box,
  FormHelperText,
} from "@mui/material";
import { Formik, Form, Field, FieldProps } from "formik";
import { joiFormikAdapter } from "joi-formik-adapter";
import { setFormSchema } from "../../models/setFormSchema";
import { CodeType, CodeSet } from "../../types/CodeMappingIndex";
import Secure from "../../shared/security";
import { useContext } from "react";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
interface AddEditSetFormProps {
  mode: "create" | "edit";
  currentSet: CodeSet | null;
  allCodeTypes: CodeType[];
  onSubmit: (data: {
    set_description: string;
    set_query: string;
    code_type: number | null;
  }) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
}
interface setFormValues {
  description: string;
  set_query: string | null;
  code_type: number | null;
}
const AddEditSetForm: React.FC<AddEditSetFormProps> = ({
  mode,
  currentSet,
  allCodeTypes,
  onSubmit,
  onCancel,
  loading,
  error,
}) => {
  const { t } = useContext(AuthGuardContext);
  const initialValues = {
    set_description: currentSet?.set_description ?? "",
    set_query: currentSet?.set_query ?? "",
    //code_type: allCodeTypes.find((ct) => ct.code_type === currentSet?.code_type) ?? null,
    code_type:
      allCodeTypes.find(
        (ct) => Number(ct.code_type) === Number(currentSet?.code_type),
      ) ?? null,
  };

  const handleSubmit = (values: typeof initialValues) => {
    onSubmit({
      set_description: values.set_description,
      set_query: values.set_query,
      code_type: values.code_type?.code_type ?? null,
    });
  };

  // Helper function to validate form values using Joi

  const validate = (values: typeof initialValues) => {
    // Transform values to match schema (code_type as number|null)
    const transformedValues = {
      set_description: values.set_description,
      set_query: values.set_query,
      code_type: values.code_type?.code_type ?? null,
    };

    const { error } = setFormSchema.validate(transformedValues, {
      abortEarly: false,
    });
    const errors: Partial<Record<keyof typeof initialValues, string>> = {};
    if (error) {
      error.details.forEach((detail) => {
        const key = detail.path[0] as keyof typeof initialValues;
        const message = detail.message.replace(/^.*fails to match /, "");
        errors[key] = message;
      });
    }
    return errors;
  };
  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      //validate={joiFormikAdapter(setFormSchema)}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }) => (
        <Form>
          {Object.keys(errors).length > 0 && (
            <pre style={{ color: "red" }}>
              {JSON.stringify(errors, null, 2)}
            </pre>
          )}

          {/* Updated container with flex layout */}
          <Stack
            spacing={1.5}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Description - unchanged */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minheight: 600,
                gap: 1,
              }}
            >
              <Secure.GLTypography
                resource_key="codeMapping_13_description"
                variant="body2"
                sx={{ color: "text.obs" }}
                fontWeight={500}
              />

              <Field name="set_description">
                {({ field }: FieldProps) => (
                  <Secure.GLTextField
                    resource_key="codeMapping_13_enterDescription"
                    color="whiteField"
                    {...field}
                    placeholder={t("codeMapping_13_enterDescription")}
                    fullWidth
                    error={
                      touched.set_description && Boolean(errors.set_description)
                    }
                    helperText={
                      touched.set_description && errors.set_description
                    }
                    inputProps={{ maxLength: 500 }}
                  />
                )}
              </Field>
            </Box>

            {/* Set Query - Fixed with flex layout */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minheight: 600,
                gap: 1,
              }}
            >
              <Secure.GLTypography
                resource_key="codeMapping_13_setQuery"
                variant="body2"
                sx={{ color: "text.obs" }}
                fontWeight={500}
              />

              <Box
                sx={{
                  border:
                    touched.set_query && errors.set_query
                      ? "1px solid #f44336"
                      : "1px solid rgba(255, 255, 255, 0.23)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  flex: 1,
                  display: "flex",
                }}
              >
                <Field name="set_query">
                  {({ field }: FieldProps) => (
                    <Secure.GLTextField
                      resource_key="codeMapping_13_enterSetQuery"
                      color="whiteField"
                      {...field}
                      placeholder={t("codeMapping_13_enterSetQuery")}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        style: {
                          overflow: "auto",
                          height: "100%",
                          // padding: "16.5px 14px",
                          boxSizing: "border-box",
                          flex: 1,
                        },
                      }}
                      inputProps={{
                        style: {
                          height: "100%",
                        },
                      }}
                      sx={{
                        // "& fieldset": { border: "none" },
                        "& textarea": {
                          fontFamily: "monospace",
                          fontSize: "0.875rem",
                          height: "100% !important",
                        },
                        flex: 1,
                        height: "100%",
                      }}
                    />
                  )}
                </Field>
              </Box>
              {touched.set_query && errors.set_query && (
                <FormHelperText error sx={{ mx: "14px", mt: "3px" }}>
                  {errors.set_query}
                </FormHelperText>
              )}
            </Box>

            {/* Code Type - unchanged */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minheight: 600,
                gap: 1
              }}
            >
              <Secure.GLTypography
                resource_key="codeMapping_13_codeType"
                variant="body2"
                sx={{ color: "text.obs" }}
                fontWeight={500}
              />

              <Secure.GLGenericAutocomplete
                resource_key="codeMapping_13_codeType"
                options={allCodeTypes}
                getOptionLabel={(option) =>
                  `[${option.code_type}] - ${option.description}`
                }
                renderOption={(props, option) => (
                  <li {...props}>
                    [{option.code_type}] - {option.description}
                  </li>
                )}
                value={values.code_type}
                onChange={(_, newValue) => setFieldValue("code_type", newValue)}
                isOptionEqualToValue={(option, value) =>
                  String(option.code_type) === String(value?.code_type)
                }
                renderInput={(params) => (
                  <Secure.GLTextField
                    resource_key="codeMapping_13_codeType"
                    color="whiteField"
                    {...params}
                    placeholder={t("codeMapping_13_codeType")}
                    error={touched.code_type && Boolean(errors.code_type)}
                    helperText={
                      touched.code_type && typeof errors.code_type === "string"
                        ? errors.code_type
                        : ""
                    }
                  />
                )}
              />
            </Box>

            {/* Error Message - unchanged */}
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            {/* Buttons - now fixed at bottom */}
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              mt={2}
              sx={{ marginTop: "auto" }}
            >
              <Secure.GLButton
                resource_key="codeMapping_13_cancel"
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
              />

              <Secure.GLButton
                resource_key={
                  mode === "edit"
                    ? "codeMapping_13_updateSet"
                    : "codeMapping_13_create"
                }
                type="submit"
                variant="contained"
                disabled={loading || isSubmitting}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : mode === "edit" ? (
                  t("codeMapping_13_updateSet")
                ) : (
                  t("codeMapping_13_create")
                )}
              </Secure.GLButton>
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};

export default AddEditSetForm;

// import { TextField, Button, Stack, CircularProgress, Typography, Autocomplete, Box } from "@mui/material";
// import { Formik, Form, Field, FieldProps } from "formik";
// import { joiFormikAdapter } from "joi-formik-adapter";
// import { setFormSchema } from "../../models/setFormSchema";
// import { CodeType, CodeSet } from "../../types/CodeMappingIndex";

// interface AddEditSetFormProps {
//   mode: "create" | "edit";
//   currentSet: CodeSet | null;
//   allCodeTypes: CodeType[];
//   onSubmit: (data: {
//     set_description: string;
//     set_query: string;
//     code_type: number | null;
//   }) => void;
//   onCancel: () => void;
//   loading: boolean;
//   error: string | null;
// }

// const AddEditSetForm: React.FC<AddEditSetFormProps> = ({
//   mode,
//   currentSet,
//   allCodeTypes,
//   onSubmit,
//   onCancel,
//   loading,
//   error,
// }) => {
//   const initialValues = {
//   set_description: currentSet?.set_description ?? "",
//   set_query: currentSet?.set_query ?? "",
//   code_type: allCodeTypes.find((ct) => ct.code_type === currentSet?.code_type) ?? null,
// };

//   const handleSubmit = (values: typeof initialValues) => {
//     onSubmit({
//       set_description: values.set_description,
//       set_query: values.set_query,
//       code_type: values.code_type?.code_type ?? null,
//     });
//   };
// console.log("initialValues.set_query:", initialValues.set_query);

//   return (

//     <Formik
//       initialValues={initialValues}
//       validate={joiFormikAdapter(setFormSchema)}
//       enableReinitialize
//       onSubmit={handleSubmit}
//     >
//       {({ values, errors, touched, setFieldValue, isSubmitting }) => (
//         <Form>
//           <Stack spacing={2} padding={2} sx={{ maxHeight: '80vh', overflow: 'hidden'}}>
//             {/* Description */}
//             <Typography variant="body2" sx={{ color: "text.obs" }} fontWeight={500}>
//               Description
//             </Typography>
//             <Field name="set_description">
//               {({ field }: FieldProps) => (
//                 <TextField
//                   color="whiteField"
//                   {...field}
//                   placeholder="Enter Description"
//                   fullWidth
//                   error={touched.set_description && Boolean(errors.set_description)}
//                   helperText={touched.set_description && errors.set_description}
//                   inputProps={{ maxLength: 500 }}
//                 />
//               )}
//             </Field>

//             {/* Set Query */}
//             <Box>
//             <Typography variant="body2" sx={{ color: "text.obs" }} fontWeight={500}>
//               Set Query
//             </Typography>
//              <Box
//                 sx={{
//                   border: touched.set_query && errors.set_query
//                     ? '1px solid #f44336'
//                     : '1px solid rgba(255, 255, 255, 0.23)',
//                   borderRadius: '4px',
//                   overflow: 'hidden',
//                   height: 300
//                 }}
//               >
//             <Field name="set_query">
//               {({ field }: FieldProps) => (
//                 <TextField
//                   color="whiteField"
//                   {...field}
//                   placeholder="Enter Set Query"
//                   fullWidth
//                   multiline
//                   rows={40}
//                   error={touched.set_query && Boolean(errors.set_query)}
//                   helperText={touched.set_query && errors.set_query}

//                 />
//               )}
//             </Field>
// </Box>
// </Box>
//             {/* Code Type */}
//             <Typography variant="body2" sx={{ color: "text.obs" }} fontWeight={500}>
//               Code Type
//             </Typography>
//             <Autocomplete
//               options={allCodeTypes}
//               getOptionLabel={(option) => `[${option.code_type}] - ${option.description}`}
//               renderOption={(props, option) => (
//                 <li {...props}>
//                   [{option.code_type}] - {option.description}
//                 </li>
//               )}
//               value={values.code_type}
//               onChange={(_, newValue) => setFieldValue("code_type", newValue)}
//               isOptionEqualToValue={(option, value) => option.code_type === value?.code_type}
//               renderInput={(params) => (
//                 <TextField
//                   color="whiteField"
//                   {...params}
//                   placeholder="Select Code Type"
//                   error={touched.code_type && Boolean(errors.code_type)}
//                   helperText={touched.code_type && typeof errors.code_type === "string" ? errors.code_type : ""}
//                 />
//               )}
//             />

//             {/* Error Message */}
//             {error && (
//               <Typography color="error" variant="body2">
//                 {error}
//               </Typography>
//             )}

//             {/* Buttons */}
//             <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
//               <Button variant="outlined" onClick={onCancel} disabled={loading}>
//                 Cancel
//               </Button>
//               <Button type="submit" variant="contained" disabled={loading || isSubmitting}>
//                 {loading ? <CircularProgress size={24} /> : mode === "edit" ? "Update" : "Create"}
//               </Button>
//             </Stack>
//           </Stack>
//         </Form>
//       )}
//     </Formik>
//   );
// };

// export default AddEditSetForm;
