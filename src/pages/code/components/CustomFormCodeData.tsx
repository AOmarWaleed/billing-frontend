import React, {
  useState,
  useEffect,
  useContext,
} from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  TextField,
  Autocomplete,
  Grid2 as Grid,
} from "@mui/material";
import { Form, Formik } from "formik";
import { CodeDataDTO } from "../../../types/CodeDataDTO";
import { AppDispatch, RootState } from "../../../redux/store";
import { SelectOption } from "../../../types/selectOpion";
import { CodeData } from "../../../types/CodeData";
import {
  addCodeData,
  fetchCodeDataByCodeType,
  updateCodeData,
  setSelectedItemByCode,
} from "../../../redux/slices/CodeDataSlice";
import { useDispatch, useSelector } from "react-redux";
import { mutate } from "swr";
import { apiUtility } from "../../../utils/apiUtility";
import { AuthGuardContext } from "../../../shared/core/AuthGuard";
import Secure from "../../../shared/security";
import { ChipArrayInput } from "./DataGridCode";
import api from "../../../utils/Api";
import codeDataSchema from "../../../models/codeDataScheme";

interface CustomFormCodeDataProps {
  row: CodeData;
  isInEditMode: boolean;
  isNew?: boolean;
  editId: number;
  master_code_type: number;
  isLinked: boolean;
  master_code_desc: string;
  linked_code_desc: string;
  linked_type: string;
  handleClose: () => void;
  selectedCodeData?: CodeData;
  codeTypeRef?: React.MutableRefObject<(() => void) | null>;
}

