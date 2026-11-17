// src/utils/formatters.ts
import { selectFormat } from "../../redux/slices/configSlice";
import { format, parse, parseISO, isValid } from "date-fns";

import { store } from "../../redux/store";
import RiyalSymbol from "../../components/riyalSymbol/RiyalSymbol";
import { useSelector } from "react-redux";
import { FormatKeys } from "../../types/formateTypes";
// ================= DATE FORMATTER =================
const getFormat = (key: FormatKeys): string => {
  return selectFormat(key)(store.getState());
};

const defaultDateFormat = (): string => {
  return selectFormat("DATETIME_FORMAT")(store.getState()) || "MM/dd/yyyy hh:mm a";
};

export const formatDisplayCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "";

  // Convert to number if it's a string (runtime safety)
  const numericValue = typeof value === "string" ? parseFloat(value) : Number(value);

  // Check if it's a valid number
  if (isNaN(numericValue)) {
    console.warn("formatDisplayCurrency received non-numeric value:", value);
    return "";
  }

  // Get formatting settings with fallbacks
  const decimals = Number(selectFormat("CURRENCY_DECIMALS")(store.getState())) || 2;
  const thousandSep = selectFormat("NUMBER_THOUSAND_SEPARATOR")(store.getState()) || ",";
  const decimalSep = selectFormat("NUMBER_DECIMAL_SEPARATOR")(store.getState()) || ".";

  // Format number with proper separators
  const parts = numericValue.toFixed(decimals).split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
  const decimalPart = parts[1] ? decimalSep + parts[1] : "";

  return (
    <>
      {" "}
      <RiyalSymbol /> {integerPart}
      {decimalPart}
    </>
  );
};

export const formatDate = (dateString: string | Date | null | undefined, formatKey?: FormatKeys): string => {
  const format = formatKey ? (getFormat(formatKey) as string) : defaultDateFormat();
  return _formatDate(dateString, format);
};
// export const formatDate = (dateString: string | Date | null | undefined, displayFormat?: string): string => {
//   if (!dateString) return "";

//   try {
//     //const defaultDateFormat = () => useSelector(selectFormat("DATETIME_FORMAT"));

//     const formatString = displayFormat || defaultDateFormat;
//     // If already a Date object
//     if (dateString instanceof Date) {
//       return format(dateString, typeof formatString === "function" ? formatString() : formatString);
//       //return format(dateString, formatString);
//     }

//     // Clean the string
//     const cleanDateString = dateString.toString().trim();

//     // Handle common server formats
//     let dateObj: Date;

//     // ISO-like format: "12-22-1999T12:22:22"
//     if (/^\d{2}-\d{2}-\d{4}T\d{2}:\d{2}:\d{2}$/.test(cleanDateString)) {
//       const [datePart, timePart] = cleanDateString.split("T");
//       const [month, day, year] = datePart.split("-");
//       // Reconstruct as ISO format
//       dateObj = new Date(`${year}-${month}-${day}T${timePart}`);
//     }
//     // ISO format (with proper year-month-day order)
//     else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(cleanDateString)) {
//       dateObj = parseISO(cleanDateString);
//     }
//     // Fallback to JavaScript Date parsing
//     else {
//       dateObj = new Date(cleanDateString);
//     }

//     // Check if valid before formatting
//     if (isNaN(dateObj.getTime())) {
//       console.warn("Invalid date:", dateString);
//       return "";
//     }

//     return format(dateString, typeof formatString === "function" ? formatString() : formatString);
//   } catch (error) {
//     console.error("Date formatting error:", error);
//     return "";
//   }
// };
//before delete hook
export const _formatDate = (dateString: string | Date | null | undefined, displayFormat: string = "MM/dd/yyyy hh:mm a"): string => {
  if (!dateString) return "";

  try {
    // If already a Date object
    if (dateString instanceof Date) {
      return format(dateString, displayFormat);
    }

    // Clean the string
    const cleanDateString = dateString.toString().trim();

    // Handle common server formats
    let dateObj: Date;

    // ISO-like format: "12-22-1999T12:22:22"
    if (/^\d{2}-\d{2}-\d{4}T\d{2}:\d{2}:\d{2}$/.test(cleanDateString)) {
      const [datePart, timePart] = cleanDateString.split("T");
      const [month, day, year] = datePart.split("-");
      // Reconstruct as ISO format
      dateObj = new Date(`${year}-${month}-${day}T${timePart}`);
    }
    // ISO format (with proper year-month-day order)
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(cleanDateString)) {
      dateObj = parseISO(cleanDateString);
    }
    // Fallback to JavaScript Date parsing
    else {
      dateObj = new Date(cleanDateString);
    }

    // Check if valid before formatting
    if (isNaN(dateObj.getTime())) {
      console.warn("Invalid date:", dateString);
      return "";
    }

    return format(dateObj, displayFormat);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "";

  // Get formatting settings with fallbacks
  const symbol = selectFormat("CURRENCY_SYMBOL")(store.getState()) || "SAR";
  const decimals = Number(selectFormat("CURRENCY_DECIMALS")(store.getState())) || 2;
  const thousandSep = selectFormat("NUMBER_THOUSAND_SEPARATOR")(store.getState()) || ",";
  const decimalSep = selectFormat("NUMBER_DECIMAL_SEPARATOR")(store.getState()) || ".";

  // Format number with proper separators
  const parts = value.toFixed(decimals).split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
  const decimalPart = parts[1] ? decimalSep + parts[1] : "";

  //return `${symbol}${integerPart}${decimalPart}`;
  return `${integerPart}${decimalPart}`;
};

