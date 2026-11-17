import { Box } from "@mui/material";
import React from "react";
import OrderFilter from "./Components/OrderFilter";
import OrderMaster from "./Components/OrderMaster";
import OrderDetails from "./Components/OrderDetails";
import OrderTaps from "./Components/OrderTaps";
import OrderMedicationRequest from "./Components/OrderMedicationRequest";
import OrderHL7OBX from "./Components/OrderHL7OBX";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
export default function Order() {
  return (
    <Box mt={2}>
      <HandleTitle titleKey="ORDER" />
      <Box mb={2}>
        <OrderFilter />
      </Box>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ width: "30%" }}>
          <OrderMaster />
        </Box>

        <Box
          sx={{
            width: "68%",
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          <OrderDetails />
          <OrderTaps />
        </Box>
      </Box>
    </Box>
  );
}
