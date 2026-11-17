// src/hooks/useFormats.ts
import { useSelector } from "react-redux";
import { selectFormat, selectAllFormats } from "../../redux/slices/configSlice";
import { FormatKeys } from "../../types/formateTypes";
import { formatCurrency, formatDate as _formatDate, formatNumber, formatText } from "../../utils/formatData/formatters";
import { formatDisplayCurrency } from "../../utils/formatData/formatterv2";
import { store } from "../../redux/store";
export const useFormats = () => {
  const getFormat = (key: FormatKeys): string => {
    return selectFormat(key)(store.getState());
  };

  const defaultDateFormat = (): string => {
    return selectFormat("DATETIME_FORMAT")(store.getState()) || "MM/dd/yyyy hh:mm a";
  };
  return {
    getFormat,
    formatDate: (dateString: string | Date | null | undefined, formatKey?: FormatKeys) => {
      const format = formatKey ? (getFormat(formatKey) as string) : defaultDateFormat();
      return _formatDate(dateString, format);
    },
    currency: (value: number) => formatCurrency(value),
    displayCurrency: (value: number) => formatDisplayCurrency(value),
    number: (value: number) => formatNumber(value),
    text: (value: string) => formatText(value),
  };
};
