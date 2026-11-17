import React, { useState } from "react";
import {
  Autocomplete,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Field } from "formik";

interface CustomAutoCompleteProps {
  name: string;
  label: string;
  options: any[] | null;
  keyOb1: string;
  keyOb2?: string;
  handleIconClick: () => void;
  icon: React.ReactNode;
  setter: (field: string, value: string) => void;
  value: any;
  update: (value: any) => void;
}

const CustomAutoComplete: React.FC<CustomAutoCompleteProps> = ({
  name,
  label,
  options,
  keyOb1,
  keyOb2,
  handleIconClick,
  icon,
  setter,
  value,
  update,
}) => {
  const [touched, setTouched] = useState(false);
  
  return (
    <Field name={name}>
      {({ field, meta }: any) => (
        <Autocomplete
          value={value || null}
          options={options?.filter((option) => option[keyOb1]) || []}
          getOptionLabel={(option: any) =>
            keyOb2
              ? `${option[keyOb2]} - ${option[keyOb1]}`
              : option[keyOb1] || ""
          }
          isOptionEqualToValue={(option, value) =>
            option[keyOb1] === value[keyOb1]
          }
          onChange={(_, newValue) => {
            setter(name, newValue);
            update(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              {...field}
              size="small"
              error={meta.touched && Boolean(meta.error)}
              helperText={meta.touched && meta.error}
              name={name}
              label={label}
              variant="outlined"
              onBlur={() => setTouched(false)}
              onFocus={() => setTouched(true)}
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: touched && (
                    <InputAdornment position="start">
                      <IconButton size="small" onClick={handleIconClick}>
                        {icon}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      )}
    </Field>
  );
};

export default CustomAutoComplete;
