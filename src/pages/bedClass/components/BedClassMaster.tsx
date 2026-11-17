import {
  Box,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid2,
  IconButton,
  Paper,
  Divider,
  Stack,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Autocomplete,
  CircularProgress,
  Grid,
  FormControlLabel,
  Radio,
  RadioGroup,
  debounce as muiDebounce,
} from "@mui/material";
import { Formik, Form, FieldArray, FormikProps } from "formik";
import * as Yup from "yup";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { fetcher } from "../../../utils/Api";
import api from "../../../utils/Api";
import { publicUrl } from "../../../utils/publicUrl";
import {
  useBedClassContext,
  BedClass,
  BedClassService,
  BedClassMasterWithServices,
} from "../context/BedClassContext";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { DisplayMsgDialog, GlCustomTable, GlPanelTable, Secure } from "@givc/shared-components";
import { GridColDef } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import WarningIcon from "@mui/icons-material/Warning";
import { t } from "i18next";

// Use the BedClass type from context, omit fields that come from token and auto-generated
type MasterFormData = Omit<
  BedClass,
  "bed_class_id" | "creation_date" | "facility_id" | "created_by"
>;

// Use the BedClassService type from context, omit bed_class_service_id and bed_class_id as they'll be set by server
type ServiceFormData = Omit<
  BedClassService,
  "bed_class_service_id" | "bed_class_id"
>;

// Extended type for form handling with a flag to track if service is from API
interface ServiceFormDataWithId extends ServiceFormData {
  tempId?: string;
  bed_class_service_id?: string;
}

interface FormValues {
  masterData: MasterFormData;
  servicesData: ServiceFormDataWithId[];
}

interface EditMasterFormValues {
  bed_class_id: number;
  description: string;
  smallest_number_of_hours: number;
  rounding_required: string;
  patient_care_pct: number;
  accumulate_fractions: string;
  fraction_weight_priority: number;
}

// Validation schemas using the types
const serviceValidationSchema = Yup.object({
  item_id: Yup.number().required("Item ID is required"),
  payer_id: Yup.number().nullable(),
  from_day: Yup.number()
    .min(0, "From day must be >= 0")
    .required("From day is required"),
  to_day: Yup.number()
    .min(Yup.ref("from_day"), "To day must be >= from day")
    .required("To day is required"),
  time_calculation_basis: Yup.string().required(
    "Time calculation basis is required",
  ),
  units: Yup.number()
    .min(1, "Units must be at least 1")
    .required("Units are required"),
});

const masterValidationSchema = Yup.object({
  description: Yup.string().required("Description is required"),
  smallest_number_of_hours: Yup.number()
    .min(0, "Must be >= 0")
    .required("Required"),
  rounding_required: Yup.string()
    .oneOf(["U", "D"], "Must be either U (Up) or D (Down)")
    .required("Rounding required is required"),
  patient_care_pct: Yup.number().min(0).max(100).required("Required"),
  accumulate_fractions: Yup.string().max(1, "Must be a single character"),
  fraction_weight_priority: Yup.number().min(0).required("Required"),
});

const masterWithServicesValidationSchema = Yup.object({
  masterData: masterValidationSchema,
  servicesData: Yup.array()
    .of(serviceValidationSchema)
    // make it optional
    .notRequired()
    .default([]),
});

const editMasterValidationSchema = Yup.object({
  bed_class_id: Yup.number().required("Bed class ID is required"),
  description: Yup.string().required("Description is required"),
  smallest_number_of_hours: Yup.number()
    .min(0, "Must be >= 0")
    .required("Required"),
  rounding_required: Yup.string()
    .oneOf(["U", "D"], "Must be either U (Up) or D (Down)")
    .required("Rounding required is required"),
  patient_care_pct: Yup.number().min(0).max(100).required("Required"),
  accumulate_fractions: Yup.string().max(1, "Must be a single character"),
  fraction_weight_priority: Yup.number().min(0).required("Required"),
});

const sanitizeNonNegativeNumber = (
  rawValue: string,
  { allowDecimal = true } = {},
): number | "" | null => {
  if (rawValue === null || rawValue === undefined) return "";

  const trimmed = rawValue.trim();
  if (trimmed === "") return "";
  if (/\s/.test(trimmed) || trimmed.includes("-") || trimmed.includes("+")) {
    return null;
  }

  const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
  if (!pattern.test(trimmed)) {
    return null;
  }

  const numericValue = Number(trimmed);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return null;
  }

  return numericValue;
};

const sanitizeTextValue = (rawValue: string): string => {
  if (rawValue === null || rawValue === undefined) return "";

  // If it's ONLY whitespace (e.g. "   "), treat it as empty.
  if (rawValue.trim() === "") return "";

  // Otherwise keep the value as-is, spaces and all — don't trim,
  // or you'll strip the trailing space while the user is still typing
  // between words (e.g. "a m" would collapse to "am").
  return rawValue;
};

