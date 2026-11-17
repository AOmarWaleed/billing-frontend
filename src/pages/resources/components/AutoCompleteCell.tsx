import { GridRenderCellParams } from "@mui/x-data-grid";
import { PermissionsObj, getAvailableGroups } from "../Permissions";
import { Autocomplete, TextField } from "@mui/material";

type AutoCompleteCellProps = {
  setPermissions: (
    value: PermissionsObj[] | ((prev: PermissionsObj[]) => PermissionsObj[]),
  ) => void;
  params: GridRenderCellParams;
  permissions: PermissionsObj[];
  groups: any;
};

const AutoCompleteCell = ({
  setPermissions,
  permissions,
  params,
  groups,
}: AutoCompleteCellProps) => {
  return (
    <Autocomplete
      disabled={params.row.dbexisted}
      size="small"
      options={getAvailableGroups(groups, permissions)}
      getOptionLabel={(option) => option.group_id + " " + option.group_name}
      value={groups.find(
        (group: any) =>
          group.group_id ===
            permissions.find((item: any) => item.id === params.row.id)
              ?.group_id || null,
      )}
      onChange={(_, value) => {
        setPermissions((prev) =>
          prev.map((item) =>
            item.id === params.row.id
              ? { ...item, group_id: value?.group_id }
              : item,
          ),
        );
      }}
      disableClearable
      renderInput={(params) => (
        <TextField {...params} placeholder="Select a group..." />
      )}
    />
  );
};

export default AutoCompleteCell;
