import { Button } from "@mui/material";
import { ButtonProps } from "@mui/material";
import { AuthGuardPermissions } from "../core/AuthGuard";

export type GLButtonProps = ButtonProps & {
  resource_key: string;
  fallBackText?: string;
};

const GLButton = ({
  resource_key,
  fallBackText,
  disabled: disabledLocal,
  children,
  ...props
}: GLButtonProps) => {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled, t }) => (
        <Button {...props} disabled={disabled || disabledLocal}>
          {children ?? ((t && t(resource_key)) || fallBackText)}
        </Button>
      )}
    </AuthGuardPermissions>
  );
};

export default GLButton;
