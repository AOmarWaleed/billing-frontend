import { Suspense, useContext, useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  Grid2,
  useTheme,
  Stack,
} from "@mui/material";
import { Edit, Delete, AddCircle } from "@mui/icons-material";
import { useFormik, FormikProvider, Form } from "formik";
import * as Yup from "yup";
import Style from "./resource.module.css";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
import api from "../../utils/Api";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getPagesTrans, useTransSlice } from "../../redux/slices/transSlice";
import { useLanguage } from "../../context/LanguageContext";
import GlCustomTable from "../../shared/tables/GlCustomTable";
// import {GlCustomTable} from "@common/shared-components";
import GlPanelTable from "../../shared/tables/GlPanelTable";
import { useGlBoolean } from "../../shared/hooks/useGlBoolean";
import { Field } from "../../utils/formController"; // <-- make sure these are Formik-aware fields
import { GridColDef } from "@mui/x-data-grid";
import { t } from "i18next";
import { mutate } from "swr";
import { apiUtility } from "../../utils/apiUtility";
import { useTranslation } from "react-i18next";
import Secure from "../../shared/security";
import {
  DisplayMsgDialog,
  Secure as GalaxySecure,
} from "@givc/shared-components";
import { GLGridColDef } from "../../shared/security/GLCustomTable";
import { AuthGuardContext } from "../../shared/core/AuthGuard";
import Permissions from "./Permissions";
import { publicUrl } from "../../utils/publicUrl";

