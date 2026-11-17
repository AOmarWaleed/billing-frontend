import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Grid,
  Button,
  Slide,
  Fade,
} from "@mui/material";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import api from "../../utils/Api";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { fetchPolicies } from "../../redux/slices/payerPolicySlice";

interface AgreementExclusionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
  selectedPayerId?: number;
  selectedPolicyId?: number;
  selectedPolicyClassId?: number;
}

const validationSchema = Yup.object({
  payer_id: Yup.number().optional(),
  policy_id: Yup.number().optional(),
  class_id: Yup.number().optional(),

  exclusion_cat: Yup.string().required("Exclusion Category is required"),
  exclusion_type: Yup.string().required("Exclusion Type is required"),
  exclusion_value: Yup.string().required("Exclusion Value is required"),
  qualification: Yup.string().optional(),
});

export default function AgreementExclusionDialog({
  open,
  onClose,
  onSuccess,
  editData,
  selectedPayerId: propSelectedPayerId,
  selectedPolicyId: propSelectedPolicyId,
  selectedPolicyClassId: propSelectedPolicyClassId,
}: AgreementExclusionDialogProps) {
  const [loading, setLoading] = useState(false);

  // Data states
  const [payers, setPayers] = useState<any[]>([]);
  const [payersLoading, setPayersLoading] = useState(false);

  const [policies, setPolicies] = useState<any[]>([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);

  const [policyClasses, setPolicyClasses] = useState<any[]>([]);
  const [policyClassesLoading, setPolicyClassesLoading] = useState(false);

  const [exclusionCategories, setExclusionCategories] = useState<any[]>([]);
  const [exclusionTypes, setExclusionTypes] = useState<any[]>([]);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [diagnosis, setDiagnosis] = useState<any[]>([]);

  const isEdit = !!editData;

  // Fetch initial data
  useEffect(() => {
    if (open) {
      fetchPayers();
      fetchExclusionCategories();
      fetchExclusionTypes();
      fetchQualifications();
      fetchDiagnosis();
      fetchPolicies();
      fetchPolicyClasses();
    }
  }, [open]);

  useEffect(() => {
    if (propSelectedPayerId && payers.length > 0 && !isEdit) {
      formik.setFieldValue("payer_id", propSelectedPayerId);
      fetchPolicies(propSelectedPayerId);
    }
  }, [payers, propSelectedPayerId]);

  useEffect(() => {
    console.log(`
      propSelectedPolicyId: ${propSelectedPolicyId}
      editData?.policy_id: ${editData?.policy_id}
      policies.length: ${policies.length}
      isEdit: ${isEdit}

      first ${(propSelectedPolicyId || editData?.policy_id) && policies.length > 0 && !isEdit}
      sec   ${!propSelectedPolicyId}
      third ${isEdit && editData?.policy_id}
       
      `);
    
    if ((propSelectedPolicyId || editData?.policy_id) && policies.length > 0 && !isEdit) {
      formik.setFieldValue("policy_id", propSelectedPolicyId || editData?.policy_id);
      fetchPolicyClasses(propSelectedPolicyId || editData?.policy_id);
    } else if (!propSelectedPolicyId  && !isEdit) {
      formik.setFieldValue("policy_id", "");
      setPolicyClasses([]);
    } else if (isEdit && editData?.policy_id) {
      formik.setFieldValue("policy_id", editData.policy_id);
    }
  }, [propSelectedPolicyId, policies , editData?.policy_id]);

  useEffect(() => {
    if (propSelectedPolicyClassId && policyClasses.length > 0 && !isEdit) {
      formik.setFieldValue("class_id", propSelectedPolicyClassId);
    }
  }, [propSelectedPolicyClassId, policyClasses, policies]);

  //   when edit to get diagnosis or qualification value
  useEffect(() => {
    if (isEdit) {
      if (
        editData.exclusion_cat === "SPECIALITY" &&
        qualifications.length > 0
      ) {
        const selectedQualification = qualifications.find(
          (q) => q.user_code === editData.exclusion_value,
        );
        formik.setFieldValue(
          "qualification",
          selectedQualification ? selectedQualification.user_code : "",
        );
      } else if (
        editData.exclusion_cat === "DIAGNOSIS" &&
        diagnosis.length > 0
      ) {
        const selectedDiagnosis = diagnosis.find(
          (d) => d.diagnosis_code === editData.exclusion_value,
        );
        formik.setFieldValue(
          "diagnosis_code",
          selectedDiagnosis ? selectedDiagnosis.diagnosis_code : "",
        );
      }
    }
  }, [editData, qualifications, diagnosis]);
  // Fetch payers
  const fetchPayers = async () => {
    setPayersLoading(true);
    try {
      const { data } = await api.get("/api/agreement-exclusion/payers");
      setPayers(data?.data || []);
    } catch (error) {
      console.error("Error fetching payers:", error);
    } finally {
      setPayersLoading(false);
    }
  };

  // Fetch policies by payer
  const fetchPolicies = async (payerId?: number) => {
    setPoliciesLoading(true);
    try {
      const { data } = await api.get("/api/agreement-exclusion/policies", {
        params: { payer_id: payerId },
      });
      setPolicies(data?.data || []);
    } catch (error) {
      console.error("Error fetching policies:", error);
    } finally {
      setPoliciesLoading(false);
    }
  };

  // Fetch policy classes by policy
  const fetchPolicyClasses = async (policyId?: number) => {
    setPolicyClassesLoading(true);
    try {
      const { data } = await api.get(
        "/api/agreement-exclusion/policy-classes",
        {
          params: { policy_id: policyId },
        },
      );
      setPolicyClasses(data?.data || []);
    } catch (error) {
      console.error("Error fetching policy classes:", error);
    } finally {
      setPolicyClassesLoading(false);
    }
  };

  // Fetch exclusion categories (code 44)
  const fetchExclusionCategories = async () => {
    try {
      const { data } = await api.get("/api/agreement-exclusion/code-data/44");
      setExclusionCategories(data?.data || []);
    } catch (error) {
      console.error("Error fetching exclusion categories:", error);
    }
  };

  // Fetch exclusion types (code 45)
  const fetchExclusionTypes = async () => {
    try {
      const { data } = await api.get("/api/agreement-exclusion/code-data/45");
      setExclusionTypes(data?.data || []);
    } catch (error) {
      console.error("Error fetching exclusion types:", error);
    }
  };

  // Fetch qualification (code 26)
  const fetchQualifications = async () => {
    try {
      const { data } = await api.get("/api/agreement-exclusion/code-data/26");
      setQualifications(data?.data || []);
    } catch (error) {
      console.error("Error fetching qualifications:", error);
    }
  };

  // Fetch diagnosis
  const fetchDiagnosis = async () => {
    try {
      const { data } = await api.get("/api/agreement-exclusion/diagnosis");
      setDiagnosis(data?.data || []);
    } catch (error) {
      console.error("Error fetching diagnosis:", error);
    }
  };

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      payer_id: editData?.payer_id || "",
      policy_id: editData?.policy_id || "",
      class_id: editData?.class_id || "",
      exclusion_cat: editData?.exclusion_cat || "",
      exclusion_type: editData?.exclusion_type || "",
      exclusion_value: editData?.exclusion_value || "",
      qualification: editData?.qualification || "",
      diagnosis_code: editData?.diagnosis_code || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);

      const payload = {
        payer_id: values.payer_id || null,
        policy_id: values.policy_id || null,
        class_id: values.class_id || null,
        exclusion_cat: values.exclusion_cat || null,
        exclusion_type: values.exclusion_type || null,
        exclusion_value: values.exclusion_value || null,
      };

      try {
        const url = isEdit
          ? `/api/agreement-exclusion/${editData.exclusion_id}`
          : "/api/agreement-exclusion";
        const method = isEdit ? "put" : "post";

        await api[method](url, payload);
        onSuccess();
        handleClose();
      } catch (error) {
        console.error("Error saving agreement exclusion:", error);
        toast.error(
          `Failed to ${isEdit ? "update" : "add"} agreement exclusion - ${(error as any)?.response?.data?.error || (error as any)?.message}`,
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Handle payer change - fetch policies
  const handlePayerChange = (event: any, newValue: any) => {
    const payerId = newValue?.payer_id;
    formik.setFieldValue("payer_id", payerId);
    formik.setFieldValue("policy_id", "");
    formik.setFieldValue("class_id", "");
    setPolicies([]);
    setPolicyClasses([]);

    fetchPolicies(payerId || undefined);
  };

  // Handle policy change - fetch policy classes AND set related payer (since payer exists on policy object)
  const handlePolicyChange = (event: any, newValue: any) => {
    const policyId = newValue?.policy_id;
    const payerId = newValue?.payer_id;

    // Set payer from the selected policy
    if (payerId) {
      formik.setFieldValue("payer_id", payerId);
    }

    formik.setFieldValue("policy_id", policyId);
    formik.setFieldValue("class_id", "");
    setPolicyClasses([]);

    fetchPolicyClasses(policyId || undefined);
  };

  // Handle policy class change - set related policy (which will also set payer through the policy)
  const handlePolicyClassChange = (event: any, newValue: any) => {
    const classId = newValue?.class_id;
    const policyId = newValue?.policy_id;

    if (policyId) {
      // Find the policy object from the policies array to get its payer_id
      const selectedPolicy = policies.find((p) => p.policy_id === policyId);

      if (selectedPolicy) {
        // Set policy
        formik.setFieldValue("policy_id", policyId);

        // Set payer from the policy object
        if (selectedPolicy.payer_id) {
          formik.setFieldValue("payer_id", selectedPolicy.payer_id);
        }
      }
    }

    formik.setFieldValue("class_id", classId);
  };

  // Handle category change
  const handleCategoryChange = (event: any, newValue: any) => {
    formik.setFieldValue("exclusion_cat", newValue?.user_code);

    // reset exclusion value and qualification/diagnosis when type changes
    formik.setFieldValue("exclusion_value", "");
    formik.setFieldValue("qualification", "");
    formik.setFieldValue("diagnosis_code", "");
  };

  // Handle type change
  const handleTypeChange = (event: any, newValue: any) => {
    formik.setFieldValue("exclusion_type", newValue?.user_code);
  };

  // Handle qualification change
  const handleQualificationChange = (event: any, newValue: any) => {
    formik.setFieldValue("qualification", newValue?.user_code);
    formik.setFieldValue("exclusion_value", newValue?.user_code);
  };

  // Handle diagnosis change
  const handleDiagnosisChange = (event: any, newValue: any) => {
    formik.setFieldValue("diagnosis_code", newValue?.diagnosis_code);
    formik.setFieldValue("exclusion_value", newValue?.diagnosis_code);
  };

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // Helper to find selected value for Autocomplete
  const findSelectedPayer = () => {
    const payerId = formik.values.payer_id;
    if (!payerId) return null;
    return payers.find((p) => p.payer_id === payerId);
  };

  const findSelectedPolicy = () => {
    const policyId = formik.values.policy_id;
    if (!policyId) return null;
    return policies.find((p) => p.policy_id === policyId);
  };

  const findSelectedPolicyClass = () => {
    const classId = formik.values.class_id;
    if (!classId) return null;
    return policyClasses.find((c) => c.class_id === classId);
  };

  const findSelectedCategory = () => {
    const category = formik.values.exclusion_cat;
    if (!category) return null;
    return exclusionCategories.find((c) => c.user_code === category);
  };

  const findSelectedType = () => {
    const type = formik.values.exclusion_type;
    if (!type) return null;
    return exclusionTypes.find((t) => t.user_code === type);
  };

  const findSelectedQualification = () => {
    const qualification = formik.values.qualification;
    if (!qualification) return null;
    return qualifications.find((q) => q.user_code === qualification);
  };

  const findSelectedDiagnosis = () => {
    const diagnosisCode = formik.values.diagnosis_code;
    if (!diagnosisCode) return null;
    return diagnosis.find((d) => d.diagnosis_code === diagnosisCode);
  };

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit Agreement Exclusion" : "Add Agreement Exclusion"}
      icon={
        isEdit ? (
          <EditIcon
            sx={{
              backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
              color: "white",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              padding: "5px",
            }}
          />
        ) : (
          <AddIcon
            sx={{
              backgroundImage: "linear-gradient(#2764AF , #55C5D6)",
              color: "white",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              padding: "5px",
            }}
          />
        )
      }
      content={
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Payer Autocomplete */}
            <Grid item xs={12} sm={6}>
              {/* {formik.values.payer_id} */}
              <Autocomplete
                options={payers}
                disabled
                loading={payersLoading}
                value={findSelectedPayer()}
                onChange={handlePayerChange}
                getOptionLabel={(option) =>
                  `${option.payer_id} - ${option.description || option.short_name}`
                }
                isOptionEqualToValue={(option, value) =>
                  option.payer_id === value?.payer_id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="payer_id"
                    label="Payer"
                    required
                    error={
                      formik.touched.payer_id && Boolean(formik.errors.payer_id)
                    }
                    helperText={
                      formik.touched.payer_id && formik.errors.payer_id
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {payersLoading && (
                            <CircularProgress color="inherit" size={20} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Policy Autocomplete - depends on payer */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={policies}
                loading={policiesLoading}
                value={findSelectedPolicy()}
                onChange={handlePolicyChange}
                getOptionLabel={(option) =>
                  `${option.policy_id} - ${option.description || ""}`
                }
                isOptionEqualToValue={(option, value) =>
                  option.policy_id === value?.policy_id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="policy_id"
                    label="Policy"
                    required
                    error={
                      formik.touched.policy_id &&
                      Boolean(formik.errors.policy_id)
                    }
                    helperText={
                      formik.touched.policy_id && formik.errors.policy_id
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {policiesLoading && (
                            <CircularProgress color="inherit" size={20} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Policy Class Autocomplete - depends on policy */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={policyClasses}
                loading={policyClassesLoading}
                value={findSelectedPolicyClass()}
                onChange={handlePolicyClassChange}
                getOptionLabel={(option) =>
                  `${option.class_id} - ${option.class} ${option.plan ? `- ${option.plan}` : ""} ${option.class_group ? `(${option.class_group})` : ""}`
                }
                isOptionEqualToValue={(option, value) =>
                  option.class_id === value?.class_id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="class_id"
                    label="Policy Class"
                    required
                    error={
                      formik.touched.class_id && Boolean(formik.errors.class_id)
                    }
                    helperText={
                      formik.touched.class_id && formik.errors.class_id
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {policyClassesLoading && (
                            <CircularProgress color="inherit" size={20} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Exclusion Type Autocomplete */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={exclusionTypes}
                loading={exclusionTypes.length === 0}
                value={findSelectedType()}
                onChange={handleTypeChange}
                getOptionLabel={(option) =>
                  `${option.user_code} - ${option.description}`
                }
                isOptionEqualToValue={(option, value) =>
                  option.user_code === value?.user_code
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="exclusion_type"
                    label="Exclusion Type"
                    required
                    error={
                      formik.touched.exclusion_type &&
                      Boolean(formik.errors.exclusion_type)
                    }
                    helperText={
                      formik.touched.exclusion_type &&
                      formik.errors.exclusion_type
                    }
                  />
                )}
              />
            </Grid>

            {/* Exclusion Category Autocomplete */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={exclusionCategories}
                loading={exclusionCategories.length === 0}
                value={findSelectedCategory()}
                onChange={handleCategoryChange}
                getOptionLabel={(option) =>
                  `${option.user_code} - ${option.description}`
                }
                isOptionEqualToValue={(option, value) =>
                  option.user_code === value?.user_code
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="exclusion_cat"
                    label="Exclusion Category"
                    required
                    error={
                      formik.touched.exclusion_cat &&
                      Boolean(formik.errors.exclusion_cat)
                    }
                    helperText={
                      formik.touched.exclusion_cat &&
                      formik.errors.exclusion_cat
                    }
                  />
                )}
              />
            </Grid>

            {/* Exclusion Value */}
            <Grid item xs={12} sm={6} sx={{ display: "flex", gap: 1 }}>
              <Box sx={{ width: "70%" }}>
                {/* Qualification */}
                <Fade
                  in={formik.values.exclusion_cat === "SPECIALITY"}
                  mountOnEnter
                  unmountOnExit
                  timeout={100}
                >
                  <Autocomplete
                    options={qualifications}
                    loading={qualifications.length === 0}
                    value={findSelectedQualification()}
                    onChange={handleQualificationChange}
                    getOptionLabel={(option) =>
                      `${option.user_code} - ${option.description}`
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.user_code === value?.user_code
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="qualification"
                        label="Qualification"
                        error={
                          formik.touched.qualification &&
                          Boolean(formik.errors.qualification)
                        }
                        helperText={
                          formik.touched.qualification &&
                          formik.errors.qualification
                        }
                      />
                    )}
                  />
                </Fade>

                {/* Diagnosis */}

                <Fade
                  in={formik.values.exclusion_cat === "DIAGNOSIS"}
                  mountOnEnter
                  unmountOnExit
                  timeout={100}
                >
                  <Autocomplete
                    options={diagnosis}
                    loading={diagnosis.length === 0}
                    value={findSelectedDiagnosis()}
                    onChange={handleDiagnosisChange}
                    getOptionLabel={(option) =>
                      `${option.diagnosis_code} - ${option.diagnosis_desc}`
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.diagnosis_code === value?.diagnosis_code
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="diagnosis_code"
                        label="Diagnosis"
                        error={
                          formik.touched.diagnosis_code &&
                          Boolean(formik.errors.diagnosis_code)
                        }
                        helperText={
                          formik.touched.diagnosis_code &&
                          formik.errors.diagnosis_code
                        }
                      />
                    )}
                  />
                </Fade>
              </Box>

              <Box sx={{ width: "30%" }}>
                <TextField
                  disabled
                  fullWidth
                  name="exclusion_value"
                  label="Exclusion Value"
                  value={formik.values.exclusion_value}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  error={
                    formik.touched.exclusion_value &&
                    Boolean(formik.errors.exclusion_value)
                  }
                  helperText={
                    formik.touched.exclusion_value &&
                    formik.errors.exclusion_value
                  }
                />
              </Box>
            </Grid>
          </Grid>

          {/* Dialog Actions */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
          >
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={() => formik.handleSubmit()}
              variant="contained"
              disabled={loading || !formik.isValid}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : isEdit ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </Box>
        </Box>
      }
    />
  );
}
