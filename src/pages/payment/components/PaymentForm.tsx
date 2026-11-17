import { useCallback, useState, useEffect, useContext } from "react";
import { Box } from "@mui/material";
import { GlFormAutoComplete } from "../../../shared/forms/WithForm/GlFormAutoComplete";
import { FormValues } from "./PaymentMethodsForm";
import { DesktopDatePicker as DatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { Patient } from "../../SinglePatient/PatientAccountTypes";
import { SelectedPatient } from "../PaymentMaster";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";

const themeHeight = null;
export type FilterProps<T> = {
  fromSinglePatientPage: Boolean;
  formData?: { patientId: string; episodeNo: string };
  values: T;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T, shouldValidate?: boolean) => void;
};

const PaymentForm = ({
  setFieldValue,
  setFieldTouched,
  values,
  formData,
  fromSinglePatientPage,
}: FilterProps<FormValues>) => {
  const [patientId, setPatientId] = useState<SelectedPatient | null>(
    formData?.patientId || null,
  );

  //==================  * Resources * ===================
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;

  const handlePtientIdChange = useCallback(
    (v: any) => {
      setFieldValue("patient_id", v?.patient_id || "");
      setFieldValue("episode_no", "");
      setPatientId(v.patient_id || null);
    },
    [setPatientId, setFieldValue],
  );
  const handleEpisodeChange = useCallback(
    (v: any) => {
      setFieldValue("episode_no", v?.episode_no || "");
    },
    [setFieldValue],
  );
  useEffect(() => {
    if (fromSinglePatientPage) {
      setFieldValue("patient_id", formData?.patientId);
      setFieldValue("episode_no", formData?.episodeNo);
    }
  }, []);
  return (
    <Box
      sx={{
        maxWidth: "800px",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "flex-start",
        alignItems: "flex-start",
        gap: 1,
        height: "85px",
        mt: "10px",
      }}
    >
      <Box sx={{ flex: 5 }}>
        <Secure.GlFormAutoComplete
          resource_key={
            fromSinglePatientPage
              ? "patientAccount_11_Episode"
              : "payment_23_Episode"
          }
          url="/api/patientAccount/withEpisode"
          labelKeys={["patient_id", "first_name", "middle_names", "last_name"]}
          inputLabel={
            fromSinglePatientPage
              ? t("patientAccount_11_PatientID")
              : t("payment_23_Episode")
          }
          idKey="patient_id"
          name="patient_id"
          onChange={handlePtientIdChange}
          inputSx={
            fromSinglePatientPage && {
              "&.MuiFormControl-root": {
                margin: "0px",
              },
              "& .MuiFilledInput-root:hover": {
                backgroundColor: "white",
              },
              "& .MuiFilledInput-root:focus": {
                backgroundColor: "white",
              },
              "& .MuiFilledInput-root.Mui-focused": {
                backgroundColor: "white",
              },
            }
          }
          variant={fromSinglePatientPage ? "filled" : "outlined"}
        />
      </Box>

      <Box sx={{ flex: 2, height: "66px" }}>
        {/* <Field.Text label="episode" name="episode" /> */}
        <Secure.GlFormAutoComplete
          resource_key={
            fromSinglePatientPage
              ? "patientAccount_11_Episode"
              : "payment_23_Episode"
          }
          url={
            patientId
              ? `/api/patientAccount/searchEpisodeByPatientId/${patientId}`
              : ""
          }
          labelKeys={["episode_no"]}
          inputLabel={
            fromSinglePatientPage
              ? t("patientAccount_11_Episode")
              : t("payment_23_Episode")
          }
          idKey="episode_no"
          name="episode_no"
          onChange={handleEpisodeChange}
          inputSx={
            fromSinglePatientPage && {
              "&.MuiFormControl-root": {
                margin: "0px",
              },
              "& .MuiFilledInput-root:hover": {
                backgroundColor: "white",
              },
              "& .MuiFilledInput-root:focus": {
                backgroundColor: "white",
              },
              "& .MuiFilledInput-root.Mui-focused": {
                backgroundColor: "white",
              },
            }
          }
          variant={fromSinglePatientPage ? "filled" : "outlined"}
          size="small"
        />
      </Box>
      <Box
        sx={{
          height:
            (themeHeight ?? fromSinglePatientPage) ? "45.69px" : "37.69px",
        }}
      >
        <DatePicker
          format="dd/MM/yyyy"
          value={values.date}
          onChange={(newValue: any) => {
            setFieldValue("date", newValue);
          }}
          onBlur={() => setFieldTouched("date", true)}
          sx={{
            "&": {
              width: "100%",
              height: "100% ",
            },
            "& .MuiPickersInputBase-sectionsContainer": {
              padding: "0 !important",
            },
            "& .MuiPickersInputBase-root": {
              height: "100%",
              backgroundColor: fromSinglePatientPage ? "white" : "transparent",
            },
          }}
          slotProps={{
            textField: {
              variant: "outlined",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default PaymentForm;
