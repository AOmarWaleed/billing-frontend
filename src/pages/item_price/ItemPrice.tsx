import React from "react";
import "../../assets/css/Style.css";

import { Box } from "@mui/material";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import ItemPriceDG from "./ItemPriceDG";

const ItemPrice: React.FC = () => {
  return (
    <Box sx={{ py: 2 }}>
      <ItemPriceDG />
      <HandleTitle titleKey="ITEM_PRICE" />
    </Box>
  );
};

export default ItemPrice;
