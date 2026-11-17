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
  Stack,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  Grid,
  FormHelperText,
  debounce as muiDebounce,
} from "@mui/material";
import { Formik, Form, FormikProps } from "formik";
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
  BedClassService as BedClassServiceType,
} from "../context/BedClassContext";

import CloseIcon from "@mui/icons-material/Close";

import { DisplayMsgDialog, GlCustomTable, GlPanelTable, Secure } from "@givc/shared-components";
import { GridColDef } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import WarningIcon from "@mui/icons-material/Warning";
import { useParams, useNavigate } from "react-router-dom";
import { t } from "i18next";

const sanitizeNonNegativeNumber = (
  rawValue: string,
  { allowDecimal = false } = {},
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
  if (rawValue.trim() === "") return "";
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

interface ServiceFormValues {
  bed_class_id: number;
  item_id: number | null;
  payer_id: number | null;
  from_day: number;
  to_day: number;
  time_calculation_basis: string;
  units: number;
}

// Validation schema for service
const serviceFormValidationSchema = Yup.object({
  bed_class_id: Yup.number().required("Bed class ID is required"),
  item_id: Yup.number().required("Item ID is required"),
  payer_id: Yup.number().nullable(),
  from_day: Yup.number()
    .min(0, "From day must be >= 0")
    .required("From day is required"),
  to_day: Yup.number()
    .min(Yup.ref("from_day"), "To day must be >= from day")
    .required("To day is required"),
  time_calculation_basis: Yup.string()
    .trim()
    .required("Time calculation basis is required"),
  units: Yup.number()
    .min(1, "Units must be at least 1")
    .required("Units are required"),
});

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
        "Are you sure you want to delete this service? This action cannot be undo."
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
    //         "Are you sure you want to delete this service? This action cannot be undo."}
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
  ({ value, onChange, error, helperText, disabled, editingValue }: any) => {
    const [localItems, setLocalItems] = useState<ItemOption[]>([]);
    const [localLoading, setLocalLoading] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState("");
    const [localPage, setLocalPage] = useState(1);
    const [localHasMore, setLocalHasMore] = useState(true);
    const [selectedValue, setSelectedValue] = useState<ItemOption | null>(null);

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

    // Fetch the selected item when editing
    useEffect(() => {
      const fetchSelectedItem = async () => {
        if (editingValue && !selectedValue) {
          try {
            const { data } = await api.get("/api/payer-code-mapping/items", {
              params: { search: editingValue.toString() },
            });
            const foundItem = data?.data?.find(
              (item: ItemOption) => item.item_id == editingValue,
            );
            if (foundItem) {
              setSelectedValue(foundItem);
            }
          } catch (error) {
            console.error("Error fetching selected item:", error);
          }
        }
      };
      fetchSelectedItem();
    }, [editingValue]);

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
        value={
          selectedValue ||
          localItems.find((item) => item.item_id === value) ||
          null
        }
        onChange={(_, newValue) => {
          setSelectedValue(newValue);
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
  ({ value, onChange, error, helperText, disabled, editingValue }: any) => {
    const [localPayers, setLocalPayers] = useState<PayerOption[]>([]);
    const [localLoading, setLocalLoading] = useState(false);
    const [selectedValue, setSelectedValue] = useState<PayerOption | null>(
      null,
    );

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

    // Fetch the selected payer when editing
    useEffect(() => {
      const fetchSelectedPayer = async () => {
        if (editingValue && !selectedValue) {
          try {
            const { data } = await api.get("/api/agreement-exclusion/payers");
            const foundPayer = data?.data?.find(
              (payer: PayerOption) => payer.payer_id == editingValue,
            );
            if (foundPayer) {
              setSelectedValue(foundPayer);
            }
          } catch (error) {
            console.error("Error fetching selected payer:", error);
          }
        }
      };
      fetchSelectedPayer();
    }, [editingValue]);

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
        value={
          selectedValue ||
          localPayers.find((payer) => payer.payer_id === value) ||
          null
        }
        onChange={(_, newValue) => {
          setSelectedValue(newValue);
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

// Add/Edit Service Dialog Component
const ServiceDialog = React.memo(
  ({ open, onClose, bedClassId, editingService, onSuccess }: any) => {
    const { setIsLoading, setError, addService, updateService } =
      useBedClassContext();
    const isEditing = !!editingService;

    const handleSubmit = async (
      values: ServiceFormValues,
      { setSubmitting, resetForm }: any,
    ) => {
      try {
        setIsLoading(true);
        if (isEditing) {
          await updateService(editingService.bed_class_service_id, {
            item_id: values.item_id?.toString() || null,
            payer_id: values.payer_id?.toString() || null,
            from_day: values.from_day,
            to_day: values.to_day,
            time_calculation_basis: values.time_calculation_basis,
            units: values.units,
          });
          toast.success("Service updated successfully");
        } else {
          await addService({
            bed_class_id: values.bed_class_id,
            item_id: values.item_id?.toString() || null,
            payer_id: values.payer_id?.toString() || null,
            from_day: values.from_day,
            to_day: values.to_day,
            time_calculation_basis: values.time_calculation_basis,
            units: values.units,
          });
          toast.success("Service added successfully");
        }
        resetForm();
        onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.message);
        toast.error(
          err.response?.data?.msg ||
          `Failed to ${isEditing ? "update" : "add"} service`,
        );
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? "Edit Service" : "Add New Service"}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Formik<ServiceFormValues>
          initialValues={{
            bed_class_id: bedClassId,
            item_id: editingService?.item_id
              ? parseInt(editingService.item_id)
              : null,
            payer_id: editingService?.payer_id
              ? parseInt(editingService.payer_id)
              : null,
            from_day: editingService?.from_day || 0,
            to_day: editingService?.to_day || 0,
            time_calculation_basis:
              editingService?.time_calculation_basis || "",
            units: editingService?.units || 1,
          }}
          validationSchema={serviceFormValidationSchema}
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
          }: FormikProps<ServiceFormValues>) => (
            <Form noValidate>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <ServiceItemAutocomplete
                      value={values.item_id}
                      onChange={(newValue: number | null) => {
                        setFieldValue("item_id", newValue);
                      }}
                      error={touched.item_id && !!errors.item_id}
                      helperText={touched.item_id && errors.item_id}
                      editingValue={isEditing ? values.item_id : null}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {/* {values.payer_id} */}
                    <PayerAutocomplete
                      value={values.payer_id}
                      onChange={(newValue: number | null) => {
                        setFieldValue("payer_id", newValue);
                      }}
                      error={touched.payer_id && !!errors.payer_id}
                      helperText={touched.payer_id && errors.payer_id}
                      editingValue={isEditing ? values.payer_id : null}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="from_day"
                      label="From Day"
                      type="number"
                      value={values.from_day}
                      onChange={(e) => {
                        const sanitized = sanitizeNonNegativeNumber(e.target.value);
                        if (sanitized === null) return;
                        setFieldValue("from_day", sanitized);
                      }}
                      onKeyDown={(e) => {
                        if (["-", "+", "e", "E", " "].includes(e.key)) e.preventDefault();
                      }}
                      onBlur={handleBlur}
                      size="small"
                      required
                      inputProps={{ min: 0 }}
                      error={touched.from_day && !!errors.from_day}
                      helperText={touched.from_day && errors.from_day}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="to_day"
                      label="To Day"
                      type="number"
                      value={values.to_day}
                      onChange={(e) => {
                        const sanitized = sanitizeNonNegativeNumber(e.target.value);
                        if (sanitized === null) return;
                        setFieldValue("to_day", sanitized);
                      }}
                      onKeyDown={(e) => {
                        if (["-", "+", "e", "E", " "].includes(e.key)) e.preventDefault();
                      }}
                      onBlur={handleBlur}
                      size="small"
                      required
                      inputProps={{ min: 0 }}
                      error={touched.to_day && !!errors.to_day}
                      helperText={touched.to_day && errors.to_day}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="units"
                      label="Units"
                      type="number"
                      value={values.units}
                      onChange={(e) => {
                        const sanitized = sanitizeNonNegativeNumber(e.target.value);
                        if (sanitized === null) return;
                        setFieldValue("units", sanitized);
                      }}
                      onKeyDown={(e) => {
                        if (["-", "+", "e", "E", " "].includes(e.key)) e.preventDefault();
                      }}
                      onBlur={handleBlur}
                      size="small"
                      required
                      inputProps={{ min: 1 }}
                      error={touched.units && !!errors.units}
                      helperText={touched.units && errors.units}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="time_calculation_basis"
                      label="Time Calculation Basis"
                      value={values.time_calculation_basis}
                      onChange={(e) => {
                        setFieldValue(
                          "time_calculation_basis",
                          sanitizeTextValue(e.target.value),
                        );
                      }}
                      onBlur={handleBlur}
                      size="small"
                      required
                      error={
                        touched.time_calculation_basis &&
                        !!errors.time_calculation_basis
                      }
                      helperText={
                        touched.time_calculation_basis &&
                        errors.time_calculation_basis
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
                  {isEditing ? "Update Service" : "Add Service"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    );
  },
);

export default function BedClassService() {
  const {
    palette: { mode },
  } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [tableParams, setTableParams] = useState({});
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [editingService, setEditingService] =
    useState<BedClassServiceType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bedClassDescription, setBedClassDescription] = useState("");

  const serviceTableRef = useRef<any>();

  const {
    setIsLoading,
    setError,
    deleteService,
    fetchMasterData,
    selectedBedClass,
    resetServiceForm,
  } = useBedClassContext();

  // Fetch bed class description
  useEffect(() => {
    const fetchBedClassInfo = async () => {
      if (selectedBedClass) {
        try {
          const result = await fetchMasterData({
            bed_class_id: selectedBedClass.bed_class_id,
          });
          if (result?.data && result.data.length > 0) {
            setBedClassDescription(result.data[0].description);
          }
        } catch (err) {
          console.error("Error fetching bed class info:", err);
        }
      }
    };
    fetchBedClassInfo();
  }, [selectedBedClass, fetchMasterData]);

  // Debounced search for table
  const debouncedTableSearch = useMemo(
    () =>
      muiDebounce((value: string) => {
        setTableParams({
          search: value,
          bed_class_id: selectedBedClass?.bed_class_id,
        });
      }, DEBOUNCE_DELAY),
    [selectedBedClass],
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedTableSearch(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    debouncedTableSearch("");
  };

  const handleOpenAddDialog = () => {
    if (!selectedBedClass?.bed_class_id) return;
    setEditingService(null);
    setOpenServiceDialog(true);
  };

  const handleOpenEditDialog = (service: BedClassServiceType) => {
    setEditingService(service);
    setOpenServiceDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenServiceDialog(false);
    setEditingService(null);
  };

  const handleDialogSuccess = () => {
    serviceTableRef.current?.();
  };

  // Handle delete service - open confirmation dialog
  const handleDeleteClick = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete service
  const handleConfirmDelete = async () => {
    if (serviceToDelete) {
      setIsDeleting(true);
      try {
        await deleteService(serviceToDelete);
        toast.success("Service deleted successfully");
        serviceTableRef.current?.();
        setDeleteDialogOpen(false);
        setServiceToDelete(null);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.response?.data?.msg || "Failed to delete service");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Define columns for the table
  const columns: GridColDef[] = [
    {
      field: "bed_class_service_id",
      headerName: "Service ID",
      //   flex: 1,
      display: "flex",
      type: "number",
    },
    {
      field: "item_description",
      display: "flex",
      headerName: "Item",
      flex: 1,
      type: "string",
    },
    {
      field: "payer_name",
      display: "flex",
      headerName: "Payer",
      flex: 1,
      type: "string",
    },
    {
      field: "from_day",
      headerName: "From Day",
      //   flex: 1,
      display: "flex",
      type: "number",
    },
    {
      field: "to_day",
      display: "flex",
      headerName: "To Day",
      //   flex: 1,
      type: "number",
    },
    {
      field: "units",
      display: "flex",
      headerName: "Units",
      //   flex: 0.5,
      type: "number",
    },
    {
      field: "time_calculation_basis",
      display: "flex",
      headerName: "Time Calculation Basis",
      //   flex: 2,
      type: "string",
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
      //   flex: 1,
      renderHeader: () => (
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={1}
          sx={{ minHeight: 23, height: 23 }}
        >
          <span>Actions</span>
          {selectedBedClass?.bed_class_id && (
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
          )}
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
            onClick={() => handleDeleteClick(params.row.bed_class_service_id)}
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
      <GlPanelTable>
        <GlCustomTable
          enableUnselectRow={false}
          columns={columns}
          url="/api/bed-class/services"
          params={{
            ...tableParams,
            bed_class_id: selectedBedClass?.bed_class_id ?? -1,
          }}
          fetcher={fetcher}
          getRowId={(r) => r?.bed_class_service_id}
          refetchRef={serviceTableRef}
        />
      </GlPanelTable>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undo."
        loading={isDeleting}
      />

      <ServiceDialog
        open={openServiceDialog}
        onClose={handleCloseDialogs}
        bedClassId={selectedBedClass?.bed_class_id ?? 0}
        editingService={editingService}
        onSuccess={handleDialogSuccess}
      />
    </Box>
  );
}
