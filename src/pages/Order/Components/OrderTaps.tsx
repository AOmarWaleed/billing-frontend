import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import React from "react";
import OrderHL7OBX from "./OrderHL7OBX";
import OrderMedicationRequest from "./OrderMedicationRequest";
import { useContext } from "react";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";
export default function OrderTaps() {
  const { t } = useContext(AuthGuardContext);
  const [value, setValue] = React.useState("1");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return (
    <div>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
          <TabList sx={{ fontSize: ".8rem" }} onChange={handleChange}>
            <Secure.GLTab
              resource_key="order_24_labResults"
              sx={{ fontSize: ".8rem" }}
              label={t("order_24_labResults")}
              value="1"
            />
            <Secure.GLTab
              resource_key="order_24_medication"
              sx={{ fontSize: ".8rem" }}
              label={t("order_24_medication")}
              value="2"
            />
            {/* <Tab sx={{ fontSize: ".8rem" }} label="Encounter" value="3" />
            <Tab sx={{ fontSize: ".8rem" }} label="info" value="4" />
            <Tab sx={{ fontSize: ".8rem" }} label="Attachment" value="5" />
            <Tab sx={{ fontSize: ".8rem" }} label="TransActions" value="6" />
            <Tab sx={{ fontSize: ".8rem" }} label="Diag & Team" value="7" />
            <Tab sx={{ fontSize: ".8rem" }} label="hl7Obx" value="7" /> */}
          </TabList>
        </Box>

        <Secure.GLTabPanel resource_key="order_24_labResults" value="1" sx={{ p: 0, pt: 1 }}>
          {/* Content for Lab Results */}
          {/* <h2>Lab Results</h2> */}
          <OrderHL7OBX />
        </Secure.GLTabPanel>
        <Secure.GLTabPanel resource_key="order_24_medication" value="2" sx={{ p: 0, pt: 1 }}>
          {/* Content for Medication */}
          {/* <h2>Medication</h2> */}
          <OrderMedicationRequest />
        </Secure.GLTabPanel>
      </TabContext>
    </div>
  );
}
