import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useContext,
} from "react";
import { Formik, Form, FieldArray, FormikTouched } from "formik";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Autocomplete,
  Typography,
  FormControl,
  FormHelperText,
  Snackbar,
  Alert,
  SnackbarCloseReason,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { v4 as uuid } from "uuid";
import apiNphies from "../../../utils/ApiNphies";
import PaymentForm from "./PaymentForm";
import { format, sub } from "date-fns";
import paymentSchema from "./validationSchema";
import { Patient } from "../../SinglePatient/PatientAccountTypes";
import { SelectedPatient } from "../PaymentMaster";
import api from "../../../utils/Api";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import { CustomGridColDef } from "../../../types/Columns";
import Secure from "../../../shared/security";
import { mutate } from "swr";
import { apiUtility } from "../../../utils/apiUtility";
import CustomDialog from "../../../components/CustomDialog/CustomDialog";
type PaymentMethod = {
  code: number;
  user_code: string;
  code_type: number;
  description: string;
  linked_code: string;
  col_1: string;
  col_2: string;
  col_3: string;
};

type Payment = {
  id: string;
  method: PaymentMethod | null;
  amount: number | "";
  card_number?: string;
  card_approval_no?: string;
};

export type FormValues = {
  payments: Payment[];
  total_amount: number | "";
  total_paid: number | 0;
  total_change: number | 0;
  patient_id: string;
  episode_no: string;
  date: Date;
};

const initialValues: FormValues = {
  payments: [],
  total_amount: "",
  total_paid: 0,
  total_change: 0,
  patient_id: "",
  episode_no: "",
  date: new Date(),
};
export type PaymenMethodFormGridProps = {
  fromSinglePatientPage: boolean;
  formData?: { patientId: string; episodeNo: string };
};
const isCard = (payment_method: PaymentMethod | null) =>
  payment_method?.user_code === "CREDIT" ||
  payment_method?.user_code === "MADA";

