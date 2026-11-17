import { IconButton, IconButtonProps } from "@mui/material";
import { AuthGuardPermissions } from "../core/AuthGuard";

export type GLIconButtonProps = IconButtonProps & {
  resource_key: string;
};

const GLIconButton = ({
  resource_key,
  disabled: disabledLocal,
  children,
  ...props
}: GLIconButtonProps) => {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled }) => (
        <IconButton {...props} disabled={disabled || disabledLocal}>
          {children}
        </IconButton>
      )}
    </AuthGuardPermissions>
  );
};

export default GLIconButton;
