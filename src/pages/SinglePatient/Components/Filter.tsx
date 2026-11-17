import React, { useCallback, useMemo } from "react";
import * as Yup from "yup";
import { Grid2 as Grid, IconButton } from "@mui/material";
import { usePatientAccount } from "../context/PatientAccountContext";

import SearchIcon from "@mui/icons-material/Search";
import { useFormik, FormikProvider, Form } from "formik";
import { Field } from "../../../utils/formController";
import { GlFormAutoComplete } from "../../../shared/forms/WithForm/GlFormAutoComplete";
import Secure from "../../../shared/security";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import { useContext } from "react";
import { mutate } from "swr";
import { apiUtility } from "../../../utils/apiUtility";
export const Filter: React.FC<{ setEpisodeData: React.Dispatch<React.SetStateAction<any[]>>; setPatientId: React.Dispatch<React.SetStateAction<string | null>> }> = ({ setEpisodeData, setPatientId }) => {
  const {
    setFormData,
    setSelectedPatient,
    fetchPatient,
    getPatientPolicyData,
    selectedPatient,
    getEpisodePolicy,
    selectedEpisodePolicy,
    setSelectedEpisodePolicy,
    setPatient,
  } = usePatientAccount();
  const { t } = useContext(AuthGuardContext);
  // ---------------- Validation ----------------
  const validationSchema = useMemo(
    () =>
      Yup.object({
        episode: Yup.string(),
        patient: Yup.string().nullable(),
      }),
    [],
  );

  // ---------------- Formik ----------------
  const formik = useFormik({
    initialValues: {
      patient: "800494",
      episode: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (values.patient && values.episode) {
        setFormData({ patientId: values.patient, episodeNo: values.episode });
        fetchPatient(values.patient, values.episode);
        getPatientPolicyData(values.patient);

        //! if not exist try get one
        if (!selectedEpisodePolicy) {
          getEpisodePolicy(values.patient, values.episode);
        }
      }
      setSubmitting(false);
    },
  });

  const { isSubmitting, handleSubmit, setFieldValue } = formik;

  // ---------------- Handlers ----------------
  const handleChange = useCallback(
    (v: any) => {
      setSelectedPatient(v || null);
      setEpisodeData([]);
      setPatientId(v?.patient_id || null);
      // if autocomplete should update patient in form values
      setFieldValue("patient", v?.patient_id || "");
      setFieldValue("episode", "");
      setPatient(null);
      setSelectedEpisodePolicy(null);

      if (!v?.patient_id) {
        setFormData({ patientId: "" });
        setPatientId(null);
      }
    },
    [setSelectedPatient, setFieldValue, setPatient, setPatientId],
  );

  const handleEpisodeChagne = useCallback(
    (v: any) => {
      setEpisodeData(v);
      setPatient(null);
      setFieldValue("episode", v?.episode_no || "");
    },
    [setPatient],
  );

  // ---------------- Render ----------------
  return (
    <FormikProvider value={formik}>
      <Form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Secure.GlFormAutoComplete
              resource_key="patientAccount_11_patient"
              url="/api/patientAccount/withEpisode"
              labelKeys={[
                "patient_id",
                "first_name",
                "middle_names",
                "last_name",
              ]}
              inputLabel={t("patientAccount_11_patient")}
              idKey="patient_id"
              name="patient"
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 5 }}>
            {/* <Field.Text label="episode" name="episode" /> */}
            <Secure.GlFormAutoComplete
              resource_key="patientAccount_11_episode"
              url={
                selectedPatient?.patient_id
                  ? `/api/patientAccount/searchEpisodeByPatientId/${selectedPatient?.patient_id}`
                  : ""
              }
              labelKeys={["episode_no"]}
              inputLabel={t("patientAccount_11_episode")}
              idKey="episode_no"
              name="episode"
              onChange={handleEpisodeChagne}
            />
          </Grid>

          <Grid size={{ xs: 1 }}>
            <Secure.GLIconButton
              resource_key="patientAccount_11_searchIcon"
              type="submit"
              disabled={isSubmitting}
              title={isSubmitting ? "Searching... please wait" : "Submit"}
            >
              <SearchIcon />
            </Secure.GLIconButton>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
};
