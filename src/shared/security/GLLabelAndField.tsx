import { Box, Typography, TextField } from "@mui/material";
import { Field, FieldProps } from "formik";
import { AuthGuardPermissions } from "../core/AuthGuard";
import { cloneElement } from "react";
import { useContext } from "react";
import { AuthGuardContext } from "../core/AuthGuard";
const GLLabelAndField = ({
  wrapperProps,
  labelProps,
  resource_key,
  children,
  withLabel = true,
  ...restProps
}: any) => {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled, required, t }) => {
        return (
          <Box {...wrapperProps}>
            {withLabel && <Typography {...labelProps}>{t && t(resource_key)}</Typography>}
            <Field {...restProps}>
              {(props: FieldProps) => {
                const isCustomRenderer =
                  children && typeof children === "function";
                if (isCustomRenderer) {
                  const element = children(props);
                  const clonedElement = cloneElement(element, {
                    disabled: disabled,
                    required: required,
                  });
                  return clonedElement;
                } else {
                  const hasError = props.meta.touched && props.meta.error;
                  return (
                    <TextField
                      {...props.field} // name, value, onChange, onBlur
                      // disabled={disabled}
                      // required={required}
                      error={Boolean(hasError)}
                      helperText={hasError ? props.meta.error : undefined}
                      fullWidth
                    />
                  );
                }
              }}
            </Field>
          </Box>
        );
      }}
    </AuthGuardPermissions>
  );
};

export default GLLabelAndField;
