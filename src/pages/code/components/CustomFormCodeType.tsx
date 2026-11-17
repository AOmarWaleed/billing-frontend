import React, { useContext, useState } from "react";
import {
  Divider,
  TextField,
  Grid2 as Grid,
} from "@mui/material";
import { Form, Formik } from "formik";
import { TypeList } from "../../../types/TypeList";
import { CodeTypeDTO } from "../../../types/CodeTypeDTO";
import { useDispatch, useSelector } from "react-redux";
import {
  addCodeType,
  fetchTypes,
  updateCodeType,
} from "../../../redux/slices/CodeTypeSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import { mutate } from "swr";
import { apiUtility } from "../../../utils/apiUtility";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";
import codeTypeSchema from "../../../models/codeTypeSchema";

interface Row {
  description: string;
  code_type: number | string;
  linked_type: string;
  linked_description: string;
  isEditing?: boolean;
}

interface CustomRowCodeTypeProps {
  row: Row;
  isInEditMode: boolean;
  editId: number;
  isNew?: boolean;
  types?: TypeList[];
  handleClose: () => void;
  codeTypesRef: React.RefObject<(() => void) | null>;
}

const CustomFormCodeType: React.FC<CustomRowCodeTypeProps> = ({
  row,
  editId,
  isInEditMode,
  isNew = false,
  types = [],
  handleClose,
  codeTypesRef,
}) => {
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;

  const dispatch: AppDispatch = useDispatch();
  const codetypes = useSelector(
    (state: RootState) => state.codetypes.codetypes,
  );

  const selectedCodeCurr = codetypes.find(
    (item) => item.code_type === editId,
  );

  const initialValues = {
    code_type: isNew ? "" : (selectedCodeCurr?.code_type ?? editId ?? ""),
    description: isNew ? "" : (selectedCodeCurr?.description ?? ""),
    linked_type: isNew
      ? null
      : (selectedCodeCurr?.linked_type ?? null),
  };

  const [selectedLinkedText, setSelectedLinkedText] = useState<string>(
    isNew ? "" : (selectedCodeCurr?.linked_description ?? ""),
  );

  const filteredTypes = types.filter(
    (type) => isNew || type.code_type !== editId,
  );
  const codeTypeOptions = filteredTypes.map((type) => ({
    label: `${type.code_type} - ${type.description}`,
    id: type.code_type,
  }));

  const validateFormikWithJoi = (values: any) => {
    const payload = {
      ...values,
      code_type:
        values.code_type === "" || values.code_type === null
          ? null
          : Number(values.code_type),
      description:
        typeof values.description === "string" ? values.description.trim() : "",
      linked_type:
        values.linked_type === "" || values.linked_type === null
          ? null
          : Number(values.linked_type),
    };

    const { error } = codeTypeSchema.validate(payload, { abortEarly: false });
    if (!error) return {};

    const errors: Record<string, string> = {};
    error.details.forEach((err) => {
      const field = String(err.path[0]);
      if (!errors[field]) {
        errors[field] = err.message;
      }
    });
    return errors;
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    const payload: CodeTypeDTO = {
      code_type: isNew ? Number(values.code_type) : editId,
      description: values.description ? values.description.trim() : "",
      linked_type: values.linked_type ? Number(values.linked_type) : null,
    };

    try {
      if (isNew) {
        const resultAction = await dispatch(addCodeType({ data: payload }));
        if (addCodeType.fulfilled.match(resultAction)) {
          handleClose();
          await mutate((e) => apiUtility(e, "codetype"));
          dispatch(fetchTypes());
          codeTypesRef?.current?.();
        }
      } else {
        const resultAction = await dispatch(
          updateCodeType({ id: editId, data: payload }),
        );
        if (updateCodeType.fulfilled.match(resultAction)) {
          handleClose();
          await mutate((e) => apiUtility(e, "codetype"));
          dispatch(fetchTypes());
          codeTypesRef?.current?.();
        }
      }
    } catch (error: any) {
      console.error("Save Code Type error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validate={validateFormikWithJoi}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        isSubmitting,
      }) => (
        <Form>
          <Grid container spacing={2}>
            {/* Code Type Field */}
            <Grid size={12}>
              <Secure.GLTypography resource_key="codetype_8_CodeType">
                {isNew ? (
                  <Secure.GLTextField
                    resource_key="codetype_8_CodeType"
                    name="code_type"
                    id="codeType"
                    label={t("codetype_8_CodeType") || "Code Type"}
                    value={values.code_type ?? ""}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/\D/g, "");
                      setFieldValue("code_type", sanitized);
                    }}
                    onBlur={handleBlur}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (["-", "+", "e", "E", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    error={
                      touched.code_type && Boolean(errors.code_type)
                    }
                    helperText={
                      touched.code_type && (errors.code_type as string)
                    }
                    size="small"
                    fullWidth
                  />
                ) : (
                  values.code_type
                )}
              </Secure.GLTypography>
            </Grid>

            {/* Description Field */}
            <Grid size={12}>
              <Secure.GLTypography resource_key="codetype_8_DescriptionColon">
                <Secure.GLTextField
                  resource_key="codetype_8_DescriptionColon"
                  name="description"
                  id="description"
                  label={t("codetype_8_DescriptionColon") || "Description"}
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.description && Boolean(errors.description)
                  }
                  helperText={
                    touched.description && (errors.description as string)
                  }
                  size="small"
                  fullWidth
                />
              </Secure.GLTypography>
            </Grid>

            {/* Linked Type Field */}
            <Grid size={12} sx={{ position: "relative", zIndex: 9999 }}>
              <Secure.GLTypography
                resource_key="codetype_8_LinkedType"
                sx={{ position: "relative", zIndex: 9999, width: "100%" }}
              >
                <Secure.GLAutocomplete
                  resource_key="codetype_8_LinkedType"
                  id="linked_type"
                  options={codeTypeOptions}
                  inputValue={selectedLinkedText}
                  onInputChange={(_, newInputValue) => {
                    setSelectedLinkedText(newInputValue || "");
                  }}
                  value={
                    codeTypeOptions.find(
                      (opt) => opt.id === values.linked_type,
                    ) || null
                  }
                  onChange={(
                    _,
                    newValue: { label: string; id: number } | null,
                  ) => {
                    setFieldValue(
                      "linked_type",
                      newValue ? newValue.id : null,
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label={
                        t("codetype_8_LinkedType") || "Linked Type"
                      }
                    />
                  )}
                  sx={{ width: "100%" }}
                />
              </Secure.GLTypography>
            </Grid>

            {/* Divider */}
            <Grid size={12}>
              <Divider
                sx={{
                  mt: 6,
                  mb: 4,
                  backgroundColor: "text.obs",
                  maxWidth: "100%",
                }}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid size={12}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Secure.GLButton
                  resource_key="codetype_8_Cancel"
                  onClick={handleClose}
                  sx={{ mr: "8px", color: "primary.main" }}
                  disabled={isSubmitting}
                >
                  {t("codetype_8_Cancel") || "Cancel"}
                </Secure.GLButton>
                {isNew ? (
                  <Secure.GLButton
                    resource_key="codetype_8_Save"
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {t("codetype_8_Save") || "Save"}
                  </Secure.GLButton>
                ) : (
                  <Secure.GLButton
                    resource_key="codetype_8_SaveUpdate"
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {t("codetype_8_SaveUpdate") || "Save Update"}
                  </Secure.GLButton>
                )}
              </div>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default CustomFormCodeType;
