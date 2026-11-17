/**
 * @company GIVC
 * @author Engr. Sahar AlHaddad <saharalhaddad2011@gmail.com>
 * @created 2025-05-07
 * @modified
 */

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TextFieldProps } from "@mui/material/TextField";
import { useAppSelector } from "../../hooks/hooks";
import { useRef } from "react";

interface CustomDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  format?: string;
  error?: boolean;
  helperText?: string;
  textFieldProps?: TextFieldProps;
}

const CustomDatePicker = ({ label, value, onChange, format = "dd/MM/yyyy HH:mm a", error = false, helperText = "", textFieldProps = {} }: CustomDatePickerProps) => {
  //Get format from Redux with proper type safety
  const dateTimeFormat = useAppSelector((state) => {
    return state.config.values.DATETIME_FORMAT;
  });

  const anchorRef = useRef(null);

  return (
    
      <div ref={anchorRef}>
        <DateTimePicker
          label={label}
          value={value}
          onChange={onChange}
          format={dateTimeFormat ? dateTimeFormat : format}
          slotProps={{
            textField: {
              error: error,
              helperText: helperText,
              ...textFieldProps,
            },
            popper: {
              anchorEl: anchorRef.current,
            },
          }}
        />
      </div>
  
  );
};

export default CustomDatePicker;
