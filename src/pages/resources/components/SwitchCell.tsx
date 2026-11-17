import { Box, Switch } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { PermissionsObj } from "../Permissions";

type SwitchCellProps = {
  setPermissions: (
    value: PermissionsObj[] | ((prev: PermissionsObj[]) => PermissionsObj[]),
  ) => void;
  params: GridRenderCellParams;
};

const SwitchCell = ({ setPermissions, params }: SwitchCellProps) => {
  return params.row[params.field] ? (
    <Box display="flex" width="100%">
      <Switch
        checked={params.row[params.field] === "Y"}
        onChange={(_) => {
          const newStatus = params.row[params.field] === "Y" ? "N" : "Y";
          setPermissions((prev) =>
            prev.map((item) =>
              item.id === params.row.id
                ? { ...item, [params.field]: newStatus }
                : item,
            ),
          );
        }}
        color="info"
        size="small"
      />
    </Box>
  ) : null;
};

export default SwitchCell;