// Enhanced parseCurrency with null handling
export const parseCurrency = (displayValue: string): number | null => {
  if (!displayValue.trim()) return null;

  const { CURRENCY_SYMBOL = "$", NUMBER_THOUSAND_SEPARATOR = ",", NUMBER_DECIMAL_SEPARATOR = "." } = store.getState().config.values;

  const cleanString = displayValue
    .replace(new RegExp(`[${CURRENCY_SYMBOL}]`, "g"), "") // Remove currency symbol
    .replace(new RegExp(`[${NUMBER_THOUSAND_SEPARATOR}]`, "g"), "") // Remove thousand separators
    .replace(NUMBER_DECIMAL_SEPARATOR, "."); // Standardize decimal separator

  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? null : parsed;
};

// Number Formatter
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  // Convert string input to number
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  // Handle NaN cases from string conversion
  if (isNaN(numericValue)) return "";
  const thousandSep = selectFormat("NUMBER_THOUSAND_SEPARATOR")(store.getState());
  const decimalSep = selectFormat("NUMBER_DECIMAL_SEPARATOR")(store.getState());
  const decimals = selectFormat("NUMBER_DECIMALS")(store.getState());

  return value
    .toLocaleString(undefined, {
      minimumFractionDigits: Number(decimals),
      maximumFractionDigits: Number(decimals),
      useGrouping: true,
    })
    .replace(/,/g, thousandSep)
    .replace(/\./g, decimalSep);
};

// Text Formatter
export const formatText = (text: string): string => {
  const shouldUppercase = selectFormat("TEXT_UPPERCASE")(store.getState());
  const shouldTrim = selectFormat("TEXT_TRIM")(store.getState());
  const maxLength = selectFormat("TEXT_MAX_LENGTH")(store.getState());

  let formatted = text;
  if (shouldTrim) formatted = formatted.trim();
  if (shouldUppercase) formatted = formatted.toUpperCase();
  if (formatted.length > Number(maxLength)) formatted = formatted.substring(0, Number(maxLength));

  return formatted;
};

export const safeParse = (value: string, fallback = 0): number => {
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
};

export const parseNumber = (displayValue: string): number => {
  const { NUMBER_THOUSAND_SEPARATOR } = store.getState().config.values;
  return parseFloat(displayValue.replace(new RegExp(`\\${NUMBER_THOUSAND_SEPARATOR}`, "g"), ""));
};
// Currency Formatter
// export const formatCurrency = (value: number | null | undefined): string => {
//     if (value === null || value === undefined) return "";
//     const symbol = selectFormat("CURRENCY_SYMBOL")(store.getState());
//     const decimals = selectFormat("CURRENCY_DECIMALS")(store.getState());
//     return `${symbol}${value.toFixed(Number(decimals))}`;
//   };
//   // Enhanced parseCurrency
//   export const parseCurrency = (displayValue: string): number => {
//       const { CURRENCY_SYMBOL, NUMBER_THOUSAND_SEPARATOR, NUMBER_DECIMAL_SEPARATOR } = store.getState().config.values;

//       const cleanString = displayValue
//         .replace(CURRENCY_SYMBOL as string, "")
//         .replace(new RegExp(`\\${NUMBER_THOUSAND_SEPARATOR}`, "g"), "")
//         .replace(NUMBER_DECIMAL_SEPARATOR as string, ".");

//       return safeParse(cleanString);
//     };

// export const formatDisplayCurrency = (value: number | null | undefined) => {
//   if (value === null || value === undefined) return "";

//   // Get formatting settings with fallbacks

//   const decimals = Number(selectFormat("CURRENCY_DECIMALS")(store.getState())) || 2;
//   const thousandSep = selectFormat("NUMBER_THOUSAND_SEPARATOR")(store.getState()) || ",";
//   const decimalSep = selectFormat("NUMBER_DECIMAL_SEPARATOR")(store.getState()) || ".";

//   // Format number with proper separators
//   const parts = value.toFixed(decimals).split(".");
//   const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
//   const decimalPart = parts[1] ? decimalSep + parts[1] : "";

//   return (
//     <>
//       {" "}
//       <RiyalSymbol /> {integerPart} {decimalPart}
//     </>
//   );
// };