// Constants
const DEBOUNCE_DELAY = 500;
const ITEMS_PER_PAGE = 50;

interface PayerOption {
  payer_id: number;
  description: string;
  short_name: string;
}

interface ItemOption {
  item_id: number;
  description: string;
  category_code: string;
}

// Confirm Delete Dialog Component
const ConfirmDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}: any) => {
  return (
    <DisplayMsgDialog
      open={open}
      onClose={onClose}
      onAction={onConfirm}
      description={
        message ||
        "Are you sure you want to delete this ITEM?"
      }
      status="DELETE"
      getResource={false}
      actionLabel="Delete"
      actionColor="error"
    />
    // <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    //   <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    //     <WarningIcon color="warning" />
    //     {title || "Confirm Delete"}
    //   </DialogTitle>
    //   <DialogContent>
    //     <Typography>
    //       {message ||
    //         "Are you sure you want to delete this item? This action cannot be undo."}
    //     </Typography>
    //   </DialogContent>
    //   <DialogActions>
    //     <Button onClick={onClose} disabled={loading}>
    //       Cancel
    //     </Button>
    //     <Button
    //       onClick={onConfirm}
    //       color="error"
    //       variant="contained"
    //       disabled={loading}
    //     >
    //       {loading ? "Deleting..." : "Delete"}
    //     </Button>
    //   </DialogActions>
    // </Dialog>
  );
};

