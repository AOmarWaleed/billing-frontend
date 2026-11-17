import { addGroup, updateGroup } from "../../../redux/slices/groupsSlice";
import { fetchGroups as fetchUserGroups } from "../../../redux/slices/userSlice";
import { AppDispatch } from "../../../redux/store";
import { GroupDTO } from "../../../types/GroupDTO";

export const addGroupHandler = async (dispatch: AppDispatch, data: GroupDTO, handleClose: () => void) => {
  try {
    await dispatch(addGroup({ data: data }))
      .unwrap()
      .then(() => {
        dispatch(fetchUserGroups());
        handleClose();
      });
  } catch (error: any) {
    throw error;
  }
};

export const updateGroupHandler = async (dispatch: AppDispatch, id: number, data: GroupDTO, handleClose: () => void) => {
  try {
    await dispatch(updateGroup({ id: id, data: data }))
      .unwrap()
      .then(() => {
        dispatch(fetchUserGroups());
        handleClose();
      });
  } catch (error: any) {
    throw error;
  }
};
