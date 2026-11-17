import { GlCustomTable, OldAuthGuardContext } from "@givc/shared-components";
import { GridColDef } from "@mui/x-data-grid";
import { useContext } from "react";
import { AuthGuardContext } from "../core/AuthGuard";
import { GlCustomTableProps } from "../tables/GlCustomTable";
import { AuthGuardPermissions } from "../core/AuthGuard";
import { fetcher } from "../../utils/Api";
export type GLCustomTableSecureProps = GlCustomTableProps<any> & {
  resource_key: string;
};

export type GLGridColDef = GridColDef & {
  resource_key: string;
};

const GlCustomTableSecure = ({
  resource_key,
  ...props
}: GLCustomTableSecureProps) => {
  const ctx = useContext(OldAuthGuardContext);
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({}) => {
        return (
          <GlCustomTable
            {...props}
            fetcher={fetcher}
            columns={props.columns
              .filter((item: any) => ctx?.checkVisiblity(item.resource_key))
              .map((item: any) => {
                const translated = ctx?.t(item.resource_key);
                const fallbackHeaderName = item.headerName || item.field || translated || item.resource_key;
                const headerName = translated && translated !== item.resource_key ? translated : fallbackHeaderName;
                return { ...item, headerName };
              })}
          />
        );
      }}
    </AuthGuardPermissions>
  );
};

export default GlCustomTableSecure;
AuthGuardPermissions