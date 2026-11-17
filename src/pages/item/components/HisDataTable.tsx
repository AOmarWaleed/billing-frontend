import { useContext, useMemo, useRef } from "react";
import { GlPanelTable, Secure as GalaxySecure } from "@givc/shared-components";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import { GLGridColDef } from "../../users/components/UserFacilitySection";
import { fetcher } from "../../../utils/Api";
import useItemSlice from "../../../redux/hooks/useItemSlice";

const HisDataTable = () => {
  const ctx = useContext(AuthGuardContext);
  const tableRef = useRef<(() => void) | null>(null);

  const columns = useMemo(
    (): GLGridColDef[] => [
      {
        field: "system_code",
        permission: "items_5_hisSystemCode",
        uiText: "items_5_hisSystemCode",
        headerName: "SYSTEM CODE",
        flex: 2,
        minWidth: 150,
        filterable: true,
        align: "right"
      },
      {
        field: "facility_id",
        permission: "items_5_hisFacilityId",
        uiText: "items_5_hisFacilityId",
        headerName: "FACILITY ID",
        flex: 2,
        minWidth: 150,
        filterable: true,
        align: "right"
      },
      {
        field: "facility_name",
        permission: "items_5_hisFacilityName",
        uiText: "items_5_hisFacilityName",
        headerName: "FACILITY NAME",
        flex: 4,
        minWidth: 220,
        filterable: true,
      },
      {
        field: "facility_code",
        permission: "items_5_hisHisCode",
        uiText: "items_5_hisHisCode",
        headerName: "HIS CODE",
        flex: 2,
        minWidth: 150,
        filterable: true,
        align: "right"
      },
    ],
    [],
  );

  const {
      selectedItem,
    } = useItemSlice();
  const itemId = selectedItem?.item_id;

  if (!ctx) {
    return null;
  }

  return (
    <GlPanelTable>
      <GalaxySecure.GLCustomTable2
        permission="items_5_hisDataTable"
        columns={columns}
        fetcher={fetcher}
        refetchRef={tableRef}
        url={itemId ? "/api/facility-mappings/other" : ""}
        params={{ relation: "ITEM_ID", system_code: itemId }}
        getRowId={(row) => row.facility_id}
        limit={5}
        smallSize
      />
    </GlPanelTable>
  );
};

export default HisDataTable;
