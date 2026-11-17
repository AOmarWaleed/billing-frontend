import { memo, useState, useEffect, useContext } from "react";
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from "../../../utils/Api";
import GlPanelTable from "../../../shared/tables/GlPanelTable";
import {
  AuthGuardContext,
  AuthGuardPermissions,
} from "../../../shared/core/AuthGuard";
import { Secure } from "@givc/shared-components";
import { GLGridColDef } from "../../users/components/UserFacilitySection";

interface GroupAuthorizationProps {
  groupId: number;
  functionId: number | null;
}

interface AuthorizationRow {
  id: string;
  function_id: number;
  function_name: string;
  resource_id: string;
  resource_type: string;
  resource_key: string;
  resource_text: string;
  resource_text_locale: string;
  hidden: string;
  disabled: string;
  required: string;
}

const GroupAuthorization = memo(function GroupAuthorization({
  groupId,
  functionId,
}: GroupAuthorizationProps) {
  const ctx = useContext(AuthGuardContext);
  const t = ctx?.t || ((key: string) => key);
  const userLang = localStorage.getItem("lang") || "en";
  const [rows, setRows] = useState<AuthorizationRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/auth/group-authorizations", {
          params: { group_id: groupId },
        });
        if (!cancelled) {
          const data = response.data;
          setRows(Array.isArray(data) ? data : data?.data || []);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const filteredRows =
    functionId !== null && functionId !== undefined
      ? rows.filter((r) => Number(r.function_id) === Number(functionId))
      : rows;

  const allColumns: GLGridColDef[] = [
    {
      field: "function_name",
      headerName: t("users_9_functionName") || "Function",
      permission: "users_9_functionName",
      resource_key: "users_9_functionName",
      uiText: "users_9_functionName",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "resource_type",
      headerName: t("users_9_resourceType") || "Type",
      permission: "users_9_resourceType",
      resource_key: "users_9_resourceType",
      uiText: "users_9_resourceType",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "resource_text",
      headerName: t("users_9_resourceText") || "Resource",
      permission: "users_9_resourceText",
      resource_key: "users_9_resourceText",
      uiText: "users_9_resourceText",
      flex: 2,
      minWidth: 200,
      renderCell: (params) =>
        params.row?.[
          userLang === "ar" ? "resource_text_locale" : "resource_text"
        ] || params.value,
    },
    {
      field: "hidden",
      headerName: t("users_9_groupAuthorizationHidden") || "Hidden",
      permission: "users_9_groupAuthorizationHidden",
      resource_key: "users_9_groupAuthorizationHidden",
      uiText: "users_9_groupAuthorizationHidden",
      width: 90,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "disabled",
      headerName: t("users_9_groupAuthorizationDisabled") || "Disabled",
      permission: "users_9_groupAuthorizationDisabled",
      resource_key: "users_9_groupAuthorizationDisabled",
      uiText: "users_9_groupAuthorizationDisabled",
      width: 90,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "required",
      headerName: t("users_9_groupAuthorizationRequired") || "Required",
      permission: "users_9_groupAuthorizationRequired",
      resource_key: "users_9_groupAuthorizationRequired",
      uiText: "users_9_groupAuthorizationRequired",
      width: 90,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) => value ?? "-",
    },
  ];

  const columns = allColumns
    .filter((col) => ctx?.checkVisiblity(col.permission))
    .map((col) => ({
      ...col,
      headerName: ctx?.t(col.permission) || col.headerName,
    }));

  return (
    <AuthGuardPermissions secureId="users_9_groupAuthorizationTable">
      {() => (
        <Box>
          <Secure.GLCustomTable2
            permission="users_9_groupAuthorizationTable"
            rows={filteredRows}
            columns={columns.map((column) => ({
              ...column,
              resource_key: column.permission || column.resource_key,
            }))}
            loading={loading}
            getRowId={(row) => row.id || row.resource_id}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            sx={{
              "& .MuiDataGrid-cell": {
                fontSize: "0.875rem",
              },
            }}
            smallSize
          />
        </Box>
      )}
    </AuthGuardPermissions>
  );
});

export default GroupAuthorization;
