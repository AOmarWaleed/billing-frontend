import PaymenMethodFormGrid from "./components/PaymentMethodsForm";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import { Patient } from "../SinglePatient/PatientAccountTypes";
import { forwardRef } from "react";
import HandleTitle from "../../components/HandleTitle/HandleTitle";

export interface SelectedPatient {
  patient_id: string;
  mrn: string;
  first_name: string;
  middle_names: string;
  last_name: string;
  birth_date: string;
  gender: string;
  nationality: string;
  phone: string;
  marital_status: string;
  city: string | null;
  state: string | null;
  country: string | null;
  health_id: string | null;
  full_name: string;
}

export interface PaymentProps {
  formData?: { patientId: string; episodeNo: string };
  fromSinglePatientPage?: boolean;
}

const PaymentMaster = forwardRef<HTMLElement, PaymentProps>(
  ({ formData, fromSinglePatientPage = false }, refToForward) => {
    return (
      <Box>
        <HandleTitle titleKey="PAYMENT" />
        {fromSinglePatientPage ? (
          <PaymenMethodFormGrid
            fromSinglePatientPage={fromSinglePatientPage}
            formData={formData}
            ref={refToForward}
          />
        ) : (
          <PaymenMethodFormGrid fromSinglePatientPage={fromSinglePatientPage} />
        )}
      </Box>
    );
  },
);
export default PaymentMaster;
