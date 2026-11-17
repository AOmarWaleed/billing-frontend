import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useFormikContext } from "formik";

interface PatientAutocompleteProps {
  name: string;
  label: string;
  patients: any[];
  loading?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  error?: boolean;
  helperText?: string;
}

export const PatientAutocomplete: React.FC<PatientAutocompleteProps> = ({
  name,
  label,
  patients,
  loading = false,
  value: propValue,
  onChange: propOnChange,
  error: propError,
  helperText: propHelperText,
}) => {
  const formik = useFormikContext();

  // Use props if provided, otherwise use Formik context
  const value =
    propValue !== undefined ? propValue : (formik as any)?.values[name] || null;
  const error =
    propError !== undefined
      ? propError
      : (formik as any)?.touched[name] &&
        Boolean((formik as any)?.errors[name]);
  const helperText =
    propHelperText !== undefined
      ? propHelperText
      : (formik as any)?.touched[name] && (formik as any)?.errors[name];

  const handleChange = (event: any, newValue: any) => {
    if (propOnChange) {
      propOnChange(newValue);
    }
    if (formik) {
      formik.setFieldValue(name, newValue ? newValue.patient_id : null);
    }
  };

  return (
    <Autocomplete
      options={patients}
      loading={loading}
      ListboxProps={{
        sx: {
          "& .MuiAutocomplete-option": {
            fontSize: "12px",
          },
        },
      }}
      renderOption={(params, row) => (
        <li
          {...params}
          style={{
            fontSize: "10px !important",
            marginBottom: "5px",
            display: "block",
            flexWrap: "wrap",
          }}
        >
          {`${row?.patient_id} - ${row?.first_name} ${row?.middle_names || ''} ${row?.last_name} `}
        </li>
      )}
      getOptionLabel={(option) =>
        `${option?.patient_id} - ${option?.first_name} ${option?.middle_names || ''} ${option?.last_name}`
      }
      value={patients?.find((option) => option?.patient_id === value) || null}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size="small"
          error={error}
          helperText={helperText}
          sx={{ fontSize: "12px" }}
        />
      )}
    />
  );
};
