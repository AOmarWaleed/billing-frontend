import { Grid2 as Grid, IconButton, MenuItem } from "@mui/material";
import { Form, FormikProvider, useFormik } from "formik";
import { Field } from "../../../utils/formController";
import SearchIcon from "@mui/icons-material/Search";
import { useAppDispatch } from "../../../hooks/hooks";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
// import { setInvoiceFilter, setSearchClicked } from "../../../redux/slices/invoiceSlice";
import { format } from "date-fns";
import { mutate } from "swr";
import { apiUtility } from "../../../utils/apiUtility";
import { setInvoiceFilter } from "../../../redux/slices/invoiceSlice";
import { useContext } from "react";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";
import CloseIcon from "@mui/icons-material/Close";

export default function InvoiceFilter() {
  const dispatch = useAppDispatch();
  const { invoiceFilter } = useSelector((state: RootState) => state.invoice);
  const { t } = useContext(AuthGuardContext);
  const formik = useFormik({
    initialValues: {
      startDate: invoiceFilter.startDate
        ? new Date(invoiceFilter.startDate)
        : null,
      endDate: invoiceFilter.endDate ? new Date(invoiceFilter.endDate) : null,
      invoiceNo: invoiceFilter.invoiceNo || "",
      payerId: invoiceFilter.payerId || null,
      payerType: invoiceFilter.payerType || "",
      zatcaStatus: invoiceFilter.zatcaStatus || "",
      transType: invoiceFilter.transType || "",
    },
    onSubmit: (values) => {
      mutate((k) => apiUtility(k, "invoice"));
      dispatch(
        setInvoiceFilter({
          startDate: values.startDate
            ? format(values.startDate, "yyyy-MM-dd HH:mm:ss")
            : "",
          endDate: values.endDate
            ? format(values.endDate, "yyyy-MM-dd HH:mm:ss")
            : "",
          // startDate : values.startDate ,
          // endDate : values.endDate  || '',
          invoiceNo: values.invoiceNo,
          payerId: values.payerId,
          payerType: values.payerType,
          zatcaStatus: values.zatcaStatus,
          transType: values.transType,
        }),
      );
    },
  });

  const handleResetFilters = () => {
    formik.resetForm();
    dispatch(
      setInvoiceFilter({
        startDate: "",
        endDate: "",
        invoiceNo: "",
        payerId: null,
        payerType: "",
        zatcaStatus: "",
        transType: "",
      }),
    );
    mutate((k) => apiUtility(k, "invoice"));
  };

  return (
    <FormikProvider value={formik}>
      <Form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {/* Period on Invoice Date */}
          <Grid size={{ xs: 12, sm: 2 }}>
            <Secure.GLFormDateTimePicker
              resource_key="inovices_22_startDate"
              name="startDate"
              label={t("inovices_22_startDate")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Secure.GLFormDateTimePicker
              resource_key="inovices_22_endDate"
              name="endDate"
              label={t("inovices_22_endDate")}
            />
          </Grid>

          {/* Invoice No */}
          <Grid size={{ xs: 12, sm: 2 }}>
            <Secure.GLFormTextField
              resource_key="inovices_22_invoiceNo"
              name="invoiceNo"
              label={t("inovices_22_invoiceNo")}
            />
          </Grid>

          {/* Transaction Type */}
          <Grid size={{ xs: 12, sm: 1 }}>
            <Secure.GLFormTextField
              resource_key="inovices_22_transactionType"
              name="transType"
              label={t("inovices_22_transactionType")}
            />
          </Grid>

          {/* Payer ID */}
          <Grid size={{ xs: 12, sm: 2 }}>
            <Secure.GlFormAutoComplete
              resource_key="inovices_22_choosePayer"
              name="payerId"
              url="/item_prices/get-all-payers"
              labelKeys={["payer_id", "description"]}
              separator=" - "
              idKey="payer_id"
              inputLabel="Choose Payer"
            />
          </Grid>

          {/* Payer Type */}
          <Grid size={{ xs: 12, sm: 1 }}>
            <Secure.GLFormTextField
              resource_key="inovices_22_payerType"
              name="payerType"
              label={t("inovices_22_payerType")}
            />
          </Grid>

          {/* ZATCA Status */}
          <Grid size={{ xs: 12, sm: 1 }}>
            <Secure.GLFormTextField
              resource_key="inovices_22_zatcaStatus"
              name="zatcaStatus"
              label={t("inovices_22_zatcaStatus")}
            />
          </Grid>

          {/* Search Button */}
          <Grid
            size={{ xs: 12, sm: 1 }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Secure.GLIconButton
              resource_key="inovices_22_searchIcon"
              type="submit"
            >
              <SearchIcon />
            </Secure.GLIconButton>

            <Secure.GLIconButton
              resource_key="inovices_22_resetFilters"
              onClick={handleResetFilters}
            >
              <CloseIcon />
            </Secure.GLIconButton>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
}
