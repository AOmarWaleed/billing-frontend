import { useEffect, useMemo, useRef, useState } from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Pagination,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

import { useGridApiRef } from "@mui/x-data-grid";
import CustomPagination from "../CustomPagination/CustomPagination";
import { render } from "react-dom";
import { getContentHelperFun } from "../../utils/trans";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import TransWrapper from "../TransWrapper/TransWrapper";

// interface CustomPaginationProps {
//   totalPages: number;
//   currentPage: number;
//   onPageChange: (page: number) => void;
// }

// function CustomPagination({
//   totalPages,
//   currentPage,
//   onPageChange,
// }: CustomPaginationProps) {
//   const handleFirstPage = () => {
//     onPageChange(1);
//   };

//   const handleLastPage = () => {
//     onPageChange(totalPages);
//   };
//   return (
//     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

//       {/* <IconButton
//         onClick={handleFirstPage}
//         disabled={currentPage === 1}
//         aria-label="Go to first page"
//       >
//         <FirstPage />
//       </IconButton>

//       <Pagination
//         count={totalPages}
//         page={currentPage}
//         onChange={(_, value) => onPageChange(value)}
//         color="primary"
//         boundaryCount={2} // Show more pages around the current page
//         showFirstButton={false}
//         showLastButton={false}
//       />

//       <IconButton
//         onClick={handleLastPage}
//         disabled={currentPage === totalPages}
//         aria-label="Go to last page"
//       >
//         <LastPage />
//       </IconButton> */}
//     </Box>
//   );
// }
interface CustomTableProps {
  loading?: boolean;
  initialRows: any[];

  height?: string;
  width?: string;

  columns: GridColDef[];
  getRowId?: any;

  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  //!queryString
  setParams: (page: any) => void;
  params: any;
  rowCount: any;
  applyFilters?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  limit: number;
  setLimit: any;
  actionHeader: string | undefined;
}

