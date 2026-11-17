import React, { useCallback, useMemo, useRef } from "react";
import {
  DataGrid,
  GridFilterModel,
  GridSortModel,
  GridColDef,
  GridRowId,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { useGlSetState } from "../../hooks/useGlState";
import GlCustomPagination from "../GlCustomPagination";
import { format } from "date-fns";
import { useGlLocalStorage } from "../../hooks/useGlLocalStorage";
import { useGlDeepCompareEffect } from "../../hooks/useGlDeepCompare";

interface TableState {
  page: number;
  limit: number;
  sort: string;
  filter: string;
  selectedRowId: GridRowId | null;
}

interface GlCustomTableProps<T> {
  /** Data comes from parent (Redux,etc.) */
  rows: T[];
  totalCount: number;

  loading?: boolean;

  /** UI config */
  columns: GridColDef[];
  getRowId?: (row: T) => string | number;

  /** Events */
  onParamsChange?: (params: { page: number; limit: number; sort: string; filter: string }) => void;
  onRowSelected?: (selectedRow: T | null) => void;

  /** Behavior */
  enableKeyboardNavigation?: boolean;
  autoSelectFirstRow?: boolean;
  footer?: React.ReactNode;
  tableId?: string; // unique DOM id
}

export default function GlCustomTable<T extends Record<string, any>>({
  rows,
  totalCount,
  loading,
  columns,
  getRowId,
  onParamsChange,
  onRowSelected,
  enableKeyboardNavigation = true,
  autoSelectFirstRow = true,
  footer,
  tableId = "gl-custom-table",
}: GlCustomTableProps<T>) {
  const tableStates = useGlSetState<TableState>({
    page: 1,
    limit: 10,
    sort: "",
    filter: "",
    selectedRowId: null,
  });

  const {
    state: columnVisibilityModel,
    setState: setColumnVisibilityModel,
  } = useGlLocalStorage<Record<string, boolean>>(
    `gl_table_visibility_${tableId}`,
    {}
  );

  const tableRef = useRef<HTMLDivElement>(null);

  /** -------- Row selection -------- */
  const handleRowClick = useCallback(
    (params: any) => {
      tableStates.setField("selectedRowId", params.id);
      onRowSelected?.(params.row);
    },
    [onRowSelected]
  );

  /** -------- Keyboard navigation -------- */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enableKeyboardNavigation || !tableRef.current || rows.length === 0)
        return;
      if (!tableRef.current.contains(event.target as Node)) return;

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();

        const currentIndex = rows.findIndex((row: any) => {
          const rowId = getRowId?.(row) || row.id || row._id;
          return rowId === tableStates.state.selectedRowId;
        });

        if (currentIndex === -1 && rows.length > 0 && autoSelectFirstRow) {
          const firstRowId =
            getRowId?.(rows[0]) || rows[0].id || rows[0]._id || 0;
          tableStates.setField("selectedRowId", firstRowId);
          onRowSelected?.(rows[0]);
          return;
        }

        let newIndex = currentIndex;
        if (event.key === "ArrowDown")
          newIndex = Math.min(currentIndex + 1, rows.length - 1);
        if (event.key === "ArrowUp")
          newIndex = Math.max(currentIndex - 1, 0);

        if (newIndex !== currentIndex) {
          const newRow = rows[newIndex];
          const newRowId = getRowId?.(newRow) || newRow.id || newRow._id;
          tableStates.setField("selectedRowId", newRowId);
          onRowSelected?.(newRow);

          const rowElement = document.querySelector(`[data-id="${newRowId}"]`);
          rowElement?.scrollIntoView({ block: "nearest" });
        }
      }
    },
    [rows, tableStates.state.selectedRowId, enableKeyboardNavigation, autoSelectFirstRow, getRowId, onRowSelected]
  );

  /** -------- Sort / Filter / Paging -------- */
  const handleSortModelChange = useCallback(
    (sortModel: GridSortModel) => {
      let sort = "";
      if (sortModel.length > 0) {
        const sortField = sortModel[0]?.field;
        const sortDirection = sortModel[0]?.sort;
        sort = sortDirection ? `${sortField},${sortDirection}` : "";
      }
      tableStates.setState({ sort, page: 1 });
      onParamsChange?.({
        page: 1,
        limit: tableStates.state.limit,
        sort,
        filter: tableStates.state.filter,
      });
    },
    [tableStates.state.limit, tableStates.state.filter, onParamsChange]
  );

  const handleFilterChange = useCallback(
    (filterModel: GridFilterModel) => {
      let filter = "";
      if (filterModel.items.length > 0 && filterModel.items[0]?.value) {
        const filterItem = filterModel.items[0];
        if (filterItem.field?.includes("date") && filterItem.value) {
          filterItem.value = format(
            new Date(filterItem.value),
            "yyyy-MM-dd HH:mm:ss"
          );
        }
        filter = `${filterItem.field},${filterItem.operator},${filterItem.value}`;
      }
      tableStates.setState({ filter, page: 1 });
      onParamsChange?.({
        page: 1,
        limit: tableStates.state.limit,
        sort: tableStates.state.sort,
        filter,
      });
    },
    [tableStates.state.sort, tableStates.state.limit, onParamsChange]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      tableStates.setState({ limit: newPageSize, page: 1 });
      onParamsChange?.({
        page: 1,
        limit: newPageSize,
        sort: tableStates.state.sort,
        filter: tableStates.state.filter,
      });
    },
    [tableStates.state.sort, tableStates.state.filter, onParamsChange]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      tableStates.setState({ page: newPage });
      onParamsChange?.({
        page: newPage,
        limit: tableStates.state.limit,
        sort: tableStates.state.sort,
        filter: tableStates.state.filter,
      });
    },
    [tableStates.state.limit, tableStates.state.sort, tableStates.state.filter, onParamsChange]
  );

  /** -------- Columns -------- */
  const memoizedColumns = useMemo(() => {
    return columns.map((column) =>
      column.type === "actions"
        ? { ...column, filterable: false, sortable: false }
        : column
    );
  }, [columns]);

  /** -------- Effects -------- */
  useGlDeepCompareEffect(() => {
    if (enableKeyboardNavigation) {
      document
        .getElementById(tableId)
        ?.addEventListener("keydown", handleKeyDown);
      return () => {
        document
          .getElementById(tableId)
          ?.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [enableKeyboardNavigation, handleKeyDown]);

  /** -------- Render -------- */
  return (
    <div id={tableId}>
      <Box
        ref={tableRef}
        sx={{
          height: "auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#eff2f8",
          borderRadius: "5px",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <DataGrid
            rows={rows}
            columns={memoizedColumns}
            sortingMode="server"
            filterMode="server"
            onFilterModelChange={handleFilterChange}
            onSortModelChange={handleSortModelChange}
            loading={loading}
            hideFooter
            onRowClick={handleRowClick}
            rowSelectionModel={
              tableStates.state.selectedRowId
                ? [tableStates.state.selectedRowId]
                : []
            }
            getRowId={
              getRowId ||
              ((row: T) => row.id || row._id || JSON.stringify(row))
            }
            disableColumnMenu={false}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            sx={{
              "& .MuiDataGrid-row": { cursor: "pointer" },
              "& .MuiDataGrid-row.Mui-selected": {
                backgroundColor: "primary.light",
                "&:hover": { backgroundColor: "primary.main" },
              },
            }}
            slotProps={{
              loadingOverlay: { variant: "skeleton", noRowsVariant: "skeleton" },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
          }}
        >
          <GlCustomPagination
            totalCount={totalCount}
            currentPage={tableStates.state.page}
            pageSize={tableStates.state.limit}
            onPageSizeChange={handlePageSizeChange}
            onPageChange={handlePageChange}
          />
          <Box>{footer && footer}</Box>
        </Box>
      </Box>
    </div>
  );
}
