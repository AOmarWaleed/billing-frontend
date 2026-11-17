import { memo, useContext } from "react";
import { GlCustomTable, Secure } from "@givc/shared-components";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import { CustomGridColDef } from "../../../types/Columns";
import { fetcher } from "../../../utils/Api";
import { GLGridColDef } from "../../users/components/UserFacilitySection";

interface GroupUsersProps {
  groupId: number;
}

const GroupUsers = memo(function GroupUsers({ groupId }: GroupUsersProps) {
  const ctx = useContext(AuthGuardContext);
  const t = ctx?.t || ((key: string) => key);

  const columns: GLGridColDef[] = [
    {
      field: "user_name",
      headerName: t("users_9_detailsUserName") || "Username",
      permission: "users_9_detailsUserName",
      resource_key: "users_9_detailsUserName",
      uiText: "generic_0_userName",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "first_name",
      headerName: t("users_9_detailsFirstName") || "First Name",
      permission: "users_9_detailsFirstName",
      resource_key: "users_9_detailsFirstName",
      uiText: "users_9_detailsFirstName",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "family_name",
      headerName: t("users_9_detailsLastName") || "Last Name",
      permission: "users_9_detailsLastName",
      resource_key: "users_9_detailsLastName",
      uiText: "users_9_detailsLastName",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "employee_name",
      headerName: t("users_9_detailsEmployeeName") || "Employee Name",
      permission: "users_9_detailsEmployeeName",
      resource_key: "users_9_detailsEmployeeName",
      uiText: "users_9_detailsEmployeeName",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const firstName = params.row?.emp_first_name || "";
        const middleNames = params.row?.emp_middle_names || "";
        const lastName = params.row?.emp_last_name || "";
        const name = [firstName, middleNames, lastName]
          .filter(Boolean)
          .join(" ");
        return <span>{name || "-"}</span>;
      },
    },
    {
      field: "employee_id",
      headerName: t("users_9_detailsEmployeeId") || "Employee ID",
      permission: "users_9_detailsEmployeeId",
      resource_key: "users_9_detailsEmployeeId",
      uiText: "users_9_detailsEmployeeId",
      align: "left",
      headerAlign: "right",
      width: 100,
      renderCell: (params) => <span>{params.value ? params.value : "-"}</span>,
    },
  ];

  return (
    // <Secure.GlCustomTable
    //   resource_key="GroupUsers_Table"
    //   url="/usersetup/new"
    //   params={{ group_id: groupId }}
    //   columns={columns}
    //   fetcher={fetcher}
    //   getRowId={(row) => row.user_id?.toString()}
    //   smallSize={true}
    // />
    <Secure.GLCustomTable2
      permission="users_9_usersDetails"
      url="/usersetup/new"
      params={{ group_id: groupId }}
      columns={columns}
      fetcher={fetcher}
      getRowId={(row) => row.user_id?.toString()}
      smallSize={true}
    />
  );
});

export default GroupUsers;
