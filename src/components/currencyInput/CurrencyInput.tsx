// src/components/CurrencyInput.tsx
import { Box, Stack, TextField, TextFieldProps } from "@mui/material";

import { parseCurrency } from "../../utils/formatData/formatters";
import { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/formatData/formatterv2";
import RiyalSymbol from "../riyalSymbol/RiyalSymbol";

export const CurrencyInput = ({
  value,
  onChange,
  ...props
}: Omit<TextFieldProps, "onChange"> & {
  value: number;
  onChange: (value: number) => void;
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Initialize with formatted value
  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatCurrency(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue); // Allow free-form input while typing

    // Parse but don't reformat yet
    const parsedValue = parseCurrency(rawValue);
    if (!isNaN(parsedValue)) {
      onChange(parsedValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused (optional)
    setInputValue(value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format properly when blurring
    setInputValue(currency(value));
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <RiyalSymbol />
      <TextField
        {...props}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputProps={{
          inputMode: "decimal",
          // More permissive pattern for better UX
          pattern: "[0-9].?[0-9]",
        }}
      />
    </Stack>
  );
};
