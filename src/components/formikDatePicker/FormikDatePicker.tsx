/**
 * @author Engr. Sahar AlHaddad <saharalhaddad2011@gmail.com>
 * @created 2025-04-18
 * @modified
 */

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Field, FieldProps } from "formik";
import { useAppSelector } from "../../hooks/hooks";
interface FormikDatePickerProps {
  name: string;
  label: string;
  format?: string;
  // touched?: any;
  // errors?: any;
}

export const FormikDatePicker = ({ name, label, format = "dd/MM/yyyy hh:mm a" }: FormikDatePickerProps) => {
  const dateTimeFormat = useAppSelector((state) => {
    return state.config.values.DATETIME_FORMAT;
  });

  return (
   
      <Field name={name}>
        {({ field, form }: FieldProps<Date | null>) => (
          <DateTimePicker
            label={label}
            value={field.value}
            onChange={(date) => {
              form.setFieldValue(name, date);
            }}
            format={dateTimeFormat ? dateTimeFormat : format}
            slotProps={{
              textField: {
                error: touched[name] && !!errors[name],
                helperText: (touched[name] && errors[name]) as string,
              },
            }}
          />
        )}
      </Field>
     );
};

// Usage in your form:
//<FormikDatePicker name="birthDate" label="Date of Birth" />
