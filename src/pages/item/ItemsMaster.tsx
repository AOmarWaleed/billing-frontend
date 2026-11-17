import React, { useEffect, useRef } from "react";
import DataGridItem from "../item/components/DataGridItem";
import { Box, Grid2 } from "@mui/material";
import "../../assets/css/Style.css";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import Item from "./Item";
import Tabs from "./components/Tabs";
import useItemSlice from "../../redux/hooks/useItemSlice";

const ItemsMaster: React.FC = () => {
  const { groups, vats, nphies, error, createItem, fetchGroups, fetchNphies, fetchVatCats } = useItemSlice();

  useEffect(() => {
    fetchGroups(7);
    fetchVatCats(38);
    fetchNphies(9);
  }, []);

  const itemsRef = useRef<() => void | null>(null);

  return (
    <>
      <Box
        sx={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        }}>
        <HandleTitle titleKey="ITEMS" />
        {/* <TextExtractorTool function_id={5} /> */}
        {/* Grid container for DataGrid components */}
        <Grid2 container spacing={2} sx={{ flexGrow: 1 }}>
          <Grid2 size={{ xs:12, sm:6, md:4.0 }}>
            <DataGridItem itemsRef={itemsRef} />
          </Grid2>
          <Grid2 size={{ xs:12, sm:6, md:8.0 }}>
            <Item itemsRef={itemsRef} />
            <Tabs />
          </Grid2>
        </Grid2>
      </Box>
    </>
  );
};

export default ItemsMaster;
