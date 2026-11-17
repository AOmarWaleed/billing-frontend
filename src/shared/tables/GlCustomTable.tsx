import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DataGrid,
  GridFilterModel,
  GridSortModel,
  GridColDef,
  GridRowId,
  GridCellParams,
  GridSlotsComponent,
} from "@mui/x-data-grid";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useGlList } from "../hooks/useGlList";
import { useGlSetState } from "../hooks/useGlState";
import GlCustomPagination from "./GlCustomPagination";
import { format } from "date-fns";
import { useGlLocalStorage } from "../hooks/useGlLocalStorage";
import { useGlDeepCompareEffect } from "../hooks/useGlDeepCompare";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// formik
interface TableState {
  page: number;
  limit: number;
  _sort: string;
  _filter: string;
  selectedRowId: GridRowId | null;
}

export interface GlCustomTableProps<T> {
  url: string;
  autoRowHeight?: boolean;
  limit?: number;
  params?: Record<string, any>;
  columns: GridColDef[];
  customSortColumns?: string[];
  getRowId?: (row: T) => string | number;
  getRowClassName?: (params: any) => string;
  handleDataChange?: (list: any[]) => void;
  loading?: boolean;
  onRowSelected?: (selectedRow: T | null) => void;
  refetchRef?: React.MutableRefObject<(() => void) | null>;
  enableKeyboardNavigation?: boolean;
  autoSelectFirstRow?: boolean;
  smallSize?: boolean;
  hideHeader?: boolean;
  footer?: React.ReactNode;
  sx?: any;
  defaultHiddenColumns?: string[];
  actionsSideSort?: React.ReactNode;
  slots?: GridSlotsComponent;
  nphiesFetcher?: boolean;
  pageSizeOptions?: number[];
  rows?: T[];
  localeText?: Record<string, any>;
}

