// src/types/formatTypes.ts
export type FormatCategory = "date" | "currency" | "number" | "text";

export type FormatKeys =
  // Date/Time
  | "DATE_FORMAT"
  | "TIME_FORMAT"
  | "DATETIME_FORMAT"
  | "TIMESTAMP_FORMAT"
  // Currency
  | "CURRENCY_FORMAT"
  | "CURRENCY_SYMBOL"
  | "CURRENCY_DECIMALS"
  // Number
  | "NUMBER_DECIMALS"
  | "NUMBER_THOUSAND_SEPARATOR"
  | "NUMBER_DECIMAL_SEPARATOR"
  // Text
  | "TEXT_UPPERCASE"
  | "TEXT_TRIM"
  | "TEXT_MAX_LENGTH";

export const DEFAULT_FORMATS: Record<FormatKeys, string | boolean | number> = {
  // Date/Time
  DATE_FORMAT: "dd/MM/yyyy",
  TIME_FORMAT: "HH:mm:ss",
  DATETIME_FORMAT: "dd/MM/yyyy HH:mm",
  TIMESTAMP_FORMAT: "yyyy-MM-dd HH:mm:ss",
  // Currency
  CURRENCY_FORMAT: "symbol",
  CURRENCY_SYMBOL: "$",
  CURRENCY_DECIMALS: 2,
  // Number
  NUMBER_DECIMALS: 2,
  NUMBER_THOUSAND_SEPARATOR: ",",
  NUMBER_DECIMAL_SEPARATOR: ".",
  // Text
  TEXT_UPPERCASE: false,
  TEXT_TRIM: true,
  TEXT_MAX_LENGTH: "255",
};
