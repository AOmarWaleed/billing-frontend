import apiNphies from "../../utils/ApiNphies";

export type CheckInsuranceEnv = "settings" | "live" | "test";

export interface EligibilityRequest {
  payer_id: number;
  patient_id?: number | string;
  purpose: string[];
  identityNumber: string;
  identityCode: string;
  identityDescription: string;
}

class EligibilityService {
  checkInsurance(
    identityNumber: string,
    identityCode: string,
    identityDescription: string,
    env?: CheckInsuranceEnv,
  ) {
    return apiNphies.get(
      `/api/checkinsurance/${encodeURIComponent(identityNumber)}`,
      {
        params: {
          code: identityCode,
          description: identityDescription,
          ...(env ? { env } : {}),
        },
      },
    );
  }

  requestEligibility(payload: EligibilityRequest) {
    return apiNphies.post("/api/eligibility", payload);
  }

  getEligibilityMessages(transId: string) {
    return apiNphies.get(
      `/api/eligibility/apiMsgs/${encodeURIComponent(transId)}`,
    );
  }
}

export default new EligibilityService();
