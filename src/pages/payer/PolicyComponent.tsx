// PolicyComponent.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCoverageById,
  clearCoverageDetails,
  setCurrentCoverageId,
} from "../../redux/slices/payerPolicySlice";
import { RootState } from "../../redux/store";
import CoverageDetails from "./CoverageDetails";
import PolicyList from "./PolicyList";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import PolicyClassDataGrid from "./PolicyClassDataGrid";
import CoverageBenefits from "./CoverageBenefits";
import { TabContext, TabPanel } from "@mui/lab";
import AgreementExclusion from "./AgreementExclusion";
import PayerCodeMapping from "./PayerCodeMapping";

const PolicyComponent: React.FC = () => {
  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState("0");
  const {
    currentCoverageId,
    coverageDetails,
    loadingCoverage,
    errorCoverage,
    selectedPolicyId,
  } = useSelector((state: RootState) => state.payerPolicy);

  const selectedPayerId = useSelector(
    (state: RootState) => state.payer.selectedPayerId,
  );

  // Fetch coverage when ID changes
  useEffect(() => {
    if (currentCoverageId) {
      dispatch(fetchCoverageById(currentCoverageId));
    } else {
      dispatch(clearCoverageDetails());
    }
  }, [dispatch, currentCoverageId]);

  const handleSelectPolicy = (coverageId: number) => {
    dispatch(clearCoverageDetails());
    dispatch(setCurrentCoverageId(coverageId));
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {selectedPayerId && (
        <>
          <PolicyList onSelectPolicy={handleSelectPolicy} />
          <PolicyClassDataGrid />

          {/* tabs */}
          <TabContext value={currentTab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                aria-label="policy tabs"
              >
                <Tab label="Coverage Details" value="0" />
                <Tab label="Agreement Exclusion" value="1" />
                <Tab label="Payer Code Mapping" value="2" />
              </Tabs>
            </Box>

            {/* Tab Panels */}
            <TabPanel sx={{ p: 0 }} value="0">
              {/* first tab */}
              <CoverageDetails
                coverage={coverageDetails}
                loading={loadingCoverage}
                error={errorCoverage}
              />
              <CoverageBenefits />
            </TabPanel>

            <TabPanel sx={{ p: 0 }} value="1">
              {/* second tab */}
              <AgreementExclusion />
            </TabPanel>

            <TabPanel sx={{ p: 0 }} value="2">
              {/* third tab */}

              <PayerCodeMapping />
            </TabPanel>
          </TabContext>
        </>
      )}
    </Box>
  );
};

export default PolicyComponent;
