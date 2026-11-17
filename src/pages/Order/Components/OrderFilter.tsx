import { Grid2 as Grid, IconButton } from "@mui/material";
import { Form, FormikProvider, useFormik } from "formik";
import React from "react";
import { Field } from "../../../utils/formController";
import SearchIcon from "@mui/icons-material/Search";
import { useAppDispatch } from "../../../hooks/hooks";
import { useSelector, useStore } from "react-redux";
import { AppStore, RootState } from "../../../redux/store";
import {
  setOrderFilter,
  setSearchClicked,
} from "../../../redux/slices/orderSlice";
import { format } from "date-fns";
import { mutate } from "swr";
import { apiUtility } from "../../../utils/apiUtility";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import { useContext } from "react";
import Secure from "../../../shared/security";
import CloseIcon from "@mui/icons-material/Close";

const getPatientId = (value: string) => value.trim().split(/\s+/)[0] ?? "";

export default function OrderFilter() {
  const { t } = useContext(AuthGuardContext);
  const dispatch = useAppDispatch();
  const { orderFilter } = useSelector((state: RootState) => state.order);

  const formik = useFormik({
    initialValues: {
      startDate: new Date(orderFilter.startDate) || new Date(),
      endDate: orderFilter.endDate ? new Date(orderFilter.endDate) : null,
      patientId: orderFilter.patientId || null,
      episodeNo: orderFilter.episodeNo || null,
    },
    onSubmit: (values) => {
      dispatch(setSearchClicked(true));
      mutate((k) => apiUtility(k, "order"));
      dispatch(
        setOrderFilter({
          startDate: values.startDate
            ? format(values.startDate, "yyyy-MM-dd")
            : "",
          endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : null,
          patientId: values.patientId,
          episodeNo: values.episodeNo,
        }),
      );
    },
  });

  const handleResetFilters = () => {
    formik.resetForm();
    dispatch(
      setOrderFilter({
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: null,
        patientId: null,
        episodeNo: null,
      }),
    );
    dispatch(setSearchClicked(true));
    mutate((k) => apiUtility(k, "order"));
  };
  return (
    <FormikProvider value={formik}>
      {/* {JSON.stringify(formik.values)} */}
      <Form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Secure.GLFormDatePicker
              resource_key="order_24_startDate"
              name="startDate"
              label={t("order_24_startDate")}
            ></Secure.GLFormDatePicker>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Secure.GLFormDatePicker
              resource_key="order_24_endDate"
              name="endDate"
              label={t("order_24_endDate")}
            ></Secure.GLFormDatePicker>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Secure.GlFormAutoComplete
              resource_key="order_24_patient"
              name="patientId"
              inputLabel={t("order_24_patient")}
              url="/api/patientAccount"
              labelKeys={[
                "patient_id",
                "first_name",
                "middle_names",
                "last_name",
              ]}
              idKey="patient_id"
              searchParam="_filter"
              searchFilterField="patient_id"
              transformSearchValue={getPatientId}
              onChange={(v: any) => {
                formik.setFieldValue("episodeNo", null);
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Secure.GlFormAutoComplete
              resource_key="order_24_episode"
              url={
                formik.values?.patientId
                  ? `/api/patientAccount/searchEpisodeByPatientId/${formik.values?.patientId}`
                  : ""
              }
              labelKeys={["episode_no"]}
              inputLabel={t("order_24_episode")}
              idKey="episode_no"
              name="episodeNo"
              disabled={!formik.values?.patientId}
            />
          </Grid>

          <Grid
            size={{ xs: 12, sm: 2 }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Secure.GLIconButton
              resource_key="order_24_searchIcon"
              type="submit"
            >
              <SearchIcon />
            </Secure.GLIconButton>
            <Secure.GLIconButton
              resource_key="order_24_resetFilters"
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
