import { Box, Grid2, Typography, Card, Stack, useTheme } from "@mui/material";
import { useEffect, useState, useContext, useRef } from "react";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { toast } from "react-toastify";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { updatePatient, clearError } from "../../redux/slices/patientSlice";
import { formatDate } from "../../utils/formatData/formatterv2";
import { useAppSelector } from "../../hooks/hooks";
import PtPolicyComponent from "./PtPolicyComponent";
import CheckInsuranceButton from "../../components/CheckInsurance/CheckInsuranceButton";
import CheckEligibilityButton from "../../components/CheckEligibility/CheckEligibilityButton";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import Secure from "../../shared/security";
import { useGlList } from "../../shared/hooks/useGlList";
import { Secure as GalaxySecure } from "@givc/shared-components";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
interface EditPatientFormProps {
  selectedPatient: any;
  selectedPatientId: any;
  openEditMode: () => void;
  closeEditMode: () => void;
  disable: boolean;
  setDisable: React.Dispatch<React.SetStateAction<boolean>>;
  refetchRef: React.RefObject<() => void | null>;
  onPatientUpdated?: (patient: any) => void;
}

export const EditPatientForm: React.FC<EditPatientFormProps> = ({
  selectedPatient,
  selectedPatientId,
  openEditMode,
  closeEditMode,
  disable,
  setDisable,
  refetchRef,
  onPatientUpdated,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    error,
    nationalityCodeTypes,
    maritalStatusCodeTypes,
    identityCodeTypes,
    occupationCodeTypes,
    religionCodeTypes,
    genderCodeTypes,
  } = useSelector((state: RootState) => state.patient);
  const dateFormat = useAppSelector((state) => {
    return state.config.values.DATE_FORMAT;
  });
  //==================  * Resources * ===================
  // const { t } = useTranslation("20");
  const { t } = useContext(AuthGuardContext);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState({
    mrn: "",
    first_name: "",
    middle_names: "",
    last_name: "",
    first_name_locale: "",
    middle_names_locale: "",
    last_name_locale: "",
    birth_date: "",
    gender: "",
    nationality: "",
    identifier_system: "",
    identifier_type: "",
    identifier_value: "",
    phone: "",
    marital_status: "",
    address_line: "",
    street: "",
    city: "",
    district: "",
    state: "",
    postal_code: "",
    country: "",
    occupation: "",
    religion: "",
    health_id: "",
  });
  const newData = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
    console.log(data);
  };

  // const [selectedDob, setSelectedDob] = useState(new Date());

  const [gender, setGender] = useState("male");
  const [payerId, setPayerId] = useState<number | null>(null);
  const [insuranceResult, setInsuranceResult] = useState<any>(null);
  const lastProcessedInsuranceId = useRef<string | null>(null);
  // Payer/eligibility state belongs to a single patient. Track the patient id
  // so we can reset it when the user switches to a different patient, without
  // clearing it when the same patient's row is merely refreshed.
  const lastSelectedPatientIdRef = useRef<any>(null);

  // Fetch facility-scoped payer options for the dropdown.
  const { glList: payerList, isLoading: payersLoading } = useGlList({
    url: "/payers/new",
    initParams: { page: 1, limit: 1000, _sort: "description,asc" },
  });

  const payers: any[] = payerList?.data ?? [];
  const payerOptions = payers.filter((payer: any) => payer.is_tpa !== "Y");
  // HIS patient id for the selected facility. HisPatientIds is attached to the
  // patient row by the backend (GET /patients/new) and is an array of objects
  // like { facility_id, facility_name, his_mrn, his_patient_id }.
  const hisPatientId =
    selectedPatient?.his_patient_id ?? "";

  useEffect(() => {
    if (!selectedPatient) {
      setData({
        mrn: "",
        first_name: "",
        middle_names: "",
        last_name: "",
        first_name_locale: "",
        middle_names_locale: "",
        last_name_locale: "",
        birth_date: "",
        gender: "",
        nationality: "",
        identifier_system: "",
        identifier_type: "",
        identifier_value: "",
        phone: "",
        marital_status: "",
        address_line: "",
        street: "",
        city: "",
        district: "",
        state: "",
        postal_code: "",
        country: "",
        occupation: "",
        religion: "",
        health_id: "",
      });
      setPayerId(null);
      setInsuranceResult(null);
      lastProcessedInsuranceId.current = null;
      lastSelectedPatientIdRef.current = null;
      return;
    }

    // Skip re-initializing the form when the same patient's row is refreshed
    // (e.g. after a save), otherwise in-progress edits would be wiped.
    if (lastSelectedPatientIdRef.current === selectedPatient.patient_id) {
      return;
    }

    // Payer/eligibility state belongs to a single patient, so reset it only
    // when the user actually switches to a different patient.
    lastSelectedPatientIdRef.current = selectedPatient.patient_id;
    setPayerId(null);
    setInsuranceResult(null);
    lastProcessedInsuranceId.current = null;

    dispatch(clearError());
    setErrors({});
    //setSelectedDob(new Date(selectedPatient.birth_date));
    setGender(selectedPatient.patient_gender || selectedPatient.gender);
    setData({
      mrn: selectedPatient.mrn || "",
      first_name: selectedPatient.first_name,
      middle_names: selectedPatient.middle_names || "",
      last_name: selectedPatient.last_name,
      first_name_locale: selectedPatient.first_name_locale || "",
      middle_names_locale: selectedPatient.middle_names_locale || "",
      last_name_locale: selectedPatient.last_name_locale || "",
      birth_date: selectedPatient.birth_date || "",
      gender: selectedPatient.gender || selectedPatient.patient_gender || "",
      nationality: selectedPatient.nationality || "",
      identifier_system: selectedPatient.identifier_system || "",
      identifier_type: selectedPatient.identifier_type || "",
      identifier_value: selectedPatient.identifier_value || "",
      phone: selectedPatient.phone || "",
      marital_status: selectedPatient.marital_status || "",
      address_line: selectedPatient.address_line,
      street: selectedPatient.street || "",
      city: selectedPatient.city || "",
      district: selectedPatient.district || "",
      state: selectedPatient.state || "",
      postal_code: selectedPatient.postal_code || "",
      country: selectedPatient.country || "",
      occupation: selectedPatient.occupation || "",
      religion: selectedPatient.religion || "",
      health_id: selectedPatient.health_id || "",
    });
    closeEditMode();
  }, [selectedPatient]);

  // Auto-select payer when an insurance check result arrives.
  useEffect(() => {
    const insurance = insuranceResult?.Insurance?.[0];
    if (!insurance?.InsuranceCompanyID || payers.length === 0) return;

    const insuranceCompanyId = String(insurance.InsuranceCompanyID);
    if (lastProcessedInsuranceId.current === insuranceCompanyId) return;
    lastProcessedInsuranceId.current = insuranceCompanyId;

    const matchedPayer = payerOptions.find(
      (payer: any) => String(payer.cchi_no) === insuranceCompanyId,
    );

    if (matchedPayer) {
      if (payerId !== matchedPayer.payer_id) {
        setPayerId(matchedPayer.payer_id);
      }
    } else {
      toast.warning(
        `Payer with CCHI No. ${insuranceCompanyId} was not found in the payer list.`,
      );
    }
  }, [insuranceResult, payerOptions, payerId]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (data.first_name.trim() === "") {
      errors.first_name = "please enter first name";
    } else {
      delete errors.first_name;
    }
    if (data.last_name.trim() === "") {
      errors.last_name = "please enter last name";
    } else {
      delete errors.last_name;
    }
    if (data.phone.trim() === "") {
      errors.phone = "please enter a phone number";
    } else {
      delete errors.phone;
    }
    if (data.gender.trim() === "") {
      errors.gender = "please select gender";
    } else {
      delete errors.gender;
    }
    return errors;
  };
  const handleSaveChanges = () => {
    dispatch(clearError());
    setErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors({ ...validationErrors });
    } else {
      dispatch(updatePatient({ id: selectedPatient.patient_id, data }))
        .unwrap()
        .then((result) => {
          closeEditMode();
          mutate((e) => apiUtility(e, "patients/new"));
          refetchRef?.current?.();
          // Keep the details section (including modification audit fields)
          // in sync with the saved row.
          // onPatientUpdated?.(result.patient);
        })
        .catch((error) => {
          throw error;
        });
    }
    //  console.log(data);
  };
  // Handle date changes
  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Format date to YYYY-MM-DD (ISO date format)
      const isoDate = date.toISOString().split("T")[0];
      setData((prev) => ({ ...prev, birth_date: isoDate }));
    } else {
      setData((prev) => ({ ...prev, birth_date: "" }));
    }
  };
  const {
    palette: { mode },
  } = useTheme();
  return (
    <>
      <Box width={"66%"} ml={2}>
        {/*   <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center", mb: 2 }}>
          {selectedPatient && (
            <Button variant="contained" color={disable ? "primary" : "inherit"} startIcon={<ModeEditIcon />} onClick={openEditMode} disabled={!disable} sx={{ textTransform: "none" }}>
              {t("195") || "Edit"}
            </Button>
          )}
        </Box> */}
        {selectedPatient && (
          <>
            <Card sx={{ p: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={0}
                spacing={1}
              >
                <Secure.GLTypography
                  resource_key="patients_20_patientDetails"
                  fallBackText="Patient Details"
                  variant="h6"
                  fontWeight="bold"
                  sx={{ display: "flex" }}
                />

                <Typography sx={{ color: "red" }}>{error}</Typography>
                {disable && (
                  <Stack direction="row" spacing={1}>
                    <GalaxySecure.GLIconButton2
                      permission="patients_20_edit"
                      uiText="generic_0_edit"
                      fallBackText="Edit"
                      onClick={openEditMode}
                      disabled={!disable}
                      size="small"
                    >
                      <img
                        src={`./themes/${mode}/icons/pen.png`}
                        alt="Edit Patient"
                      />
                    </GalaxySecure.GLIconButton2>
                    <CheckInsuranceButton
                      identityNumber={data.identifier_value}
                      identityType={data.identifier_type}
                      identityDescription={data.identifier_system}
                      onResult={setInsuranceResult}
                    />
                    <CheckEligibilityButton
                      patientId={selectedPatient.patient_id}
                      identityNumber={data.identifier_value}
                      identityCode={data.identifier_type}
                      identityDescription={data.identifier_system}
                      payerId={payerId}
                    />
                  </Stack>
                )}
                {!disable && (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    gap="10px"
                    mt={2.5}
                  >
                    <GalaxySecure.GLIconButton2
                      permission="patients_20_cancelEdit"
                      uiText="generic_0_cancel"
                      fallBackText="Cancel"
                      onClick={() => {
                        setDisable(true);
                        setErrors({});
                        dispatch(clearError());
                        setPayerId(null);
                        setInsuranceResult(null);
                        lastProcessedInsuranceId.current = null;
                        setData({
                          mrn: selectedPatient.mrn || "",
                          first_name: selectedPatient.first_name,
                          middle_names: selectedPatient.middle_names || "",
                          last_name: selectedPatient.last_name,
                          first_name_locale:
                            selectedPatient.first_name_locale || "",
                          middle_names_locale:
                            selectedPatient.middle_names_locale || "",
                          last_name_locale:
                            selectedPatient.last_name_locale || "",
                          birth_date: selectedPatient.birth_date || "",
                          gender:
                            selectedPatient.gender ||
                            selectedPatient.patient_gender ||
                            "",
                          nationality: selectedPatient.nationality || "",
                          identifier_system:
                            selectedPatient.identifier_system || "",
                          identifier_type:
                            selectedPatient.identifier_type || "",
                          identifier_value:
                            selectedPatient.identifier_value || "",
                          phone: selectedPatient.phone || "",
                          marital_status: selectedPatient.marital_status || "",
                          address_line: selectedPatient.address_line,
                          street: selectedPatient.street || "",
                          city: selectedPatient.city || "",
                          district: selectedPatient.district || "",
                          state: selectedPatient.state || "",
                          postal_code: selectedPatient.postal_code || "",
                          country: selectedPatient.country || "",
                          occupation: selectedPatient.occupation || "",
                          religion: selectedPatient.religion || "",
                          health_id: selectedPatient.health_id || "",
                        });
                      }}
                      disabled={disable}
                      size="small"
                    >
                      <img
                        src={`./themes/${mode}/icons/clear.png`}
                        alt="Cancel"
                        style={{ width: "16px", height: "16px" }}
                      />
                    </GalaxySecure.GLIconButton2>
                    <GalaxySecure.GLIconButton2
                      permission="patients_20_saveChangesEdit"
                      uiText="generic_0_save"
                      fallBackText="Save Changes"
                      onClick={handleSaveChanges}
                      disabled={disable}
                      size="small"
                    >
                      <img
                        src={`./themes/${mode}/icons/save.png`}
                        alt="Save Changes"
                        style={{ width: "16px", height: "16px" }}
                      />
                    </GalaxySecure.GLIconButton2>
                  </Box>
                )}
              </Stack>
              <Grid2
                container
                columns={48}
                mt={1.5}
                justifyContent="start"
                alignItems="flex-start"
                spacing={1.5}
                rowSpacing={2}
              >
                <Grid2 size={{ xs: 9 }}>
                  <Stack spacing={1.5}>
                    <Secure.GLTextField
                      resource_key="patients_20_firstNameEdit"
                      name="first_name"
                      fullWidth
                      label={t("patients_20_firstNameEdit") || "First Name"}
                      size="small"
                      value={data.first_name || ""}
                      onChange={(e) => newData(e)}
                      disabled={disable}
                      color="whiteField"
                      error={!!errors.first_name}
                    />
                    <Secure.GLTextField
                      resource_key="patients_20_middleNameEdit"
                      name="middle_names"
                      fullWidth
                      label={t("patients_20_middleNameEdit") || "Middle Name"}
                      size="small"
                      value={data.middle_names || ""}
                      onChange={(e) => newData(e)}
                      disabled={disable}
                      color="whiteField"
                    />
                    <Secure.GLTextField
                      resource_key="patients_20_lastNameEdit"
                      name="last_name"
                      fullWidth
                      label={t("patients_20_lastNameEdit") || "Last Name"}
                      size="small"
                      value={data.last_name}
                      onChange={(e) => newData(e)}
                      disabled={disable}
                      color="whiteField"
                      error={!!errors.last_name}
                    />
                    <Secure.GLGenericAutocomplete
                      resource_key="patients_20_identifierTypeEdit"
                      options={identityCodeTypes}
                      getOptionLabel={(option: any) =>
                        option.user_code + " - " + option.description || ""
                      }
                      value={
                        identityCodeTypes?.find(
                          (option) => option.user_code === data.identifier_type,
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setData({
                          ...data,
                          identifier_type: newValue?.user_code || "",
                          identifier_system: newValue?.description,
                        })
                      }
                      renderInput={(params) => (
                        <Secure.GLTextField
                          {...params}
                          label={t("patients_20_identifierTypeEdit")}
                          resource_key="patients_20_identifierTypeEdit"
                          placeholder={t("-55") || "Identity Type"}
                          variant="outlined"
                          fullWidth
                          color="whiteField"
                        />
                      )}
                      disabled={disable}
                    />
                  </Stack>
                </Grid2>

                <Grid2 size={{ xs: 9 }}>
                  <Stack spacing={1.5}>
                    <Secure.GLTextField
                      resource_key="patients_20_firstNameLocale"
                      name="first_name_locale"
                      fullWidth
                      style={{ direction: "rtl" }}
                      label={
                        // t("patients_20_firstNameLocale") ||
                        "First Name (Arabic)"
                      }
                      size="small"
                      value={data.first_name_locale || ""}
                      onChange={(e) => newData(e)}
                      disabled={disable}
                      color="whiteField"
                    />
                    <Secure.GLTextField
                      resource_key="patients_20_middleNameLocale"
                      name="middle_names_locale"
                      fullWidth
                      style={{ direction: "rtl" }}
                      label={
                        // t("patients_20_middleNameLocale") ||
                        "Middle Name (Arabic)"
                      }
                      size="small"
                      value={data.middle_names_locale || ""}
                      onChange={(e) => newData(e)}
                      disabled={disable}
                      color="whiteField"
                    />
                    <Secure.GLTextField
                      resource_key="patients_20_lastNameLocale"
                      name="last_name_locale"
                      fullWidth
                      style={{ direction: "rtl" }}
                      label={
                        // t("patients_20_lastNameLocale") ||
                        "Last Name (Arabic)"
                      }
                      size="small"
                      value={data.last_name_locale || ""}
                      onChange={(e) => newData(e)}
                      disabled={disable}
                      color="whiteField"
                    />
                    <Secure.GLTextField
                      label={t("patients_20_identifierValueEdit")}
                      resource_key="patients_20_identifierValueEdit"
                      fullWidth
                      name="identifier_value"
                      size="small"
                      onChange={(e) => {
                        newData(e);
                      }}
                      value={data.identifier_value || ""}
                      disabled={disable}
                      color="whiteField"
                    />
                  </Stack>
                </Grid2>

                <Grid2 size={{ xs: 24 }} container columns={24} spacing={1.5}>
                  <Stack direction="row" spacing={1.5} width="100%">
                    <Grid2 size={{ xs: 6 }}>
                      <Secure.GLGenericAutocomplete
                        resource_key="patients_20_payer"
                        options={payerOptions}
                        loading={payersLoading}
                        getOptionLabel={(payer: any) =>
                          `${payer.payer_id} - ${payer.description || payer.short_name || ""}`
                        }
                        isOptionEqualToValue={(option: any, value: any) =>
                          option.payer_id === value.payer_id
                        }
                        value={
                          payerOptions.find(
                            (payer: any) => payer.payer_id === payerId,
                          ) || null
                        }
                        onChange={(_, newValue) =>
                          setPayerId(newValue?.payer_id ?? null)
                        }
                        renderInput={(params) => (
                          <Secure.GLTextField
                            {...params}
                            label={t("patients_20_payer") || "Payer"}
                            resource_key="patients_20_payer"
                            placeholder={t("206") || "Payer"}
                            variant="outlined"
                            fullWidth
                            color="whiteField"
                          />
                        )}
                        disabled={disable}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 4 }}>
                      <Secure.GLTextField
                        resource_key="patients_20_patientIdEdit"
                        name="patient_id"
                        fullWidth
                        label={t("patients_20_patientIdEdit") || "Patient ID"}
                        size="small"
                        value={selectedPatientId || ""}
                        onChange={(e) => newData(e)}
                        disabled={true}
                        color="whiteField"
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 4 }}>
                      <Secure.GLTextField
                        resource_key="patients_20_hisPatientIdEdit"
                        name="his_patient_id"
                        fullWidth
                        label={t("patients_20_hisPatientIdEdit") || "HIS Patient ID"}
                        size="small"
                        value={hisPatientId}
                        disabled={true}
                        color="whiteField"
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 5 }}>
                      <Secure.GLTextField
                        resource_key="patients_20_mrnNoEdit"
                        name="mrn"
                        fullWidth
                        label={t("patients_20_mrnNoEdit") || "MRN No."}
                        size="small"
                        value={data.mrn || ""}
                        onChange={(e) => newData(e)}
                        disabled={disable}
                        color="whiteField"
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 5 }}>
                      <Secure.GLTextField
                        resource_key="patients_20_healthIdEdit"
                        name="health_id"
                        fullWidth
                        label={t("patients_20_healthIdEdit") || "Health ID"}
                        size="small"
                        value={data.health_id || ""}
                        onChange={(e) => newData(e)}
                        disabled={disable}
                        color="whiteField"
                      />
                    </Grid2>
                  </Stack>

                  <Stack direction="row" spacing={1.5} width="100%">
                    <Grid2 size={{ xs: 6 }}>
                      <Secure.GLTextField
                        resource_key="patients_20_mobileNoEdit"
                        name="phone"
                        fullWidth
                        label={t("patients_20_mobileNoEdit") || "Mobile No."}
                        size="small"
                        value={data.phone}
                        onChange={(e) => newData(e)}
                        disabled={disable}
                        color="whiteField"
                        error={!!errors.phone}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 7 }}>
                      <Secure.GLDatePicker
                        resource_key="patients_20_birthDateEdit"
                        label={t("patients_20_birthDateEdit") || "Birth Date"}
                        format={dateFormat ? dateFormat : "dd/MM/yyyy"}
                        value={data.birth_date ? new Date(data.birth_date) : null}
                        onChange={handleDateChange}
                        disabled={disable}
                        sx={{
                          width: "100%",
                        }}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 5 }}>
                      <Secure.GLGenericAutocomplete
                        resource_key="patients_20_genderEdit"
                        options={genderCodeTypes}
                        getOptionLabel={(option: any) =>
                          `${option.user_code} - ${option.description}`
                        }
                        value={
                          genderCodeTypes?.find(
                            (option) => option.user_code === data.gender,
                          ) || null
                        }
                        onChange={(_, newValue) =>
                          setData({
                            ...data,
                            gender: newValue?.user_code || "",
                          })
                        }
                        renderInput={(params) => (
                          <Secure.GLTextField
                            {...params}
                            label={t("patients_20_genderEdit")}
                            resource_key="patients_20_genderEdit"
                            placeholder={gender}
                            variant="outlined"
                            fullWidth
                            color="whiteField"
                            error={!!errors.gender}
                          />
                        )}
                        disabled={disable}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 6 }}>
                      <Secure.GLGenericAutocomplete
                        resource_key="patients_20_maritalStatusEdit"
                        options={maritalStatusCodeTypes}
                        getOptionLabel={(option: any) =>
                          option.user_code + " - " + option.description || ""
                        }
                        value={
                          maritalStatusCodeTypes?.find(
                            (option) => option.user_code === data.marital_status,
                          ) || null
                        }
                        onChange={(_, newValue) =>
                          setData({
                            ...data,
                            marital_status: newValue?.user_code || "",
                          })
                        }
                        renderInput={(params) => (
                          <Secure.GLTextField
                            {...params}
                            label={t("patients_20_maritalStatusEdit")}
                            resource_key="patients_20_maritalStatusEdit"
                            placeholder={t("207") || "Marital Status"}
                            variant="outlined"
                            fullWidth
                            color="whiteField"
                          />
                        )}
                        disabled={disable}
                      />
                    </Grid2>
                  </Stack>

                  <Stack direction="row" spacing={1.5} width="100%">
                    <Grid2 size={{ xs: 8 }}>
                      <Secure.GLGenericAutocomplete
                        resource_key="patients_20_nationalityEdit"
                        options={nationalityCodeTypes}
                        getOptionLabel={(option: any) =>
                          option.user_code + " - " + option.description || ""
                        }
                        value={
                          nationalityCodeTypes?.find(
                            (option) => option.user_code === data.nationality,
                          ) || null
                        }
                        onChange={(_, newValue) =>
                          setData({
                            ...data,
                            nationality: newValue?.user_code || "",
                          })
                        }
                        renderInput={(params) => (
                          <Secure.GLTextField
                            {...params}
                            label={t("patients_20_nationalityEdit")}
                            resource_key="patients_20_nationalityEdit"
                            placeholder={t("205") || "Nationality"}
                            variant="outlined"
                            fullWidth
                            color="whiteField"
                          />
                        )}
                        disabled={disable}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 8 }}>
                      <Secure.GLGenericAutocomplete
                        resource_key="patients_20_occupationEdit"
                        options={occupationCodeTypes}
                        getOptionLabel={(option: any) =>
                          option.user_code + " - " + option.description || ""
                        }
                        value={
                          occupationCodeTypes?.find(
                            (option) => option.user_code === data.occupation,
                          ) || null
                        }
                        onChange={(_, newValue) =>
                          setData({
                            ...data,
                            occupation: newValue?.user_code || "",
                          })
                        }
                        renderInput={(params) => (
                          <Secure.GLTextField
                            {...params}
                            label={t("patients_20_occupationEdit")}
                            resource_key="patients_20_occupationEdit"
                            placeholder={t("208") || "Occupation"}
                            variant="outlined"
                            fullWidth
                            color="whiteField"
                          />
                        )}
                        disabled={disable}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 8 }}>
                      <Secure.GLGenericAutocomplete
                        resource_key="patients_20_religionEdit"
                        options={religionCodeTypes}
                        getOptionLabel={(option: any) =>
                          option.user_code + " - " + option.description || ""
                        }
                        value={
                          religionCodeTypes?.find(
                            (option) => option.user_code === data.religion,
                          ) || null
                        }
                        onChange={(_, newValue) =>
                          setData({
                            ...data,
                            religion: newValue?.user_code || "",
                          })
                        }
                        renderInput={(params) => (
                          <Secure.GLTextField
                            {...params}
                            label={t("patients_20_religionEdit")}
                            resource_key="patients_20_religionEdit"
                            placeholder={t("209") || "Religion"}
                            variant="outlined"
                            fullWidth
                            color="whiteField"
                          />
                        )}
                        disabled={disable}
                      />
                    </Grid2>
                  </Stack>

                  <Stack direction="row" spacing={1.5} width="100%">
                    <Grid2 size={{ xs: 14 }}>
                      <Secure.GLTextField
                        resource_key="patients_20_addressLineEdit"
                        fullWidth
                        name="address_line"
                        label={t("patients_20_addressLineEdit") || "Address Line"}
                        size="small"
                        value={data.address_line || ""}
                        onChange={(e) => {
                          newData(e);
                        }}
                        disabled={disable}
                        color="whiteField"
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 5 }}>
                      <Secure.GLTextField
                        resource_key="patients_20_districtEdit"
                        fullWidth
                        name="district"
                        label={t("patients_20_districtEdit") || "District"}
                        size="small"
                        value={data.district || ""}
                        onChange={(e) => {
                          newData(e);
                        }}
                        disabled={disable}
                        color="whiteField"
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 5 }}>
                      <Secure.GLTextField
                        resource_key="patients_20_postalCodeEdit"
                        fullWidth
                        name="postal_code"
                        label={t("patients_20_postalCodeEdit") || "Postal Code"}
                        size="small"
                        value={data.postal_code || ""}
                        onChange={(e) => {
                          newData(e);
                        }}
                        disabled={disable}
                        color="whiteField"
                      />
                    </Grid2>
                  </Stack>
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  <Stack spacing={1.5}>
                    <Secure.GLTextField
                      resource_key="patients_20_createdByEdit"
                      fullWidth
                      name="created_by"
                      label={t("patients_20_createdByEdit") || "Created By"}
                      size="small"
                      value={selectedPatient?.created_by?.user_name ?? ""}
                      disabled={true}
                      color="whiteField"
                    />

                    <Secure.GLTextField
                      resource_key="patients_20_creationDateEdit"
                      fullWidth
                      name="creation_date"
                      label={t("patients_20_creationDateEdit") || "Creation Date"}
                      size="small"
                      value={
                        selectedPatient?.creation_date
                          ? formatDate(
                              selectedPatient.creation_date,
                              "DATE_FORMAT",
                            )
                          : ""
                      }
                      disabled={true}
                      color="whiteField"
                    />

                    <Secure.GLTextField
                      resource_key="patients_20_modifiedByEdit"
                      fullWidth
                      name="modified_by"
                      label={t("patients_20_modifiedByEdit") || "Modified By"}
                      size="small"
                      value={selectedPatient?.modified_by?.user_name ?? ""}
                      disabled={true}
                      color="whiteField"
                    />

                    <Secure.GLTextField
                      resource_key="patients_20_modificationDateEdit"
                      fullWidth
                      name="modification_date"
                      label={t("patients_20_modificationDateEdit") || "Modification Date"}
                      size="small"
                      value={
                        selectedPatient?.modification_date
                          ? formatDate(
                              selectedPatient.modification_date,
                              "DATE_FORMAT",
                            )
                          : ""
                      }
                      disabled={true}
                      color="whiteField"
                    />
                  </Stack>
                </Grid2>
              </Grid2>
            </Card>
            <PtPolicyComponent
              identityNumber={data.identifier_value}
              identityCode={data.identifier_type}
              identityDescription={data.identifier_system}
            />
          </>
        )}
      </Box>
    </>
  );
};
