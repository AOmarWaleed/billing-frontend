import { useAppDispatch, useAppSelector } from "../../hooks/hooks"; // Adjust path to your store
import {
  fetchItems,
  addItem,
  updateItem,
  deleteItem,
  findItemsById,
  setSelectedItem,
  getGroups,
  getNphies,
  getVatCats,
  setPage,
  setLimit,
  clearError,
  setSortBy,
  setSortDirection,
} from "../slices/ItemsSlice"; // Adjust path to your slice
import { ItemData } from "../../types/ItemData";
import { HierarchicalCodeItem } from "../../types/CodeItem";
import { useNavigate } from "react-router-dom";
import { ItemDTO } from "../../types/ItemDTO";

const useItemSlice = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, errorDelete,groups, vats, nphies, selectedItem, selectedItemId, status, error, page, limit, totalCount, totalPages, sortDirection, sortBy } = useAppSelector((state) => state.items);

  // Fetch items with pagination
  const fetchAllItems = async (page: number, limit: number, searchBasic: string, item_id: number | null, item_bk: string, categoryCode: string, sortBy: string, sortDirection: string) => {
    try {
      await dispatch(fetchItems({ page, limit, searchBasic, item_id, item_bk, categoryCode, sortBy, sortDirection })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  };

  // Add a new item
  const createItem = async (item: ItemDTO) => {
    try {
      console.log("from Send Item");
      await dispatch(addItem(item))
        .unwrap()
        .then(() => {
          navigate("/items");
        });
    } catch (error) {
      throw error;
    }
  };

  // Update an existing item
  const modifyItem = async (id: number, data: ItemDTO) => {
    try {
      const result = await dispatch(updateItem({ id, data })).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error as string };
    }
  };

  // Delete an item
  const removeItem = async (id: number) => {
    try {
      await dispatch(deleteItem({ id })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  };

  // Find item by ID
  const getItemById = async (id: number) => {
    try {
      const result = await dispatch(findItemsById({ id })).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error as string };
    }
  };

  // Fetch hierarchical code groups
  const fetchGroups = async (code: number) => {
    try {
      console.log("from use item");
      await dispatch(getGroups({ code })).unwrap();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  // Fetch hierarchical code groups
  const fetchNphies = async (code: number) => {
    try {
      console.log("from use item");
      await dispatch(getNphies({ code })).unwrap();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  // Fetch hierarchical code groups
  const fetchVatCats = async (code: number) => {
    try {
      console.log("from use item");
      await dispatch(getVatCats({ code })).unwrap();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Set selected item
  const selectItem = (item: ItemData | null) => {
    dispatch(setSelectedItem(item));
  };
  // Set selected page
  const selectPage = (page: number) => {
    dispatch(setPage(page));
  };
  // Set selected page
  const selectSortBy = (sortBy: string) => {
    dispatch(setSortBy(sortBy));
  };

  // Set selected page
  const selectSortDirection = (sortDirection: string) => {
    dispatch(setSortDirection(sortDirection));
  };

  // Set selected page size
  const selectLimit = (limit: number) => {
    dispatch(setLimit(limit));
  };

  // Set selected page size
  const clearErrorMsg = () => {
    dispatch(clearError());
  };
  return {
    // State
    items,
    groups,
    vats,
    nphies,
    selectedItem,
    selectedItemId,
    status,
    error,
    page,
    limit,
    totalPages,
    totalCount,
    sortBy,
    sortDirection,
errorDelete,
    // Actions
    fetchAllItems,
    createItem,
    modifyItem,
    removeItem,
    getItemById,
    fetchGroups,
    fetchNphies,
    fetchVatCats,
    selectItem,
    selectPage,
    selectLimit,
    clearErrorMsg,
    selectSortBy,
    selectSortDirection,
  };
};

export default useItemSlice;