const CustomFormCodeData: React.FC<CustomFormCodeDataProps> = ({
  row,
  isInEditMode,
  isNew = false,
  editId,
  master_code_type,
  isLinked,
  master_code_desc,
  linked_code_desc,
  linked_type,
  handleClose,
  selectedCodeData,
  codeTypeRef,
}) => {
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { resourcesData, t, userLang } = ctx;

  const dispatch: AppDispatch = useDispatch();
  const codeTypes = useSelector((state: RootState) => state.codetypes.types);
  const page = useSelector((state: RootState) => state.codedata.page);
  const limit = useSelector((state: RootState) => state.codedata.limit);

  const filteredTypes = codeTypes.filter(
    (type) => type.code_type !== master_code_type,
  );
  const codeTypeOptions = filteredTypes.map((type) => ({
    label: `${type.code_type} - ${type.description}`,
    id: type.code_type,
  }));

  const [linkedCodeOptions, setLinkedCodeOptions] = useState<
    SelectOption[] | null
  >(null);

  useEffect(() => {
    const fetchLinkedCodeList = async () => {
      if (linked_type) {
        try {
          const response = await api.get(`/codedata/list/${linked_type}`);
          if (response.data.codedatalist?.length > 0) {
            const linkedCodeOptionsTemp = response.data.codedatalist.map(
              (type: any) => ({
                label: `${type.user_code} - ${type.description || ""}`,
                user_code: type.user_code,
                id: type.code,
              }),
            );
            setLinkedCodeOptions(linkedCodeOptionsTemp);
          } else {
            setLinkedCodeOptions([]);
          }
        } catch (error) {
          console.error("Error fetching linked code list:", error);
          setLinkedCodeOptions([]);
        }
      }
    };
    fetchLinkedCodeList();
  }, [linked_type]);

  const initialValues: CodeDataDTO = {
    user_code: isNew ? "" : (selectedCodeData?.user_code ?? row?.user_code ?? ""),
    description: isNew ? "" : (selectedCodeData?.description ?? row?.description ?? ""),
    linked_code: isNew ? null : (selectedCodeData?.linked_code ?? row?.linked_code ?? null),
    linked_user_code: isNew ? "" : (selectedCodeData?.linked_user_code ?? row?.linked_user_code ?? ""),
    sub_code_type: isNew ? null : (selectedCodeData?.sub_code_type ?? row?.sub_code_type ?? null),
    cat_code: isNew
      ? []
      : (selectedCodeData?.cat_code?.map((e: any) => e?.trim()?.toUpperCase()) ??
        row?.cat_code ??
        []),
    col_1: isNew ? "" : (selectedCodeData?.col_1 ?? row?.col_1 ?? ""),
    col_2: isNew ? "" : (selectedCodeData?.col_2 ?? row?.col_2 ?? ""),
    col_3: isNew ? "" : (selectedCodeData?.col_3 ?? row?.col_3 ?? ""),
  };

  const [selectedLinkedText, setSelectedLinkedText] = useState<string>(
    isNew ? "" : (selectedCodeData?.linked_description ?? ""),
  );
  const [selectedSubText, setSelectedSubTextOption] = useState<string>(
    isNew ? "" : (selectedCodeData?.sub_type_description ?? ""),
  );

  const validateFormikWithJoi = (values: any) => {
    const payload = {
      ...values,
      user_code:
        typeof values.user_code === "string"
          ? values.user_code.trim()
          : values.user_code,
      description:
        typeof values.description === "string"
          ? values.description.trim()
          : values.description,
      linked_code:
        values.linked_code === "" || values.linked_code === null
          ? null
          : Number(values.linked_code),
      sub_code_type:
        values.sub_code_type === "" || values.sub_code_type === null
          ? null
          : Number(values.sub_code_type),
    };

    const { error } = codeDataSchema.validate(payload, { abortEarly: false });
    if (!error) return {};

    const errors: Record<string, string> = {};
    error.details.forEach((err) => {
      const field = String(err.path[0]);
      if (!errors[field]) {
        errors[field] = err.message;
      }
    });
    return errors;
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    const payload: CodeDataDTO = {
      user_code: values.user_code ? String(values.user_code).trim() : "",
      description: values.description ? String(values.description).trim() : "",
      linked_code: values.linked_code ? Number(values.linked_code) : null,
      linked_user_code: values.linked_user_code || null,
      sub_code_type: values.sub_code_type ? Number(values.sub_code_type) : null,
      cat_code:
        values.cat_code?.map((e: any) => e?.trim()?.toUpperCase()) || [],
      col_1: values.col_1 || "",
      col_2: values.col_2 || "",
      col_3: values.col_3 || "",
    };

    try {
      if (isNew) {
        const resultAction = await dispatch(
          addCodeData({ code_type: master_code_type, data: payload }),
        );
        if (addCodeData.fulfilled.match(resultAction)) {
          handleClose();
          await mutate((e) => apiUtility(e, "codedata"));
          dispatch(
            fetchCodeDataByCodeType({
              codeType: master_code_type,
              page: page,
              limit: limit,
            }),
          );
          codeTypeRef?.current?.();
        }
      } else {
        const resultAction = await dispatch(
          updateCodeData({ id: editId, data: payload }),
        );
        if (updateCodeData.fulfilled.match(resultAction)) {
          handleClose();
          await mutate((e) => apiUtility(e, "codedata"));
          dispatch(
            fetchCodeDataByCodeType({
              codeType: master_code_type,
              page: page,
              limit: limit,
            }),
          );
          dispatch(setSelectedItemByCode(editId || null));
          codeTypeRef?.current?.();
        }
      }
    } catch (error: any) {
      console.error("Save Code Data error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isInEditMode) {
    return (
      <Card
        variant="outlined"
        sx={{
          border: "none",
          p: "none",
          m: "none",
          background: "none !important",
        }}
      >
        <CardContent sx={{ padding: 0 }}>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" />}
            spacing={1}
            sx={{ overflow: "hidden", flexWrap: "nowrap" }}
          >
            <Typography style={{ flex: 1 }}>
              <span>Code Type:{"  "}</span>
              {row.code_type}
            </Typography>

            <Typography
              sx={{
                flex: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.description}
            </Typography>
          </Stack>

          {row.linked_code && (
            <Typography style={{ flex: 1 }}>
              <span>Linked Type:{"  "}</span>
              {row.linked_code}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        border: "none",
        p: "none",
        m: "none",
        background: "none !important",
      }}
    >
      <CardContent>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validate={validateFormikWithJoi}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form>
              <Grid container spacing={2}>
                {/* Code Type Info */}
                <Grid size={12}>
                  <Secure.GLTypography resource_key="codetype_8_CodeType">
                    {t("codetype_8_CodeType") || "Code Type :"} {"   "}
                    {master_code_type}
                    {"  -        "}
                    {master_code_desc}
                  </Secure.GLTypography>
                </Grid>

                {/* User Code and Description Fields */}
                <Grid size={12}>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Secure.GLTypography resource_key="codetype_8_UserCodeField">
                        <TextField
                          name="user_code"
                          id="user_code"
                          value={values.user_code ?? ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.user_code && Boolean(errors.user_code)
                          }
                          helperText={
                            touched.user_code && (errors.user_code as string)
                          }
                          size="small"
                          fullWidth
                          label={
                            t("codetype_8_UserCodeField") || "User Code:"
                          }
                        />
                      </Secure.GLTypography>
                    </Grid>

                    <Grid size={12}>
                      <Secure.GLTypography resource_key="codetype_8_DescriptionColon">
                        <TextField
                          name="description"
                          id="description"
                          value={values.description ?? ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.description && Boolean(errors.description)
                          }
                          helperText={
                            touched.description && (errors.description as string)
                          }
                          size="small"
                          fullWidth
                          label={
                            t("codetype_8_DescriptionColon") || "Description:"
                          }
                        />
                      </Secure.GLTypography>
                    </Grid>

                    <Grid size={12}>
                      <Secure.GLTypography resource_key="codetype_8_CatCodeField">
                        <ChipArrayInput
                          value={values.cat_code || []}
                          onChange={(newValue) =>
                            setFieldValue("cat_code", newValue)
                          }
                          label="Cat Code"
                          placeholder="Type category code and press Enter"
                        />
                      </Secure.GLTypography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Linked Code Field */}
                {isLinked ? (
                  <Grid size={12}>
                    <div style={{ position: "relative", zIndex: 9999 }}>
                      <Secure.GLTypography
                        resource_key="codetype_8_LinkedCodeField"
                        style={{ position: "relative", zIndex: 9999 }}
                      >
                        {t("codetype_8_LinkedCodeField") || "Linked Code:"}{" "}
                        <span style={{ marginLeft: "20px" }}>
                          {linked_type ? linked_type : ""}
                        </span>
                        <span style={{ margin: "10px", fontWeight: "bold" }}>
                          -
                        </span>
                        <span>{linked_code_desc ? linked_code_desc : ""}</span>

                        {linkedCodeOptions && linkedCodeOptions.length > 0 ? (
                          <Autocomplete
                            id="linked_code"
                            value={
                              linkedCodeOptions.find(
                                (opt) => opt.id === values.linked_code,
                              ) || null
                            }
                            inputValue={selectedLinkedText || ""}
                            onInputChange={(_, newInputValue) => {
                              setSelectedLinkedText(newInputValue || "");
                            }}
                            options={linkedCodeOptions}
                            getOptionLabel={(o: any) =>
                              o?.label || o?.user_code || ""
                            }
                            onChange={(_, newValue: any) => {
                              setFieldValue(
                                "linked_code",
                                newValue ? newValue.id : null,
                              );
                              setFieldValue(
                                "linked_user_code",
                                newValue ? (newValue.user_code || newValue.label) : null,
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                label={
                                  t("codetype_8_LinkedCodeField") || "Linked Code"
                                }
                              />
                            )}
                            sx={{ width: "100%", mt: 2 }}
                          />
                        ) : (
                          <span style={{ marginLeft: "15px" }}>
                            {" "}
                            {t("codetype_8_NoOptions") || "- No Options"}
                          </span>
                        )}
                      </Secure.GLTypography>
                    </div>
                  </Grid>
                ) : (
                  <Grid size={12}>
                    <Secure.GLTypography resource_key="codetype_8_LinkedCodeField">
                      <span>
                        {t("codetype_8_LinkedCodeField") || "Linked Code:"}{" "}
                      </span>{" "}
                      <span style={{ marginLeft: "15px" }}>Not Linked </span>
                    </Secure.GLTypography>
                  </Grid>
                )}

                {/* Sub Type Code Field */}
                <Grid size={12}>
                  <div>
                    <Secure.GLTypography resource_key="codetype_8_SubTypeCodeField">
                      <Autocomplete
                        id="sub_code_type"
                        value={
                          codeTypeOptions.find(
                            (opt) => opt.id === values.sub_code_type,
                          ) || null
                        }
                        inputValue={selectedSubText || ""}
                        onInputChange={(_, newInputValue) => {
                          setSelectedSubTextOption(newInputValue || "");
                        }}
                        options={codeTypeOptions}
                        onChange={(_, newValue: any) => {
                          setFieldValue(
                            "sub_code_type",
                            newValue ? newValue.id : null,
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            label={
                              t("codetype_8_SubTypeCodeField") ||
                              "Sub Type Code:"
                            }
                            {...params}
                            fullWidth
                          />
                        )}
                        sx={{ width: "100%" }}
                      />
                    </Secure.GLTypography>
                  </div>
                </Grid>

                {/* col_1, col_2, col_3 Fields */}
                <Grid size={12}>
                  <Secure.GLTypography resource_key="codetype_8_Col1Field">
                    <TextField
                      name="col_1"
                      id="col_1"
                      value={values.col_1 ?? ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      fullWidth
                      label="Col_1"
                    />
                  </Secure.GLTypography>
                </Grid>

                <Grid size={12}>
                  <Secure.GLTypography resource_key="codetype_8_Col2Field">
                    <TextField
                      name="col_2"
                      id="col_2"
                      value={values.col_2 ?? ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      fullWidth
                      label="Col_2"
                    />
                  </Secure.GLTypography>
                </Grid>

                <Grid size={12}>
                  <Secure.GLTypography resource_key="codetype_8_Col3Field">
                    <TextField
                      name="col_3"
                      id="col_3"
                      value={values.col_3 ?? ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      fullWidth
                      label="Col_3"
                    />
                  </Secure.GLTypography>
                </Grid>

                {/* Divider */}
                <Grid size={12}>
                  <Divider
                    sx={{
                      mt: 1,
                      mb: 1,
                      backgroundColor: "text.obs",
                      maxWidth: "100%",
                    }}
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid size={12}>
                  <div
                    style={{
                      display: "flex",
                      marginTop: "16px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Secure.GLButton
                      resource_key="codetype_8_Cancel"
                      onClick={handleClose}
                      sx={{
                        marginRight: "8px",
                        backgroundColor: "text.obs",
                        color: "primary.main",
                      }}
                      disabled={isSubmitting}
                    >
                      {t("codetype_8_Cancel") || "Cancel"}
                    </Secure.GLButton>
                    {isNew ? (
                      <Secure.GLButton
                        resource_key="codetype_8_Save"
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting}
                      >
                        {t("codetype_8_Save") || "Save"}
                      </Secure.GLButton>
                    ) : (
                      <Secure.GLButton
                        resource_key="codetype_8_SaveUpdate"
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting}
                      >
                        {t("codetype_8_SaveUpdate") || "Save Update"}
                      </Secure.GLButton>
                    )}
                  </div>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default CustomFormCodeData;