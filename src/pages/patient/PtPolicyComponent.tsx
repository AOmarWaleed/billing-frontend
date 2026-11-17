import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import PatientPolicyList from "./PatientPolicyList";
import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import CoverageDetails from "./CoverageDetails";
import {
  fetchCoverageById,
  clearCoverageDetails,
  setCurrentCoverageId,
} from "../../redux/slices/patientPolicySlice";
interface PtPolicyComponentProps {
  identityNumber?: string;
  identityCode?: string;
  identityDescription?: string;
}

const PtPolicyComponent: React.FC<PtPolicyComponentProps> = ({
  identityNumber,
  identityCode,
  identityDescription,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentCoverageId, coverageDetails, loadingCoverage, errorCoverage } =
    useSelector((state: RootState) => state.patientPolicies);

  const patientId = useSelector(
    (state: RootState) => state.patient.selectedPatientId
  );
  // Fetch coverage when ID changes
  useEffect(() => {
    if (currentCoverageId) {
      dispatch(fetchCoverageById(currentCoverageId));
    }
  }, [dispatch, currentCoverageId]);

  const handleSelectPolicy = (coverageId: number) => {
    // dispatch(clearCoverageDetails());
    // dispatch(setCurrentCoverageId(coverageId));
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {patientId && (
        <>
          <PatientPolicyList
            onSelectPolicy={handleSelectPolicy}
            identityNumber={identityNumber}
            identityCode={identityCode}
            identityDescription={identityDescription}
          />
          <CoverageDetails
            coverage={coverageDetails}
            loading={loadingCoverage}
            error={errorCoverage}
          />
        </>
      )}
    </Box>
  );
};

export default PtPolicyComponent;
