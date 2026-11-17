// src/components/NumberInput.tsx
import { TextField, TextFieldProps } from "@mui/material";
import { useFormats } from "../../hooks/formatData/useFormats";
import { formatNumber, parseNumber } from "../../utils/formatData/formatters";
import { useEffect, useState } from "react";

export const NumberInput = ({
  value,
  onChange,
  ...props
}: Omit<TextFieldProps, "onChange"> & {
  value: number;
  onChange: (value: number) => void;
}) => {
  const { number } = useFormats();
  const [inputValue, setInputValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue); // Allow free-form input while typing

    const parsedValue = parseNumber(e.target.value);
    if (!isNaN(parsedValue)) onChange(parsedValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused (optional)
    setInputValue(value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format properly when blurring
    setInputValue(number(value));
  };

  // Initialize with formatted value
  useEffect(() => {
    if (!isFocused) {
      setInputValue(number(value));
    }
  }, [value, isFocused]);

  return (
    <TextField
      {...props}
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      inputProps={{
        inputMode: "decimal",
        pattern: "[0-9].?[0-9]",
      }}
    />
  );
};
