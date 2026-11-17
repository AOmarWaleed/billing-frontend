import { useState } from "react";
import { toast } from "react-toastify";
import { DisplayMsgDialog, Secure } from "@givc/shared-components";
import EligibilityService from "../../redux/services/EligibilityService";
import { IconButton, Tooltip, useTheme } from "@mui/material";

interface CheckInsuranceButtonProps {
  identityNumber?: string;
  identityType?: string;
  identityDescription?: string;
  // env?: "settings" | "live" | "test";
  resourceKey?: string;
  onResult?: (data: any) => void;
}

type MessageStatus = "WARNING" | "ERROR" | "INFO" | "QUESTION";

const CheckInsuranceButton: React.FC<CheckInsuranceButtonProps> = ({
  identityNumber,
  identityType,
  identityDescription,
  // env,
  resourceKey = "patients_20_checkInsurance",
  onResult,
}) => {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<{
    open: boolean;
    status: MessageStatus;
    description: string;
  }>({ open: false, status: "INFO", description: "" });

  const handleCheck = async () => {
    // Clear stale text before each new check.
    setMessage({ open: false, status: "INFO", description: "" });

    const identity = (identityNumber || "").trim();
    const code = identityType || "PRC";

    if (!identity) {
      toast.error("Please enter Identity Number.");
      return;
    }

    if (code === "PRC" && identity.length < 10) {
      toast.error("Iqama/National ID must be at least 10 characters.");
      return;
    }

    const description = identityDescription || "iqama";

    setChecking(true);
    try {
      const response = await EligibilityService.checkInsurance(
        identity,
        code,
        description,
        // env,
      );

      const payload = response?.data;
      const data = payload?.data;

      // Guard missing data with an ERROR result dialog.
      if (!data) {
        setMessage({
          open: true,
          status: "ERROR",
          description: "No insurance data returned.",
        });
        return;
      }

      const failed = payload?.msg === "fail" || Number(data?.msgId) < 0;

      const insurance = data?.Insurance?.[0];
      const summary = [
        insurance?.InsuranceCompanyEN &&
          `Payer: ${insurance.InsuranceCompanyEN}`,
        insurance?.PolicyNumber && `Policy: ${insurance.PolicyNumber}`,
        insurance?.ExpiryDate && `Expiry: ${insurance.ExpiryDate}`,
      ]
        .filter(Boolean)
        .join("; ");

      setMessage({
        open: true,
        status: failed ? "ERROR" : "INFO",
        description:
          data?.description ||
          summary ||
          (failed
            ? "Insurance check failed."
            : "Insurance check completed successfully."),
      });
      onResult?.(data);
    } catch (error: any) {
      setMessage({
        open: true,
        status: "ERROR",
        description:
          error?.response?.data?.description ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to check insurance.",
      });
    } finally {
      setChecking(false);
    }
  };

  const {
    palette: { mode },
  } = useTheme();

  return (
    <>
      <Secure.GLIconButton2
        permission={resourceKey}
        uiText={resourceKey}
        fallBackText="Check Insurance"
        onClick={handleCheck}
        disabled={checking}
        size="small"
      >
        <img src={`./themes/${mode}/icons/question.png`} alt="Check Insurance" style={{ width: "16px", height: "16px" }} />
      </Secure.GLIconButton2>

      <DisplayMsgDialog
        open={message.open}
        onClose={() =>
          setMessage({ open: false, status: "INFO", description: "" })
        }
        description={message.description}
        status={message.status}
        getResource={false}
      />
    </>
  );
};

export default CheckInsuranceButton;