type FormikValues = {
  resource_id: number | "";
  resource_type: string;
  text: string;
  facility_id: number | "";
  function_id: number | "";
  resource_key: string;
  text_custom: string;
  text_locale: string;
  text_locale_custom: string;
};
// ---------------- Component ----------------
export default function ResourceManagement() {
  const { t } = useContext(AuthGuardContext);
  // ---------------- Validation ----------------
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        resource_id: Yup.number()
          .typeError("Resource ID must be a number")
          .required("Resource ID is required"),
        resource_type: Yup.string()
          .trim()
          .required("Resource type is required"),
        text: Yup.string()
          .trim()
          .required("Default text is required")
          .test(
            "not-only-spaces",
            "Default text is required",
            (value) => typeof value === "string" && value.trim().length > 0,
          ),
        facility_id: Yup.number().required("Facility ID is required"),
        // .positive("Must be positive"),
        function_id: Yup.number()
          .required("Function ID is required")
          // .positive("Must be positive")
          .nullable(),
        resource_key: Yup.string().trim().nullable(),
        text_custom: Yup.string().trim().nullable(),
        text_locale: Yup.string().trim().nullable(),
        text_locale_custom: Yup.string().trim().nullable(),
      }),
    [t],
  );

  const dispatch = useAppDispatch();
  const [pages, setPages] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [resourceTypes, setResourceTypes] = useState<any[]>([]);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const { value: openDialog, setValue: setOpenDialog } = useGlBoolean();
  const { value: deleteConfirmOpen, setValue: setDeleteConfirmOpen } =
    useGlBoolean(false);
  const { value: editMode, setValue: setEditMode } = useGlBoolean(false);

  const { language } = useLanguage();
  const { getPageResources } = useTransSlice();
  const user = useAppSelector((state) => state.auth.user);

  const resourcesRef = useRef<() => void | null>(null);

  // ---------------- Formik ----------------
  const formik = useFormik<FormikValues>({
    initialValues: {
      resource_id: "",
      resource_type: "",
      text: "",
      facility_id: "",
      function_id: "",
      resource_key: "",
      text_custom: "",
      text_locale: "",
      text_locale_custom: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const sanitizedValues = {
          ...values,
          resource_type: values.resource_type?.trim() || "",
          text: values.text?.trim() || "",
          resource_key: values.resource_key?.trim() || "",
          text_custom: values.text_custom?.trim() || "",
          text_locale: values.text_locale?.trim() || "",
          text_locale_custom: values.text_locale_custom?.trim() || "",
        };

        if (!sanitizedValues.text.trim()) {
          throw new Error("Default text is required");
        }

        let response;
        if (editMode) {
          response = await api.put(`api/trans/resource`, sanitizedValues);
        } else {
          response = await api.post(`api/trans/resources`, sanitizedValues);
        }

        const { data } = response;

        if (data.success) {
          setSnackbar({
            open: true,
            message: `Resource ${editMode ? "updated" : "added"} successfully!`,
            severity: "success",
          });

          resetForm();
          setEditMode(false);
          setOpenDialog(false);
          mutate((e) => apiUtility(e, "trans"));
          resourcesRef?.current?.();
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: `Error: ${
            error?.response?.data?.message?.includes("resource_pkey")
              ? "Resource ID already exists"
              : error?.response?.data?.message ||
                `Failed to ${editMode ? "edit" : "add"} resource`
          }`,
          severity: "error",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { resetForm, setValues, isSubmitting } = formik;

  // ---------------- Effects ----------------

  useEffect(() => {
    getPages();
    dispatch(getPagesTrans());
  }, []);

  useEffect(() => {
    getResourcesTypes();
    getGroups();
  }, []);

  // ---------------- Handlers ----------------
  const handleEdit = (resource: any) => {
    setValues({
      resource_id: resource.resource_id,
      resource_type: resource.resource_type,
      text: resource.text || "",
      facility_id: resource.facility_id ?? resource.facilityId ?? "",
      function_id: resource.function_id ?? resource.functionId ?? "",
      resource_key: resource.resource_key,
      text_custom: resource.text_custom,
      text_locale: resource.text_locale,
      text_locale_custom: resource.text_locale_custom,
    });

    setEditMode(true);
    setOpenDialog(true);
  };

  const getResourcesTypes = async () => {
    const { data } = await api.get(`api/trans/resourceTypes`);

    setResourceTypes(
      data.data.map((item: any) => ({
        label: item.user_code,
        value: item.user_code,
      })),
    );
  };

  const handleDelete = (resourceId: string) => {
    setResourceToDelete(resourceId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) return;

    try {
      await api.delete(`api/trans/resource/${resourceToDelete}`);
      setSnackbar({
        open: true,
        message: "Resource deleted successfully!",
        severity: "success",
      });

      mutate((e) => apiUtility(e, "trans"));
      resourcesRef?.current?.();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete resource",
        severity: "error",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setResourceToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  async function getPages() {
    try {
      const { data } = await api.get(`api/trans/pages`);
      setPages(data.data);
    } catch (error) {
      console.error("error in fetching getPages resources page");
    }
  }

  async function getGroups() {
    try {
      const { data } = await api.get(`api/trans/groups`);
      setGroups(data.data);
    } catch (error) {
      console.error("error in fetching getGroups");
    }
  }

  function handleCloseDialog() {
    setEditMode(false);
    setOpenDialog(false);
    resetForm();
  }

  const theme = useTheme();

  const columns: GLGridColDef[] = [
    {
      field: "resource_id",
      headerName: "ID",
      width: 100,
      type: "number",
      align: "left",
      headerAlign: "left",
      resource_key: "resources_10_ID",
    },
    {
      field: "resource_type",
      headerName: "Type",
      flex: 1,
      resource_key: "resources_10_Type",
    },
    {
      field: "text",
      headerName: "Text",
      flex: 3,
      resource_key: "resources_10_Text",
    },
    {
      field: "function_id",
      headerName: "function ID",
      flex: 2,
      resource_key: "resources_10_FunctionID",
      headerAlign: "left",
      type: "number",
      renderCell: ({ row }) => (
        <Typography sx={{ textAlign: "start", width: "100%" }}>
          {row?.function_id} - {row?.description} 
          {/* {pages.find((page) => page.pageId == p.value)?.description} */}
        </Typography>
      ),
    },
    {
      field: "resource_key",
      headerName: "Key",
      flex: 3,
      resource_key: "resources_10_ResourceKey",
    },
    {
      field: "text_custom",
      headerName: "text custom",
      flex: 3,
      resource_key: "resources_10_TextCustom",
    },
    {
      field: "text_locale",
      headerName: "text locale",
      flex: 3,
      resource_key: "resources_10_TextLocale",
    },
    {
      field: "text_locale_custom",
      headerName: "text locale custom",
      flex: 3,
      resource_key: "resources_10_TextLocaleCustom",
    },
    {
      field: "Actions",
      type: "actions",
      headerName: "Actions",
      flex: 1,
      resource_key: "resources_10_Actions",
      renderHeader: () => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            justifyContent: "space-between",
          }}
        >
          <span>Actions</span>
          <GalaxySecure.GLIconButton2
            permission="resources_10_AddResourceButton"
            uiText="generic_0_add"
            fallBackText="Add Resource"
            onClick={() => setOpenDialog(true)}
            size="small"
          >
            <img
              src={publicUrl(`themes/${theme.palette.mode}/icons/plus.png`)}
            />
          </GalaxySecure.GLIconButton2>
        </Box>
      ),
      renderCell: (p: any) => (
        // <>
        //   <Secure.GLIconButton
        //     resource_key="patientAccount_10_editIcnBtnRes"
        //     color="inherit"
        //     onClick={() => handleEdit(p.row)}
        //   >
        //     <Edit />
        //   </Secure.GLIconButton>
        //   <Secure.GLIconButton
        //     resource_key="patientAccount_10_deletIcnBtnRes"
        //     color="inherit"
        //     onClick={() => handleDelete(p.row.resource_id)}
        //   >
        //     <Delete />
        //   </Secure.GLIconButton>
        // </>
        <Stack
          direction="row"
          justifyContent="flex-end"
          marginLeft="auto"
          alignItems="center"
          spacing={1}
          sx={{ height: "100%" }}
        >
          <GalaxySecure.GLIconButton2
            permission="resources_10_editResource"
            uiText="generic_0_edit"
            fallBackText="Edit Resource"
            onClick={() => handleEdit(p.row)}
            size="small"
          >
            <img
              src={publicUrl(`themes/${theme.palette.mode}/icons/pen.png`)}
              alt="Edit"
            />
          </GalaxySecure.GLIconButton2>

          <GalaxySecure.GLIconButton2
            permission="resources_10_deleteResource"
            uiText="generic_0_delete"
            fallBackText="Delete Resource"
            onClick={() => handleDelete(p.row.resource_id)}
            size="small"
          >
            <img
              src={publicUrl(`themes/${theme.palette.mode}/icons/delete.png`)}
              alt="Delete"
            />
          </GalaxySecure.GLIconButton2>
        </Stack>
      ),
    },
  ];

  // ---------------- Render ----------------
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Box className={`${Style.parent}`} sx={{ p: 3 }}>
        <HandleTitle titleKey="RESOURCES" />
        <Box sx={{ mb: 4 }}>
          <GlPanelTable>
            {/* <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignContent: "center",
              }}
            >
              <Secure.GLButton
                resource_key="resources_10_AddResourceButton"
                variant="contained"
                startIcon={<AddCircle />}
                onClick={() => setOpenDialog(true)}
              />
            </Box> */}
            <Secure.GlCustomTable
              resource_key="replaceme"
              url={`api/trans/resources`}
              columns={columns}
              onRowSelected={(row) => setSelectedRow(row)}
              getRowId={(row: any) => row.resource_id}
              autoSelectFirstRow
              smallSize
              refetchRef={resourcesRef}
              enableKeyboardNavigation={true}
            />
          </GlPanelTable>
        </Box>
        <Box>
          <Permissions row={selectedRow} />
        </Box>
        <GenericDialog
          open={openDialog}
          title={`${
            editMode
              ? t("resources_10_EditResource")
              : t("resources_10_addResource")
          }`}
          onClose={handleCloseDialog}
          icon={editMode ? <Edit /> : <AddCircle />}
          content={
            <Box
              sx={{
                "&  .mui-6ptt0l-MuiFormHelperText-root.Mui-error": {
                  color: "warning.light",
                },
              }}
            >
              <FormikProvider value={formik}>
                <Form>
                  <Grid2 container spacing={1} sx={{ mt: 1 }}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Secure.GLTypography resource_key="patientAccount_10_resourceIdAddResourceForm" />
                      <Secure.GLFormTextField
                        resource_key="patientAccount_10_resourceIdAddResourceForm"
                        name="resource_id"
                      />
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Secure.GLTypography resource_key="patientAccount_10_resourceTypeAddResourceForm" />
                      <Field.Select
                        options={resourceTypes}
                        name="resource_type"
                      />
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Secure.GLTypography resource_key="patientAccount_10_functionIdAddResourceForm" />
                      <Secure.GLFormSelect
                        resource_key="patientAccount_10_functionIdAddResourceForm"
                        options={pages.map((p) => ({
                          value: p.pageId,
                          label: `${p.description} ID ${p.pageId}`,
                        }))}
                        name="function_id"
                      />
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Secure.GLTypography resource_key="patientAccount_10_resourceKeyAddResourceForm" />
                      <Secure.GLFormTextField
                        resource_key="patientAccount_10_resourceKeyAddResourceForm"
                        name="resource_key"
                      />
                    </Grid2>

                    <Grid2 size={{ xs: 12 }}>
                      <Secure.GLTypography resource_key="patientAccount_10_defaultTextAddResourceForm" />
                      <Secure.GLFormTextField
                        resource_key="patientAccount_10_defaultTextAddResourceForm"
                        name="text"
                      />
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 4 }}>
                      <Secure.GLTypography resource_key="patientAccount_10_customTextAddResourceForm" />
                      <Secure.GLFormTextField
                        resource_key="patientAccount_10_customTextAddResourceForm"
                        name="text_custom"
                      />
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 4 }}>
                      <Secure.GLTypography resource_key="patientAccount_10_localeTextAddResourceForm" />
                      <Secure.GLFormTextField
                        resource_key="patientAccount_10_localeTextAddResourceForm"
                        name="text_locale"
                      />
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 4 }}>
                      <Secure.GLTypography resource_key="patientAccount_10_localeCustomTextAddResourceForm" />
                      <Secure.GLFormTextField
                        resource_key="patientAccount_10_localeCustomTextAddResourceForm"
                        name="text_locale_custom"
                      />
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <Secure.GLTypography resource_key="patientAccount_10_facilityIdAddResourceForm" />
                      <Secure.GLFormTextField
                        resource_key="patientAccount_10_facilityIdAddResourceForm"
                        name="facility_id"
                      />
                    </Grid2>
                  </Grid2>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                      mt: 2,
                    }}
                  >
                    <Secure.GLButton
                      resource_key="patientAccount_10_cancelAddResourceForm"
                      color="inherit"
                      onClick={handleCloseDialog}
                    />

                    <Secure.GLButton
                      resource_key={
                        editMode
                          ? "patientAccount_10_editResourceAddResourceForm"
                          : "patientAccount_10_addResourceAddResourceForm"
                      }
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      {editMode
                        ? t("patientAccount_10_editResourceAddResourceForm")
                        : t("patientAccount_10_addResourceAddResourceForm")}
                    </Secure.GLButton>
                  </Box>
                </Form>
              </FormikProvider>
            </Box>
          }
        />

        {/* <GenericDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title={t("patientAccount_10_deleteResourceAddResourceForm")}
          icon={<Delete />}
          content={
            <>
              <Secure.GLTypography
                resource_key="patientAccount_10_deleteMsgAddResourceForm"
                sx={{ mb: 2 }}
              />

              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Secure.GLButton
                  resource_key="patientAccount_10_cancelBtnAddResourceForm"
                  onClick={() => setDeleteConfirmOpen(false)}
                />

                <Secure.GLButton
                  resource_key="patientAccount_10_deleteBtnResourceForm"
                  variant="contained"
                  onClick={confirmDelete}
                  color="error"
                />
              </Box>
            </>
          }
        /> */}

        <DisplayMsgDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          status="DELETE"
          getResource={false}
          actionLabel="Delete"
          actionColor="error"
          description="This action will permanently remove the selected resource."
          onAction={confirmDelete}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity as any}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Suspense>
  );
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// import React, { useEffect, useLayoutEffect, useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import {
//   Box,
//   Button,
//   TextField,
//   MenuItem,
//   Typography,
//   IconButton,
//   Divider,
//   Snackbar,
//   Alert,
//   FormControl,
//   InputLabel,
//   Select,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
//   Grid,
//   Paper,
//   Autocomplete,
// } from "@mui/material";
// import {
//   Edit,
//   Delete,
//   FirstPage,
//   LastPage,
//   ArrowUpward,
//   ArrowDownward,
// } from "@mui/icons-material";
// import { AddCircle } from "@mui/icons-material";
// import {
//   DataGrid,
//   GridColDef,
//   GridPaginationModel,
//   GridSortModel,
// } from "@mui/x-data-grid";
// // import api from "api";

