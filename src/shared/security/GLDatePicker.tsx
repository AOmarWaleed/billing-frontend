import { DesktopDatePicker } from "@mui/x-date-pickers";
import { DatePickerProps } from "@mui/x-date-pickers/DatePicker";

import { AuthGuardPermissions } from "../core/AuthGuard";
export type GLDatePickerProps<TDate> = DatePickerProps<TDate> & {
  resource_key: string;
};

const GLDatePicker = ({
  resource_key,
  disabled: disabledLocal,
  ...props
}: GLDatePickerProps<Date>) => {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled }) => {
        return (
          <DesktopDatePicker {...props} disabled={disabled || disabledLocal} />
        );
      }}
    </AuthGuardPermissions>
  );
};

export default GLDatePicker;
