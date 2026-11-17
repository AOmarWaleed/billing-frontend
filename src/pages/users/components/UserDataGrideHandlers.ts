import { Dispatch } from "redux";
import {
  GridRowId,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { AppDispatch } from "../../../redux/store";
import { User } from "../../../types/User";
import {
  fetchUsers,
  setPage,
  clearError,
  setSelectedItem,
  addUser,
  updateUserActiveStatus,
  updateUserLockedStatus,
  updateUser,
} from "../../../redux/slices/userSlice";
//import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import { UserDTO } from "../../../types/UserDTO";
import { mutate } from "swr";
import { apiUtility } from "../../../utils/apiUtility";

// Handler for adding new user data
export const addUserHandler = async (
  dispatch: AppDispatch,
  data: UserDTO,
  handleClose: () => void,
  refetch?: React.RefObject<() => void | null>
) => {
  try {
    await dispatch(addUser({ data: data }))
      .unwrap()
      .then(() => {
        handleClose();
        mutate((dispatch) => apiUtility(dispatch, "/usersetup/new"));
        refetch?.current?.();
      });
  } catch (error: any) {
    throw error;
  }
};

export const updateUserHandler = async (
  dispatch: AppDispatch,
  id: number,
  data: UserDTO,
  handleClose: () => void,
  refetch?: React.RefObject<() => void | null>
) => {
  try {
    await dispatch(updateUser({ id: id, data: data }))
      .unwrap()
      .then(() => {
        handleClose();
        mutate((dispatch) => apiUtility(dispatch, "/usersetup/new"));
        refetch?.current?.();
      });
  } catch (error: any) {
    throw error;
  }
};

// Handle updateActiveStatus
export const updateActiveStatus = async (
  dispatch: AppDispatch,
  userId: number,
  active: string
) => {
  await dispatch(updateUserActiveStatus({ userId: userId, active: active }));
};

// Handle updateActiveStatus
export const updateLockedStatus = async (
  dispatch: AppDispatch,
  userId: number,
  locked: string
) => {
  await dispatch(updateUserLockedStatus({ userId: userId, locked: locked }));
};

// Handler for deleting user data
// export const handleDeleteClick = async (
//   dispatch: AppDispatch,
//   deleteId: GridRowId,
//   paginationModel: GridPaginationModel,
//   setDialogOpen: (open: boolean) => void
// ) => {
//   try {
//     await dispatch(deleteUserData({ id: deleteId }))
//       .unwrap()
//       .then(() => {
//         setDialogOpen(false);
//         dispatch(
//           fetchUserGroupData({
//             page: paginationModel.page + 1,
//             limit: paginationModel.pageSize,
//           })
//         );
//       });
//   } catch (error: any) {
//     throw error;
//   }
// };

// Handler for saving updates
// export const handleSaveClick = async (
//   dispatch: AppDispatch,
//   editId: GridRowId,
//   data: User,
//   paginationModel: GridPaginationModel,
//   setOpen: (open: boolean) => void
// ) => {
//   try {
//     await dispatch(updateUserData({ id: editId, data }))
//       .unwrap()
//       .then(() => {
//         setOpen(false);
//         dispatch(
//           fetchUsers({
//             page: paginationModel.page + 1,
//             limit: paginationModel.pageSize,
//           })
//         );
//       });
//   } catch (error: any) {
//     throw error;
//   }
// };

// Handler for row selection
export const onRowsSelectionHandler = (
  ids: GridRowSelectionModel,
  userGroupData: User[],
  dispatch: AppDispatch,
  setRowId: (ids: GridRowId[]) => void
) => {
  const selectedRow = userGroupData.find((row) => row.user_id === ids[0]);
  if (selectedRow) {
    dispatch(setSelectedItem(selectedRow));
  }
  setRowId(ids);
};

// Handler for filter changes
export const handleFiltersChange =
  (setFilters: React.Dispatch<React.SetStateAction<any>>, filters: any) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({
        ...filters,
        [event.target.name]: event.target.value,
      });
    };

// Handler for search changes
export const handleSearchChange =
  (
    setSearchText: React.Dispatch<React.SetStateAction<string>>,
    dispatch: AppDispatch,
    paginationModel: GridPaginationModel
  ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchText(value);
      if (value === "") {
        dispatch(
          fetchUsers({
            page: paginationModel.page + 1,
            limit: paginationModel.pageSize,
          })
        );
      }
    };

// Handler for clearing search
export const handleClearSearch =
  (
    setSearchText: React.Dispatch<React.SetStateAction<string>>,
    dispatch: AppDispatch,
    paginationModel: GridPaginationModel
  ) =>
    () => {
      setSearchText("");
      dispatch(
        fetchUsers({
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
        })
      );
    };
