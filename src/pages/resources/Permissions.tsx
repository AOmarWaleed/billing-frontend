import { useState, useEffect, useRef } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { GridFooterContainer } from "@mui/x-data-grid";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoCompleteCell from "./components/AutoCompleteCell";
import CustomDialog from "../../components/CustomDialog/CustomDialog";
import api from "../../utils/Api";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  Grid,
  Switch,
  Autocomplete,
  TextField,
  Tooltip,
  useTheme,
} from "@mui/material";
import SwitchCell from "./components/SwitchCell";
import { v4 as uuid } from "uuid";
import { AddCircleOutline } from "@mui/icons-material";
import { DisplayMsgDialog, Secure } from "@givc/shared-components";
import { publicUrl } from "../../utils/publicUrl";

export type PermissionsObj = {
  id: string;
  group_id: number;
  resource_id: string;
  hidden: "Y" | "N";
  disabled: "Y" | "N" | null;
  required: "Y" | "N" | null;
  show: "Y" | "N";
  dbexisted: true | false;
};

export const getAvailableGroups = (groups: any, permissions: any) =>
  groups?.filter((group: any) =>
    permissions.every(
      (permission: any) => permission.group_id !== group.group_id,
    ),
  ) || null;

const Permissions = ({ row }: { row: any }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<PermissionsObj[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const initialPermissionsRef = useRef<PermissionsObj[]>([]);
  const hasChanges = () => {
    if (permissions.length !== initialPermissionsRef.current.length) {
      return true;
    }
    return permissions.some((perm) => {
      const initialPerm = initialPermissionsRef.current.find(
        (p) => p.id === perm.id,
      );
      if (!initialPerm) return true;
      return (
        perm.group_id !== initialPerm.group_id ||
        perm.hidden !== initialPerm.hidden ||
        perm.disabled !== initialPerm.disabled ||
        perm.required !== initialPerm.required
      );
    });
  };

  const CustomFooter = () => {
    return (
      <GridFooterContainer
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "flex-end",
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          {/* <Button
            onClick={handleAddRow}
            variant="text"
            startIcon={<AddCircleOutline />}
          >
            add permissions
          </Button> */}
          <Button
            variant="contained"
            onClick={updatePermissions}
            disabled={isLoadingPermissions || !hasChanges()}
          >
            {isLoadingPermissions ? "Saving..." : "Save"}
          </Button>
        </Box>
      </GridFooterContainer>
    );
  };

  /* HANDLERS */
  const updatePermissions = async () => {
    setIsLoadingPermissions(true);
    try {
      await api.post("api/resources/group-auth", {
        user_group_auth: permissions,
      });
      await fetchPermissions();
    } catch (error: any) {
      setError(error.message);
      setIsLoadingPermissions(false);
    }
  };
  const handleDeletePermissions = async () => {
    setIsDeleting(true);
    try {
      const response = await api.delete("api/auth/permissions", {
        params: {
          resource_id: selectedRow.resource_id,
          group_id: selectedRow.group_id,
        },
      });
      setIsDeleting(false);
      setSelectedRow(null);
      setPermissions((prev) =>
        prev.filter((item) => item.id !== selectedRow.id),
      );
      initialPermissionsRef.current = initialPermissionsRef.current.filter(
        (item) => item.id !== selectedRow.id,
      );
      setOpenDialog(false);
    } catch (error: any) {
      console.log(error);
      setError(error.response.data.error.message);
      setIsDeleting(false);
    }
  };

  const handleStartDeleting = (row: any) => {
    setOpenDialog(true);
    setSelectedRow(row);
  };
  const handleAddRow = () => {
    setPermissions((prev) => [
      ...prev,
      {
        id: uuid(),
        group_id: getAvailableGroups(groups, permissions)[0]?.group_id,
        resource_id: row.resource_id,
        hidden: "N",
        show: "Y",
        disabled:
          row.resource_type === "BUTTON" || row.resource_type === "INPUT"
            ? "N"
            : null,
        required: row.resource_type === "INPUT" ? "N" : null,
        dbexisted: false,
      },
    ]);
  };
  const handleRemoveRow = (targetId: string) =>
    setPermissions((prev) => prev.filter((item) => item.id !== targetId));
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError("");
  };
  /* EFFECTS */
  const fetchAllGroups = async () => {
    const response = await api.get("/api/user-groups", {
      params: { page: 1, limit: 200 },
    });
    setGroups(response.data.data);
  };
  const fetchPermissions = async () => {
    setIsLoadingPermissions(true);
    try {
      const response = await api.get("api/auth/permissions", {
        params: { resource_id: row.resource_id },
      });
      setPermissions(response.data.data);
      initialPermissionsRef.current = response.data.data;
      setIsLoadingPermissions(false);
    } catch (err: any) {
      setPermissions([]);
      initialPermissionsRef.current = [];
      setIsLoadingPermissions(false);
    }
  };
  useEffect(() => {
    fetchAllGroups();
  }, []);

  useEffect(() => {
    initialPermissionsRef.current = [];
  }, [row]);

  useEffect(() => {
    fetchPermissions();
  }, [row]);

  const theme = useTheme();

  const columns: GridColDef[] = [
    {
      field: "group_id",
      headerName: "Group",
      flex: 8,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <AutoCompleteCell
          setPermissions={setPermissions}
          params={params}
          groups={groups}
          permissions={permissions}
        />
      ),
    },
    {
      field: "hidden",
      headerName: "Hidden",
      flex: 2,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <SwitchCell setPermissions={setPermissions} params={params} />
      ),
    },
    {
      field: "disabled",
      headerName: "Disabled",
      flex: 2,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <SwitchCell setPermissions={setPermissions} params={params} />
      ),
    },
    {
      field: "required",
      headerName: "Required",
      flex: 2,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <SwitchCell setPermissions={setPermissions} params={params} />
      ),
    },

    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      flex: 2,
      sortable: false,
      filterable: false,
      renderHeader: () => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            justifyContent: "space-between",
          }}
        >
          <span>Actions</span>
          <Secure.GLIconButton2
            permission="resources_10_AddPermissionButton"
            uiText="generic_0_add"
            fallBackText="Add Permission"
            onClick={handleAddRow}
            size="small"
          >
            <img
              src={publicUrl(`themes/${theme.palette.mode}/icons/plus.png`)}
            />
          </Secure.GLIconButton2>
        </Box>
      ),
      renderCell: (params) => {
        return (
          <IconButton
            color="error"
            onClick={
              params.row.dbexisted
                ? () => handleStartDeleting(params.row)
                : () => handleRemoveRow(params.row.id)
            }
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              height: "100%",
              padding: 0,
            }}
          >
            {params.row.dbexisted ? (
              <Tooltip title="Delete Permissions" arrow>
                <img
                  src={publicUrl(
                    `themes/${theme.palette.mode}/icons/delete.png`,
                  )}
                  alt="Delete"
                />
              </Tooltip>
            ) : (
              <Tooltip title="Remove Row" arrow>
                <RemoveCircleOutlineIcon />
              </Tooltip>
            )}
          </IconButton>
        );
      },
    },
  ];
  return (
    <Box>
      <DataGrid
        columns={columns}
        rows={permissions}
        hideFooterPagination
        hideFooterSelectedRowCount
        slots={{ footer: CustomFooter }}
        disableRowSelectionOnClick
        loading={isLoadingPermissions}
        getRowClassName={(params) =>
          params.row.dbexisted ? "dbexisted-row" : "new-row"
        }
        sx={{
          "&  .new-row": {
            backgroundColor: "#c8fac8 !important",
          },
        }}
      />
      {/* <CustomDialog
        open={openDialog}
        onClose={handleCloseDialog}
        title={"Confirm Delete Permissions"}
        maxWidth="sm"
        actions={
          <Box>
            <Button
              disabled={isDeleting}
              variant="contained"
              color="warning"
              onClick={handleDeletePermissions}
            >
              Delete
            </Button>
            <Button variant="text" onClick={handleCloseDialog}>
              Cancel
            </Button>
          </Box>
        }
      >
        <Box>
          <Box sx={{ mb: 2, height: "20px" }}>
            <Typography>{error}</Typography>
          </Box>
          <Typography>
            Are you sure you want to delete permissions for this group?
          </Typography>
        </Box>
      </CustomDialog> */}
      <CustomDialog
        open={!!error}
        onClose={() => setError(null)}
        title={"Errors during updating permissions"}
        maxWidth="sm"
      >
        <Box sx={{ width: "100%" }}>{error}</Box>
      </CustomDialog>

      <DisplayMsgDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onAction={handleDeletePermissions}
        status="DELETE"
        getResource={false}
        actionLabel="Delete"
        actionColor="error"
        description="Are you sure you want to delete permissions for this group?"
      />
    </Box>
  );
};
export default Permissions;
