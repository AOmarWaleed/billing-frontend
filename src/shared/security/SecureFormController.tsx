import { GlFormAutoComplete } from "../forms/WithForm/GlFormAutoComplete";
import { GlFormCheckbox } from "../forms/WithForm/GlFormCheckbox";
import { GlFormDatePicker } from "../forms/WithForm/GlFormDatePicker";
import { GLFormDateTimePicker } from "../forms/WithForm/GLFormDateTimePicker";
import { GlFormMobileDateTimePicker } from "../forms/WithForm/GlFormMobileDateTimePicker";
import { GlFormMultiCheckbox } from "../forms/WithForm/GlFormMultiCheckbox";
import { GlFormRadioGroup } from "../forms/WithForm/GlFormRadioGroup";
import { GlFormSelect } from "../forms/WithForm/GlFormSelect";
import { GlFormTextField } from "../forms/WithForm/GlFormTextField";

import { GLAutocompleteProps } from "./GLAutocomplete";
import { GLDatePickerProps } from "./GLDatePicker";
import { GLTextFieldProps } from "./GLTextField";
import { GlSelectProps } from "../forms/StandAlone/GlSelect";
import { GLFormDateTimePickerProps } from "../forms/WithForm/GLFormDateTimePicker";
import { AuthGuardPermissions } from "../core/AuthGuard";
import { GlDateTimePicker } from "../forms/StandAlone/GlDateTimePicker";

export type GLFormDateTimePickerSecureProps = GLFormDateTimePickerProps & {
  resource_key: string;
  required?: boolean;
};

export type GLFormSelectProps = GlSelectProps & { resource_key: string };

const GlFormAutoCompleteSecure = ({
  resource_key,
  disabled: disabledLocal,
  required: requiredLocal,
  name,
  children,
  
  ...props
}: GLAutocompleteProps) => {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled, required }) => (
        <GlFormAutoComplete
          {...props}
          name={name}
          disabled={disabled || disabledLocal}
          required={required || requiredLocal}
        >
          {children}
        </GlFormAutoComplete>
      )}
    </AuthGuardPermissions>
  );
};

const GLFormDatePickerSecure = ({
  resource_key,
  disabled: disabledLocal,
  name,
  ...props
}: GLDatePickerProps<Date>) => {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled }) => (
        <GlFormDatePicker
          {...props}
          name={name!}
          disabled={disabled || disabledLocal}
        />
      )}
    </AuthGuardPermissions>
  );
};

const GLFormDateTimePickerSecure = ({
  resource_key,
  disabled: disabledLocal,
  required: requiredLocal,
  name,
  ...props
}: GLFormDateTimePickerSecureProps) => {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled, required }) => (
        <GLFormDateTimePicker
          {...props}
          name={name!}
          disabled={disabled || disabledLocal}
          required={required || requiredLocal}
        />
      )}
    </AuthGuardPermissions>
  );
};

const GLFormTextFieldSecure = ({
  resource_key,
  disabled: disabledLocal,
  required: requiredLocal,
  name,
  ...props
}: GLTextFieldProps) => {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled, required }) => (
        <GlFormTextField
          {...props}
          name={name!}
          disabled={disabled || disabledLocal}
          required={required || requiredLocal}
        />
      )}
    </AuthGuardPermissions>
  );
};

const GLFormSelectSecure = ({
  resource_key,
  disabled: disabledLocal,
  required: requiredLocal,
  name,
  ...props
}: GLFormSelectProps) => {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled, required }) => (
        <GlFormSelect
          {...props}
          name={name!}
          disabled={disabled || disabledLocal}
          required={required || requiredLocal}
        />
      )}
    </AuthGuardPermissions>
  );
};

export {
  GlFormAutoCompleteSecure,
  GLFormDatePickerSecure,
  GLFormTextFieldSecure,
  GLFormDateTimePickerSecure,
  GLFormSelectSecure,
};
