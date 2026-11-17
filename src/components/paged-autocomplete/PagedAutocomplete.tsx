// components/paged-autocomplete/PagedAutocomplete.tsx
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Autocomplete, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { usePagedList, FetchPageFn } from "../../hooks/usePagedList";

function useDebounced(v: string, ms = 300) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

export type GetOptionKey<T> = (opt: T) => string | number;
export type GetOptionLabel<T> = (opt: T) => string;

type Props<T> = {
  fetchPage: FetchPageFn<T>;
  getOptionKey: GetOptionKey<T>;
  getOptionLabel: GetOptionLabel<T>;

  label?: string;
  value: T | null;
  onChange: (val: T | null) => void;

  pageSize?: number;
  maxPagesBuffered?: number;
  placeholder?: string;
  disabled?: boolean;

  // Optional: custom render
  renderOptionContent?: (opt: T) => React.ReactNode;
};

export function PagedAutocomplete<T>({
  fetchPage,
  getOptionKey,
  getOptionLabel,
  label = "Select",
  value,
  onChange,
  pageSize = 50,
  maxPagesBuffered = 6,
  placeholder = "Type to search…",
  disabled,
  renderOptionContent,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const q = useDebounced(input, 300);
  const listboxRef = useRef<HTMLUListElement | null>(null);

  const {
    options,
    loading,
    canLoadNext,
    canLoadPrev,
    loadPage,
    trimIfNeeded,
    firstPage,
    lastPage,
  } = usePagedList<T>(fetchPage, { pageSize, maxPagesBuffered, query: q });

  // Load first page on open
  useEffect(() => {
    if (open && firstPage === 1 && lastPage === 1 && options.length === 0) {
      void loadPage(1);
    }
  }, [open, firstPage, lastPage, options.length, loadPage]);

  // Scroll handler
  const onListboxScroll = useCallback(async (e: React.UIEvent<HTMLUListElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    const nearTop = el.scrollTop <= 24;

    if (nearBottom && canLoadNext && !loading) {
      await loadPage(lastPage + 1);
      trimIfNeeded("append");
    } else if (nearTop && canLoadPrev && !loading) {
      const before = el.scrollHeight;
      await loadPage(firstPage - 1);
      const after = el.scrollHeight;
      el.scrollTop += (after - before); // keep viewport anchored
      trimIfNeeded("prepend");
    }
  }, [canLoadNext, canLoadPrev, loading, loadPage, trimIfNeeded, firstPage, lastPage]);

  return (
    <Autocomplete<T, false, false, false>
      disableClearable={false}
      disabled={disabled}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={value}
      onChange={(_, v) => onChange(v)}
      options={options}
      filterOptions={(x) => x} // server filters
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(o, v) => getOptionKey(o) === getOptionKey(v)}
      inputValue={input}
      onInputChange={(_, v) => setInput(v)}
      loading={loading && options.length === 0}
      renderInput={(params) => (
        <TextField
          {...params}
          //label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={18} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      slotProps={{
        listbox: {
          ref: (node: HTMLUListElement) => (listboxRef.current = node),
          onScroll: onListboxScroll,
          sx: { maxHeight: 360, overflowY: "auto" },
        },
      }}
      renderOption={(props, option) => (
        <li {...props} key={String(getOptionKey(option))}>
          {renderOptionContent ? (
            renderOptionContent(option)
          ) : (
            <Stack>
              <Typography variant="body2">{getOptionLabel(option)}</Typography>
            </Stack>
          )}
        </li>
      )}
      noOptionsText={open && loading ? "Loading…" : "No matches"}
    />
  );
}