export default function CustomServerTable({
  initialRows,
  columns: columnProp,
  height = "500px",
  width = "100%",
  applyFilters = false,
  getRowId,
  onEdit,
  onDelete,
  limit,
  totalPages,
  currentPage,
  onPageChange,
  loading,
  setLimit,
  actionHeader,
  setParams,
  params,
  rowCount,
}: CustomTableProps) {
  const initialFilters = useMemo(
    () =>
      columnProp.reduce((filters, col) => {
        filters[col.field] = "";
        return filters;
      }, {} as Record<string, string>),
    [columnProp]
  );
  const apiRef = useGridApiRef();
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(
    null
  );
  //  queryString
  const { content } = useSelector((store: RootState) => store.trans);
  const handleFilterChange = (field: string, value: string) => {
    setParams((prev: any) => ({ ...prev, [field]: value }));
  };

  // Add action buttons to each row
  const actionColumn: GridColDef = {
    field: "actions",
    headerName: actionHeader,
    // width: 150,
    flex: 1,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Box>
        {onEdit && (
          <IconButton onClick={() => onEdit(params.row)} color="primary">
            <Edit />
          </IconButton>
        )}
        {onDelete && (
          
            <IconButton onClick={() => onDelete(params.row)} color="error">
              <Delete />
            </IconButton>
         
        )}
      </Box>
    ),
  };

  //!111

  const columns: GridColDef[] = [
    ...columnProp.map((col) => ({
      field: col.field,
      headerName: col.headerName,
      width: col.width || 150,
      flex: 1,
      renderCell: col.renderCell,
      
      renderHeader: () => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            px: 1,
            width: "100%",
          }}
        >
          {applyFilters ? (
            <TextField
              size="small"
              placeholder={`Filter By ${col.headerName}`}
              value={params?.[col.field] || ""}
              onChange={(e) => {
                handleFilterChange(col.field, e.target.value);
              }}
              fullWidth
              variant="outlined"
              sx={{
                mr: "10px",
                backgroundColor: "white",
                borderRadius: 2,
                alignSelf: "center",
                color: "",
                "& input": { padding: "7px 10px !important", color: "" },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "1px solid white !important",
                },
              }}
            />
          ) : (
            <Typography>{col.headerName}</Typography>
          )}
        </Box>
      ),
    })),
    ...(onEdit || onDelete ? [actionColumn] : []),
  ];

  // if (onEdit || onDelete) {
  //   columns.push(actionColumn);
  // }

  // Reset Filters
  const resetFilters = () => {
    setParams(initialFilters);
  };

  const handleRowSelection = (selectionModel: GridRowSelectionModel) => {
    if (selectionModel.length > 0) {
      setSelectedRowId(selectionModel[0]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!selectedRowId || !apiRef.current) return;

    const rowModels = apiRef.current.getRowModels();
    const rowIds = Array.from(rowModels.keys());
    const currentIndex = rowIds.indexOf(selectedRowId);

    if (event.key === "ArrowDown" && currentIndex < rowIds.length - 1) {
      const nextRowId = rowIds[currentIndex + 1];

      setSelectedRowId(nextRowId);
      apiRef.current.setRowSelectionModel([nextRowId]);
    } else if (event.key === "ArrowUp" && currentIndex > 0) {
      const prevRowId = rowIds[currentIndex - 1];
      setSelectedRowId(prevRowId);
      apiRef.current.setRowSelectionModel([prevRowId]);
    }
  };

  useEffect(() => {
    setParams(initialFilters);
  }, []);
  useEffect(() => {
    if (selectedRowId) {
      apiRef.current.setRowSelectionModel([selectedRowId]);
    }
  }, [initialRows]);

  const [pageSize, setPageSize] = useState(5); // Initial number of rows

  function changeSize() {
    // Get the API reference
    const gridApi = apiRef.current;

    // Set page size via API
    if (gridApi) {
      gridApi.setPageSize(2);
    }
  }

  return (
    <Box tabIndex={0} onKeyDown={handleKeyDown} sx={{ maxWidth: "100%" }}>
      {/* {
        applyFilters ? <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={resetFilters}>
          Reset Filters
        </Button>
      </Box> : null
      } */}

      <DataGrid
        sx={{
          "& .MuiDataGrid-columnHeaderTitleContainer": {
            width: "100%",
          },
          "& .MuiDataGrid-columnHeaderTitleContainerContent": {
            width: "100%",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            flexGrow: 1,
          },
          maxWidth: "100%",
          "& .MuiDataGrid-footerContainer": { justifyContent: "start" },
        }}
        apiRef={apiRef}
        getRowId={getRowId}
        rows={initialRows}
        columns={columns}
        disableColumnMenu
        disableColumnFilter
        disableColumnSorting
        
        rowSelectionModel={selectedRowId !== null ? [selectedRowId] : []}
        onRowSelectionModelChange={handleRowSelection}
        loading={loading}
        rowCount={rowCount}
        initialState={{
          pagination: {
            rowCount: 20,
          },
        }}
        paginationMode={"server"}
        slots={{
          pagination: () => {
            return (
              <Box sx={{ display: "flex", justifyContent: "start" }}>
                <CustomPagination
                  limit={limit}
                  setLimit={setLimit}
                  totalPages={totalPages!}
                  currentPage={currentPage!}
                  onPageChange={onPageChange!}
                />
              </Box>
            );
          },
        }}
        onPaginationModelChange={
          onPageChange ? (model) => onPageChange(model.page + 1) : undefined
        }
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            sx: { m: 2 },
          },
        }}
      />
    </Box>
  );
}

/*
    <CustomServerTable
        columns={[
          { field: "conf_key", headerName: "conf key", width: 200 },
          { field: "conf_value", headerName: "conf value", width: 200 },
          { field: "description", headerName: "Description", width: 200 },
          { field: "module_id", headerName: "module id", width: 200 },
         
        ]}
        initialRows={systemRules}
        getRowId={(row: any) => row.conf_key}
        rowCount={totalRows}
        
        loading={systemRulesSliceData.isLoading.getRulesReq}
        
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setPage}

        setParams={setParams}
        params={params}

        onDelete={(x) => {
          setConfKeyToDelete(x.conf_key);
          setDeleteOpen(true);
          
        }}
        onEdit={(x) => {
          setRowToUpdate(x);
          setEditOpen(true);
        }}
      />
*/
