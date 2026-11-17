import PaymentMaster from "../payment/PaymentMaster";
import { FC, useState, useRef, useContext } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Filter } from "./Components/Filter";
import { PatientTabs } from "./Components/PatientAccountTabs";
import { usePatientAccount } from "./context/PatientAccountContext";
import { differenceInYears } from "date-fns";
import { publicUrl } from "../../utils/publicUrl";
import PaymentIcon from "@mui/icons-material/Payment";
import CustomDialog from "../../components/CustomDialog/CustomDialog";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import Secure from "../../shared/security";
import { GLGridColDef } from "../../shared/security/GLCustomTable";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
const PatientAccount: FC = () => {
  const { t } = useContext(AuthGuardContext);
  const { patient, loading, selectedPatient, formData } = usePatientAccount();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [submitNetworkError, setSubmitNetworkError] = useState<string | null>(
    null,
  );
  const [patientId, setPatientId] = useState<string | null>(null);
  const [episodeData, setEpisodeData] = useState<any[]>([]);
  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
  };
  const handleOpenPaymentDialog = () => {
    setIsPaymentDialogOpen(true);
  };
  const submitRef = useRef(null);
  const paymentRefetchRef = useRef<() => void>(null);
  const handleSubmitPayment = async () => {
    setIsSubmittingPayment(true);
    try {
      if (!submitRef?.current) {
        console.log("submitRef or current is missing!");
        return;
      }
      const hasValidationError = await submitRef.current.handleOuterAction();
      if (hasValidationError) {
        setIsSubmittingPayment(false);
        return;
      }
      paymentRefetchRef.current?.();
      handleClosePaymentDialog();
      setIsSubmittingPayment(false);
    } catch (error: any) {
      setSubmitNetworkError(error?.message || "Nework Error");
      setIsSubmittingPayment(false);
    }
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
      <HandleTitle titleKey="PATIENT_ACCOUNT" />
      <CustomDialog
        title="Payment"
        open={isPaymentDialogOpen}
        onClose={handleClosePaymentDialog}
        maxWidth="md"
        actions={
          <Box display="flex" gap={4}>
            <Button
              disabled={isSubmittingPayment}
              onClick={handleSubmitPayment}
            >
              {isSubmittingPayment ? "Submintting..." : "Submit"}
            </Button>
            <Button variant="text" onClick={handleClosePaymentDialog}>
              Close{" "}
            </Button>
          </Box>
        }
      >
        <Box>
          <Box sx={{ height: "50px", mb: "8px" }}>
            <Typography>{submitNetworkError}</Typography>
          </Box>
          <PaymentMaster
            fromSinglePatientPage
            formData={formData}
            ref={submitRef}
          />
        </Box>
      </CustomDialog>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ width: "40%" }}>
          <Filter setEpisodeData={setEpisodeData} setPatientId={setPatientId} />
        </Box>
        <Box
          sx={{
            width: "60%",
            backgroundColor: "rgba(85, 197, 197, .15)",
            px: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* {loading.fetchPatient ? "true" : "false"} */}
          {/* {JSON.stringify(selectedPatient)} */}
          {!loading.fetchPatient ? (
            selectedPatient ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Secure.GLTypography resource_key="patientAccount_11_startDate" />
                  <Secure.GLTypography resource_key="patientAccount_11_startDate">
                    {episodeData?.start_date || "-"}
                  </Secure.GLTypography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Secure.GLTypography resource_key="patientAccount_11_endDate" />
                  <Secure.GLTypography resource_key="patientAccount_11_endDate">
                    {episodeData?.end_date || "-"}
                  </Secure.GLTypography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Secure.GLTypography resource_key="patientAccount_11_fullName" />
                  <Secure.GLTypography resource_key="patientAccount_11_fullName">
                    {selectedPatient?.first_name + selectedPatient?.last_name ||
                      "-"}
                  </Secure.GLTypography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Secure.GLTypography resource_key="patientAccount_11_age" />
                  {/* <Typography>{(selectedPatient?.birth_date ) || "-"}</Typography> */}
                  <Secure.GLTypography resource_key="patientAccount_11_age">
                    {differenceInYears(
                      new Date(),
                      selectedPatient?.birth_date,
                    ) || "-"}
                  </Secure.GLTypography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {selectedPatient?.is_new_born == "Y" && (
                    <Secure.GLTooltip
                      resource_key="patientAccount_11_newborn"
                      arrow
                    >
                      <img
                        src={`newborn.png`}
                        className="xsm-img"
                        alt="Newborn"
                      />
                    </Secure.GLTooltip>
                  )}
                  {selectedPatient?.nationality && (
                    <Secure.GLTooltip
                      resource_key="patientAccount_11_nationality"
                      title={selectedPatient.nationality}
                      arrow
                    >
                      <img
                        src={publicUrl(
                          `flags/${selectedPatient.nationality
                            .toLowerCase()
                            .trim()}.png`,
                        )}
                        className="sm-img"
                        alt={`${selectedPatient.nationality} flag`}
                        style={{ width: "20px", height: "20px" }}
                      />
                    </Secure.GLTooltip>
                  )}
                  {selectedPatient?.gender && (
                    <Secure.GLTooltip
                      resource_key="patientAccount_11_gender"
                      title={selectedPatient.gender}
                      arrow
                    >
                      <img
                        src={`${selectedPatient.gender
                          .toLowerCase()
                          .trim()}.png`}
                        className="sm-img "
                        alt={selectedPatient.gender}
                        style={{ width: "20px", height: "20px" }}
                      />
                    </Secure.GLTooltip>
                  )}
                  <Secure.GLTooltip
                    resource_key="patientAccount_11_paymentIcon"
                    arrow
                    placement="bottom"
                  >
                    <IconButton
                      color="primary"
                      onClick={handleOpenPaymentDialog}
                    >
                      <PaymentIcon />
                    </IconButton>
                  </Secure.GLTooltip>
                </Box>

                {/* {JSON.stringify(patient)} */}
              </>
            ) : (
              <Secure.GLTypography resource_key="patientAccount_11_pleaseSelectPatientWithEpisode" />
            )
          ) : (
            <Box
              sx={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
              <CircularProgress size="30px" />
            </Box>
          )}
        </Box>
      </Box>

      <PatientTabs patientId={patientId} paymentRefetchRef={paymentRefetchRef} />
    </Box>
  );
};

export default PatientAccount;