export default function GlCustomTable<T extends Record<string, any>>({
  url,
  limit = 10,
  params = {},
  columns,
  getRowId,
  loading: externalLoading,
  onRowSelected,
  enableKeyboardNavigation = true,
  autoSelectFirstRow = true,
  smallSize = false,
  footer,
  handleDataChange,
  refetchRef,
  hideHeader = false,
  customSortColumns = [],
  actionsSideSort,
  sx,
  defaultHiddenColumns = [],
  slots,
  nphiesFetcher = false,
  autoRowHeight = false,
  pageSizeOptions,
  rows,
  ...props
}: GlCustomTableProps<T>) {
  const tableStates = useGlSetState<TableState>({
    page: 1,
    limit: limit || 19,
    _sort: "",
    _filter: "",
    selectedRowId: null,
  });
  const storageKey = `gl_table_visibility_${url}`;
  const defaultVisibility = columns.reduce<Record<string, boolean>>(
    (acc, col) => {
      acc[col.field] = !defaultHiddenColumns.includes(col.field);
      return acc;
    },
    {},
  );

  // console.log({defaultVisibility});

  const {
    state: columnVisibilityModel,
    setState: setColumnVisibilityModel,
    setField: setColumnVisibilityField,
  } = useGlLocalStorage<Record<string, boolean>>(storageKey, defaultVisibility);

  // console.log({columnVisibilityModel });

  const [customSort, setCustomSort] = React.useState<{
    field: string;
    direction: "asc" | "desc";
  } | null>(null);

  const { glList, isLoading, handleParamsChange, mutateGlList, replaceParams } =
    useGlList<T>({
      url,
      initParams: { ...params, ...tableStates.state },
      nphiesFetcher,
    });

  useEffect(() => {
    if (rows !== undefined) {
      setData(rows);
      return;
    }

    if (glList) {
      handleDataChange && handleDataChange(glList?.data);
      setData(glList?.data || []);
    }
  }, [glList, rows]);

  const [data, setData] = useState<T[]>(glList?.data || []);
  const totalCount = glList?.total || glList?.total_count || 0;
  const isLoadingInternal = externalLoading ?? isLoading;
  const tableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!url) {
      handleDataChange && handleDataChange([]);
      setData([]);
    }
  }, [url]);
  const handleColumnVisibilityChange = useCallback(
    (newModel: Record<string, boolean>) => {
      setColumnVisibilityModel(newModel);
    },
    [setColumnVisibilityModel],
  );

  const handleRowClick = useCallback(
    (params: any) => {
      tableStates.setField("selectedRowId", params.id);
      onRowSelected?.(params.row);
    },
    [onRowSelected],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enableKeyboardNavigation || !tableRef.current || data.length === 0)
        return;

      if (!tableRef.current.contains(event.target as Node)) return;

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();

        const currentIndex = data.findIndex((row: any) => {
          const rowId = getRowId?.(row) || row.id || row._id;
          // console.log("currentIndex", rowId);

          return rowId == tableStates.state.selectedRowId;
        });

        // console.log({ currentIndex });

        if (currentIndex === -1 && data.length > 0 && autoSelectFirstRow) {
          const firstRowId =
            getRowId?.(data[0]) || data[0].id || data[0]._id || 0;
          tableStates.setField("selectedRowId", firstRowId);
          onRowSelected?.(data[0]);
          return;
        }

        let newIndex = currentIndex;
        if (event.key === "ArrowDown") {
          newIndex = Math.min(currentIndex + 1, data.length - 1);
        } else if (event.key === "ArrowUp") {
          newIndex = Math.max(currentIndex - 1, 0);
        }

        // console.log({ newIndex }, "currentIndex");

        if (newIndex !== currentIndex) {
          const newRow = data[newIndex];
          const newRowId = getRowId?.(newRow) || newRow.id || newRow._id;
          tableStates.setField("selectedRowId", newRowId);
          onRowSelected?.(newRow);
          const rowElement = document.querySelector(`[data-id="${newRowId}"]`);
          rowElement?.scrollIntoView({ block: "nearest" });
        }
      }
    },
    [
      data,
      tableStates.state.selectedRowId,
      enableKeyboardNavigation,
      autoSelectFirstRow,
      getRowId,
      onRowSelected,
    ],
  );

  const handleSortModelChange = useCallback(
    (sortModel: GridSortModel) => {
      if (sortModel.length === 0) {
        tableStates.setState({ _sort: "" });
        return;
      }

      const sortField = sortModel[0]?.field;
      const sortDirection = sortModel[0]?.sort;

      tableStates.setState({
        _sort: sortDirection ? `${sortField},${sortDirection}` : "",
        page: 1,
      });
    },
    [tableStates.setState],
  );

  const toggleSort = (field: string) => {
    setCustomSort((prev) => {
      let newDirection: "asc" | "desc" = "asc";
      if (prev?.field === field && prev.direction === "asc") {
        newDirection = "desc";
      }

      tableStates.setState({
        _sort: `${field},${newDirection}`,
        page: 1,
      });

      return { field, direction: newDirection };
    });
  };

  const handleFilterChange = useCallback(
    (filterModel: GridFilterModel) => {
      if (filterModel.items.length === 0 || !filterModel.items[0]?.value) {
        tableStates.setState({ _filter: "", page: 1 });
        return;
      }

      const filterItem = filterModel.items[0];
      if (filterItem.field?.includes("date") && filterItem.value) {
        filterItem.value = format(
          new Date(filterItem.value),
          "yyyy-MM-dd HH:mm:ss",
        );
      }
      tableStates.setState({
        _filter: `${filterItem.field},${filterItem.operator},${filterItem.value}`,
        page: 1,
      });

      tableStates.setField("selectedRowId", null);
      onRowSelected?.(null);
    },
    [tableStates.setState, onRowSelected],
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      tableStates.setState({ limit: newPageSize, page: 1 });
      tableStates.setField("selectedRowId", null);
      onRowSelected?.(null);
    },
    [tableStates.setState, onRowSelected],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      tableStates.setState({ page: newPage });
      tableStates.setField("selectedRowId", null);
      onRowSelected?.(null);
    },
    [tableStates.setState, onRowSelected],
  );

  const memoizedColumns = useMemo(() => {
    return columns.map((column) => {
      if (column.type == "actions") {
        return {
          ...column,
          filterable: false,
          sortable: false,
        };
      }
      return {
        ...column,
      };
    });
  }, [columns]);

  useGlDeepCompareEffect(() => {
    handleParamsChange({
      page: tableStates.state.page,
      limit: tableStates.state.limit,
      _sort: tableStates.state._sort,
      _filter: tableStates.state._filter,
    });
  }, [tableStates.state, handleParamsChange]);

  useGlDeepCompareEffect(() => {
    tableStates.setState({ page: 1 });
    replaceParams({
      page: 1,
      limit,
      _sort: tableStates.state._sort,
      _filter: tableStates.state._filter,
      selectedRowId: tableStates.state.selectedRowId,
      ...params,
    });
  }, [params]);

  useEffect(() => {
    if (autoSelectFirstRow && data.length > 0) {
      if (tableStates.state.selectedRowId) {
        const selectedRow = data.find(
          (r: any) => getRowId?.(r) === tableStates.state.selectedRowId,
        );
        if (selectedRow) {
          tableStates.setField(
            "selectedRowId",
            tableStates.state.selectedRowId,
          );
          return;
        }
      }

      const firstRowId = getRowId?.(data[0]) || data[0].id || data[0]._id || 0;
      tableStates.setField("selectedRowId", firstRowId);
      onRowSelected?.(data[0]);
    } else if (data.length === 0) {
      tableStates.setField("selectedRowId", null);
      onRowSelected?.(null);
    }
  }, [data, autoSelectFirstRow]);

  // useGlDeepCompareEffect(() => {
  //   if (enableKeyboardNavigation) {
  //     document.getElementById(url)?.addEventListener("keydown", handleKeyDown);
  //     return () => {
  //       document
  //         .getElementById(url)
  //         ?.removeEventListener("keydown", handleKeyDown);
  //     };
  //   }
  // }, [enableKeyboardNavigation, handleKeyDown]);

  const handleCellKeyDown = (
    params: GridCellParams,
    event: React.KeyboardEvent,
  ) => {
    if (!enableKeyboardNavigation || data.length === 0) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      const currentIndex = data.findIndex((row: any) => {
        const rowId = getRowId?.(row) || row.id || row._id;
        return rowId == tableStates.state.selectedRowId;
      });

      if (currentIndex === -1 && data.length > 0 && autoSelectFirstRow) {
        const firstRowId =
          getRowId?.(data[0]) || data[0].id || data[0]._id || 0;
        tableStates.setField("selectedRowId", firstRowId);
        onRowSelected?.(data[0]);
        return;
      }

      let newIndex = currentIndex;
      if (event.key === "ArrowDown") {
        newIndex = Math.min(currentIndex + 1, data.length - 1);
      } else if (event.key === "ArrowUp") {
        newIndex = Math.max(currentIndex - 1, 0);
      }

      if (newIndex !== currentIndex) {
        const newRow = data[newIndex];
        const newRowId = getRowId?.(newRow) || newRow.id || newRow._id;
        tableStates.setField("selectedRowId", newRowId);
        onRowSelected?.(newRow);
        const rowElement = document.querySelector(`[data-id="${newRowId}"]`);
        rowElement?.scrollIntoView({ block: "nearest" });
      }
    }
  };
  useEffect(() => {
    if (refetchRef) {
      refetchRef.current = () => {
        mutateGlList();
      };
    }
  }, [mutateGlList, refetchRef]);

  const CustomFooter = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        // p: 1,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <GlCustomPagination
        totalCount={totalCount}
        currentPage={tableStates.state.page}
        pageSize={tableStates.state.limit}
        onPageSizeChange={handlePageSizeChange}
        onPageChange={handlePageChange}
        smallSize={smallSize}
        showPageInput={!smallSize}
        showPageSizeText={!smallSize}
        pageSizeOptions={pageSizeOptions}
      />
      {footer && <Box>{footer}</Box>}
    </Box>
  );

  // console.log("table data:", data);
  // console.log("from coustom table ", isLoadingInternal);
  return (
    <div className="">
      {/* {JSON.stringify} */}
      <Stack
        direction="row"
        spacing={1}
        my={0.5}
        flexWrap={"wrap"}
        // justifyContent={"center"}
        alignItems={"center"}
      >
        {customSortColumns.map((field) => (
          <Box key={field} sx={{ display: "flex", alignItems: "center" }}>
            <Typography className="" sx={{ textTransform: "capitalize" }}>
              {field?.replace("_", " ")}
            </Typography>
            <IconButton onClick={() => toggleSort(field)} color="primary">
              <ArrowUpwardIcon
                fontSize="small"
                sx={{
                  transition: "1s all",
                  transform:
                    customSort?.field === field &&
                    customSort.direction === "asc"
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                }}
              />

              {/* {customSort?.field === field && customSort.direction === "asc" ? (
               
              ) : (
                <ArrowDownwardIcon fontSize="small" />
              )} */}
            </IconButton>
          </Box>
        ))}
        {actionsSideSort}
      </Stack>
      <Box ref={tableRef} sx={{ width: "100%", overflow: "hidden" }}>
        <DataGrid
          {...props}
          onCellKeyDown={handleCellKeyDown}
          sx={{
            ".MuiDataGrid-scrollbar": {
              display: "none",
            },
            ".MuiDataGrid-filler": {
              display: "none",
            },
            width: "100%",
            ...sx,
          }}
          rows={data}
          columns={memoizedColumns}
          sortingMode="server"
          filterMode="server"
          onFilterModelChange={handleFilterChange}
          onSortModelChange={handleSortModelChange}
          loading={isLoadingInternal}
          onRowClick={handleRowClick}
          rowSelectionModel={
            tableStates.state.selectedRowId
              ? [tableStates.state.selectedRowId]
              : []
          }
          getRowId={
            getRowId || ((row: T) => row.id || row._id || JSON.stringify(row))
          }
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={handleColumnVisibilityChange}
          slots={{
            ...slots,
            footer: CustomFooter,
            ...(hideHeader ? { columnHeaders: () => null } : {}),
          }}
          slotProps={{
            loadingOverlay: {
              variant: "skeleton",
              noRowsVariant: "skeleton",
            },
          }}
          getRowHeight={() => (autoRowHeight ? "auto" : undefined)}
        />
      </Box>
    </div>
  );
}
