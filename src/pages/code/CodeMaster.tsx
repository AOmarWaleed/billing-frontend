import React from "react";
import "../../assets/css/Style.css";
import DataGridCodeType from "./components/DataGridCodeType";
import { Box, Grid2 } from "@mui/material";
import DataGridCode from "./components/DataGridCode";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
const CodeMaster: React.FC = () => {
  return (
    <Box
      sx={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
      }}>
      <HandleTitle titleKey="CODE" />

      {/* Grid container for DataGrid components */}
      <Grid2 container spacing={1} sx={{ flexGrow: 1 }}>
        <Grid2 size={{ xs: 12, sm: 6, md: 4.0 }}>
          {/* <TextExtractorTool function_id={8} /> */}
          <DataGridCodeType />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 8.0 }} sx={{py : '0 !important'}}>
          <DataGridCode />
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default CodeMaster;