const PaymenMethodFormGrid = forwardRef<HTMLElement, PaymenMethodFormGridProps>(
  ({ fromSinglePatientPage, formData }, forwardedRef) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState({
      title: "",
      message: "",
    });
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [openSnackBarSubmit, setOpenSnackBarSubmit] = useState(false);
    const [snackbarSubmitMessage, setSnackbarSubmitMessage] =
      useState<string>("");
    const [severity, setSeverity] = useState<
      "success" | "error" | "warning" | "info"
    >("success");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const getAvailableOptions = (payments: Payment[]) =>
      paymentMethods.filter((item) =>
        payments.every(
          (payment: Payment) => payment.method?.user_code !== item.user_code,
        ),
      );

    //==================  * Resources * ===================

    const ctx = useContext(AuthGuardContext);
    if (!ctx) {
      return null;
    }
    const { resourcesData, t, userLang } = ctx;

    useEffect(() => {
      const fetchPaymentTypes = async () => {
        try {
          const response = await api.get("codedata/list/42");
          const data = response.data;
          setPaymentMethods(data.codedatalist);
        } catch (error: any) {
          setOpenSnackBar(true);
        }
      };
      fetchPaymentTypes();
    }, []);
    const handleClose = () => {
      setOpenDialog(false);
    };
    const handleCloseSnackbar = (
      event: React.SyntheticEvent | Event,
      reason?: SnackbarCloseReason,
    ) => {
      if (reason === "clickaway") {
        return;
      }
      setOpenSnackBar(false);
    };
    const handleCloseSnackbarSubmit = (
      event: React.SyntheticEvent | Event,
      reason?: SnackbarCloseReason,
    ) => {
      if (reason === "clickaway") {
        return;
      }
      setOpenSnackBarSubmit(false);
    };

    const internalRef = useRef<HTMLInputElement>(null);
    const refToUse = forwardedRef ?? internalRef;

    return (
      <Box>
        {!fromSinglePatientPage && (
          <CustomDialog
            open={openDialog}
            onClose={handleClose}
            title={submissionMessage.title}
            maxWidth="md"
          >
            {<Typography>{submissionMessage.message}</Typography>}
          </CustomDialog>
        )}
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          open={openSnackBar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {t("payment_23_FailedFetchPaymentTypes")}
          </Alert>
        </Snackbar>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          open={openSnackBarSubmit}
          autoHideDuration={3000}
          onClose={handleCloseSnackbarSubmit}
        >
          <Alert
            onClose={handleCloseSnackbarSubmit}
            severity={severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarSubmitMessage}
          </Alert>
        </Snackbar>
        <Box
          sx={{
            maxWidth: "850px",
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
          }}
        >
          <Formik<FormValues>
            initialValues={initialValues}
            validationSchema={paymentSchema(t, fromSinglePatientPage)}
            validateOnChange={false}
            validateOnBlur={true}
            onSubmit={async (values, { resetForm }) => {
              const body = {
                ...values,
                date: format(values.date, "yyyy-MM-dd"),
                payments: values.payments.map(
                  ({
                    id,
                    method,
                    card_number,
                    card_approval_no,
                    ...paymentRest
                  }) => {
                    const payment: any = {
                      ...paymentRest,
                      method: (({
                        code_type,
                        description,
                        linked_code,
                        col_1,
                        col_2,
                        col_3,
                        ...methodRest
                      }) => methodRest)(method!),
                    };
                    if (card_number) payment.card_number = card_number;
                    if (card_approval_no)
                      payment.card_approval_no = card_approval_no;
                    return payment;
                  },
                ),
              };
              try {
                setIsSubmitting(true);
                const response = await apiNphies.post("/api/payment", body);
                if (!fromSinglePatientPage) {
                  setOpenDialog(true);
                  setSubmissionMessage({
                    title: "Payment Succeeded",
                    message: response.data.msg,
                  });
                }
                setOpenSnackBarSubmit(true);
                resetForm({
                  values: {
                    payments: [],
                    total_amount: "",
                    total_paid: 0,
                    total_change: 0,
                    episode_no: "",
                    patient_id: values.patient_id,
                    date: new Date(),
                  },
                });
                setSnackbarSubmitMessage(response.data.msg);
                setSeverity("success");
              } catch (error: any) {
                if (fromSinglePatientPage) {
                  throw error;
                }
                setOpenDialog(true);
                setSubmissionMessage({
                  title: "Payment Failed",
                  message: error.message || "Nework Error",
                });
                setIsSubmitting(false);
                setOpenSnackBarSubmit(true);
                setSnackbarSubmitMessage(
                  error.response?.data?.message ||
                    t("payment_23_FailedAddPaymentMethods"),
                );
                setSeverity("error");
              }
              setIsSubmitting(false);
            }}
          >
            {({
              values,
              setFieldValue,
              setValues,
              setFieldTouched,
              touched,
              errors,
              setTouched,
              submitForm,
              validateForm,
            }) => {
              const handleOuterAction = async () => {
                if (fromSinglePatientPage) {
                  const touched: FormikTouched<FormValues> = {
                    patient_id: true,
                    episode_no: true,
                    date: true,
                    total_amount: true,
                    total_paid: true,
                    total_change: true,
                    payments: values.payments.map(() => ({
                      id: true,
                      method: true,
                      amount: true,
                      card_number: true,
                      card_approval_no: true,
                    })),
                  };
                  setTouched(touched, true);
                  const errors = await validateForm();
                  const hasErrors = Object.keys(errors).length > 0;
                  if (hasErrors) {
                    return true;
                  }
                }
                await submitForm();
                mutate((e) => apiUtility(e, "payment/patient-payments"));
              };
              useImperativeHandle(refToUse, () => ({ handleOuterAction }));
              useEffect(() => {
                setValues({
                  ...values,
                  patient_id: fromSinglePatientPage ? formData?.patientId! : "",
                  episode_no: fromSinglePatientPage ? formData?.episodeNo! : "",
                  payments: [],
                });
              }, [paymentMethods]);
              useEffect(() => {
                setFieldValue(
                  "total_paid",
                  values.payments.reduce(
                    (prev, current) => prev + Number(current.amount),
                    0,
                  ),
                );
                setFieldValue(
                  "total_change",
                  Math.max(
                    Number(values.total_paid || 0) -
                      Number(values.total_amount || 0),
                    0,
                  ),
                );
              }, [values.payments]);
              return (
                <Form>
                  <PaymentForm
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                    fromSinglePatientPage={fromSinglePatientPage}
                    formData={formData}
                    values={values}
                  />
                  <FieldArray name="payments">
                    {({ remove, push }) => {
                      const columns: CustomGridColDef[] = [
                        {
                          field: "method",
                          resource_key: fromSinglePatientPage
                            ? "patientAccount_11_Method"
                            : "payment_23_Method",
                          headerName: "Method",
                          flex: 2,
                          minWidth: 240,
                          sortable: false,
                          renderCell: (params: GridRenderCellParams) => {
                            const rowIndex = values.payments.findIndex(
                              (p) => p.id === params.id,
                            );

                            return (
                              <Box
                                sx={{
                                  height: "100%",
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Autocomplete
                                  size="small"
                                  options={getAvailableOptions(values.payments)}
                                  getOptionLabel={(opt) => opt.description}
                                  value={params.value}
                                  disableClearable
                                  sx={{
                                    width: "100%",
                                    "&.MuiAutocomplete-root": {
                                      display: "flex",
                                      alignItems: "center",
                                    },
                                    "& .MuiAutocomplete-input": {
                                      padding: "0px 10px !important",
                                      height: "24px !important",
                                    },
                                  }}
                                  onChange={(_, value) => {
                                    setFieldValue(
                                      `payments.${rowIndex}.method`,
                                      value,
                                    );

                                    if (!isCard(value)) {
                                      setFieldValue(
                                        `payments.${rowIndex}.card_number`,
                                        "",
                                      );
                                      setFieldValue(
                                        `payments.${rowIndex}.card_approval_no`,
                                        "",
                                      );
                                    }
                                  }}
                                  renderInput={(inputProps) => (
                                    <TextField
                                      margin="none"
                                      {...inputProps}
                                      inputProps={{
                                        ...inputProps.inputProps,
                                        readOnly: true,
                                      }}
                                      placeholder="Select payment method"
                                      sx={{
                                        height: "24px",
                                        "& .MuiInputBase-root": {
                                          height: "100%",
                                          display: "flex",
                                          alignItems: "center",
                                          paddingTop: 0,
                                          paddingBottom: 0,
                                        },
                                      }}
                                    />
                                  )}
                                />
                              </Box>
                            );
                          },
                        },
                        {
                          field: "amount",
                          headerName: "Amount",
                          resource_key: fromSinglePatientPage
                            ? "patientAccount_11_Amount"
                            : "payment_23_Amount",
                          flex: 1,
                          minWidth: 120,
                          sortable: false,
                          renderCell: (params: GridRenderCellParams) => {
                            const rowIndex = values.payments.findIndex(
                              (p) => p.id === params.id,
                            );
                            const showError = !!(
                              touched?.payments?.[rowIndex]?.amount &&
                              errors?.payments?.[rowIndex]?.amount
                            );
                            return (
                              <Tooltip
                                title={
                                  showError
                                    ? errors?.payments?.[rowIndex]?.amount
                                    : ""
                                }
                                disableHoverListener={!showError}
                                placement="right"
                                arrow
                              >
                                <TextField
                                  margin="none"
                                  size="small"
                                  sx={{
                                    height: "24px",
                                    "& .MuiInputBase-root": {
                                      height: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      paddingTop: 0,
                                      paddingBottom: 0,
                                    },
                                    "& .MuiOutlinedInput-input": {
                                      padding: "0px 10px",
                                    },
                                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                      {
                                        WebkitAppearance: "none",
                                        margin: 0,
                                      },
                                    "& input[type=number]": {
                                      MozAppearance: "textfield",
                                    },
                                  }}
                                  fullWidth
                                  type="number"
                                  placeholder="Amount"
                                  value={params.value}
                                  error={
                                    !!(
                                      touched?.payments?.[rowIndex]?.amount &&
                                      errors?.payments?.[rowIndex]?.amount
                                    )
                                  }
                                  onBlur={() =>
                                    setFieldTouched(
                                      `payments.${rowIndex}.amount`,
                                      true,
                                    )
                                  }
                                  onChange={(e) => {
                                    setValues((prev) => {
                                      const updatedPayments = prev.payments.map(
                                        (paymentMethod, index) => {
                                          let newAmount: number | "" =
                                            e.target.value === ""
                                              ? ""
                                              : Number(e.target.value);

                                          return index === rowIndex
                                            ? {
                                                ...paymentMethod,
                                                amount: newAmount,
                                              }
                                            : paymentMethod;
                                        },
                                      );

                                      const total = updatedPayments.reduce(
                                        (total, item) =>
                                          total +
                                          (typeof item.amount === "number"
                                            ? item.amount
                                            : 0),
                                        0,
                                      );
                                      const newChange =
                                        total > Number(prev.total_amount)
                                          ? total - Number(prev.total_amount)
                                          : 0;
                                      return {
                                        ...prev,
                                        payments: updatedPayments,
                                        total_paid: total,
                                        total_change: newChange,
                                      };
                                    });
                                  }}
                                />
                              </Tooltip>
                            );
                          },
                        },
                        {
                          field: "card_number",
                          headerName: "Card Number",
                          resource_key: fromSinglePatientPage
                            ? "patientAccount_11_CardNumber"
                            : "payment_23_CardNumber",
                          flex: 1.2,
                          minWidth: 180,
                          sortable: false,
                          renderCell: (params) => {
                            const rowIndex = values.payments.findIndex(
                              (p) => p.id === params.id,
                            );

                            const method = values.payments[rowIndex]?.method;
                            if (!isCard(method)) return null;
                            const showError = !!(
                              touched?.payments?.[rowIndex]?.card_number &&
                              errors?.payments?.[rowIndex]?.card_number
                            );
                            return (
                              <Tooltip
                                title={
                                  showError
                                    ? errors?.payments?.[rowIndex]?.card_number
                                    : ""
                                }
                                disableHoverListener={!showError}
                                placement="right"
                                arrow
                              >
                                <TextField
                                  margin="none"
                                  sx={{
                                    height: "24px",
                                    "& .MuiInputBase-root": {
                                      height: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      paddingTop: 0,
                                      paddingBottom: 0,
                                    },
                                    "& .MuiOutlinedInput-input": {
                                      padding: "0px 10px",
                                    },
                                  }}
                                  size="small"
                                  fullWidth
                                  placeholder="Card No"
                                  error={
                                    !!(
                                      touched?.payments?.[rowIndex]
                                        ?.card_number &&
                                      errors?.payments?.[rowIndex]?.card_number
                                    )
                                  }
                                  value={params.value || ""}
                                  onChange={(e) =>
                                    setFieldValue(
                                      `payments.${rowIndex}.card_number`,
                                      e.target.value,
                                    )
                                  }
                                  onBlur={() =>
                                    setFieldTouched(
                                      `payments.${rowIndex}.card_number`,
                                      true,
                                    )
                                  }
                                />
                              </Tooltip>
                            );
                          },
                        },
                        {
                          field: "card_approval_no",
                          headerName: "Approval Code",
                          resource_key: fromSinglePatientPage
                            ? "patientAccount_11_ApprovalCode"
                            : "payment_23_ApprovalCode",
                          flex: 1.2,
                          minWidth: 120,
                          sortable: false,
                          renderCell: (params) => {
                            const rowIndex = values.payments.findIndex(
                              (p) => p.id === params.id,
                            );

                            const method = values.payments[rowIndex]?.method;
                            if (!isCard(method)) return null;
                            const showError = !!(
                              touched?.payments?.[rowIndex]?.card_approval_no &&
                              errors?.payments?.[rowIndex]?.card_approval_no
                            );
                            return (
                              <Tooltip
                                title={
                                  showError
                                    ? errors?.payments?.[rowIndex]
                                        ?.card_approval_no
                                    : ""
                                }
                                disableHoverListener={!showError}
                                placement="right"
                                arrow
                              >
                                <TextField
                                  margin="none"
                                  sx={{
                                    height: "24px",
                                    "& .MuiInputBase-root": {
                                      height: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      paddingTop: 0,
                                      paddingBottom: 0,
                                    },
                                    "& .MuiOutlinedInput-input": {
                                      padding: "0px 10px",
                                    },
                                  }}
                                  size="small"
                                  fullWidth
                                  value={params.value || ""}
                                  placeholder="Card Approval No"
                                  error={
                                    !!(
                                      touched?.payments?.[rowIndex]
                                        ?.card_approval_no &&
                                      errors?.payments?.[rowIndex]
                                        ?.card_approval_no
                                    )
                                  }
                                  onChange={(e) =>
                                    setFieldValue(
                                      `payments.${rowIndex}.card_approval_no`,
                                      e.target.value,
                                    )
                                  }
                                  onBlur={() =>
                                    setFieldTouched(
                                      `payments.${rowIndex}.card_approval_no`,
                                      true,
                                    )
                                  }
                                />
                              </Tooltip>
                            );
                          },
                        },
                        {
                          field: "actions",
                          headerName: "Actions",
                          resource_key: fromSinglePatientPage
                            ? "patientAccount_11_Actions"
                            : "payment_23_Actions",
                          flex: 0.5,
                          minWidth: 65,
                          sortable: false,
                          filterable: false,
                          renderCell: (params) => {
                            const rowIndex = values.payments.findIndex(
                              (p) => p.id === params.id,
                            );

                            return (
                              <Tooltip title="Delete Row" arrow>
                                <IconButton
                                  disabled={values.payments.length === 1}
                                  color="error"
                                  onClick={() => {
                                    remove(rowIndex);
                                  }}
                                >
                                  <RemoveCircleOutlineIcon />
                                </IconButton>
                              </Tooltip>
                            );
                          },
                        },
                      ];

                      return (
                        <Box
                          sx={{
                            maxWidth: "800px",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 2,
                              width: "100%",
                              justifyContent: "space-between",
                              mt: 1,
                              mb: 1,
                              height: "85px",
                            }}
                          >
                            <Box sx={{ flex: "1 1 60px" }}>
                              <Secure.GLTextField
                                resource_key={
                                  fromSinglePatientPage
                                    ? "patientAccount_11_TotalAmount"
                                    : "payment_23_TotalAmount"
                                }
                                variant={"filled"}
                                name="total_amount"
                                value={values.total_amount}
                                error={
                                  touched.total_amount &&
                                  Boolean(errors.total_amount)
                                }
                                helperText={
                                  touched.total_amount && errors.total_amount
                                }
                                onChange={(e) =>
                                  setFieldValue(
                                    "total_amount",
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                  )
                                }
                                onBlur={() =>
                                  setFieldTouched("total_amount", true)
                                }
                                label={
                                  fromSinglePatientPage
                                    ? t("patientAccount_11_TotalAmount")
                                    : t("payment_23_TotalAmount")
                                }
                                type="number"
                                fullWidth
                                sx={{
                                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                    {
                                      WebkitAppearance: "none",
                                      margin: 0,
                                    },
                                  "& input[type=number]": {
                                    MozAppearance: "textfield",
                                  },
                                  "& .MuiFormHelperText-root": {
                                    textAlign: "left",
                                  },

                                  "&.MuiFormControl-root": {
                                    margin: "0px",
                                  },
                                }}
                              />
                            </Box>
                            <Box sx={{ flex: "1 1 60px" }}>
                              <FormControl
                                error={
                                  !!errors.total_paid &&
                                  values.payments.length ===
                                    touched.payments?.length
                                }
                                fullWidth
                                sx={{
                                  alignItems: "flex-start",
                                  textAlign: "left",
                                }}
                              >
                                <Secure.GLTypography
                                  resource_key={
                                    fromSinglePatientPage
                                      ? "patientAccount_11_TotalPaid"
                                      : "payment_23_TotalPaid"
                                  }
                                  variant="body1"
                                >
                                  {fromSinglePatientPage
                                    ? t("patientAccount_11_TotalPaid")
                                    : t("payment_23_TotalPaid")}
                                </Secure.GLTypography>
                                <Secure.GLTypography
                                  variant="body1"
                                  resource_key={
                                    fromSinglePatientPage
                                      ? "patientAccount_11_TotalPaid"
                                      : "payment_23_TotalPaid"
                                  }
                                >
                                  {values.payments.reduce(
                                    (prev, current) =>
                                      prev + Number(current.amount),
                                    0,
                                  )}
                                </Secure.GLTypography>
                                <FormHelperText
                                  sx={{
                                    mx: 0,
                                    textAlign: "left",
                                    display:
                                      values.payments.length ===
                                        touched.payments?.length &&
                                      errors.total_paid
                                        ? "inline-block"
                                        : "none",
                                  }}
                                >
                                  {values.payments.length ===
                                    touched.payments?.length &&
                                    errors.total_paid}
                                </FormHelperText>
                              </FormControl>
                            </Box>
                            <Box sx={{ flex: "1 1 60px" }}>
                              <Secure.GLTypography
                                resource_key={
                                  fromSinglePatientPage
                                    ? "patientAccount_11_TotalChange"
                                    : "payment_23_TotalChange"
                                }
                                variant="body1"
                              >
                                {fromSinglePatientPage
                                  ? t("patientAccount_11_TotalChange")
                                  : t("payment_23_TotalChange")}{" "}
                              </Secure.GLTypography>
                              <Secure.GLTypography
                                variant="body1"
                                resource_key={
                                  fromSinglePatientPage
                                    ? "patientAccount_11_TotalChange"
                                    : "payment_23_TotalChange"
                                }
                              >
                                {(Number(values.total_paid) -
                                  Number(values.total_amount) >
                                  0 &&
                                  Number(values.total_paid) -
                                    Number(values.total_amount)) ||
                                  0}
                              </Secure.GLTypography>
                            </Box>
                          </Box>
                          <Box>
                            <DataGrid
                              columns={columns}
                              rows={values.payments}
                              getRowId={(row) => row.id}
                              getRowHeight={() => 34}
                              // rowHeight={52}
                              disableColumnMenu
                              disableRowSelectionOnClick
                              disableVirtualization
                              sx={{
                                "& .MuiDataGrid-cell": {
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  paddingTop: 0,
                                  paddingBottom: 0,
                                  boxSizing: "border-box",
                                  transition: "none !important",
                                },
                                "& .MuiDataGrid-row": {
                                  transition: "none !important", // disables row height / position animations
                                },
                              }}
                              hideFooter
                            />
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Secure.GLButton
                              resource_key={
                                fromSinglePatientPage
                                  ? "patientAccount_11_AddPaymentMethod"
                                  : "payment_23_AddPaymentMethod"
                              }
                              disabled={
                                values.payments.length === 4 ||
                                Number(values.total_amount) <=
                                  values.payments.reduce(
                                    (prev, current) =>
                                      prev + Number(current.amount),
                                    0,
                                  )
                              }
                              variant="text"
                              startIcon={<AddCircleOutlineIcon />}
                              onClick={() => {
                                push({
                                  id: uuid(),
                                  method: getAvailableOptions(
                                    values.payments,
                                  )[0],
                                  amount:
                                    values.total_change <= 0
                                      ? Number(values.total_amount) -
                                        values.payments.reduce(
                                          (prev, current) =>
                                            prev + Number(current.amount),
                                          0,
                                        )
                                      : "",
                                  card_number: "",
                                  card_approval_no: "",
                                });
                              }}
                            >
                              {fromSinglePatientPage
                                ? t("patientAccount_11_AddPaymentMethod")
                                : t("payment_23_AddPaymentMethod")}
                            </Secure.GLButton>

                            <Secure.GLButton
                              resource_key={
                                fromSinglePatientPage
                                  ? "patientAccount_11_Subimt"
                                  : "payment_23_Submit"
                              }
                              type="submit"
                              variant="contained"
                              sx={{
                                ml: 2,
                                display: fromSinglePatientPage
                                  ? "none"
                                  : "inline-block",
                              }}
                              disabled={isSubmitting}
                            >
                              {isSubmitting
                                ? fromSinglePatientPage
                                  ? t("patientAccount_11_Subimtting")
                                  : t("payment_23_Submit")
                                : fromSinglePatientPage
                                  ? t("patientAccount_11_Subimt")
                                  : t("payment_23_Submit")}
                            </Secure.GLButton>
                          </Box>
                        </Box>
                      );
                    }}
                  </FieldArray>
                </Form>
              );
            }}
          </Formik>
        </Box>
      </Box>
    );
  },
);

export default PaymenMethodFormGrid;
