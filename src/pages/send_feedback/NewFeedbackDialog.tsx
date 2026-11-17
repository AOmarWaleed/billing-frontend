import { useState, useEffect, useRef, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Grid,
  Button,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { flattenPages } from "../../utils/trans";
import FeedbackService from "../../redux/services/FeedbackService";
import { FileUploader } from "../../fileUploader";
import type { FileUploaderHandle } from "../../fileUploader";
import type { FeedbackItem } from "../../redux/slices/feedbackSlice";
import { toast } from "react-toastify";
import api from "../../utils/Api";

// Toast wrapper with fallback
const showSuccess = (message: string) => {
  try {
    toast.success(message, { 
      position: "bottom-right",
      autoClose: 5000,
      toastId: `feedback-success-${Date.now()}`,
      style: { zIndex: 10000 } as any,
    });
  } catch {
    alert(message);
  }
};

const showError = (message: string) => {
  try {
    toast.error(message, { 
      position: "bottom-right",
      autoClose: 5000,
      toastId: `feedback-error-${Date.now()}`,
      style: { zIndex: 10000 } as any,
    });
  } catch {
    alert(message);
  }
};

interface FeedbackType {
  user_code: string;
  description: string;
}

interface NewFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  feedback?: FeedbackItem | null;
  defaultPage?: string;
  onSuccess?: () => void;
  t?: (key: string) => string;
}

const validationSchema = Yup.object({
  page: Yup.string().optional(),
  feedback_type: Yup.string().required("Feedback Type is required"),
  feedback_text: Yup.string().required("Feedback is required"),
});

