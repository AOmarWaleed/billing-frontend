import React, { useContext } from "react";
import { Box, Typography } from "@mui/material";
import { AuthGuardContext } from "@givc/shared-components";

interface Row {
  description: string;
  item_id: number;
  item_bk: string;
  category_code: string;
}

const CustomRowItem: React.FC<{ row: Row }> = ({ row }) => {
  const t = useContext(AuthGuardContext)?.t ?? ((key: string) => key);

  return (
    <Box
      display="flex"
      alignItems="center"
      width="100%"
      gap={1}
      px={1}
      py={0}
      sx={{ minHeight: 0 }}
    >
      <Box
        display="flex"
        flexDirection="column"
        gap={0}
        flex={1}
        minWidth={0}
      >
        <Box display="flex" flexWrap="wrap" gap={1}>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            sx={{ fontSize: 12 }}
          >
            {row.description}
          </Typography>
        </Box>

        <Box display="flex" flexWrap="wrap" gap={2}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: 11 }}
          >
            {t("items_5_CategoryCode") || "Category Code"}:{" "}
            {row.category_code || "-"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: 11 }}
          >
            {t("items_5_CodeLower") || "Code"}: {row.item_bk || "-"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: 11 }}
          >
            {t("items_5_IdLower") || "Id"}: {row.item_id}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomRowItem;
