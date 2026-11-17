import React, { useState } from "react";
import { useFormats } from "../hooks/formatData/useFormats";

import { FormikDatePicker } from "../components/formikDatePicker/FormikDatePicker";
import CustomDatePicker from "../components/CustomDatePicker/CustomDatePicker";
import { TextField } from "@mui/material";
import { formatCurrency, formatDate, formatDisplayCurrency, formatNumber, parseCurrency, parseNumber } from "../utils/formatData/formatterv2";
import { CurrencyInput } from "../components/currencyInput/CurrencyInput";
import { NumberInput } from "../components/numberInput/NumberInput";
import RiyalSymbol from "../components/riyalSymbol/RiyalSymbol";
import Example from "../common/codeList/Example";

export const FormatDataEx = () => {
  const [dateValue, setDateValue] = useState();
  const [numberValue, setNumberValue] = useState(null);
  const [currencyValue, setCurrencyValue] = useState();

  const formattedDate = formatDate(new Date());

  const serverDates = [
    "12-22-1999T12:22:22", // Your custom format
    "2023-05-15T14:30:00", // ISO format
    "05/15/2023 14:30", // Common US format
    "Invalid-date-string", // Will return empty string
  ];
  return (
    <div style={{ padding: "20px", alignItems: "center " }}>
      <h3>Format Data</h3>

      <h2>DATETIME FORMAT</h2>
      <ul>
        {serverDates.map((dateStr, i) => (
          <li key={i}>
            {dateStr} → {formatDate(dateStr)}
          </li>
        ))}
      </ul>

      <h2>DATE_FORMAT</h2>
      <ul>
        {serverDates.map((dateStr, i) => (
          <li key={i}>
            {dateStr} → {formatDate(dateStr, "DATE_FORMAT")}
          </li>
        ))}
      </ul>

      <h2>TIME_FORMAT</h2>
      <ul>
        {serverDates.map((dateStr, i) => (
          <li key={i}>
            {dateStr} → {formatDate(dateStr, "TIME_FORMAT")}
          </li>
        ))}
      </ul>

      <h2>TIMESTAMP_FORMAT</h2>
      <ul>
        {serverDates.map((dateStr, i) => (
          <li key={i}>
            {dateStr} → {formatDate(dateStr, "TIMESTAMP_FORMAT")}
          </li>
        ))}
      </ul>

      <div>
        {/* // <p>Date: {date(new Date(), "DATETIME_FORMAT")}</p> */}
        <h3>Currency </h3>
        <p>Total: {formatDisplayCurrency(1250.5)}</p>
        <p>
          <RiyalSymbol /> 198
        </p>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span>{"\uFDFC"}</span>
          <span>455</span>
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span>﷼</span>
          <span>5665</span>
        </span>
        <p>Input for currency</p>
        <CurrencyInput placeholder="Price" value={currencyValue} onChange={(val) => setCurrencyValue(val)} />

        <h3>Number</h3>
        <p>Quantity: {formatNumber(1500)} units</p>
      </div>
      <div>
        <p>input for numbers</p>
        <NumberInput placeholder="Quantity" value={numberValue} onChange={(val) => setNumberValue(val)} />
      </div>
      <h3>Date</h3>

      <span>{formatDate("12-22-1999T12:22:22", "DATETIME_FORMAT")} </span>

      <p> {formatDate("12-22-1999T12:22:22")}</p>
      <p>Custom format: {formatDate("12-22-1999T12:22:22")}</p>

      <CustomDatePicker placeholder="Select Date" value={dateValue} onChange={setDateValue} />

      {/* <Example /> */}
    </div>
  );
};
