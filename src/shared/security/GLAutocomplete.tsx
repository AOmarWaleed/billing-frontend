import { Autocomplete, AutocompleteProps, TextField } from "@mui/material";
import { AuthGuardPermissions } from "../core/AuthGuard";
import { cloneElement } from "react";
export type GLAutocompleteProps<
  T,
  Multiple extends boolean = false,
  DisableClearable extends boolean = false,
  FreeSolo extends boolean = false
> = AutocompleteProps<T, Multiple, DisableClearable, FreeSolo> & {
  resource_key: string;
};

// Step 2: create the component using AuthGuardPermissions
export default function GLAutocomplete<
  T,
  Multiple extends boolean | undefined = false
>({ resource_key, renderInput, ...props }: GLAutocompleteProps<T, Multiple>) {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled, required }) => {
        return (
          <Autocomplete<T, Multiple>
            {...props}
            disabled={disabled}
            renderInput={(params) => {
              const element = renderInput(params);
              const newElement = cloneElement(element, { required: required });
              return newElement;
            }}
          />
        );
      }}
    </AuthGuardPermissions>
  );
}
