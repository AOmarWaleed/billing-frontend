import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { useContext } from "react";
import {
  formatDisplayCurrency,
} from "../../../utils/formatData/formatterv2";
import { GridColDef } from "@mui/x-data-grid";
import GlPanelTable from "../../../shared/tables/GlPanelTable";
import GlCustomTable from "../../../shared/tables/GlCustomTable";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";
import { CustomGridColDef } from "../../../types/Columns";

interface PriceHistoryTableProps {
  openIos: boolean;
  setOpenIos: React.Dispatch<React.SetStateAction<boolean>>;
  iosHistory: any;
  setIosHistory: any;
  currRowItemId: number | null;
  currRowPayerId: number | null;
  currRowPriceListId: number | null;
}

const PriceHistoryTable: React.FC<PriceHistoryTableProps> = ({
  openIos,
  setOpenIos,
  iosHistory = [],
  setIosHistory,
  currRowItemId,
  currRowPayerId,
  currRowPriceListId,
}) => {
  //==================  * Resources * ===================

  const ctx = useContext(AuthGuardContext);

  if (!ctx) {
    return null;

  }

  const { resourcesData, t, userLang } = ctx;


  const columns: CustomGridColDef[] = [
    {
      field: "start_date",
      resource_key: "item_prices_6_AppliesStart",
      flex: 1,
    },
    {
      field: "end_date",
      resource_key: "item_prices_6_AppliesEnd",

      flex: 1,

    },
    {
      field: "price",
      resource_key: "item_prices_6_PriceField",

      flex: 1,
      type: "number",
      renderCell: (row) => {
        return <>{formatDisplayCurrency(row.value)}</>;
      },
    },
  ];

  return (
    <Box mr={2} p={2} sx={{ direction: "ltr", display: "grid", gap: 1 }}>
      {/* Title */}
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        {t("item_prices_6_IOSPriceHistory") || "IOS Price History"}
      </Typography>

      {/* Table */}
      <GlPanelTable>
        <Secure.GlCustomTable
          resource_key="item_prices_6_IOSPriceHistory"
          smallSize={true}
          columns={columns}
          handleDataChange={(data) => {
            setIosHistory(data);
          }}
          url="item_prices/ios_history"
          params={{
            item_id: currRowItemId || 0,
            payer_id: currRowPayerId,
            price_list_id: currRowPriceListId,
          }}
          limit={5}
        />

        {/* <GalaxySecure.GLCustomTable2 
          permission="item_prices_6_IOSPriceHistory"
          fetcher={fetcher}
          columns={columns}
          handleDataChange={(data) => {
            setIosHistory(data);
          }}
          url="item_prices/ios_history"
          params={{
            item_id: currRowItemId || 0,
            payer_id: currRowPayerId,
            price_list_id: currRowPriceListId,
          }}
          smallSize
        /> */}
      </GlPanelTable>

      {/* Actions Section */}
      {iosHistory.length > 0 ? (
        <>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            {t("item_prices_6_Actions") || "Actions"}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {iosHistory.length > 0 && (
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "primary.main",
                        color: "white",
                      }}
                    >
                      {t("item_prices_6_ModificationDate") || "Modification Date"}
                    </TableCell>
                    <TableCell>
                      {new Date(
                        iosHistory[0].modification_date
                      ).toLocaleDateString("en-GB") || " "}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "primary.main",
                      color: "white",
                    }}
                  >
                    {t("item_prices_6_AmendedBy") || "Amended By"}
                  </TableCell>
                  <TableCell>{t("item_prices_6_NotFound") || "- NOT FOUND"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default PriceHistoryTable;