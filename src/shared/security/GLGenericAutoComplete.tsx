import { Autocomplete } from "@mui/material";
import { GLAutocompleteProps } from "./GLAutocomplete";
import { AuthGuardPermissions } from "../core/AuthGuard";

const GLGenericAutocomplete = <
  T,
  Multiple extends boolean | undefined = false
>({
  resource_key,
  disabled: disabledLocal,
  ...props
}: GLAutocompleteProps<T, Multiple>) => {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled }) => (
        <Autocomplete {...props} disabled={disabled || disabledLocal} />
      )}
    </AuthGuardPermissions>
  );
};

export default GLGenericAutocomplete;
