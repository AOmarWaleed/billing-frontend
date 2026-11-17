import * as Yup from "yup";

const paymentSchema = (t: (key: string) => string, singlePatient: boolean) =>
  Yup.object({
    date: Yup.date().required(
      singlePatient
        ? t("patientAccount_11_DateRequired")
        : t("payment_23_DateRequired"),
    ),

    patient_id: Yup.string().required(
      singlePatient
        ? t("patientAccount_11_PatientIDRequired")
        : t("payment_23_PatientIDRequired"),
    ),

    episode_no: Yup.string().required(
      singlePatient
        ? t("patientAccount_11_EpisodeNumberRequired")
        : t("payment_23_EpisodeNumberRequired"),
    ),

    payments: Yup.array()
      .of(
        Yup.object({
          id: Yup.string().required(),

          method: Yup.object({
            code: Yup.number().required(),
            user_code: Yup.string()
              .required(
                singlePatient
                  ? t("patientAccount_11_PaymentMethodRequired")
                  : t("payment_23_PaymentMethodRequired"),
              )
              .oneOf(["CASH", "MADA", "CREDIT", "TRANSFER"]),
          }),

          amount: Yup.number()
            .typeError(
              singlePatient
                ? t("patientAccount_11_AmountMustBeNumber")
                : t("payment_23_AmountMustBeNumber"),
            )
            .required(
              singlePatient
                ? t("patientAccount_11_AmountRequired")
                : t("payment_23_AmountRequired"),
            )
            .positive(
              singlePatient
                ? t("patientAccount_11_AmountGreaterThanZero")
                : t("payment_23_AmountGreaterThanZero"),
            ),

          card_number: Yup.string().when("method.user_code", {
            is: (val: string) => ["CREDIT", "MADA"].includes(val),
            then: (schema) =>
              schema
                .required(
                  singlePatient
                    ? t("patientAccount_11_CardNumberRequired")
                    : t("payment_23_CardNumberRequired"),
                )
                .matches(
                  /^[0-9]{16}$/,
                  singlePatient
                    ? t("patientAccount_11_ValidCardNumber")
                    : t("payment_23_ValidCardNumber"),
                ),
            otherwise: (schema) => schema.strip(),
          }),

          card_approval_no: Yup.string().when("method.user_code", {
            is: (val: string) => ["CREDIT", "MADA"].includes(val),
            then: (schema) =>
              schema
                .required(
                  singlePatient
                    ? t("patientAccount_11_ApprovalNumberRequired")
                    : t("payment_23_ApprovalNumberRequired"),
                )
                .matches(
                  /^[0-9]{3,8}$/,
                  singlePatient
                    ? t("patientAccount_11_ApprovalNumberDigits")
                    : t("payment_23_ApprovalNumberDigits"),
                ),
            otherwise: (schema) => schema.strip(),
          }),
        }),
      )
      .min(
        1,
        singlePatient
          ? t("patientAccount_11_AtLeastOnePaymentMethod")
          : t("payment_23_AtLeastOnePaymentMethod"),
      ),

    total_amount: Yup.number()
      .required(
        singlePatient
          ? t("patientAccount_11_TotalAmountRequired")
          : t("payment_23_TotalAmountRequired"),
      )
      .positive(
        singlePatient
          ? t("patientAccount_11_TotalAmountPositive")
          : t("payment_23_TotalAmountPositive"),
      ),

    total_paid: Yup.number().nullable().min(0),
    total_change: Yup.number().nullable().min(0),
  })
    .test("total_paid", "", function (values) {
      const total = values?.payments?.reduce(
        (acc, curr) => acc + (Number(curr.amount) || 0),
        0,
      );

      if (total && total < (values?.total_amount ?? 0)) {
        return this.createError({
          path: "total_paid",
          message: singlePatient
            ? t("patientAccount_11_TotalPaidLessThanAmount")
            : t("payment_23_TotalPaidLessThanAmount"),
        });
      }
      return true;
    })
    .test("total_paid", "", function (values) {
      const total = values?.payments?.reduce((acc, curr) => {
        if (curr.method.user_code === "CASH") return acc;
        return acc + (Number(curr.amount) || 0);
      }, 0);

      if (total && total > (values?.total_amount ?? 0)) {
        return this.createError({
          path: "total_paid",
          message: singlePatient
            ? t("patientAccount_11_CardPaymentsExceedAmount")
            : t("payment_23_CardPaymentsExceedAmount"),
        });
      }
      return true;
    });

export default paymentSchema;
