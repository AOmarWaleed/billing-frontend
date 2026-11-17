import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Field, FieldProps } from "formik";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import { useState } from "react";

type PasswordFieldProps = {
  name: string;
  label: string;
  size: "small" | "medium";
  widthPercentage?: string;
};

export function PasswordField({
  name,
  label,
  size = "small",
  widthPercentage,
}: PasswordFieldProps): JSX.Element {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () =>
    setShowPassword((show: boolean) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };
  return (
    <Field name={name}>
      {({ field, meta }: FieldProps) => (
        <TextField
          {...field}
          label={label}
          type={showPassword ? "password" : "text"}
          fullWidth
          size={size}
          margin="normal"
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.touched && meta.error}
          sx={{
            width: widthPercentage,
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword
                        ? "hide the password"
                        : "display the password"
                    }
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    onMouseUp={handleMouseUpPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    </Field>
  );
}
