import { useEffect, useState, useMemo, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Grid,
  Button,
  debounce,
} from "@mui/material";
import GenericDialog from "../../components/genericDialog/GenericDialog";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import api from "../../utils/Api";
import { toast } from "react-toastify";

interface PayerCodeMappingDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
  selectedPayerId?: any;
}

const validationSchema = Yup.object({
  payer_id: Yup.number().required("Payer is required"),
  item_id: Yup.number().required("Item is required"),
  payer_code: Yup.string().required("Payer Code is required"),
  payer_desc: Yup.string().required("Payer Description is required"),
});

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 300;
// Items per page for pagination
const ITEMS_PER_PAGE = 50;

export default function PayerCodeMappingDialog({
  open,
  onClose,
  onSuccess,
  editData,
  selectedPayerId: propSelectedPayerId,
}: PayerCodeMappingDialogProps) {
  const [loading, setLoading] = useState(false);

  // Data states
  const [payers, setPayers] = useState<any[]>([]);
  const [payersLoading, setPayersLoading] = useState(false);
  
  // Optimized items state with pagination/search
  const [items, setItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsSearchTerm, setItemsSearchTerm] = useState("");
  const [itemsPage, setItemsPage] = useState(1);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const isEdit = !!editData;

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        setItemsPage(1);
        setItems([]);
        fetchItems(searchValue, 1);
      }, DEBOUNCE_DELAY),
    []
  );

  useEffect(() => {
    if (propSelectedPayerId && payers.length > 0 && !isEdit) {
      console.log("propSelectedPayerId", propSelectedPayerId);
      formik.setFieldValue("payer_id", propSelectedPayerId);
    }
  }, [propSelectedPayerId, payers, isEdit]);

  // Fetch payers (small dataset - no optimization needed)
  const fetchPayers = async () => {
    setPayersLoading(true);
    try {
      const { data } = await api.get("/api/agreement-exclusion/payers");
      setPayers(data?.data || []);
    } catch (error) {
      console.error("Error fetching payers:", error);
    } finally {
      setPayersLoading(false);
    }
  };

  // Optimized fetch items with search and pagination
  const fetchItems = async (search: string = "", page: number = 1) => {
    setItemsLoading(true);
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
      
      setTotalItems(total);
      setHasMoreItems(page * ITEMS_PER_PAGE < total);
      
      if (page === 1) {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setItemsLoading(false);
    }
  };

  // Load more items when scrolling
  const handleLoadMore = () => {
    if (!itemsLoading && hasMoreItems) {
      const nextPage = itemsPage + 1;
      setItemsPage(nextPage);
      fetchItems(itemsSearchTerm, nextPage);
    }
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setItemsSearchTerm(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    if (open) {
      fetchPayers();
      if (!isEdit) {
      fetchItems();
      }else if (isEdit && editData.item_id) {
        // If in edit mode, fetch the specific item to ensure it's in the list
        fetchItems(editData.item_id, 1); 
      }
    }
    
    // Cleanup debounce on unmount
    return () => {
      debouncedSearch.clear();
    };
  }, [open]);

  const formik = useFormik({
    initialValues: {
      payer_id: editData?.payer_id || "",
      item_id: editData?.item_id || null,
      payer_code: editData?.payer_code || "",
      payer_desc: editData?.payer_desc || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const url = isEdit
          ? `/api/payer-code-mapping/${editData.mapping_id}`
          : "/api/payer-code-mapping";
        const method = isEdit ? "put" : "post";

        await api[method](url, values);
        toast.success(`Successfully ${isEdit ? "updated" : "added"} payer code mapping`);
        onSuccess();
        handleClose();
      } catch (error) {
        console.error("Error saving payer code mapping:", error);
        toast.error(
          `Failed to ${isEdit ? "update" : "add"} payer code mapping - ${
            error?.response?.data?.error || error?.message || "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setItemsSearchTerm("");
    setItemsPage(1);
    setItems([]);
    onClose();
  };

  const findSelectedPayer = () => {
    const payerId = formik.values.payer_id;
    if (!payerId) return null;
    return payers.find((p) => p.payer_id === payerId);
  };

  const findSelectedItem = () => {
    const itemId = formik.values.item_id;
    if (!itemId) return null;
    return items.find((i) => i.item_id === itemId);
  };

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit Payer Code Mapping" : "Add Payer Code Mapping"}
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
      content={
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Payer Autocomplete */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={payers}
                disabled
                loading={payersLoading}
                value={findSelectedPayer()}
                onChange={(event, newValue) => {
                  formik.setFieldValue("payer_id", newValue?.payer_id);
                }}
                getOptionLabel={(option) =>
                  `${option.payer_id} - ${option.description || option.short_name}`
                }
                isOptionEqualToValue={(option, value) =>
                  option.payer_id === value?.payer_id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="payer_id"
                    label="Payer"
                    required
                    error={
                      formik.touched.payer_id && Boolean(formik.errors.payer_id)
                    }
                    helperText={
                      formik.touched.payer_id && formik.errors.payer_id
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {payersLoading && (
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

            {/* Optimized Item Autocomplete with Virtual Scroll */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={items}
                loading={itemsLoading}
                value={findSelectedItem()}
                disabled={isEdit && formik.values.item_id} // Optional: disable if already set in edit mode
                onChange={(event, newValue) => {
                  formik.setFieldValue("item_id", newValue?.item_id || null);
                }}
                getOptionLabel={(option) =>
                  `${option.item_id} - ${option.description} (${option.category_code})`
                }
                isOptionEqualToValue={(option, value) =>
                  option.item_id === value?.item_id
                }
                filterOptions={(x) => x} // Disable client-side filtering
                onInputChange={(event, value, reason) => {
                  if (reason === 'input') {
                    handleSearchChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
                ListboxProps={{
                  onScroll: (event: React.UIEvent<HTMLDivElement>) => {
                    const listbox = event.currentTarget;
                    const scrollBottom = listbox.scrollHeight - listbox.scrollTop - listbox.clientHeight;
                    if (scrollBottom < 50 && !itemsLoading && hasMoreItems) {
                      handleLoadMore();
                    }
                  },
                  style: { maxHeight: 300 },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="item_id"
                    label="Item"
                    required
                    placeholder="Type to search..."
                    error={
                      formik.touched.item_id && Boolean(formik.errors.item_id)
                    }
                    helperText={formik.touched.item_id && formik.errors.item_id}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {itemsLoading && (
                            <CircularProgress color="inherit" size={20} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              {/* Optional: Show total items count
              {totalItems > 0 && (
                <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5, ml: 1.5 }}>
                  {totalItems} total items available
                </Box>
              )} */}
            </Grid>

            {/* Payer Code */}
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                name="payer_code"
                label="Payer Code"
                required
                value={formik.values.payer_code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.payer_code && Boolean(formik.errors.payer_code)
                }
                helperText={
                  formik.touched.payer_code && formik.errors.payer_code
                }
              />
            </Grid>

            {/* Payer Description */}
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                name="payer_desc"
                label="Payer Description"
                required
                multiline
                rows={2}
                value={formik.values.payer_desc}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.payer_desc && Boolean(formik.errors.payer_desc)
                }
                helperText={
                  formik.touched.payer_desc && formik.errors.payer_desc
                }
              />
            </Grid>
          </Grid>

          {/* Dialog Actions */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
          >
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={() => formik.handleSubmit()}
              variant="contained"
              disabled={loading || !formik.isValid}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : isEdit ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </Box>
        </Box>
      }
    />
  );
}