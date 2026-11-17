import { FormControlLabel } from "@mui/material";
import { FormControlLabelProps } from "@mui/material";
import { AuthGuardPermissions } from "../core/AuthGuard";
import { GLFormControlProps } from "./GLFormControl";
import { cloneElement } from "react";
type GLFormControlLabel = FormControlLabelProps & {
  resourse_key: string;
  name: string;
};

const GLFormControlLabel = ({
  resource_key,
  control,
  name,
  label,
  ...props
}: GLFormControlProps) => {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled, t }) => {
        const clonedElement = cloneElement(control, {
          disabled: disabled,
        });
        return (
          <FormControlLabel
            control={clonedElement}
            name={name}
            label={t && t(resource_key)}
          />
        );
      }}
    </AuthGuardPermissions>
  );
};

export default GLFormControlLabel;