// import Style from "./resource.module.css";
// import CustomPagination from "../../components/CustomPagination/CustomPagination";
// import GenericDialog from "../../components/genericDialog/GenericDialog";
// import { getContentHelperFun } from "../../utils/trans";
// import { useSelector } from "react-redux";
// import { RootState } from "../../redux/store";
// import HandleTitle from "../../components/HandleTitle/HandleTitle";
// import api from "../../utils/Api";
// import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
// import {
//   getPagesTrans,
//   getResourceTypes,
//   getGroups,
//   useTransSlice,
// } from "../../redux/slices/transSlice";
// import TextExtractorTool from "../../utils/textExtractor/TextExtractorTool";
// import { useLanguage } from "../../context/LanguageContext";
// import { createResourceHelpers } from "../../utils/resourceMapping/createResourceHelpers";
// import GlCustomTable from "../../shared/tables/GlCustomTable";
// import GlPanelTable from "../../shared/tables/GlPanelTable";

// export interface FilterValues {
//   params: Record<string, any>;
// }

// interface Page {
//   pageid: number;
//   description: string;
// }

// interface Group {
//   group_id: number;
//   group_name: string;
// }

// interface GroupPermission {
//   group_id: string;
//   hidden: string;
//   disabled: string;
// }

// const validationSchema = Yup.object().shape({
//   resource_id: Yup.number(),
//   resource_type: Yup.string().required("Resource type is required"),
//   text: Yup.string().required("Default text is required"),
//   facility_id: Yup.number()
//     .required("Facility ID is required")
//     .positive("Must be positive"),
//   function_id: Yup.number()
//     .required("Function ID is required")
//     .positive("Must be positive")
//     .nullable(),
//   resource_key: Yup.string().nullable(),
//   text_custom: Yup.string().nullable(),
//   text_locale: Yup.string().nullable(),
//   text_locale_custom: Yup.string().nullable(),
//   groupPermissions: Yup.array().of(
//     Yup.object().shape({
//       group_id: Yup.number().required("Group is required"),
//       hidden: Yup.string()
//         .oneOf(["Y", "N"])
//         .required("Hidden status is required"),
//       disabled: Yup.string()
//         .oneOf(["Y", "N"])
//         .required("Disabled status is required"),
//     })
//   ),
// });

// const CustomSortIcon = ({ direction }: { direction: any }) => {
//   if (!direction)
//     return (
//       <ArrowUpward fontSize="small" sx={{ color: "gray", rotate: "90deg" }} />
//     );
//   return direction === "asc" ? (
//     <ArrowUpward fontSize="small" sx={{ color: "yellow" }} />
//   ) : (
//     <ArrowDownward fontSize="small" sx={{ color: "yellow" }} />
//   );
// };

// export default function ResourceManagement() {
//   const dispatch = useAppDispatch();
//   const [resources, setResources] = useState<any[]>([]);
//   const [pages, setPages] = useState<Page[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     pageSize: 20,
//     totalCount: 0,
//   });
//   const [openDialog, setOpenDialog] = useState(false);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });
//   //==================  * Resources * ===================
//   const [inputColumns, setInputColumns] = useState([]);
//   const { resource } = useAppSelector((state) => state.trans);
//   const { language } = useLanguage();
//   const { getPageResources } = useTransSlice();
//   const user = useAppSelector((state) => state.auth.user);
//   const { t, getDisable } = createResourceHelpers(resource.resources);

//   useEffect(() => {
//     if (resource.resources.length === 0) return;
//     const Columns = [];
//     setInputColumns(Columns);
//   }, [resource.resources]);
//   //==================  * Resources * ===================

//   const [editMode, setEditMode] = useState(false);
//   const [resourceToEdit, setResourceToEdit] = useState<any>(null);
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [applyFilter, setApplyFilter] = useState(false);
//   const [params, setParams] = useState<Record<string, any>>({});
//   const [resourceTypes, setResourceTypes] = useState<any[]>([]);
//   const [sortModel, setSortModel] = useState<GridSortModel>([
//     { field: "resource_id", sort: "asc" },
//   ]);

