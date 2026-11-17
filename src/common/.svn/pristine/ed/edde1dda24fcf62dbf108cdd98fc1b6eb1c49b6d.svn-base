import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";

interface GroupingDataGridProps<T extends Record<string, any>>
  extends Omit<DataGridProps, "rows" | "columns"> {
  data: T[];
  columns: GridColDef[];
  countField: string;
  uniqProperty: string;
  handleSetSelectedRow: (newItem: any) => void;
  defaultPageSize?: number;
}

function GroupingDataGrid<T extends Record<string, any>>({
  data,
  columns,
  countField,
  defaultPageSize = 10,
  handleSetSelectedRow,
  uniqProperty,
  ...dataGridProps
}: GroupingDataGridProps<T>) {
  const [selectionModel, setSelectionModel] = useState<number[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >({});
  // Add state for pagination
  const [paginationModel, setPaginationModel] = useState({
    pageSize: defaultPageSize,
    page: 0,
  });

  // Get currently visible columns
  const visibleColumns = useMemo(
    () => columns.filter((col) => columnVisibilityModel[col.field] !== false),
    [columns, columnVisibilityModel]
  );

  // Auto-group by visible non-count columns
  const processedData = useMemo(() => {
    const groupFields = visibleColumns
      .filter((col) => col.field !== countField)
      .map((col) => col.field);

    return Object.values(
      data.reduce(
        (groups: Record<string, T & { id: string; count: number }>, row: T) => {
          const groupKey = groupFields.map((field) => row[field]).join("|");
          if (!groups[groupKey]) {
            (groups as any)[groupKey] = {
              ...row,
              [countField]: 0,
            };
          }
          (groups as any)[groupKey][countField] += Number(row[countField]) || 0;
          return groups;
        },
        {}
      )
    );
  }, [data, visibleColumns, countField]);

  useEffect(() => {
    selectedRow && handleSetSelectedRow(selectedRow);
  }, [selectedRow]);

  useEffect(() => {
    processedData.length > 0
      ? setSelectedRow(selectedRow)
      : setSelectedRow(null);
  }, [processedData]);

  return (
    <DataGrid
      rowSelectionModel={selectionModel}
      onRowSelectionModelChange={(newSelection: GridRowSelectionModel) => {
        setSelectionModel(newSelection as number[]);
        const selected = processedData.find(
          (f) => f[uniqProperty] === newSelection[0]
        );
        if (selected) {
          handleSetSelectedRow(selected);
        }
      }}
      onCellKeyDown={(params: any, event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();

          const currentIndex = processedData.findIndex(
            (r) => r[uniqProperty] === params.id
          );

          const nextIndex =
            event.key === "ArrowDown"
              ? Math.min(processedData.length - 1, currentIndex + 1)
              : Math.max(0, currentIndex - 1);
          const nextRow = processedData[nextIndex];
          if (nextRow) {
            handleSetSelectedRow(nextRow);
            setSelectionModel([Number(nextRow[uniqProperty])]);
          }
        }
      }}
      onRowClick={(p) => setSelectedRow(p.row)}
      rows={processedData}
      columns={columns}
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={setColumnVisibilityModel}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[5, 10, 25, 50, 100]} // Available page size options
      getRowId={(row) => row.id}
      {...dataGridProps}
    />
  );
}

export default GroupingDataGrid;

// // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
// import {
//   DataGrid,
//   DataGridProps,
//   GridColDef,
//   GridRowSelectionModel,
//   GridCellParams,
// } from "@mui/x-data-grid";
// import { useCallback, useEffect, useMemo, useState, useRef } from "react";

// interface GroupingDataGridProps<T extends Record<string, any>>
//   extends Omit<DataGridProps, "rows" | "columns"> {
//   data: T[];
//   columns: GridColDef[];
//   countField: keyof T;
//   sumFields?: (keyof T)[];
//   uniqProperty: keyof T;
//   handleSetSelectedRows: (selectedRows: T[]) => void;
//   defaultPageSize?: number;
// }

// function GroupingDataGrid<T extends Record<string, any>>({
//   data,
//   columns,
//   countField,
//   sumFields = [],
//   defaultPageSize = 10,
//   handleSetSelectedRows,
//   uniqProperty,
//   ...dataGridProps
// }: GroupingDataGridProps<T>) {
//   const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
//   const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({});
//   const [paginationModel, setPaginationModel] = useState({
//     pageSize: defaultPageSize,
//     page: 0,
//   });

//   // Use refs for values that don't need to trigger re-renders
//   const groupedRowsMapRef = useRef<Map<string, T[]>>(new Map());
//   const previousDataRef = useRef<T[]>([]);
//   const previousColumnsRef = useRef<string>(columns.map(c => c.field).join(','));

//   // Group data and track original rows
//   const processedData = useMemo(() => {
//     const groupFields = columns
//       .filter(col => columnVisibilityModel[col.field] !== false)
//       .map(col => col.field)
//       .filter(field => field !== countField && !sumFields.includes(field as keyof T));

