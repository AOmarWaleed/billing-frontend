import { Formik, Form, Field, FieldProps, FormikHelpers } from "formik";
import { TextField, Button, Box, Typography, Divider, Autocomplete } from "@mui/material";

import { joiFormikAdapter } from "joi-formik-adapter";
import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import { useContext, useEffect, useState } from "react";
import Joi from "joi";
import { GroupDTO } from "../../../types/GroupDTO";
import { addGroupHandler, updateGroupHandler } from "./GroupEventHandler";
import { SelectOption } from "../../../types/selectOpion";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";


// Define the type for the form values
interface GroupFormValues {
  group_name: string;
  description: string;
  auth_provider_group: string;
  menu_id: number;
}

interface CustomGroupFormProps {
  isNew: boolean; // Optional flag to indicate a new row
  editId: number;
  editRow: any;
  handleClose: () => void;
  error: string;
  formschema: Joi.ObjectSchema;
}
// Form Component
const CustomGroupForm: React.FC<CustomGroupFormProps> = ({ isNew, editId, editRow, handleClose, error, formschema }) => {
  const menus = useAppSelector((state) => state.groups.menus);
  const [menuOptions, setMenuOptions] = useState<SelectOption[]>([]);
  const dispatch = useAppDispatch();
  const { t } = useContext(AuthGuardContext)!;

  //==================  * Resources * ===================

  // const { resource } = useAppSelector((state) => state.trans);
  // const { language } = useLanguage();
  // const { getPageResources } = useTransSlice();
  // const user = useAppSelector((state) => state.auth.user);
  // const { t, getDisable } = createResourceHelpers(resource.resources);

  //==================  * Resources * ===================

  // Assuming editRow is of type UserFormValues or similar
  const [row, setRow] = useState<GroupFormValues>({
    group_name: editRow.group_name ?? "",
    description: editRow.description ?? "",
    auth_provider_group: editRow.auth_provider_group ?? "",
    menu_id: editRow.menu_id ?? null,
  });

  useEffect(() => {
    // Fetch groups and wait for the result
    //dispatch(fetchMenus()).unwrap();
    // Map the groups to the desired format
    if (menus) {
      const groupOptionsTemp = menus.map((type) => ({
        label: `${type.menu_id} - ${type.description}`,
        id: type.menu_id,
      }));
      // Set the group options
      setMenuOptions(groupOptionsTemp);
    }
  }, [menus]);

  const handleSubmit = (values: any, { setSubmitting }: FormikHelpers<any>) => {
    // Transform UserFormValues into UserDTO
    const transformedValues: GroupDTO = {
      group_name: values.group_name,
      description: values.description,
      auth_provider_group: values.auth_provider_group,
      menu_id: values.menu_id,
    };
    // Call addUserHandler with the transformed values
    if (isNew) {
      dispatch;
      addGroupHandler(dispatch, transformedValues, handleClose);
    } else {
      updateGroupHandler(dispatch, editId, transformedValues, handleClose);
    }

    setSubmitting(false); // Reset submitting state
  };

  const validate = (values: GroupFormValues) => {
    const result = formschema.validate(values, { abortEarly: false });
    return result.error?.details.reduce<Record<string, string>>(
      (errors, detail) => {
        const field = detail.path[0]?.toString();
        if (field && !errors[field]) {
          errors[field] = detail.message;
        }
        return errors;
      },
      {},
    ) ?? {};
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto" }}>
      {/* <TextExtractorTool function_id={9} /> */}
      {error && <span style={{ color: "red" }}>{error}</span>}
      <Formik
        initialValues={row}
        validate={validate}
        onSubmit={handleSubmit}>
        {({ errors, touched, isSubmitting }) => (
          <Form>

            <Box display="flex" gap={2} my={2}>
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                name="group_name"
                resource_key='usergroups_9_GroupNameForm'
                withLabel={false}
              >
                {({ field }: FieldProps) => (
                  <TextField color="whiteField" {...field} fullWidth label={t("usergroups_9_GroupNameForm") || "GROUP NAME"} variant="outlined" error={touched.group_name && Boolean(errors.group_name)} helperText={touched.group_name && errors.group_name} />
                )}
              </Secure.GLLabelAndField>
            </Box>
            <Box display="flex" gap={2} mb={2}>
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                name="description"
                resource_key='usergroups_9_DescriptionForm'
                withLabel={false}
              >
                {({ field }: FieldProps) => (
                  <TextField
                    color="whiteField"
                    {...field}
                    fullWidth
                    variant="outlined"
                    label={t("usergroups_9_DescriptionForm") || "DESCRIPTION"}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                )}
              </Secure.GLLabelAndField>
            </Box>
            <Box display="flex" gap={2} mb={2}>
              <Secure.GLLabelAndField
                wrapperProps={{ flex: 1 }}
                resource_key='usergroups_9_AuthProviderGroupForm'
                name="auth_provider_group"
                withLabel={false}>
                {({ field }: FieldProps) => (
                  <TextField
                    color="whiteField"
                    {...field}
                    fullWidth
                    variant="outlined"
                    label={t("usergroups_9_AuthProviderGroupForm") || "AUTH PROVIDER GROUP"}
                    error={touched.auth_provider_group && Boolean(errors.auth_provider_group)}
                    helperText={touched.auth_provider_group && errors.auth_provider_group}
                  />
                )}
              </Secure.GLLabelAndField>
            </Box>

            <Box display="flex" gap={2} mb={2}>
              {menus && (
                <Secure.GLLabelAndField
                  wrapperProps={{ flex: 1 }}
                  resource_key='usergroups_9_MenuName' name="menu_id" withLabel={false}>
                  {({ field, form }: FieldProps) => {
                    const selectedOption = menuOptions.find((option) => option.id === field.value) || null;

                    return (
                      <Autocomplete
                        value={selectedOption || null}
                        onChange={(event, newValue: { label: string; id: number } | null) => {
                          form.setFieldValue(field.name, newValue ? newValue.id : ""); // Update Formik's value
                        }}
                        options={menuOptions}
                        getOptionLabel={(option) => option.label || ""}
                        renderInput={(params) => (
                          <TextField
                            color="whiteField"
                            {...params}
                            placeholder={t("usergroups_9_SelectMenu") || "SELECT MENU"}
                            label={t("usergroups_9_MenuName") || "MENU NAME"}
                            error={Boolean(form.touched.menu_id && form.errors.menu_id)}
                            helperText={form.touched.menu_id && typeof form.errors.menu_id === "string" ? form.errors.menu_id : ""}
                            fullWidth
                          />
                        )}
                        sx={{ width: "100%" }}
                      />
                    );
                  }}
                </Secure.GLLabelAndField>
              )}
            </Box>

            {/* Divider */}
            <Divider
              sx={{
                mt: 6,
                mb: 4,
                backgroundColor: "text.obs",
                maxWidth: "100%",
              }}
            />

            {/* Buttons */}
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Secure.GLButton resource_key="usergroups_9_Cancel" onClick={handleClose} variant="outlined" sx={{ backgroundColor: "text.obs", color: "primary.main" }}>
              </Secure.GLButton>
              {isNew ? (
                <Secure.GLButton resource_key='usergroups_9_Submit' type="submit" variant="contained" color="primary">
                </Secure.GLButton>
              ) : (
                <Secure.GLButton resource_key='usergroups_9_Submit' type="submit" variant="contained" color="primary">
                </Secure.GLButton>
              )}
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default CustomGroupForm;
