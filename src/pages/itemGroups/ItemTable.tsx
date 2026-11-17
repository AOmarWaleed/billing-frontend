import React, { useState, useEffect, useRef, useContext } from "react";
import { GridColDef, GridRowId } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import AddIcon from "@mui/icons-material/Add";
import {
  addItemToGroupThunk,
  clearError,
  deleteItemFromGroupThunk,
  setCurrItem,
} from "../../redux/slices/itemGroupSlice";
import { Item, ItemGroup } from "../../types/ItemGroupIndex";
import ItemGroupActionForm from "./ItemGroupActionform";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmDeleteDialog from "../../components/deleteDialog/ConfirmDeleteDialog";
import AuthGuard, { AuthGuardContext } from "../../shared/core/AuthGuard";
import GlCustomTable from "../../shared/tables/GlCustomTable";
import Secure from "../../shared/security";
import GlPanelTable from "../../shared/tables/GlPanelTable";

type CustomGridColDef = GridColDef & {
  id?: string;
  name?: string;
  resource_key: string;
};

const ItemTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { error, currItem, selectedGroup, selectedGroupId } = useAppSelector(
    (state) => state.itemGroup
  );
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const refetchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setAppliedFilters(filters);
    }, 500);

    return () => window.clearTimeout(debounceTimer);
  }, [filters]);

  const { t } = useContext(AuthGuardContext)!;
  // API URL - will be constructed based on group_id
  const apiUrl = selectedGroup?.group_id
    ? `/api/itemgroup/${selectedGroup.group_id}/items`
    : "";

  // API params (can be extended for additional filters if needed)

  const handleAddClick = () => {
    dispatch(clearError());
    setOpenAddDialog(true);
  };

  const handleAddItem = async (values: any) => {
    await dispatch(
      addItemToGroupThunk({
        group_id: values.group_id,
        item_id: values.item_id,
      })
    )
      .unwrap()
      .then(() => {
        setOpenAddDialog(false);
        // Trigger refetch
        if (refetchRef.current) {
          refetchRef.current();
        }
      })
      .catch((error: any) => {
        throw error;
      });
  };

  const handleDeleteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(clearError());
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!currItem || !selectedGroup) return;

    try {
      const deletedId = currItem?.item_id;
      console.log("group" + deletedId + " " + selectedGroup.group_id);
      await dispatch(
        deleteItemFromGroupThunk({
          group_id: selectedGroup.group_id,
          item_id: deletedId,
        })
      ).unwrap();

      setOpenDeleteDialog(false);
      // Trigger refetch
      if (refetchRef.current) {
        refetchRef.current();
      }
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  };

  const handleRowSelected = (selectedRow: Item | null) => {
    if (selectedRow) {
      dispatch(setCurrItem(selectedRow));
    } else {
      dispatch(setCurrItem(null));
    }
  };

  const handleDataChange = (data: any[]) => {
    console.log("Items data updated:", data);
  };

  const columns: CustomGridColDef[] = [
    {
      field: "item_id",
      resource_key: "itemGroup_14_itemIdItemTable",
      headerName: "Item ID",
      flex: 1,
      headerClassName: "item-table-header",
    },
    {
      field: "description",
      headerName: "Column Description",
      resource_key: "itemGroup_14_columnDescriptionItemTable",

      flex: 4,
    },
    {
      field: "category",
      headerName: "Category",
      resource_key: "itemGroup_14_categoryItemTable",

      flex: 2,
    },
    {
      field: "categoryDescription",
      headerName: "Cat Desc",
      resource_key: "itemGroup_14_catDescItemTable",

      flex: 4,
    },
    {
      field: "subCategory",
      headerName: "Sub Category",
      resource_key: "itemGroup_14_subCategoryItemTable",

      flex: 2,
    },
    {
      field: "subCatDescription",
      headerName: "Sub Cat Desc",
      resource_key: "itemGroup_14_subCatDescItemTable",

      flex: 4,
    },
    {
      field: "set_id",
      headerName: "Set",
      resource_key: "itemGroup_14_setItemTable",

      flex: 2,
    },
    {
      field: "autoProcessed",
      headerName: "Auto_Added",
      resource_key: "itemGroup_14_autoAddedItemTable",

      flex: 2,
      renderCell: (params) => (params.value ? "Yes" : "No"),
    },
  ];

  return (
    <Box mt={2} ml={2}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Secure.GLTypography
          flex={3}
          resource_key="itemGroup_14_itemTableItemTable"
        />
        <Secure.GLTooltip resource_key="itemGroup_14_addItemItemTable">
          <Secure.GLIconButton
            resource_key="itemGroup_14_addItemItemTable"
            sx={{ height: 32, width: 32, borderRadius: 1, padding: "4px" }}
            onClick={handleAddClick}
            disabled={!selectedGroup}
          >
            <AddCircleOutlineIcon fontSize="small" />
          </Secure.GLIconButton>
        </Secure.GLTooltip>
        <Secure.GLTooltip resource_key="itemGroup_14_deleteItemItemTable">
          <Secure.GLIconButton
            resource_key="itemGroup_14_deleteItemItemTable"
            sx={{
              height: 32,
              width: 32,
              borderRadius: 1,
              padding: "4px",
            }}
            onClick={handleDeleteClick}
            disabled={!currItem}
          >
            <DeleteIcon fontSize="small" />
          </Secure.GLIconButton>
        </Secure.GLTooltip>
      </Stack>

      {/* GlCustomTable */}
      <GlPanelTable
        filterSection={
          <Stack direction="row" spacing={0} sx={{ mb: 1 }}>
            {columns.map((col) => (
              <Box key={col.field} flex={col.flex ?? 1} sx={{ px: 0.5 }}>
                <Secure.GLTextField
                  resource_key={col.resource_key}
                  fullWidth
                  size="small"
                  placeholder={t(col.resource_key)}
                  value={filters[col.field] ?? ""}
                  onChange={(e) =>
                    setFilters({ ...filters, [col.field]: e.target.value })
                  }
                />
              </Box>
            ))}
          </Stack>
        }
      >
        <Secure.GlCustomTable
          key={
            selectedGroup?.group_id
              ? `items-${selectedGroup.group_id}`
              : "no-group-items"
          }
          resource_key="items_table"
          url={apiUrl}
          params={appliedFilters}
          limit={10}
          columns={columns}
          getRowId={(row) => row.item_id?.toString()}
          onRowSelected={handleRowSelected}
          handleDataChange={handleDataChange}
          refetchRef={refetchRef}
          enableKeyboardNavigation={true}
          autoSelectFirstRow={true}
          smallSize={false}
          localeText={{
            noRowsLabel: "✨ No data available",
            noResultsOverlayLabel: "✨ No data available",
          }}
        />
      </GlPanelTable>

      {/* Add Item Dialog */}
      <GenericDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          dispatch(clearError());
        }}
        title={t("itemGroup_14_addItemAddItem")}
        icon={<AddIcon sx={dialogIconStyle} />}
        content={
          selectedGroup && (
            <ItemGroupActionForm
              initialValues={{
                item_id: "",
                group_id: selectedGroup.group_id,
                auto_proceed: "ADD",
                category_code: "",
                sub_category_code: "",
              }}
              currentGroupId={selectedGroup.group_id}
              onSubmit={handleAddItem}
              onClose={() => {
                setOpenAddDialog(false);
                dispatch(clearError());
              }}
              error={error || ""}
              isUpdate={false}
            />
          )
        }
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          dispatch(clearError());
        }}
        onConfirm={handleDeleteConfirm}
        title={t("itemGroup_14_confirmToDeleteDeleteItem")}
        message={t("itemGroup_14_areYouSureYouWantToDeleteThisItemDeleteItem")}
        errorMsg={error || null}
      />
    </Box>
  );
};

const dialogIconStyle = {
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
};

export default ItemTable;