//     if (!data.length) return [];

//     const groups = new Map<string, {group: T, originalRows: T[]}>();
//     const newGroupedRowsMap = new Map<string, T[]>();

//     for (const row of data) {
//       const groupKey = groupFields.map(field => row[field]).join("|");
//       const existing = groups.get(groupKey);

//       if (existing) {
//         existing.group[countField] = (Number(existing.group[countField]) || 0) + 1 as T[keyof T];
//         sumFields.forEach(field => {
//           existing.group[field] = ((Number(existing.group[field]) || 0) +
//                           (Number(row[field]) || 0)) as T[keyof T];
//         });
//         existing.originalRows.push(row);
//       } else {
//         const newGroup = { ...row };
//         newGroup[countField] = 1 as T[keyof T];
//         sumFields.forEach(field => {
//           newGroup[field] = (Number(row[field]) || 0) as T[keyof T];
//         });
//         groups.set(groupKey, {
//           group: newGroup,
//           originalRows: [row]
//         });
//       }
//     }

//     // Update the ref with the new grouped rows map
//     Array.from(groups.entries()).forEach(([_, value]) => {
//       newGroupedRowsMap.set(String(value.group[uniqProperty]), value.originalRows);
//     });
//     groupedRowsMapRef.current = newGroupedRowsMap;

//     return Array.from(groups.values()).map(v => v.group);
//   }, [data, columns, countField, sumFields, columnVisibilityModel, uniqProperty]);

//   // Update selected rows when data or grouping changes
//   useEffect(() => {

//     // Only update if data or columns actually changed
//     const currentColumns = columns.map(c => c.field).join(',');
//     if (data === previousDataRef.current && currentColumns === previousColumnsRef.current) {
//       return;
//     }
//     console.log("hii");

//     previousDataRef.current = data;
//     previousColumnsRef.current = currentColumns;

//     if (processedData.length > 0) {
//       // Try to maintain selection if possible
//       if (selectionModel.length > 0) {
//         const selectedRowId = String(selectionModel[0]);
//         if (groupedRowsMapRef.current.has(selectedRowId)) {
//           // Selection still valid, just update the rows
//           handleSetSelectedRows(groupedRowsMapRef.current.get(selectedRowId) || []);
//           return;
//         }
//       }

//       // Select first row by default
//       const firstRowId = String(processedData[0][uniqProperty]);
//       setSelectionModel([firstRowId]);
//       handleSetSelectedRows(groupedRowsMapRef.current.get(firstRowId) || []);
//     } else {
//       handleSetSelectedRows([]);
//     }
//   }, [ selectionModel, handleSetSelectedRows, uniqProperty , columnVisibilityModel]);

//   const handleKeyDown = useCallback((params: GridCellParams, event: React.KeyboardEvent) => {
//     if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
//       event.preventDefault();
//       const currentIndex = processedData.findIndex(
//         (r) => String(r[uniqProperty]) === String(params.id)
//       );

//       if (currentIndex === -1) return;

//       const direction = event.key === 'ArrowDown' ? 1 : -1;
//       const nextIndex = Math.max(0, Math.min(processedData.length - 1, currentIndex + direction));
//       const nextRow = processedData[nextIndex];

//       if (nextRow) {
//         const nextRowId = String(nextRow[uniqProperty]);
//         setSelectionModel([nextRowId]);
//         handleSetSelectedRows(groupedRowsMapRef.current.get(nextRowId) || []);
//       }
//     }
//   }, [processedData, handleSetSelectedRows, uniqProperty]);

//   const handleRowClick = useCallback((params: {row: T}) => {
//     const rowId = String(params.row[uniqProperty]);
//     setSelectionModel([rowId]);
//     handleSetSelectedRows(groupedRowsMapRef.current.get(rowId) || []);
//   }, [handleSetSelectedRows, uniqProperty]);

//   const handleColumnVisibilityChange = useCallback((newModel: Record<string, boolean>) => {
//     // console.log(newModel);

//     setColumnVisibilityModel(newModel);
//   }, []);

//   return (
//     <DataGrid
//       rowSelectionModel={selectionModel}
//       onRowSelectionModelChange={setSelectionModel}
//       onCellKeyDown={handleKeyDown}
//       onRowClick={handleRowClick}
//       rows={processedData}
//       columns={columns}
//       columnVisibilityModel={columnVisibilityModel}
//       onColumnVisibilityModelChange={handleColumnVisibilityChange}
//       paginationModel={paginationModel}
//       onPaginationModelChange={setPaginationModel}
//       pageSizeOptions={[5, 10, 25, 50, 100]}
//       getRowId={(row) => String(row[uniqProperty])}
//       {...dataGridProps}
//     />
//   );
// }

// export default GroupingDataGrid;
