import React, { forwardRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  colors,
} from "@mui/material";
import api from "../../../utils/Api";
import { apiUtility } from "../../../utils/apiUtility";
import { mutate } from "swr";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import { useContext } from "react";
import Secure from "../../../shared/security";
type Props = {
  invoiceNet: number;
  invoiceID: string;
  setIsSubmittingDiscount: (state: boolean) => void;
  setDiscountDialogOpen: (state: boolean) => void;
  invoiceRefetchRef: React.MutableRefObject<(() => void) | undefined>;
};

const AmountPercentageForm = forwardRef<HTMLFormElement, Props>(
  (
    { invoiceID, invoiceNet, setIsSubmittingDiscount, setDiscountDialogOpen, invoiceRefetchRef },
    ref
  ) => {
    const { t } = useContext(AuthGuardContext);
    const validationSchema = Yup.object({
      amount: Yup.number()
        .typeError(t("patientAccount_11_mustBeANumberDiscountDialogue"))
        .min(0, t("patientAccount_11_cannotBeNegativeDiscountDialogue"))
        .max(
          invoiceNet,
          t(
            "patientAccount_11_cannotExceedInvoiceNetOr100PercentDiscountDialogue"
          )
        )
        .required(
          t(
            "patientAccount_11_pleaseEnterAnAmountOrAPercentageDiscountDialogue"
          )
        )
        .notOneOf(
          [0],
          t("patientAccount_11_discountCannotBeZeroDiscountDialogue")
        ),
      percentage: Yup.number()
        .typeError(t("patientAccount_11_mustBeANumber2DiscountDialogue"))
        .min(0, t("patientAccount_11_cannotBeNegative2DiscountDialogue"))
        .max(
          100,
          t(
            "patientAccount_11_cannotExceedInvoiceNetOr100Percent2DiscountDialogue"
          )
        )
        .required(
          t(
            "patientAccount_11_pleaseEnterAnAmountOrAPercentage2DiscountDialogue"
          )
        )
        .notOneOf([0], t("patientAccount_11_cannotBeZeroDiscountDialogue")),
    });

    return (
      <Formik
        onSubmit={async (values, { setFieldError }) => {
          setIsSubmittingDiscount(true);
          try {
            const response = await api.post("/api/invoice/apply-discount", {
              invoiceId: invoiceID,
              discount_amount: values.amount,
            });

            mutate((key) => apiUtility(key, "invoice"));
            setIsSubmittingDiscount(false);
            setDiscountDialogOpen(false);
            invoiceRefetchRef?.current?.()
          } catch (error: any) {
            if (error.response.data?.error) {
              setFieldError("amount", error.response.data.error);
            } else {
              setFieldError("amount", error.message);
            }
            setIsSubmittingDiscount(false);
          }
        }}
        initialValues={{ amount: 0, percentage: 0 }}
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {(formik) => {
          const handlePercentage = (e: React.ChangeEvent<HTMLInputElement>) => {
            let value = e.target.value;
            formik.setFieldValue("percentage", value);
            const amount = ((Number(value) / 100) * invoiceNet).toFixed(2);
            formik.setFieldValue("amount", amount);
          };

          const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
            let value = e.target.value;
            formik.setFieldValue("amount", value);
            const percentage = ((Number(value) / invoiceNet) * 100).toFixed(2);
            formik.setFieldValue("percentage", percentage);
          };

          return (
            <form onSubmit={formik.handleSubmit}>
              <Box>
                <Box display="flex" flexDirection="row" gap={2} mt={2} mb={2}>
                  <Secure.GLTextField
                    resource_key="patientAccount_11_amountDiscountDialogue"
                    sx={{
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                        {
                          display: "none",
                        },
                      "& input[type=number]": {
                        MozAppearance: "textfield",
                      },
                    }}
                    label={t("patientAccount_11_amountDiscountDialogue")}
                    name="amount"
                    variant="filled"
                    value={formik.values.amount}
                    type="number"
                    onChange={handleAmount}
                    onFocus={() => {
                      if (
                        formik.values.amount === 0.0 ||
                        formik.values.amount === 0
                      ) {
                        formik.setFieldValue("amount", "");
                      }
                    }}
                    onBlur={() => {
                      const raw = formik.values.amount;
                      if (!raw) {
                        formik.setFieldValue("amount", 0);
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <img
                            src="currency.svg"
                            alt="icon"
                            width="22"
                            height="22"
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Secure.GLTextField
                    resource_key="patientAccount_11_percentageDiscountDialogue"
                    sx={{
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                        {
                          display: "none",
                        },
                      "& input[type=number]": {
                        MozAppearance: "textfield",
                      },
                    }}
                    label={t("patientAccount_11_percentageDiscountDialogue")}
                    name="percentage"
                    variant="filled"
                    type="number"
                    value={formik.values.percentage}
                    onChange={handlePercentage}
                    onFocus={() => {
                      if (
                        formik.values.percentage === 0.0 ||
                        formik.values.percentage === 0
                      ) {
                        formik.setFieldValue("percentage", "");
                      }
                    }}
                    onBlur={() => {
                      const raw = formik.values.percentage;
                      if (!raw) {
                        formik.setFieldValue("percentage", 0);
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                      style: { textAlign: "right" }, // optional: align number to the right
                    }}
                  />
                </Box>
                <button type="submit" style={{ display: "none" }} ref={ref}>
                  submit
                </button>
                <Box sx={{ width: "100%", minHeight: "2em" }}>
                  <Typography sx={{ color: "yellow" }}>
                    {formik.errors.amount}
                  </Typography>
                </Box>
              </Box>
            </form>
          );
        }}
      </Formik>
    );
  }
);

export default AmountPercentageForm;
