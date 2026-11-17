import { Box, Grid } from "@mui/material";
import React from "react";
import { CustomRowDataGridEx } from "./CustomRowDataGridEx";

const example = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
      }}>
      {/* Other components above the DataGrid */}
      <Box sx={{ mb: 2 }}>
        <h4>Your title</h4>
      </Box>

      {/* Grid container for DataGrid components */}
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} sm={6} md={4.0}>
          <CustomRowDataGridEx />
        </Grid>
        <Grid item xs={12} sm={6} md={8.0}>
          <div>the second part </div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default example;