//   const formik = useFormik({
//     initialValues: {
//       resource_id: "",
//       resource_type: "",
//       text: "",
//       facility_id: "",
//       function_id: "",
//       resource_key: "",
//       text_custom: "",
//       text_locale: "",
//       text_locale_custom: "",
//       groupPermissions: [] as GroupPermission[],
//     },
//     validationSchema,
//     onSubmit: async (values) => {
//       try {
//         let response;
//         if (editMode) {
//           response = await api.put(
//             `api/trans/resource`,
//             values
//           );
//         } else {
//           response = await api.post(
//             `api/trans/resources`,
//             values
//           );
//         }

//         const { data } = response;

//         if (data.success) {
//           setSnackbar({
//             open: true,
//             message: `Resource ${editMode ? "updated" : "added"} successfully!`,
//             severity: "success",
//           });

//           formik.resetForm();
//           setEditMode(false);
//           setOpenDialog(false);
//           getResources();
//         } else {
//           throw new Error(data.message);
//         }
//       } catch (error: any) {
//         console.error("Error adding resource:", error);
//         setSnackbar({
//           open: true,
//           message: `Error: ${
//             error?.response?.data?.message?.includes("resource_pkey")
//               ? "Resource ID already exists"
//               : error?.response?.data?.message ||
//                 `Failed to ${editMode ? "edit" : "add"} resource`
//           }`,
//           severity: "error",
//         });
//       }
//     },
//   });

//   const fetchResourcePermissions = async (resourceId: string) => {
//     try {
//       const response = await api.get(
//         `${
//           import.meta.env.
//         }api/trans/authPermissions/${resourceId}`
//       );
//       return response.data.data || [];
//     } catch (error) {
//       console.error("Error fetching permissions:", error);
//       return [];
//     }
//   };

//   const handleEdit = async (resource: any) => {
//     setResourceToEdit(resource);
//     const permissions = await fetchResourcePermissions(resource.resource_id);
//     console.log(permissions, "permissions");

//     formik.setValues({
//       resource_id: resource.resource_id,
//       resource_type: resource.resource_type,
//       text: resource.text || "",
//       facility_id: resource.facility_id || "",
//       function_id: resource.function_id || "",
//       resource_key: resource.resource_key,
//       text_custom: resource.text_custom,
//       text_locale: resource.text_locale,
//       text_locale_custom: resource.text_locale_custom,
//       groupPermissions:
//         permissions.length > 0
//           ? permissions.map((perm: any) => ({
//               group_id: perm.group_id.toString(),
//               hidden: perm.hidden || "N",
//               disabled: perm.disabled || "N",
//             }))
//           : [],
//     });
//     setEditMode(true);
//     setOpenDialog(true);
//   };

//   const getResourcesTypes = async () => {
//     const { data } = await api.get(
//       `api/trans/resourceTypes`
//     );

//     setResourceTypes(() => {
//       return data.data.map((item: any) => {
//         return {
//           label: item.user_code,
//           value: item.user_code,
//         };
//       });
//     });
//   };

//   const handleDelete = (resourceId: string) => {
//     setResourceToDelete(resourceId);
//     setDeleteConfirmOpen(true);
//   };

//   const confirmDelete = async () => {
//     if (!resourceToDelete) return;

//     try {
//       await api.delete(
//         `${
//           import.meta.env.
//         }api/trans/c${resourceToDelete}`
//       );
//       setSnackbar({
//         open: true,
//         message: "Resource deleted successfully!",
//         severity: "success",
//       });
//       getResources();
//     } catch (error) {
//       console.error("Error deleting resource:", error);
//       setSnackbar({
//         open: true,
//         message: "Failed to delete resource",
//         severity: "error",
//       });
//     } finally {
//       setDeleteConfirmOpen(false);
//       setResourceToDelete(null);
//     }
//   };

//   const handleAddPermission = () => {
//     const currentPermissions = formik.values.groupPermissions;
//     const usedGroupIds = currentPermissions
//       .map((p) => p.group_id)
//       .filter((id) => id !== "");

//     if (usedGroupIds.length === groups.length) {
//       setSnackbar({
//         open: true,
//         message: "All available groups have been assigned",
//         severity: "warning",
//       });
//       return;
//     }

//     formik.setFieldValue("groupPermissions", [
//       ...currentPermissions,
//       { group_id: "", hidden: "N", disabled: "N" },
//     ]);
//   };

