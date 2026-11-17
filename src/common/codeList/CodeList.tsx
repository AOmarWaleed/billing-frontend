// CodeAutocomplete.tsx
import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import axios, { AxiosError } from "axios";

interface CodeItem {
  code: string;
  description: string;
}

interface ApiResponse {
  codedata: CodeItem[];
}

const codeCache = new Map<number, CodeItem[]>();
const BaseUrl = import.meta.env.VITE_API_BASE_URL;
export const CodeList = ({
  codeType,
  placeholder = "Select code",
  value,
  onChange,
  //apiBaseUrl = "http://localhost:3001/codedata/code/list",
  apiBaseUrl = BaseUrl,
}: {
  codeType: number;
  placeholder?: string;
  value: CodeItem | null;
  onChange: (value: CodeItem | null) => void;
  apiBaseUrl?: string;
}) => {
  const [options, setOptions] = useState<CodeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadCodes = async () => {
      // Check cache first
      if (codeCache.has(codeType)) {
        setOptions(codeCache.get(codeType)!);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<ApiResponse>(`${apiBaseUrl}/${codeType}`);

        // Directly use the array response (adjust if your structure differs)
        const codes = response.data.codedata;
        codeCache.set(codeType, codes);
        setOptions(codes);
      } catch (err) {
        if (axios.isCancel(err)) return;

        const error = err as AxiosError;
        let errorMessage = "Failed to load codes";

        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = "Authentication required";
          } else if (error.response.status === 404) {
            errorMessage = "Endpoint not found - check the API URL";
          }
        }

        setError(errorMessage);
        console.error("API Error:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadCodes();

    return () => controller.abort();
  }, [codeType, apiBaseUrl]);

  return (
    <div>
      <Autocomplete
        options={options}
        loading={loading}
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        getOptionLabel={(option) => `${option.code} - ${option.description}`}
        isOptionEqualToValue={(option, value) => option.code === value?.code}
        noOptionsText={error || "No options available"}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            error={!!error}
            helperText={error}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? "Loading..." : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </div>
  );
};
