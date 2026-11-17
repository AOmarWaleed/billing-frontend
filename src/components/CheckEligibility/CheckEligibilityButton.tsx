import { useState } from "react";
import { toast } from "react-toastify";
import { DisplayMsgDialog, Secure } from "@givc/shared-components";
import { useTheme } from "@mui/material";
import EligibilityService from "../../redux/services/EligibilityService";
import type { EligibilityRequest } from "../../redux/services/EligibilityService";

interface CheckEligibilityButtonProps {
  patientId?: number | string;
  identityNumber?: string;
  identityCode?: string;
  identityDescription?: string;
  payerId?: number | null;
  resourceKey?: string;
  onResult?: (data: any) => void;
}

type MessageStatus = "WARNING" | "ERROR" | "INFO" | "QUESTION";

const ELIGIBILITY_PURPOSE = ["Discovery"];

const hasValue = (value: unknown): boolean =>
  value !== null && value !== undefined && String(value).trim() !== "";

const composeDescription = (
  parts: Array<string | number | null | undefined>,
): string =>
  parts
    .filter(hasValue)
    .map((part) => String(part).trim())
    .join("; ");

const formatApiMessages = (rows: any[]): string[] =>
  rows
    .map((row) => {
      const code = row?.nphies_message_id;
      const display = row?.nphies_message;

      if (hasValue(code) || hasValue(display)) {
        return [code, display].filter(hasValue).join(" ").trim();
      }

      return typeof row?.notes === "string" ? row.notes.trim() : "";
    })
    .filter(Boolean);

const CheckEligibilityButton: React.FC<CheckEligibilityButtonProps> = ({
  patientId,
  identityNumber,
  identityCode,
  identityDescription,
  payerId,
  resourceKey = "patients_20_checkEligibility",
  onResult,
}) => {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<{
    open: boolean;
    status: MessageStatus;
    description: string;
  }>({ open: false, status: "INFO", description: "" });

  const {
    palette: { mode },
  } = useTheme();

  const resetMessage = () =>
    setMessage({ open: false, status: "INFO", description: "" });

  const handleCheck = async () => {
    resetMessage();

    const identity = (identityNumber || "").trim();

    if (!identity) {
      toast.error("Please enter Identity Number.");
      return;
    }

    if (payerId === null || payerId === undefined) {
      toast.error("Please select a payer.");
      return;
    }

    const code = identityCode || "PRC";
    const description = identityDescription || "iqama";

    const payload: EligibilityRequest = {
      payer_id: payerId,
      patient_id: patientId,
      purpose: ELIGIBILITY_PURPOSE,
      identityNumber: identity,
      identityCode: code,
      identityDescription: description,
    };

    setChecking(true);

    try {
      const response = await EligibilityService.requestEligibility(payload);
      const body = response?.data;

      if (!body) {
        setMessage({
          open: true,
          status: "ERROR",
          description: "No eligibility data returned.",
        });
        return;
      }

      onResult?.(body);

      const isValidationEnvelope = Boolean(
        body?.data && typeof body.data === "object",
      );
      const status = String(body?.status || "").toUpperCase();
      const transId = body?.transId || body?.data?.transId || undefined;
      const coverageId =
        body?.coverageId || body?.data?.coverageId || undefined;

      const descriptionText =
        body?.data?.description || body?.description || body?.msg || "";

      const messageStatus: MessageStatus = isValidationEnvelope
        ? "ERROR"
        : status === "ELIGIBLE"
          ? "INFO"
          : status === "INELIGIBLE"
            ? "WARNING"
            : "ERROR";

      let apiMessageLines: string[] = [];

      if (!isValidationEnvelope && status === "FAILED" && transId) {
        try {
          const messagesResponse =
            await EligibilityService.getEligibilityMessages(String(transId));
          const rows = messagesResponse?.data?.data;

          if (Array.isArray(rows)) {
            apiMessageLines = formatApiMessages(rows);
          }
        } catch {
          // Best-effort only; keep the base description.
        }
      }

      const fallback =
        status === "ELIGIBLE"
          ? "Eligibility check completed successfully."
          : status === "INELIGIBLE"
            ? "Patient is not eligible."
            : "Eligibility check failed.";

      setMessage({
        open: true,
        status: messageStatus,
        description:
          composeDescription([
            descriptionText,
            hasValue(transId) ? `Trans ID: ${transId}` : "",
            hasValue(coverageId) ? `Coverage ID: ${coverageId}` : "",
            ...apiMessageLines,
          ]) || fallback,
      });
    } catch (error: any) {
      const errorData = error?.response?.data;

      onResult?.(errorData ?? error);

      const descriptionText =
        errorData?.description ||
        errorData?.err?.response?.data?.description ||
        errorData?.message ||
        error?.message ||
        "Failed to check eligibility.";

      setMessage({
        open: true,
        status: "ERROR",
        description: composeDescription([
          descriptionText,
          hasValue(errorData?.transId) ? `Trans ID: ${errorData.transId}` : "",
          hasValue(errorData?.coverageId)
            ? `Coverage ID: ${errorData.coverageId}`
            : "",
        ]),
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <Secure.GLIconButton2
        permission={resourceKey}
        uiText={resourceKey}
        fallBackText="Check Eligibility"
        onClick={handleCheck}
        disabled={checking}
        size="small"
      >
        <img
          src={`./themes/${mode}/icons/eligibility-check.png`}
          alt="Check Eligibility"
          style={{ width: "16px", height: "16px" }}
        />
      </Secure.GLIconButton2>

      <DisplayMsgDialog
        open={message.open}
        onClose={resetMessage}
        description={message.description}
        status={message.status}
        getResource={false}
      />
    </>
  );
};

export default CheckEligibilityButton;