//   const handleRemovePermission = (index: number) => {
//     const newPermissions = [...formik.values.groupPermissions];
//     newPermissions.splice(index, 1);
//     formik.setFieldValue("groupPermissions", newPermissions);
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   async function getPages() {
//     try {
//       const { data } = await api.get(
//         `api/trans/pages`
//       );
//       setPages(data.data);
//     } catch (error) {
//       console.error("error in fetching getPages resources page");
//     }
//   }

//   async function getGroups() {
//     try {
//       const { data } = await api.get(
//         `api/trans/groups`
//       );
//       setGroups(data.data);
//     } catch (error) {
//       console.error("error in fetching getGroups");
//     }
//   }

//   function handleCloseDialog() {
//     setEditMode(false);
//     setOpenDialog(false);
//     formik.resetForm();
//   }

//   const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

//   const handleSortModelChange = (newSortModel: GridSortModel) => {
//     setSortModel(newSortModel);
//     if (newSortModel.length > 0) {
//       const { field, sort } = newSortModel[0];
//       getResources(field, sort as any);
//     } else {
//       getResources("resource_id", "asc");
//     }
//   };

//   async function getResources(sortBy = "resource_id", sortOrder = "asc") {
//     try {
//       setLoading(true);
//       const { data } = await api.get(
//         `api/trans/resources`,
//         {
//           params: {
//             page: pagination.page,
//             pageSize: pagination.pageSize,
//             sortBy,
//             sortOrder,
//             ...(params || {}),
//           },
//         }
//       );

//       setResources(data.data);
//       setPagination((prev) => ({
//         ...prev,
//         totalCount: data.pagination?.totalCount || 0,
//       }));
//     } catch (error) {
//       console.error("error in fetching getResources resources page");
//       setSnackbar({
//         open: true,
//         message: "Failed to load resources",
//         severity: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   }

//   const handlePageChange = (newPage: number, newPageSize?: number) => {
//     setPagination((prev) => ({
//       page: newPage,
//       pageSize: newPageSize || prev.pageSize,
//       totalCount: prev.totalCount,
//     }));
//   };

//   const handlePageSizeChange = (newPageSize: number) => {
//     setPagination((prev) => ({
//       page: 1,
//       pageSize: newPageSize,
//       totalCount: prev.totalCount,
//     }));
//   };

//   const handleFilterChange = (field: keyof FilterValues, value: string) => {
//     setPagination((prev) => ({
//       ...prev,
//       page: 1,
//     }));
//     setParams((prevParams: any) => ({
//       ...(prevParams || {}),
//       [field]: value,
//     }));
//   };

//   const { content } = useSelector((store: RootState) => store.trans);

//   useEffect(() => {
//     getPages();
//     getResources();
//     dispatch(getPagesTrans());
//   }, [pagination.page, pagination.pageSize, params]);

//   useEffect(() => {
//     applyFilter ? null : setParams(null);
//   }, [applyFilter]);

//   useEffect(() => {
//     getResourcesTypes();
//     getGroups();
//   }, []);

//   const columns: GridColDef[] = [
//     {
//       field: "resource_id",
//       headerName: t("493") || "ID",
//       width: 100,
//       type: "number",
//       // sortable: !applyFilter,
//       renderCell: (p) => (
//         <Typography sx={{ textAlign: "end", width: "100%" }}>
//           {p.value}
//         </Typography>
//       ),
//       // renderHeader: (params: any) => {
//       //   console.log("render header", params.applyFilter);

//       //   const sortDirection = sortModel.find(
//       //     (m) => m.field === params.field
//       //   )?.sort;
//       //   return (
//       //     <>
//       //       {params.applyFilter ? (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             flexDirection: "column",
//       //             gap: 1,
//       //             width: "100%",
//       //           }}
//       //         >
//       //           <TextField
//       //             size="small"
//       //             placeholder={t("493") || `resource id`}
//       //             value={params?.resource_id}
//       //             onChange={(e) =>
//       //               handleFilterChange("resource_id", e.target.value)
//       //             }
//       //             fullWidth
//       //             variant="outlined"
//       //             sx={{
//       //               mr: "10px",
//       //               backgroundColor: "white",
//       //               borderRadius: 2,
//       //               alignSelf: "center",
//       //               "& input": { padding: "7px 10px !important" },
//       //               "& .MuiOutlinedInput-notchedOutline": {
//       //                 border: "1px solid white !important",
//       //               },
//       //             }}
//       //           />
//       //         </Box>
//       //       ) : (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             alignItems: "center",
//       //             justifyContent: "space-between",
//       //           }}
//       //         >
//       //           <span>{t("493") || "ID"}</span>
//       //           <CustomSortIcon direction={sortDirection} />
//       //         </Box>
//       //       )}
//       //     </>
//       //   );
//       // },
//     },
//     {
//       field: "resource_type",
//       headerName: t("494") || "Type",
//       flex: 1,
//     },
//     {
//       field: "text",
//       headerName: t("495") || "Text",
//       flex: 3,
//       // sortable: !applyFilter,
//       // renderHeader: (params: any) => {
//       //   const sortDirection = sortModel.find(
//       //     (m) => m.field === params.field
//       //   )?.sort;
//       //   return (
//       //     <>
//       //       {params.applyFilter ? (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             flexDirection: "column",
//       //             gap: 1,
//       //             width: "100%",
//       //           }}
//       //         >
//       //           <TextField
//       //             size="small"
//       //             placeholder={t("495") || "text"}
//       //             value={params?.text}
//       //             onChange={(e) => handleFilterChange("text", e.target.value)}
//       //             fullWidth
//       //             variant="outlined"
//       //             sx={{
//       //               mr: "10px",
//       //               backgroundColor: "white",
//       //               borderRadius: 2,
//       //               alignSelf: "center",
//       //               "& input": { padding: "7px 10px !important" },
//       //               "& .MuiOutlinedInput-notchedOutline": {
//       //                 border: "1px solid white !important",
//       //               },
//       //             }}
//       //           />
//       //         </Box>
//       //       ) : (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             alignItems: "center",
//       //             justifyContent: "space-between",
//       //           }}
//       //         >
//       //           <span>{t("495") || "Text"}</span>
//       //           <CustomSortIcon direction={sortDirection} />
//       //         </Box>
//       //       )}
//       //     </>
//       //   );
//       // },
//     },
//     {
//       field: "function_id",
//       headerName: t("496") || "function ID",
//       flex: 1,
//       // sortable: !applyFilter,
//       renderCell: (p) => (
//         <Typography sx={{ textAlign: "start", width: "100%" }}>
//           {p.value} -{" "}
//           {pages.find((page) => page.pageid == p.value)?.description}
//         </Typography>
//       ),
//       // renderHeader: (params: any) => {
//       //   const sortDirection = sortModel.find(
//       //     (m) => m.field === params.field
//       //   )?.sort;
//       //   return (
//       //     <>
//       //       {params.applyFilter ? (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             flexDirection: "column",
//       //             gap: 1,
//       //             width: "100%",
//       //           }}
//       //         >
//       //           <Autocomplete
//       //             size="small"
//       //             options={pages}
//       //             getOptionLabel={(option) => option.description}
//       //             value={
//       //               pages.find(
//       //                 (option) => option.pageid === params?.function_id
//       //               ) || null
//       //             }
//       //             onInputChange={(event, newInputValue, reason) => {
//       //               console.log("Input change:", reason, newInputValue);
//       //               if (newInputValue === "") {
//       //                 handleFilterChange("function_id", "");
//       //               }
//       //             }}
//       //             onChange={(event, newValue) =>
//       //               handleFilterChange(
//       //                 "function_id",
//       //                 newValue?.pageid.toString() || ""
//       //               )
//       //             }
//       //             renderInput={(params) => (
//       //               <TextField
//       //                 {...params}
//       //                 placeholder={t("496") || "page"}
//       //                 variant="outlined"
//       //                 sx={{
//       //                   mr: "10px",
//       //                   backgroundColor: "white",
//       //                   borderRadius: 2,
//       //                   alignSelf: "center",
//       //                   "& input": { padding: "7px 10px !important" },
//       //                   "& .MuiOutlinedInput-notchedOutline": {
//       //                     border: "1px solid white !important",
//       //                   },
//       //                 }}
//       //               />
//       //             )}
//       //             renderOption={(props, option) => (
//       //               <li {...props} key={option.pageid}>
//       //                 {option.description}
//       //               </li>
//       //             )}
//       //             isOptionEqualToValue={(option, value) =>
//       //               option.pageid === value?.pageid
//       //             }
//       //             fullWidth
//       //             clearOnBlur={false}
//       //             includeInputInList
//       //           />
//       //         </Box>
//       //       ) : (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             alignItems: "center",
//       //             justifyContent: "space-between",
//       //           }}
//       //         >
//       //           <span>{t("496") || "page"}</span>
//       //           <CustomSortIcon direction={sortDirection} />
//       //         </Box>
//       //       )}
//       //     </>
//       //   );
//       // },
//     },
//     {
//       field: "resource_key",
//       headerName: t("497") || "Key",
//       flex: 3,
//       // sortable: !applyFilter,
//       // renderHeader: (params: any) => {
//       //   const sortDirection = sortModel.find(
//       //     (m) => m.field === params.field
//       //   )?.sort;
//       //   return (
//       //     <>
//       //       {params.applyFilter ? (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             flexDirection: "column",
//       //             gap: 1,
//       //             width: "100%",
//       //           }}
//       //         >
//       //           <TextField
//       //             size="small"
//       //             placeholder={t("497") || "key"}
//       //             value={params?.resource_key}
//       //             onChange={(e) =>
//       //               handleFilterChange("resource_key", e.target.value)
//       //             }
//       //             fullWidth
//       //             variant="outlined"
//       //             sx={{
//       //               mr: "10px",
//       //               backgroundColor: "white",
//       //               borderRadius: 2,
//       //               alignSelf: "center",
//       //               "& input": { padding: "7px 10px !important" },
//       //               "& .MuiOutlinedInput-notchedOutline": {
//       //                 border: "1px solid white !important",
//       //               },
//       //             }}
//       //           />
//       //         </Box>
//       //       ) : (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             alignItems: "center",
//       //             justifyContent: "space-between",
//       //           }}
//       //         >
//       //           <span>{t("497") || "Key"}</span>
//       //           <CustomSortIcon direction={sortDirection} />
//       //         </Box>
//       //       )}
//       //     </>
//       //   );
//       // },
//     },
//     {
//       field: "text_custom",
//       headerName: "text custom",
//       flex: 3,
//       // sortable: !applyFilter,
//       // renderHeader: (params: any) => {
//       //   const sortDirection = sortModel.find(
//       //     (m) => m.field === params.field
//       //   )?.sort;
//       //   return (
//       //     <>
//       //       {params.applyFilter ? (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             flexDirection: "column",
//       //             gap: 1,
//       //             width: "100%",
//       //           }}
//       //         >
//       //           <TextField
//       //             size="small"
//       //             placeholder={t("498") || "text custom"}
//       //             value={params?.text_custom}
//       //             onChange={(e) =>
//       //               handleFilterChange("text_custom", e.target.value)
//       //             }
//       //             fullWidth
//       //             variant="outlined"
//       //             sx={{
//       //               mr: "10px",
//       //               backgroundColor: "white",
//       //               borderRadius: 2,
//       //               alignSelf: "center",
//       //               "& input": { padding: "7px 10px !important" },
//       //               "& .MuiOutlinedInput-notchedOutline": {
//       //                 border: "1px solid white !important",
//       //               },
//       //             }}
//       //           />
//       //         </Box>
//       //       ) : (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             alignItems: "center",
//       //             justifyContent: "space-between",
//       //           }}
//       //         >
//       //           <span>{t("498") || "text custom"}</span>
//       //           <CustomSortIcon direction={sortDirection} />
//       //         </Box>
//       //       )}
//       //     </>
//       //   );
//       // },
//     },
//     {
//       field: "text_locale",
//       headerName: "text locale",
//       flex: 3,
//       // sortable: !applyFilter,
//       renderCell: (p) => (
//         <Typography sx={{ textAlign: "end", width: "100%" }}>
//           {p.value}
//         </Typography>
//       ),
//       // renderHeader: (params: any) => {
//       //   const sortDirection = sortModel.find(
//       //     (m) => m.field === params.field
//       //   )?.sort;
//       //   return (
//       //     <>
//       //       {params.applyFilter ? (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             flexDirection: "column",
//       //             gap: 1,
//       //             width: "100%",
//       //           }}
//       //         >
//       //           <TextField
//       //             size="small"
//       //             placeholder={t("499") || "text local"}
//       //             value={params?.text_locale}
//       //             onChange={(e) =>
//       //               handleFilterChange("text_locale", e.target.value)
//       //             }
//       //             fullWidth
//       //             variant="outlined"
//       //             sx={{
//       //               mr: "10px",
//       //               backgroundColor: "white",
//       //               borderRadius: 2,
//       //               alignSelf: "center",
//       //               "& input": { padding: "7px 10px !important" },
//       //               "& .MuiOutlinedInput-notchedOutline": {
//       //                 border: "1px solid white !important",
//       //               },
//       //             }}
//       //           />
//       //         </Box>
//       //       ) : (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             alignItems: "center",
//       //             justifyContent: "space-between",
//       //           }}
//       //         >
//       //           <span>{t("499") || "text locale"}</span>
//       //           <CustomSortIcon direction={sortDirection} />
//       //         </Box>
//       //       )}
//       //     </>
//       //   );
//       // },
//     },
//     {
//       field: "text_locale_custom",
//       headerName: "text locale custom",
//       flex: 3,
//       // sortable: !applyFilter,
//       renderCell: (p) => (
//         <Typography sx={{ textAlign: "end", width: "100%" }}>
//           {p.value}
//         </Typography>
//       ),
//       // renderHeader: (params: any) => {
//       //   const sortDirection = sortModel.find(
//       //     (m) => m.field === params.field
//       //   )?.sort;
//       //   return (
//       //     <>
//       //       {params.applyFilter ? (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             flexDirection: "column",
//       //             gap: 1,
//       //             width: "100%",
//       //           }}
//       //         >
//       //           <TextField
//       //             size="small"
//       //             placeholder={t("500") || "text locale custom"}
//       //             value={params?.text_locale_custom}
//       //             onChange={(e) =>
//       //               handleFilterChange("text_locale_custom", e.target.value)
//       //             }
//       //             fullWidth
//       //             variant="outlined"
//       //             sx={{
//       //               mr: "10px",
//       //               backgroundColor: "white",
//       //               borderRadius: 2,
//       //               alignSelf: "center",
//       //               "& input": { padding: "7px 10px !important" },
//       //               "& .MuiOutlinedInput-notchedOutline": {
//       //                 border: "1px solid white !important",
//       //               },
//       //             }}
//       //           />
//       //         </Box>
//       //       ) : (
//       //         <Box
//       //           sx={{
//       //             display: "flex",
//       //             alignItems: "center",
//       //             justifyContent: "space-between",
//       //           }}
//       //         >
//       //           <span>{t("500") || "text locale custom"}</span>
//       //           <CustomSortIcon direction={sortDirection} />
//       //         </Box>
//       //       )}
//       //     </>
//       //   );
//       // },
//     },

//     {
//       field: "creation_date",
//       headerName: "Created Date",
//       flex: 3,
//       type: "dateTime",

//       valueGetter: (value, row, column, apiRef) => (value ? new Date(value) : null),
//       valueFormatter: (value, row, column, apiRef) =>
//         row?.creation_date || "",
//     },

//     {
//       field: "Actions",
//       type: "actions",
//       headerName: t("501") || "Actions",
//       flex: 1,
//       renderCell: (p) => (
//         <>
//           <IconButton onClick={() => handleEdit(p.row)}>
//             <Edit />
//           </IconButton>
//           <IconButton onClick={() => handleDelete(p.row.resource_id)}>
//             <Delete />
//           </IconButton>
//         </>
//       ),
//     },
//   ];

//   const getAvailableGroupsForIndex = (index: number) => {
//     if (!groups) return [];

//     const currentPermissions = formik.values.groupPermissions;
//     const currentGroupId = currentPermissions[index]?.group_id;

//     return groups.filter((group) => {
//       if (group.group_id.toString() === currentGroupId) return true;
//       return !currentPermissions.some(
//         (perm, i) => i !== index && perm.group_id === group.group_id.toString()
//       );
//     });
//   };

//   return (
//     <Box className={`${Style.parent}`} sx={{ p: 3 }}>
//       <HandleTitle titleKey="RESOURCES" />
//       {/* <TextExtractorTool function_id={10} />  */}

//       {/* <GlPanelTable filterSection={
//         <>
//          <Button
//           variant="contained"
//           startIcon={<AddCircle />}
//           onClick={() => setOpenDialog(true)}
//         >
//           {t("504") || "Add Resource"}
//         </Button>
//         </>
//       } >
//         <GlCustomTable
//           url={`api/trans/resources`}
//           params={params}
//           columns={columns}
//         />
//       </GlPanelTable> */}
//       <GlCustomTable
//         url={`api/trans/resources`}
//         params={params}

//         columns={columns}
//         getRowId={(row) => row.resource_id}
//       />

//       <Box sx={{ width: "100%" }}>
//         {/* <DataGrid
//         onRowDoubleClick={(params) => handleEdit(params.row)}
//           sx={{
//             "& .MuiDataGrid-columnHeaderTitleContainerContent": {
//               width: "100%",
//             },
//             // "& .MuiDataGrid-columnHeaders": {
//             //   backgroundColor: "#2764AF !important",
//             //   height: applyFilter ? "100px" : "40px",
//             // },
//             "& .MuiDataGrid-iconButtonContainer": {
//               visibility: "visible",
//               display: "none",
//             },
//             "& .MuiDataGrid-sortIcon": {
//               opacity: 1,
//               color: "white",
//             },
//             "& .MuiDataGrid-menuIcon": {
//               visibility: "hidden",
//             },
//           }}
//           disableColumnMenu
//           disableColumnFilter
//           // disableColumnSorting
//           rows={resources}
//           columns={columns}
//           loading={loading}
//           hideFooterPagination={true}
//           hideFooterSelectedRowCount={true}
//           hideFooter={true}
//           getRowId={(row) => row.resource_id}
//           // columnHeaderHeight={params.applyFilter ? 100 : 40}
//           sortingMode="server"
//           onSortModelChange={handleSortModelChange}
//           sortModel={sortModel}
//         /> */}
//       </Box>
//       {/* </Paper> */}

//       {/* Custom Pagination */}

//       {/* Add Resource Dialog */}
//       {/* <Dialog
//         open={openDialog}
//         onClose={() => setOpenDialog(false)}
//         maxWidth="md"
//         fullWidth
//       >
//         <DialogTitle>Add New Resource</DialogTitle>
//         <DialogContent>

//         </DialogContent>
//         <DialogActions>

//         </DialogActions>
//       </Dialog> */}
//       <GenericDialog
//         open={openDialog}
//         title={`${
//           editMode
//             ? t("529") || "Edit resource"
//             : t("502") || "Add resource"
//         }`}
//         onClose={() => handleCloseDialog()}
//         icon={editMode ? <Edit /> : <AddCircle />}
//         content={
//           <Box
//             sx={{
//               "&  .mui-6ptt0l-MuiFormHelperText-root.Mui-error": {
//                 color: "warning.light",
//               },
//             }}
//           >
//             <form onSubmit={formik.handleSubmit}>
//               <Grid container spacing={3} sx={{ mt: 1 }}>
//                 {/* Basic Information */}
//                 <Grid sx={{ display: "none" }} item xs={12} md={6}>
//                   <Typography >
//                     {t("523") || "Resource ID"}
//                   </Typography>
//                   <TextField
//                     disabled={editMode}
//                     variant="standard"
//                     color="whiteField"
//                     fullWidth
//                     id="resource_id"
//                     name="resource_id"
//                     type="number"
//                     value={formik.values.resource_id}
//                     onChange={formik.handleChange}
//                     error={
//                       formik.touched.resource_id &&
//                       Boolean(formik.errors.resource_id)
//                     }
//                     helperText={
//                       formik.touched.resource_id && formik.errors.resource_id
//                     }
//                   />
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <Typography >
//                     {t("522") || "Resource Type"}
//                   </Typography>
//                   <TextField
//                     variant="standard"
//                     color="whiteField"
//                     fullWidth
//                     id="resource_type"
//                     name="resource_type"
//                     select
//                     value={formik.values.resource_type}
//                     onChange={formik.handleChange}
//                     error={
//                       formik.touched.resource_type &&
//                       Boolean(formik.errors.resource_type)
//                     }
//                     helperText={
//                       formik.touched.resource_type &&
//                       formik.errors.resource_type
//                     }
//                   >
//                     {resourceTypes.map((option) => (
//                       <MenuItem key={option.value} value={option.value}>
//                         {option.label}
//                       </MenuItem>
//                     ))}
//                   </TextField>
//                 </Grid>
//                 <Grid item xs={12} md={6}>
//                   <Typography >
//                     {t("521") || "Function ID"}
//                   </Typography>
//                   <FormControl fullWidth variant="standard">
//                     <TextField
//                       select
//                       variant="standard"
//                       color="whiteField"
//                       id="function_id"
//                       name="function_id"
//                       value={formik.values.function_id}
//                       onChange={formik.handleChange}
//                       error={
//                         formik.touched.function_id &&
//                         Boolean(formik.errors.function_id)
//                       }
//                       helperText={
//                         formik.touched.function_id && formik.errors.function_id
//                       }
//                     >
//                       {pages.map((page) => (
//                         <MenuItem key={page.pageid} value={page.pageid}>
//                           {page.description} (ID: {page.pageid})
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </FormControl>
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Typography >
//                     {t("520") || "Resource Key"}
//                   </Typography>
//                   <TextField
//                     variant="standard"
//                     color="whiteField"
//                     fullWidth
//                     id="resource_key"
//                     name="resource_key"
//                     value={formik.values.resource_key}
//                     onChange={formik.handleChange}
//                     error={
//                       formik.touched.resource_key &&
//                       Boolean(formik.errors.resource_key)
//                     }
//                     helperText={
//                       formik.touched.resource_key && formik.errors.resource_key
//                     }
//                   />
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Typography >
//                     {t("519") || "Default Text"}
//                   </Typography>
//                   <TextField
//                     variant="standard"
//                     color="whiteField"
//                     fullWidth
//                     id="text"
//                     name="text"
//                     value={formik.values.text}
//                     onChange={formik.handleChange}
//                     error={formik.touched.text && Boolean(formik.errors.text)}
//                     helperText={formik.touched.text && formik.errors.text}
//                     rows={2}
//                   />
//                 </Grid>

//                 <Grid item xs={12} md={4}>
//                   <Typography >
//                     {t("518") || "Custom Text"}
//                   </Typography>
//                   <TextField
//                     variant="standard"
//                     color="whiteField"
//                     fullWidth
//                     id="text_custom"
//                     name="text_custom"
//                     value={formik.values.text_custom}
//                     onChange={formik.handleChange}
//                     error={
//                       formik.touched.text_custom &&
//                       Boolean(formik.errors.text_custom)
//                     }
//                     helperText={
//                       formik.touched.text_custom && formik.errors.text_custom
//                     }
//                   />
//                 </Grid>

//                 <Grid item xs={12} md={4}>
//                   <Typography >
//                     {t("517") || "Locale Text"}
//                   </Typography>
//                   <TextField
//                     variant="standard"
//                     color="whiteField"
//                     fullWidth
//                     id="text_locale"
//                     name="text_locale"
//                     value={formik.values.text_locale}
//                     onChange={formik.handleChange}
//                     error={
//                       formik.touched.text_locale &&
//                       Boolean(formik.errors.text_locale)
//                     }
//                     helperText={
//                       formik.touched.text_locale && formik.errors.text_locale
//                     }
//                   />
//                 </Grid>

//                 <Grid item xs={12} md={4}>
//                   <Typography >
//                     {t("516") || "Locale Custom Text"}
//                   </Typography>
//                   <TextField
//                     variant="standard"
//                     color="whiteField"
//                     fullWidth
//                     id="text_locale_custom"
//                     name="text_locale_custom"
//                     value={formik.values.text_locale_custom}
//                     onChange={formik.handleChange}
//                     error={
//                       formik.touched.text_locale_custom &&
//                       Boolean(formik.errors.text_locale_custom)
//                     }
//                     helperText={
//                       formik.touched.text_locale_custom &&
//                       formik.errors.text_locale_custom
//                     }
//                   />
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <Typography >
//                     {t("515") || "Facility ID"}
//                   </Typography>
//                   <TextField
//                     variant="standard"
//                     color="whiteField"
//                     fullWidth
//                     id="facility_id"
//                     name="facility_id"
//                     type="number"
//                     value={formik.values.facility_id}
//                     onChange={formik.handleChange}
//                     error={
//                       formik.touched.facility_id &&
//                       Boolean(formik.errors.facility_id)
//                     }
//                     helperText={
//                       formik.touched.facility_id && formik.errors.facility_id
//                     }
//                   />
//                 </Grid>

//                 {/* Permissions Section */}
//                 <Grid item xs={12} sx={{}}>
//                   <Divider sx={{ my: 2 }}>
//                     <Typography >
//                       {t("514") || "Group Permissions"}
//                     </Typography>
//                   </Divider>

//                   {formik.values.groupPermissions.map((permission, index) => (
//                     <Box key={index} sx={{ mb: 3 }}>
//                       <Grid container spacing={2} alignItems="center">
//                         <Grid item xs={4}>
//                           <Typography >
//                             {t("513") || "Group"}
//                           </Typography>
//                           <FormControl
//                             variant="standard"
//                             sx={{ backgroundColor: "" }}
//                             fullWidth
//                           >
//                             <TextField
//                               select
//                               color="whiteField"
//                               variant="standard"
//                               name={`groupPermissions[${index}].group_id`}
//                               value={permission.group_id}
//                               onChange={formik.handleChange}
//                               error={
//                                 formik.touched.groupPermissions?.[index]
//                                   ?.group_id &&
//                                 Boolean(
//                                   (
//                                     formik.errors.groupPermissions?.[
//                                       index
//                                     ] as any
//                                   )?.group_id
//                                 )
//                               }
//                               helperText={
//                                 formik.touched.groupPermissions?.[index]
//                                   ?.group_id &&
//                                 (formik.errors.groupPermissions?.[index] as any)
//                                   ?.group_id
//                               }
//                             >
//                               {getAvailableGroupsForIndex(index).map(
//                                 (group) => (
//                                   <MenuItem
//                                     key={group.group_id}
//                                     value={group.group_id.toString()}
//                                   >
//                                     {group.group_name}
//                                   </MenuItem>
//                                 )
//                               )}
//                             </TextField>
//                           </FormControl>
//                         </Grid>

//                         <Grid item xs={3}>
//                           <Typography >
//                             {t("512") || "Hidden"}
//                           </Typography>
//                           <FormControl
//                             variant="standard"
//                             sx={{ backgroundColor: "" }}
//                             fullWidth
//                           >
//                             <Select
//                               name={`groupPermissions[${index}].hidden`}
//                               value={permission.hidden}
//                               onChange={formik.handleChange}
//                             >
//                               <MenuItem value="N">
//                                 {t("510") || "No"}
//                               </MenuItem>
//                               <MenuItem value="Y">
//                                 {t("511") || "Yes"}
//                               </MenuItem>
//                             </Select>
//                           </FormControl>
//                         </Grid>

//                         <Grid item xs={3}>
//                           <Typography >
//                             {t("509") || "Disabled"}
//                           </Typography>
//                           <FormControl
//                             variant="standard"
//                             sx={{ backgroundColor: "" }}
//                             fullWidth
//                           >
//                             <Select
//                               name={`groupPermissions[${index}].disabled`}
//                               value={permission.disabled}
//                               onChange={formik.handleChange}
//                             >
//                               <MenuItem value="N">
//                                 {t("510") || "No"}
//                               </MenuItem>
//                               <MenuItem value="Y">
//                                 {t("511") || "Yes"}
//                               </MenuItem>
//                             </Select>
//                           </FormControl>
//                         </Grid>

//                         <Grid item xs={2}>
//                           {index > 0 && (
//                             <IconButton
//                               onClick={() => handleRemovePermission(index)}
//                             >
//                               <Delete color="error" />
//                             </IconButton>
//                           )}
//                         </Grid>
//                       </Grid>
//                     </Box>
//                   ))}

//                   <Button
//                     variant="contained"
//                     onClick={handleAddPermission}
//                     disabled={
//                       formik.values.groupPermissions.length === groups?.length
//                     }
//                   >
//                     {t("508") || "Add Permissions"}
//                   </Button>
//                 </Grid>
//               </Grid>
//             </form>
//             <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
//               <Button
//                 sx={{ backgroundColor: "" }}
//                 onClick={() => {
//                   handleCloseDialog();
//                 }}
//               >
//                 {t("506") || "Cancel"}
//               </Button>
//               <Button
//                 onClick={() => formik.handleSubmit()}
//                 variant="contained"
//                 disabled={formik.isSubmitting}
//               >
//                 {formik.isSubmitting ? (
//                   <CircularProgress size={24} />
//                 ) : (
//                   `${
//                     editMode
//                       ? t("529") || "Edit Resource"
//                       : t("504") || "Add Resource"
//                   } `
//                 )}
//               </Button>
//             </Box>
//           </Box>
//         }
//       />

//       <GenericDialog
//         open={deleteConfirmOpen}
//         onClose={() => setDeleteConfirmOpen(false)}
//         title={t("503") || "Delete Resource"}
//         icon={<Delete />}
//         content={
//           <>
//             <Typography color="" sx={{ mb: 2 }}>
//               {t("507") ||
//                 "Are you sure you want to delete this resource?"}
//             </Typography>
//             <Divider sx={{ backgroundColor: "" }} />
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "flex-end",
//                 gap: 2,
//                 mt: 2,
//               }}
//             >
//               <Button
//                 sx={{ backgroundColor: "" }}
//                 onClick={() => setDeleteConfirmOpen(false)}
//               >
//                 {t("506") || "Cancel"}
//               </Button>
//               <Button variant="contained" onClick={confirmDelete} color="error">
//                 {t("505") || "Delete"}
//               </Button>
//             </Box>
//           </>
//         }
//       />

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//       >
//         <Alert
//           onClose={handleCloseSnackbar}
//           severity={snackbar.severity as any}
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }
