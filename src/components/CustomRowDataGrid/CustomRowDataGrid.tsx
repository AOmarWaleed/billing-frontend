import { DataGrid, GridActionsCellItem, GridToolbar, GridPaginationModel, GridColDef, GridRowId, GridRowModesModel, GridRowSelectionModel } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Box, IconButton, Stack, TextField, InputAdornment } from "@mui/material";
import CustomPagination from "../../../components/CustomPagination/CustomPagination";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmDeleteDialog from "../../../components/deleteDialog/ConfirmDeleteDialog";
import GenericDialog from "../../../components/genericDialog/GenericDialog";
import { useGridApiRef } from "@mui/x-data-grid";
import AddCircleIcon from "@mui/icons-material/AddCircle";

interface CustomRowDataGridProps<T extends { id?: any }> {
  // Data
  rows: T[];
  totalPages: number;
  page: number;
  limit: number;
  selectedItem?: T | null;

  // Columns configuration
  columns: GridColDef[];
  sortableFields: {
    field: string;
    label: string;
    currentOrder: "asc" | "desc";
  }[];

  // Callbacks
  onPageChange: (page: number) => void;
  onSortChange: (field: string, order: "asc" | "desc") => void;
  onRowSelection: (ids: GridRowSelectionModel) => void;
  onSearch: (searchText: string) => void;
  onClearSearch: () => void;

  // CRUD operations
  onAdd: () => void;
  onEdit: (id: GridRowId) => void;
  onDelete: (id: GridRowId) => Promise<void>;

  // UI customization
  title: string;
  addButtonLabel?: string;
  deleteTitle?: string;
  deleteMessage?: string;

  // State
  searchText: string;
  error?: string | null;

  // Components
  formComponent: React.ReactNode;
}

const CustomRowDataGrid = <T extends { id?: any }>({
  rows,
  totalPages,
  page,
  limit,
  selectedItem,
  columns,
  sortableFields,
  onPageChange,
  onSortChange,
  onRowSelection,
  onSearch,
  onClearSearch,
  onAdd,
  onEdit,
  onDelete,
  title,
  addButtonLabel = "Add",
  deleteTitle = "Confirm to delete",
  deleteMessage = "Are you sure you want to delete this item?",
  searchText,
  error,
  formComponent,
}: CustomRowDataGridProps<T>) => {
  const [deleteId, setDeleteId] = useState<GridRowId | null>(null);
  const [editId, setEditId] = useState<GridRowId | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const apiRef = useGridApiRef();

  // Delete dialog handlers
  const openDialog = (id: GridRowId) => () => {
    setDeleteId(id);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDeleteId(null);
  };

  // Form dialog handlers
  const handleEditClick = (id: GridRowId) => () => {
    setEditId(id);
    setOpenForm(true);
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setOpenForm(true);
    onAdd();
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  // Search handlers
  const handleQuickSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onSearch(value);
  };

  const handleKeyDownSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch(searchText);
    }
  };

  const handleSearch = () => {
    onSearch(searchText);
  };

  // Enhanced columns with actions
  const enhancedColumns: GridColDef[] = [
    ...columns,
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={handleEditClick(id)} color="inherit" />,
          <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={openDialog(id)} color="inherit" />,
        ];
      },
    },
  ];

  // Custom slots for DataGrid
  const slots = {
    toolbar: GridToolbar,
    noRowsOverlay: () => (
      <Stack height="100%" alignItems="center" justifyContent="center">
        <span className="title-text">NO DATA FOUND</span>
      </Stack>
    ),
    noResultsOverlay: () => (
      <Stack height="100%" alignItems="center" justifyContent="center">
        Local filter returns no result
      </Stack>
    ),
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog open={isDialogOpen} onClose={closeDialog} onConfirm={() => onDelete(deleteId!).then(closeDialog)} title={deleteTitle} message={deleteMessage} errorMsg={error || null} />

      {/* Form Dialog */}
      <GenericDialog
        open={openForm}
        onClose={handleCloseForm}
        title={editId ? `Update ${title}` : `Add ${title}`}
        icon={
          editId ? (
            <EditIcon
              sx={{
                backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
                color: "white",
                border: "0",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          ) : (
            <PlaylistAddIcon
              sx={{
                backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
                color: "white",
                border: "0",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          )
        }
        content={
          <>
            {error && <div style={{ color: "yellow", marginBottom: "15px" }}>{error}</div>}
            {formComponent}
          </>
        }
      />

      {/* Search Bar */}
      <Stack direction="row" spacing={0}>
        <TextField
          id="quickSearch"
          placeholder="Search"
          variant="outlined"
          sx={{
            mr: "10px",
            borderRadius: 2,
            alignSelf: "center",
            "& input": { padding: "7px 10px !important" },
          }}
          value={searchText}
          style={{ marginRight: 6, marginBottom: "20px", flex: 1 }}
          onChange={handleQuickSearchChange}
          onKeyDown={handleKeyDownSearch}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {searchText && (
                  <IconButton onClick={onClearSearch} size="small">
                    <ClearIcon />
                  </IconButton>
                )}
                <IconButton onClick={handleSearch} size="small">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* Sort Headers */}
      <Stack direction="row" spacing={0}>
        {sortableFields.map((field) => (
          <div key={field.field} style={{ flex: 3, alignItems: "center" }}>
            <span>{field.label}:</span>
            <IconButton onClick={() => onSortChange(field.field, field.currentOrder === "asc" ? "desc" : "asc")} color="primary">
              {field.currentOrder === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>
          </div>
        ))}

        <IconButton onClick={handleOpenAdd} sx={{ paddingLeft: "20px", alignContent: "right" }}>
          <AddCircleIcon />
          <span style={{ paddingLeft: "10px" }} className="title-text">
            {addButtonLabel}
          </span>
        </IconButton>
      </Stack>

      {/* DataGrid */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <DataGrid
          apiRef={apiRef}
          autoHeight
          getRowHeight={() => "auto"}
          rowHeight={"auto"}
          sx={{ "--DataGrid-overlayHeight": "650px" }}
          rows={rows}
          columns={enhancedColumns}
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          hideFooterSelectedRowCount={true}
          slots={{
            ...slots,
            pagination: () => (
              <Box sx={{ display: "flex", width: "100%", justifyContent: "start" }}>
                <CustomPagination totalPages={totalPages} onPageChange={onPageChange} currentPage={page} limit={limit} />
              </Box>
            ),
          }}
          getRowId={(row) => row.id?.toString() || ""}
          rowSelectionModel={selectedItem?.id ? ([selectedItem.id] as GridRowSelectionModel) : []}
          onRowSelectionModelChange={onRowSelection}
        />
      </Box>
    </>
  );
};

export default CustomRowDataGrid;