// Service Item Autocomplete Component
const ServiceItemAutocomplete = React.memo(
  ({ value, onChange, error, helperText, disabled }: any) => {
    const [localItems, setLocalItems] = useState<ItemOption[]>([]);
    const [localLoading, setLocalLoading] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState("");
    const [localPage, setLocalPage] = useState(1);
    const [localHasMore, setLocalHasMore] = useState(true);
    const localDebouncedSearch = useMemo(
      () =>
        muiDebounce((searchValue: string) => {
          setLocalPage(1);
          setLocalItems([]);
          fetchLocalItems(searchValue, 1);
        }, DEBOUNCE_DELAY),
      [],
    );

    const fetchLocalItems = async (search: string = "", page: number = 1) => {
      setLocalLoading(true);
      try {
        const { data } = await api.get("/api/payer-code-mapping/items", {
          params: {
            search: search || undefined,
            page: page,
            limit: ITEMS_PER_PAGE,
          },
        });

        const newItems = data?.data || [];
        const total = data?.total || 0;
        setLocalHasMore(page * ITEMS_PER_PAGE < total);

        if (page === 1) {
          setLocalItems(newItems);
        } else {
          setLocalItems((prev) => [...prev, ...newItems]);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLocalLoading(false);
      }
    };

    const handleSearchChange = (value: string) => {
      setLocalSearchTerm(value);
      localDebouncedSearch(value);
    };

    const handleLocalLoadMore = (event: React.UIEvent<HTMLUListElement>) => {
      const listbox = event.currentTarget;
      const scrollBottom =
        listbox.scrollHeight - listbox.scrollTop - listbox.clientHeight;
      if (scrollBottom < 50 && !localLoading && localHasMore) {
        const nextPage = localPage + 1;
        setLocalPage(nextPage);
        fetchLocalItems(localSearchTerm, nextPage);
      }
    };

    useEffect(() => {
      fetchLocalItems();
      return () => {
        localDebouncedSearch.clear();
      };
    }, []);

    return (
      <Autocomplete
        fullWidth
        options={localItems}
        loading={localLoading}
        getOptionLabel={(option) =>
          `${option.item_id} - ${option.description} (${option.category_code})`
        }
        value={localItems.find((item) => item.item_id === value) || null}
        onChange={(_, newValue) => {
          onChange(newValue?.item_id || null);
        }}
        isOptionEqualToValue={(option, value) =>
          option.item_id === value?.item_id
        }
        onInputChange={(event, newValue, reason) => {
          if (reason === "input") {
            handleSearchChange(newValue);
          }
        }}
        ListboxProps={{
          onScroll: handleLocalLoadMore,
          style: { maxHeight: 300 },
        }}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Item ID"
            size="small"
            // required
            error={error}
            helperText={helperText}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {localLoading && (
                    <CircularProgress color="inherit" size={20} />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    );
  },
);

// Payer Autocomplete Component
const PayerAutocomplete = React.memo(
  ({ value, onChange, error, helperText, disabled }: any) => {
    const [localPayers, setLocalPayers] = useState<PayerOption[]>([]);
    const [localLoading, setLocalLoading] = useState(false);

    const fetchLocalPayers = async () => {
      setLocalLoading(true);
      try {
        const { data } = await api.get("/api/agreement-exclusion/payers");
        setLocalPayers(data?.data || []);
      } catch (error) {
        console.error("Error fetching payers:", error);
      } finally {
        setLocalLoading(false);
      }
    };

    useEffect(() => {
      fetchLocalPayers();
    }, []);

    return (
      <Autocomplete
        fullWidth
        options={localPayers}
        loading={localLoading}
        getOptionLabel={(option) =>
          `${option.payer_id} - ${option.description || option.short_name}`
        }
        value={localPayers.find((payer) => payer.payer_id === value) || null}
        onChange={(_, newValue) => {
          onChange(newValue?.payer_id || null);
        }}
        isOptionEqualToValue={(option, value) =>
          option.payer_id === value?.payer_id
        }
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Payer ID"
            size="small"
            error={error}
            helperText={helperText}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {localLoading && (
                    <CircularProgress color="inherit" size={20} />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    );
  },
);

// Add Master with Services Dialog Component
const AddMasterWithServicesDialog = React.memo(
  ({
    open,
    onClose,
    onSubmit,
    isLoading: isSubmitting,
    editingServiceIndex,
    onEditService,
    onDeleteService,
    getNestedError,
    getNestedTouched,
    transformToApiFormat,
    tableRefreshRef,
    serviceTableRef,
  }: any) => {
    const {
      setIsLoading,
      setError,
      addMasterWithServices,
      setTableParams,
      tableParams,
      setSelectedBedClass,
    } = useBedClassContext();

    const handleSubmit = async (
      values: FormValues,
      { setSubmitting, resetForm }: any,
    ) => {
      try {
        setIsLoading(true);
        const apiData = transformToApiFormat(values);
        await addMasterWithServices(apiData);
        resetForm();
        onClose();
        tableRefreshRef.current?.();
        serviceTableRef.current?.();
      } catch (err: any) {
        setError(err.message);
        toast.error(
          err.response?.data?.msg || "Failed to add master with services",
        );
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 1,
          }}
        >
          <span>Add New Bed Class with Services</span>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ ml: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Formik<FormValues>
          initialValues={{
            masterData: {
              description: "",
              smallest_number_of_hours: 0,
              rounding_required: "U",
              min: 0,
              patient_care_pct: 0,
              accumulate_fractions: "",
              fraction_weight_priority: 0,
            },
            servicesData: [],
          }}
          validationSchema={masterWithServicesValidationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            handleChange,
            handleBlur,
            setFieldValue,
            isSubmitting,
            errors,
            touched,
          }: FormikProps<FormValues>) => (
            <Form>
              <DialogContent dividers>
                {/* Bed Class Data Section */}
                <Typography variant="h6" gutterBottom>
                  Bed Class Information
                </Typography>
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 12 }}>
                    <TextField
                      fullWidth
                      name="masterData.description"
                      label="Description"
                      value={values.masterData.description}
                      onChange={(event) => {
                        const sanitized = sanitizeTextValue(event.target.value);
                        setFieldValue("masterData.description", sanitized);
                      }}
                      onBlur={handleBlur}
                      size="small"
                      error={
                        !!getNestedError(errors, "masterData.description") &&
                        !!getNestedTouched(touched, "masterData.description")
                      }
                      helperText={
                        getNestedTouched(touched, "masterData.description") &&
                        getNestedError(errors, "masterData.description")
                      }
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="masterData.smallest_number_of_hours"
                      label="Smallest Number of Hours"
                      type="number"
                      value={values.masterData.smallest_number_of_hours}
                      onChange={(event) => {
                        const sanitized = sanitizeNonNegativeNumber(
                          event.target.value,
                          { allowDecimal: true },
                        );
                        if (sanitized === null) return;
                        setFieldValue(
                          "masterData.smallest_number_of_hours",
                          sanitized,
                        );
                      }}
                      onKeyDown={(event) => {
                        if (["-", "+", "e", "E", " "].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      onBlur={handleBlur}
                      size="small"
                      error={
                        !!getNestedError(
                          errors,
                          "masterData.smallest_number_of_hours",
                        ) &&
                        !!getNestedTouched(
                          touched,
                          "masterData.smallest_number_of_hours",
                        )
                      }
                      helperText={
                        getNestedTouched(
                          touched,
                          "masterData.smallest_number_of_hours",
                        ) &&
                        getNestedError(
                          errors,
                          "masterData.smallest_number_of_hours",
                        )
                      }
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="rounding-required-label">
                        Rounding Required
                      </InputLabel>
                      <Select
                        labelId="rounding-required-label"
                        name="masterData.rounding_required"
                        value={values.masterData.rounding_required}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Rounding Required"
                        error={
                          !!getNestedError(
                            errors,
                            "masterData.rounding_required",
                          ) &&
                          !!getNestedTouched(
                            touched,
                            "masterData.rounding_required",
                          )
                        }
                      >
                        <MenuItem value="U">Up (U)</MenuItem>
                        <MenuItem value="D">Down (D)</MenuItem>
                      </Select>
                      {getNestedTouched(
                        touched,
                        "masterData.rounding_required",
                      ) &&
                        getNestedError(
                          errors,
                          "masterData.rounding_required",
                        ) && (
                          <FormHelperText error>
                            {getNestedError(
                              errors,
                              "masterData.rounding_required",
                            )}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="masterData.patient_care_pct"
                      label="Patient Care %"
                      type="number"
                      value={values.masterData.patient_care_pct}
                      onChange={(event) => {
                        const sanitized = sanitizeNonNegativeNumber(
                          event.target.value,
                          { allowDecimal: true },
                        );
                        if (sanitized === null) return;
                        setFieldValue(
                          "masterData.patient_care_pct",
                          sanitized,
                        );
                      }}
                      onKeyDown={(event) => {
                        if (["-", "+", "e", "E", " "].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      onBlur={handleBlur}
                      size="small"
                      inputProps={{ min: 0, max: 100, step: "any" }}
                      error={
                        !!getNestedError(
                          errors,
                          "masterData.patient_care_pct",
                        ) &&
                        !!getNestedTouched(
                          touched,
                          "masterData.patient_care_pct",
                        )
                      }
                      helperText={
                        getNestedTouched(
                          touched,
                          "masterData.patient_care_pct",
                        ) &&
                        getNestedError(errors, "masterData.patient_care_pct")
                      }
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <FormControl component="fieldset" size="small">
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        gutterBottom
                      >
                        Accumulate Fractions
                      </Typography>
                      <RadioGroup
                        row
                        name="masterData.accumulate_fractions"
                        value={values.masterData.accumulate_fractions}
                        onChange={handleChange}
                      >
                        <FormControlLabel
                          value="Y"
                          control={<Radio size="small" />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="N"
                          control={<Radio size="small" />}
                          label="No"
                        />
                        <FormControlLabel
                          value=""
                          control={<Radio size="small" />}
                          label="None"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="masterData.fraction_weight_priority"
                      label="Fraction Weight Priority"
                      type="number"
                      value={values.masterData.fraction_weight_priority}
                      onChange={(event) => {
                        const sanitized = sanitizeNonNegativeNumber(
                          event.target.value,
                          { allowDecimal: true },
                        );
                        if (sanitized === null) return;
                        setFieldValue(
                          "masterData.fraction_weight_priority",
                          sanitized,
                        );
                      }}
                      onKeyDown={(event) => {
                        if (["-", "+", "e", "E", " "].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      onBlur={handleBlur}
                      size="small"
                      error={
                        !!getNestedError(
                          errors,
                          "masterData.fraction_weight_priority",
                        ) &&
                        !!getNestedTouched(
                          touched,
                          "masterData.fraction_weight_priority",
                        )
                      }
                      helperText={
                        getNestedTouched(
                          touched,
                          "masterData.fraction_weight_priority",
                        ) &&
                        getNestedError(
                          errors,
                          "masterData.fraction_weight_priority",
                        )
                      }
                    />
                  </Grid2>
                </Grid2>

                <Divider sx={{ my: 3 }} />

                {/* Services Data Section */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6">Services</Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const newServices = [...values.servicesData];
                      newServices.push({
                        item_id: null as any,
                        payer_id: null as any,
                        from_day: 0,
                        to_day: 0,
                        time_calculation_basis: "",
                        units: 1,
                        tempId: Date.now().toString(),
                      });
                      setFieldValue("servicesData", newServices);
                    }}
                  >
                    Add Service
                  </Button>
                </Box>

                {typeof getNestedError(errors, "servicesData") === "string" && (
                  <FormHelperText error sx={{ mb: 2 }}>
                    {getNestedError(errors, "servicesData")}
                  </FormHelperText>
                )}

                <FieldArray name="servicesData">
                  {({ remove }) => (
                    <>
                      {values.servicesData.length === 0 ? (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mb: 2 }}
                        >
                          No services added yet. Click "Add Service" to add one.
                        </Typography>
                      ) : (
                        values.servicesData.map((service, index) => (
                          <Paper
                            key={service.tempId || index}
                            id={`service-${index}`}
                            sx={{
                              p: 2,
                              mb: 2,
                              position: "relative",
                              border:
                                editingServiceIndex === index
                                  ? "2px solid #1976d2"
                                  : "1px solid #e0e0e0",
                            }}
                          >
                            {/* <Box
                              sx={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                display: "flex",
                                gap: 1,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  onDeleteService(service, remove, index)
                                }
                                color="error"
                              // disabled={values.servicesData.length === 1}
                              > */}
                            {/* <DeleteIcon fontSize="small" />
                          </IconButton>
                            </Box> */}
                            <Grid container spacing={2} sx={{ pt: 2 }}>
                              <Grid item xs={12} sm={6}>
                                <ServiceItemAutocomplete
                                  value={service.item_id}
                                  onChange={(newValue: number | null) => {
                                    setFieldValue(
                                      `servicesData.${index}.item_id`,
                                      newValue,
                                    );
                                  }}
                                  error={
                                    !!getNestedError(
                                      errors,
                                      `servicesData.${index}.item_id`,
                                    ) &&
                                    !!getNestedTouched(
                                      touched,
                                      `servicesData.${index}.item_id`,
                                    )
                                  }
                                  helperText={
                                    getNestedTouched(
                                      touched,
                                      `servicesData.${index}.item_id`,
                                    ) &&
                                    getNestedError(
                                      errors,
                                      `servicesData.${index}.item_id`,
                                    )
                                  }
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <PayerAutocomplete
                                  value={service.payer_id}
                                  onChange={(newValue: number | null) => {
                                    setFieldValue(
                                      `servicesData.${index}.payer_id`,
                                      newValue,
                                    );
                                  }}
                                  error={
                                    !!getNestedError(
                                      errors,
                                      `servicesData.${index}.payer_id`,
                                    ) &&
                                    !!getNestedTouched(
                                      touched,
                                      `servicesData.${index}.payer_id`,
                                    )
                                  }
                                  helperText={
                                    getNestedTouched(
                                      touched,
                                      `servicesData.${index}.payer_id`,
                                    ) &&
                                    getNestedError(
                                      errors,
                                      `servicesData.${index}.payer_id`,
                                    )
                                  }
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  name={`servicesData.${index}.from_day`}
                                  label="From Day"
                                  type="number"
                                  value={service.from_day}
                                  onChange={(event) => {
                                    const sanitized = sanitizeNonNegativeNumber(
                                      event.target.value,
                                      { allowDecimal: true },
                                    );
                                    if (sanitized === null) return;
                                    setFieldValue(
                                      `servicesData.${index}.from_day`,
                                      sanitized,
                                    );
                                  }}
                                  onKeyDown={(event) => {
                                    if (["-", "+", "e", "E", " "].includes(event.key)) {
                                      event.preventDefault();
                                    }
                                  }}
                                  onBlur={handleBlur}
                                  size="small"
                                  required
                                  error={
                                    !!getNestedError(
                                      errors,
                                      `servicesData.${index}.from_day`,
                                    ) &&
                                    !!getNestedTouched(
                                      touched,
                                      `servicesData.${index}.from_day`,
                                    )
                                  }
                                  helperText={
                                    getNestedTouched(
                                      touched,
                                      `servicesData.${index}.from_day`,
                                    ) &&
                                    getNestedError(
                                      errors,
                                      `servicesData.${index}.from_day`,
                                    )
                                  }
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  name={`servicesData.${index}.to_day`}
                                  label="To Day"
                                  type="number"
                                  value={service.to_day}
                                  onChange={(event) => {
                                    const sanitized = sanitizeNonNegativeNumber(
                                      event.target.value,
                                      { allowDecimal: true },
                                    );
                                    if (sanitized === null) return;
                                    setFieldValue(
                                      `servicesData.${index}.to_day`,
                                      sanitized,
                                    );
                                  }}
                                  onKeyDown={(event) => {
                                    if (["-", "+", "e", "E", " "].includes(event.key)) {
                                      event.preventDefault();
                                    }
                                  }}
                                  onBlur={handleBlur}
                                  size="small"
                                  required
                                  error={
                                    !!getNestedError(
                                      errors,
                                      `servicesData.${index}.to_day`,
                                    ) &&
                                    !!getNestedTouched(
                                      touched,
                                      `servicesData.${index}.to_day`,
                                    )
                                  }
                                  helperText={
                                    getNestedTouched(
                                      touched,
                                      `servicesData.${index}.to_day`,
                                    ) &&
                                    getNestedError(
                                      errors,
                                      `servicesData.${index}.to_day`,
                                    )
                                  }
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  name={`servicesData.${index}.units`}
                                  label="Units"
                                  value={service.units}
                                  type="number"
                                  onChange={(event) => {
                                    const sanitized = sanitizeNonNegativeNumber(
                                      event.target.value,
                                      { allowDecimal: false },
                                    );
                                    if (sanitized === null) return;
                                    setFieldValue(
                                      `servicesData.${index}.units`,
                                      sanitized,
                                    );
                                  }}
                                  onKeyDown={(event) => {
                                    if (["-", "+", ".", "e", "E", " "].includes(event.key)) {
                                      event.preventDefault();
                                    }
                                  }}
                                  onBlur={handleBlur}
                                  size="small"
                                  required
                                  inputProps={{ min: 1, step: 1 }}
                                  error={
                                    !!getNestedError(
                                      errors,
                                      `servicesData.${index}.units`,
                                    ) &&
                                    !!getNestedTouched(
                                      touched,
                                      `servicesData.${index}.units`,
                                    )
                                  }
                                  helperText={
                                    getNestedTouched(
                                      touched,
                                      `servicesData.${index}.units`,
                                    ) &&
                                    getNestedError(
                                      errors,
                                      `servicesData.${index}.units`,
                                    )
                                  }
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  name={`servicesData.${index}.time_calculation_basis`}
                                  label="Time Calculation Basis"
                                  value={service.time_calculation_basis}
                                  onChange={(event) => {
                                    const sanitized = sanitizeTextValue(
                                      event.target.value,
                                    );
                                    setFieldValue(
                                      `servicesData.${index}.time_calculation_basis`,
                                      sanitized,
                                    );
                                  }}
                                  onBlur={handleBlur}
                                  size="small"
                                  error={
                                    !!getNestedError(
                                      errors,
                                      `servicesData.${index}.time_calculation_basis`,
                                    ) &&
                                    !!getNestedTouched(
                                      touched,
                                      `servicesData.${index}.time_calculation_basis`,
                                    )
                                  }
                                  helperText={
                                    getNestedTouched(
                                      touched,
                                      `servicesData.${index}.time_calculation_basis`,
                                    ) &&
                                    getNestedError(
                                      errors,
                                      `servicesData.${index}.time_calculation_basis`,
                                    )
                                  }
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        ))
                      )}
                    </>
                  )}
                </FieldArray>
              </DialogContent>
              <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  Create Bed Class with Services
                </Button>
              </DialogActions>
            </Form>
          )
          }
        </Formik >
      </Dialog >
    );
  },
);

// Edit Master Dialog Component
const EditMasterDialog = React.memo(
  ({
    open,
    onClose,
    selectedMaster,
    onSubmit,
    isLoading: isSubmitting,
    tableRefreshRef,
    serviceTableRef,
  }: any) => {
    const {
      setIsLoading,
      setError,
      updateMaster,
      setTableParams,
      tableParams,
    } = useBedClassContext();

    const handleSubmit = async (
      values: EditMasterFormValues,
      { setSubmitting, resetForm }: any,
    ) => {
      try {
        setIsLoading(true);
        await updateMaster(values.bed_class_id, {
          description: values.description,
          smallest_number_of_hours: values.smallest_number_of_hours,
          rounding_required: values.rounding_required,
          patient_care_pct: values.patient_care_pct,
          accumulate_fractions: values.accumulate_fractions,
          fraction_weight_priority: values.fraction_weight_priority,
          facility_id: "",
          created_by: "",
          creation_date: "",
        });
        resetForm();
        onClose();
        tableRefreshRef.current?.();
        serviceTableRef.current?.();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 1,
          }}
        >
          <span>Edit Bed Class</span>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ ml: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Formik<EditMasterFormValues>
          initialValues={{
            bed_class_id: selectedMaster?.bed_class_id || 0,
            description: selectedMaster?.description || "",
            smallest_number_of_hours:
              selectedMaster?.smallest_number_of_hours || 0,
            rounding_required: selectedMaster?.rounding_required || "U",
            patient_care_pct: selectedMaster?.patient_care_pct || 0,
            accumulate_fractions: selectedMaster?.accumulate_fractions || "",
            fraction_weight_priority:
              selectedMaster?.fraction_weight_priority || 0,
          }}
          validationSchema={editMasterValidationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({
            values,
            handleChange,
            handleBlur,
            setFieldValue,
            isSubmitting,
            errors,
            touched,
          }) => (
            <Form>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="description"
                      label="Description"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      error={touched.description && !!errors.description}
                      helperText={touched.description && errors.description}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="smallest_number_of_hours"
                      label="Smallest Number of Hours"
                      type="number"
                      value={values.smallest_number_of_hours}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      error={
                        touched.smallest_number_of_hours &&
                        !!errors.smallest_number_of_hours
                      }
                      helperText={
                        touched.smallest_number_of_hours &&
                        errors.smallest_number_of_hours
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="edit-rounding-required-label">
                        Rounding Required
                      </InputLabel>
                      <Select
                        labelId="edit-rounding-required-label"
                        name="rounding_required"
                        value={values.rounding_required}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Rounding Required"
                        error={
                          touched.rounding_required &&
                          !!errors.rounding_required
                        }
                      >
                        <MenuItem value="U">Up (U)</MenuItem>
                        <MenuItem value="D">Down (D)</MenuItem>
                      </Select>
                      {touched.rounding_required &&
                        errors.rounding_required && (
                          <FormHelperText error>
                            {errors.rounding_required}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="patient_care_pct"
                      label="Patient Care %"
                      type="number"
                      value={values.patient_care_pct}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (/^\d*\.?\d*$/.test(value)) {
                          setFieldValue(
                            "patient_care_pct",
                            value === "" ? "" : Number(value),
                          );
                        }
                      }}
                      onKeyDown={(event) => {
                        if (["-", "+", "e", "E"].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      onBlur={handleBlur}
                      size="small"
                      inputProps={{ min: 0, max: 100, step: "any" }}
                      error={
                        touched.patient_care_pct && !!errors.patient_care_pct
                      }
                      helperText={
                        touched.patient_care_pct && errors.patient_care_pct
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl component="fieldset" size="small">
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        gutterBottom
                      >
                        Accumulate Fractions
                      </Typography>
                      <RadioGroup
                        row
                        name="accumulate_fractions"
                        value={values.accumulate_fractions}
                        onChange={handleChange}
                      >
                        <FormControlLabel
                          value="Y"
                          control={<Radio size="small" />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="N"
                          control={<Radio size="small" />}
                          label="No"
                        />
                        <FormControlLabel
                          value=""
                          control={<Radio size="small" />}
                          label="None"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="fraction_weight_priority"
                      label="Fraction Weight Priority"
                      type="number"
                      value={values.fraction_weight_priority}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      size="small"
                      error={
                        touched.fraction_weight_priority &&
                        !!errors.fraction_weight_priority
                      }
                      helperText={
                        touched.fraction_weight_priority &&
                        errors.fraction_weight_priority
                      }
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  Update Bed Class
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    );
  },
);

export default function BedClassMaster() {
  const {
    palette: { mode },
  } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [tableParams, setTableParams] = useState({});
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState<BedClass | null>(null);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [masterToDelete, setMasterToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const tableRefreshRef = useRef<any>();

  const {
    setIsLoading,
    setError,
    fetchMasterData,
    addMasterWithServices,
    updateMaster,
    deleteMaster,
    deleteService,
    setSelectedBedClass,
    serviceTableRef,
  } = useBedClassContext();

  // Debounced search for table
  const debouncedTableSearch = useMemo(
    () =>
      muiDebounce((value: string) => {
        setTableParams({ search: value });
      }, DEBOUNCE_DELAY),
    [],
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setSelectedBedClass(null);
    debouncedTableSearch(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedBedClass(null);
    debouncedTableSearch("");
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (master: BedClass) => {
    setSelectedMaster(master);
    setOpenEditDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setSelectedMaster(null);
    setEditingServiceIndex(null);
  };

  // Handle delete master - open confirmation dialog
  const handleDeleteClick = (bedClassId: number) => {
    setMasterToDelete(bedClassId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete master
  const handleConfirmDelete = async () => {
    if (masterToDelete) {
      setIsDeleting(true);
      try {
        await deleteMaster(masterToDelete);
        setTableParams({ ...tableParams, refresh: Date.now() });
        // serviceTableRef?.current?.();
        toast.success("Master deleted successfully");
        setDeleteDialogOpen(false);
        setMasterToDelete(null);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.response?.data?.msg || "Failed to delete master");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle edit service
  const handleEditService = (index: number) => {
    setEditingServiceIndex(index);
    const serviceElement = document.getElementById(`service-${index}`);
    if (serviceElement) {
      serviceElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Handle delete service
  const handleDeleteService = async (
    service: ServiceFormDataWithId,
    remove: (index: number) => void,
    index: number,
  ) => {
    if (service.bed_class_service_id) {
      try {
        await deleteService(service.bed_class_service_id);
        remove(index);
        toast.success("Service deleted successfully");
      } catch (err: any) {
        setError(err.message);
        toast.error(err.response?.data?.msg || "Failed to delete service");
      }
    } else {
      remove(index);
    }
  };

  // Helper function to get nested error and touched
  const getNestedError = (errors: any, path: string) => {
    return path.split(".").reduce((obj, key) => obj && obj[key], errors);
  };

  const getNestedTouched = (touched: any, path: string) => {
    return path.split(".").reduce((obj, key) => obj && obj[key], touched);
  };

  // Transform form values to API expected format
  const transformToApiFormat = (
    values: FormValues,
  ): BedClassMasterWithServices => {
    return {
      masterData: {
        bed_class_id: 0,
        description: values.masterData.description,
        smallest_number_of_hours: values.masterData.smallest_number_of_hours,
        rounding_required: values.masterData.rounding_required,
        patient_care_pct: values.masterData.patient_care_pct,
        accumulate_fractions: values.masterData.accumulate_fractions || "",
        fraction_weight_priority: values.masterData.fraction_weight_priority,
        facility_id: "",
        created_by: "",
        creation_date: "",
      },
      servicesData: values.servicesData.map((service) => ({
        bed_class_service_id: service.bed_class_service_id || "",
        bed_class_id: 0,
        item_id: service.item_id?.toString() || "",
        payer_id: service.payer_id?.toString() || "",
        from_day: service.from_day,
        to_day: service.to_day,
        time_calculation_basis: service.time_calculation_basis,
        units: service.units || 1,
      })),
    };
  };

  // Format rounding required for display
  const formatRoundingRequired = (value: string) => {
    if (value === "U") return "Up";
    if (value === "D") return "Down";
    return value;
  };

  // Define columns for the table
  const columns: GridColDef[] = [
    // {
    //   field: "bed_class_id",
    //   headerName: "Bed Class ID",
    //   flex: 1,
    //   type: "number",
    // },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      type: "string",
    },
    {
      field: "smallest_number_of_hours",
      headerName: "Smallest Hours",
      flex: 1,
      type: "number",
    },
    {
      field: "rounding_required",
      headerName: "Rounding Required",
      flex: 1,
      type: "string",
      renderCell: (params: any) => formatRoundingRequired(params.value),
    },
    {
      field: "patient_care_pct",
      headerName: "Patient Care %",
      flex: 1,
      type: "number",
      hideable: true,
    },
    {
      field: "accumulate_fractions",
      headerName: "Accumulate Fractions",
      flex: 1,
      type: "string",
      hideable: true,
    },
    {
      field: "fraction_weight_priority",
      headerName: "Weight Priority",
      flex: 1,
      type: "number",
      hideable: true,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "custom",
      sortable: false,
      filterable: false,
      hideable: false,
      hideSortIcons: true,
      disableColumnMenu: true,
      renderHeader: () => (
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={1}
          sx={{ minHeight: 23, height: 23 }}
        >
          <span>Actions</span>
          <Secure.GLIconButton
            resource_key=""
            onClick={handleOpenAddDialog}
            size="small"
            sx={{ width: 23, height: 23, p: 0, borderRadius: 1 }}
          >
            <img
              src={publicUrl(`themes/${mode}/icons/plus.png`)}
              width="15px"
              alt="add"
            />
          </Secure.GLIconButton>
        </Box>
      ),
      renderCell: (params: any) => (
        <Box
          sx={{
            width: "100%",
            minHeight: 23,
            height: 23,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          <Secure.GLIconButton
            resource_key=""
            onClick={() => handleOpenEditDialog(params.row)}
            size="small"
            sx={{ width: 23, height: 23, p: 0, borderRadius: 1 }}
          >
            <img
              src={publicUrl(`themes/${mode}/icons/pen.png`)}
              width="15px"
              alt="edit"
            />
          </Secure.GLIconButton>
          <Secure.GLIconButton
            resource_key=""
            onClick={() => handleDeleteClick(params.row.bed_class_id)}
            size="small"
            sx={{ width: 23, height: 23, p: 0, borderRadius: 1 }}
          >
            <img
              src={publicUrl(`themes/${mode}/icons/delete.png`)}
              width="15px"
              alt="delete"
            />
          </Secure.GLIconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <GlPanelTable
        filterSection={
          <TextField
            size="small"
            placeholder="Search by description..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ display: "block", mx: "auto" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ ml: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", }}>
                    {searchTerm && (
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        sx={{

                          p: 0,
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      sx={{


                        width: 30,
                        height: 30,

                        p: 0.5,
                      }}
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        }

      >
        <GlCustomTable
          enableUnselectRow={false}
          smallSize
          columns={columns}
          url="/api/bed-class/master"
          params={tableParams}
          fetcher={fetcher}
          getRowId={(r) => r?.bed_class_id}
          refetchRef={tableRefreshRef}
          onRowSelected={(r) => {
            setSelectedBedClass(r as any);
          }}
        />
      </GlPanelTable>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Bed Class"
        message={`Deleting this master bed class will also remove all linked services. This operation cannot be undo.`}
        loading={isDeleting}
      />

      <AddMasterWithServicesDialog
        open={openAddDialog}
        onClose={handleCloseDialogs}
        editingServiceIndex={editingServiceIndex}
        onEditService={handleEditService}
        onDeleteService={handleDeleteService}
        getNestedError={getNestedError}
        getNestedTouched={getNestedTouched}
        transformToApiFormat={transformToApiFormat}
        tableRefreshRef={tableRefreshRef}
        serviceTableRef={serviceTableRef}
      />

      <EditMasterDialog
        open={openEditDialog}
        onClose={handleCloseDialogs}
        selectedMaster={selectedMaster}
        tableRefreshRef={tableRefreshRef}
        serviceTableRef={serviceTableRef}
      />
    </Box>
  );
}