export default function NewFeedbackDialog({
  open,
  onClose,
  feedback,
  defaultPage,
  onSuccess,
  t,
}: NewFeedbackDialogProps) {
  const translate = t || ((key: string) => key);
  const isEdit = Boolean(feedback);
  const menuPages = useSelector((state: RootState) => state.trans.pages);
  const [loading, setLoading] = useState(false);
  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);
  const [feedbackTypesLoading, setFeedbackTypesLoading] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [submitDone, setSubmitDone] = useState(false);
  const uploaderRef = useRef<FileUploaderHandle>(null);

  useEffect(() => {
    if (submitDone) {
      onClose();
      setSubmitDone(false);
    }
  }, [submitDone, onClose]);

  const pageOptions = useMemo(() => {
    const flat = flattenPages(menuPages);
    const seen = new Set<string>();
    return flat
      .filter((p) => {
        const name = p.en_text || p.display_text;
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return true;
      })
      .map((p) => ({
        value: p.en_text || p.display_text,
        label: p.en_text || p.display_text,
      }));
  }, [menuPages]);

  const formik = useFormik({
    initialValues: {
      page: defaultPage || "",
      feedback_type: "",
      feedback_text: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        let attachment: string[] = [];

        if (uploaderRef.current?.hasFiles) {
          const filenames = await uploaderRef.current.upload();
          attachment = filenames;
          if (attachment.length === 0) {
            setLoading(false);
            return;
          }
        }

        const payload = {
          page: values.page.trim() || null,
          feedback_text: values.feedback_text.trim(),
          feedback_type: values.feedback_type,
          attachment: uploaderRef.current?.hasFiles
            ? attachment
            : isEdit
              ? existingAttachments
              : [],
        };

        if (isEdit && feedback) {
          await api.put(`/api/feedback/${feedback.feedback_id}`, payload);
          const successMsg =
            translate("sendfeedback_46_UpdateSuccess") ||
            "Feedback updated successfully";
          showSuccess(successMsg);
          console.log("[Feedback] Success:", successMsg);
        } else {
          await api.post("/api/feedback", payload);
          const successMsg =
            translate("sendfeedback_46_SuccessMessage") ||
            "Feedback submitted successfully";
          showSuccess(successMsg);
          console.log("[Feedback] Success:", successMsg);
        }

        formik.resetForm();
        uploaderRef.current?.clearFiles();
        onSuccess?.();
        setSubmitDone(true);
      } catch (error: any) {
        const message =
          error.response?.data?.error ||
          (isEdit ? "Failed to update feedback" : "Failed to submit feedback");
        showError(message);
        console.error("[Feedback] Error:", message, error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    setFeedbackTypesLoading(true);
    FeedbackService.getTypes()
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setFeedbackTypes(list);
      })
      .catch(() => {})
      .finally(() => setFeedbackTypesLoading(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    if (feedback) {
      formik.setValues({
        page: feedback.page || "",
        feedback_type: feedback.feedback_type,
        feedback_text: feedback.feedback_text,
      });
      let atts: string[] = [];
      try {
        const parsed = JSON.parse(feedback.attachment);
        if (Array.isArray(parsed)) atts = parsed;
      } catch {
        if (Array.isArray(feedback.attachment)) atts = feedback.attachment;
      }
      setExistingAttachments(atts);
      uploaderRef.current?.clearFiles();
    } else {
      formik.resetForm({
        values: {
          page: defaultPage || "",
          feedback_type: "",
          feedback_text: "",
        },
      });
      setExistingAttachments([]);
      uploaderRef.current?.clearFiles();
    }
  }, [feedback, open, defaultPage]);

  const handleClose = () => {
    if (!loading) {
      formik.resetForm();
      uploaderRef.current?.clearFiles();
      onClose();
    }
  };

  const dialogContent = (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Autocomplete
            freeSolo
            options={pageOptions.map((opt) => opt.label)}
            value={formik.values.page || null}
            onChange={(_, v) => formik.setFieldValue("page", v || "")}
            onInputChange={(_, v) => formik.setFieldValue("page", v || "")}
            renderInput={(params) => (
              <TextField
                {...params}
                label={translate("sendfeedback_46_PageField") || "Page"}
                size="small"
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            options={feedbackTypes}
            loading={feedbackTypesLoading}
            getOptionLabel={(option) => option.description}
            isOptionEqualToValue={(option, value) =>
              option.user_code === value?.user_code
            }
            value={
              feedbackTypes.find(
                (ft) => ft.user_code === formik.values.feedback_type
              ) || null
            }
            onChange={(_, v) =>
              formik.setFieldValue("feedback_type", v?.user_code || "")
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  (translate("sendfeedback_46_TypeField") || "Feedback Type") +
                  " *"
                }
                size="small"
                fullWidth
                error={
                  formik.touched.feedback_type &&
                  Boolean(formik.errors.feedback_type)
                }
                helperText={
                  formik.touched.feedback_type && formik.errors.feedback_type
                }
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {feedbackTypesLoading && (
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

        <Grid item xs={12}>
          <TextField
            label={
              (translate("sendfeedback_46_FeedbackField") || "Feedback") + " *"
            }
            placeholder={
              translate("sendfeedback_46_FeedbackPlaceholder") ||
              "Describe your issue or feedback..."
            }
            value={formik.values.feedback_text}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            name="feedback_text"
            multiline
            rows={5}
            size="small"
            fullWidth
            error={
              formik.touched.feedback_text &&
              Boolean(formik.errors.feedback_text)
            }
            helperText={
              formik.touched.feedback_text && formik.errors.feedback_text
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {translate("sendfeedback_46_AttachmentsSection") || "Attachments"}
          </Typography>
          <FileUploader
            ref={uploaderRef}
            endpoint="/api/feedback/upload"
            maxFiles={10}
            existingFiles={isEdit ? existingAttachments : undefined}
            chooseLabel={
              translate("sendfeedback_46_ChooseFilesButton") || "Choose Files"
            }
            addMoreLabel={
              translate("sendfeedback_46_AddMoreFilesButton") || "Add More Files"
            }
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          {translate("sendfeedback_46_CancelButton") || "Cancel"}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !formik.isValid}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : isEdit ? (
            translate("sendfeedback_46_UpdateButton") || "Update"
          ) : (
            translate("sendfeedback_46_SubmitButton") || "Submit"
          )}
        </Button>
      </Box>
    </Box>
  );

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={
        isEdit
          ? translate("sendfeedback_46_EditTitle") || "Edit Feedback"
          : translate("sendfeedback_46_NewTitle") || "Report an Issue / Send Feedback"
      }
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
      content={dialogContent}
      maxWidth="sm"
    />
  );
}
