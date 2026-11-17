import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { getContentHelperFun, isDisabledHelperFun, isHiddenHelperFun } from "../../utils/trans";
import EditIcon from "@mui/icons-material/Edit";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Box,
  Grid,
  IconButton,
  Paper,
} from "@mui/material";
import { Delete, AddCircle } from "@mui/icons-material";

import api from "../../utils/Api";
import * as Yup from "yup";
import { useFormik } from "formik";
// import GenericDialog from "../genericDialog/GenericDialog";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getPageContent } from "../../redux/slices/transSlice";
import { useDispatch } from "react-redux";

interface GroupPermission {
  group_id: string;
  hidden: string;
  disabled: string;
}

const validationSchema = Yup.object().shape({
  resource_id: Yup.number(),
  resource_type: Yup.string().required("Resource type is required"),
  text: Yup.string().required("Default text is required"),
  facility_id: Yup.number().required("Facility ID is required").positive("Must be positive"),
  function_id: Yup.number().required("Function ID is required").positive("Must be positive").nullable(),
  resource_key: Yup.string().nullable(),
  text_custom: Yup.string().nullable(),
  text_locale: Yup.string().nullable(),
  text_locale_custom: Yup.string().nullable(),
  groupPermissions: Yup.array().of(
    Yup.object().shape({
      group_id: Yup.number().required("Group is required"),
      hidden: Yup.string().oneOf(["Y", "N"]).required("Hidden status is required"),
      disabled: Yup.string().oneOf(["Y", "N"]).required("Disabled status is required"),
    })
  ),
});

export default function TransWrapper({
  children,
  pageId,
  type,
  selector,
  customKey,
  resourceId,
}: {
  children: React.ReactNode;
  customKey: string;
  pageId: number;
  type: string;
  selector: string;
  resourceId: string;
}) {
  const { pagesTrans: pages, content, groups, resourceTypes } = useAppSelector((store) => store.trans);
  const dispatch = useAppDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  const text = getContentHelperFun({
    content,
    key: customKey,
    pageId,
    type,
  });

  const isHidden = isHiddenHelperFun({
    content,
    key: customKey,
    pageId,
    type,
  });

  const isDisabled = isDisabledHelperFun({
    content,
    key: customKey,
    pageId,
    type,
  });

  const formik = useFormik({
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
      groupPermissions: [] as GroupPermission[],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await api.put(`api/trans/resource`, values);

        if (response.data.success) {
          setSnackbar({
            open: true,
            message: "Resource updated successfully!",
            severity: "success",
          });

          dispatch(getPageContent(pageId));
          setOpenDialog(false);
        } else {
          throw new Error(response.data.message);
        }
      } catch (error: any) {
        console.error("Error updating resource:", error);
        setSnackbar({
          open: true,
          message: error?.response?.data?.message || "Failed to update resource",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const fetchResourcePermissions = async (resourceId: string) => {
    try {
      const response = await api.get(`api/trans/authPermissions/${resourceId}`);
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching permissions:", error);
      return [];
    }
  };

  const getAvailableGroupsForIndex = (index: number) => {
    if (!groups) return [];
    const currentPermissions = formik.values.groupPermissions;
    const currentGroupId = currentPermissions[index]?.group_id;
    return groups.filter((group) => {
      if (group.group_id.toString() === currentGroupId) return true;
      return !currentPermissions.some((perm, i) => i !== index && perm.group_id === group.group_id.toString());
    });
  };

  const handleAddPermission = () => {
    const currentPermissions = formik.values.groupPermissions;
    const usedGroupIds = currentPermissions.map((p) => p.group_id).filter((id) => id !== "");

    if (usedGroupIds.length === groups.length) {
      setSnackbar({
        open: true,
        message: "All available groups have been assigned",
        severity: "warning",
      });
      return;
    }

    formik.setFieldValue("groupPermissions", [...currentPermissions, { group_id: "", hidden: "N", disabled: "N" }]);
  };

  const handleRemovePermission = (index: number) => {
    const newPermissions = [...formik.values.groupPermissions];
    newPermissions.splice(index, 1);
    formik.setFieldValue("groupPermissions", newPermissions);
  };

  const handleEditClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);

      // Fetch resource data
      const resourceResponse = await api.get(`api/trans/resource/${resourceId || 8}`);

      if (resourceResponse.data.success) {
        const resource = resourceResponse.data.data;
        const permissions = await fetchResourcePermissions(resourceId);

        formik.setValues({
          resource_id: resource.resource_id,
          resource_type: resource.resource_type,
          text: resource.text || "",
          facility_id: resource.facility_id || "",
          function_id: resource.function_id || "",
          resource_key: resource.resource_key,
          text_custom: resource.text_custom,
          text_locale: resource.text_locale,
          text_locale_custom: resource.text_locale_custom,
          groupPermissions:
            permissions.length > 0
              ? permissions.map((perm: any) => ({
                  group_id: perm.group_id.toString(),
                  hidden: perm.hidden || "N",
                  disabled: perm.disabled || "N",
                }))
              : [],
        });

        setOpenDialog(true);
      }
    } catch (error) {
      console.error("Error fetching resource:", error);
      setSnackbar({
        open: true,
        message: "Failed to load resource details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) {
      const element = ref.current.querySelector(selector);
      if (element) {
        element.innerHTML = text;
      }
    }
  }, [content, pageId, customKey, type, text, selector]);

  if (isHidden) {
    return null;
  }

  return (
    <>
      <Box sx={{ position: "relative", display: "inline" }}>
        <div
          ref={ref}
          style={{
            display: "inline",
            pointerEvents: isDisabled ? "none" : "auto",
            cursor: isDisabled ? "not-allowed" : "pointer",
            opacity: isDisabled ? 0.5 : 1,
            position: "relative",
          }}>
          {children}
        </div>

        {/* <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: "0",
            left: "100%",
            transform: "translate(-50%, -50%)",
            zIndex: "999",
            pointerEvents: "auto",
            backgroundColor: "background.paper",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
          onClick={handleEditClick}
        >
          <EditIcon fontSize="small" />
        </IconButton> */}
      </Box>

      {/* Edit Dialog - Matches ResourceManagement styling */}
      {/* <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.default',
            color: 'text.obs'
          }
        }}
      > */}

      
      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
