import { AsyncThunkAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import { importLdapGroups } from "../../../redux/slices/groupsSlice";
import { LdapGroup } from "../../../types/LdapGroup";
import GroupSelector from "../components/GroupSelector";

interface CustomImportGroupProps {
  handleClose: () => void;
}
const ImportGroups: React.FC<CustomImportGroupProps> = ({ handleClose }) => {
  const ldapGroups = useAppSelector((state) => state.groups.ldapGroups);
  const dispatch = useAppDispatch();

  const handleImport = async (selectedGroups: LdapGroup[]) => {
    try {
      await dispatch(importLdapGroups(selectedGroups))
        .unwrap()
        .then(() => {
          handleClose();
        });
    } catch (error: any) {
      alert(error.message || "Failed to import groups.");
      throw error;
    }
  };

  return <GroupSelector data={ldapGroups} onImport={handleImport} onClose={handleClose} />;
};

export default ImportGroups;
function dispatch(
  arg0: AsyncThunkAction<
    any,
    LdapGroup[],
    {
      state?: unknown;
      dispatch?: ThunkDispatch<unknown, unknown, UnknownAction>;
      extra?: unknown;
      rejectValue?: unknown;
      serializedErrorType?: unknown;
      pendingMeta?: unknown;
      fulfilledMeta?: unknown;
      rejectedMeta?: unknown;
    }
  >
) {
  throw new Error("Function not implemented.");
}
