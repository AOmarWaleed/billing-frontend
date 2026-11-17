import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { FormControl } from '@mui/material';
import { DesktopDatePickerProps } from '@mui/x-date-pickers';

// ----------------------------------------------------------------------

export interface GlDatePickerProps extends Omit<DesktopDatePickerProps<any>, 'onChange' | 'value'> {
  name: string;
  helperText?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  onBlur?: () => void;
  error?: boolean;
  errorMessage?: string;
}

export function GlDatePicker({
  name,
  label,
  helperText,
  value = null,
  onChange,
  onBlur,
  error = false,
  errorMessage,
  ...other
}: GlDatePickerProps) {
  const handleChange = (date: Date | null) => {
    if (onChange) {
      onChange(date);
    }
  };

  return (
    <FormControl fullWidth error={error}>
      {/* {JSON.stringify(value) } */}
      <DesktopDatePicker
      
        label={label}
        value={value}
        onChange={handleChange}
        format='dd/MM/yyyy'
        onClose={onBlur} 
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'small',
            error: error,
            helperText: errorMessage ?? helperText,
            name: name,
            onBlur: onBlur, 
          },
        }}
        {...other}
      />
    </FormControl>
  );
}