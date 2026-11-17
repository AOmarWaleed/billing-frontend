// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Formik, Form, Field, FieldProps } from "formik";
// import { TextField, Button, Box, Typography, Autocomplete, RadioGroup, FormControlLabel, Radio } from "@mui/material";
// import { useAppSelector } from "../../hooks/hooks";
// import axios from "../../utils/Api";

// interface AddEditPackageFormProps {
//   initialValues: any;
//   onSubmit: (values: any) => void;
//   onClose: () => void;
//   error?: string;
//   isUpdate: boolean;
//   mode: "limited" | "excluded" | "category"; // determines fetching behavior
//   parentPackageId: number;
// }

// interface Item {
//   id: number;
//   description: string;
//   category_code: string | null;
//   subCategory: string;
// }

// const emptyInit = {
//   item_id: null,
//   payer_id: null,
//   relation: "",
//   limit_quantity: "",
//   limit_amount: "",
//   limit_day_amount: "",
// };

// const AddEditPackageForm: React.FC<AddEditPackageFormProps> = ({ initialValues, onSubmit, onClose, error, isUpdate, mode, parentPackageId }) => {
//   const payers = useAppSelector((state) => state.package.payers) || [];
//   const catgory = useAppSelector((state) => state.package.payers) || [];
//   const [items, setItems] = useState<Item[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);

//   // Build query params per mode
//   const baseParams = useMemo(() => {
//     const params: Record<string, any> = { limit: 1000 };
//     if (mode === "limited" || mode === "excluded") {
//       params.include_null_category = true;
//       params.include_null_subcategory = true;
//     }
//     return params;
//   }, [mode]);

//   // Shared fetcher (initial & search)
//   const fetchItems = async (search?: string) => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`/api/itemgroup/items`, {
//         params: {
//           ...baseParams,
//           ...(search ? { search } : {}),
//         },
//       });
//       const all: Item[] = res.data?.data ?? [];
//       // Always exclude the parent
//       setItems(all.filter((i) => i.id !== parentPackageId));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     fetchItems();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [baseParams, parentPackageId]);

//   // Form validation
//   const validateForm = (values: any) => {
//     const errors: any = {};
//     if (!values.item_id) errors.item_id = "Item is required";
//     if (mode === "category" && !values.relation) errors.relation = "Relation is required";
//     return errors;
//   };

//   // Debounced search control
//   const searchTimer = useRef<number | null>(null);
//   const handleSearch = (text: string) => {
//     if (searchTimer.current) window.clearTimeout(searchTimer.current);
//     searchTimer.current = window.setTimeout(() => fetchItems(text), 300);
//   };

//   return (
//     <Box sx={{ maxWidth: 600, p: 2 }}>
//       {error && (
//         <Typography sx={{ color: "red" }} variant="body2" mb={2}>
//           {error}
//         </Typography>
//       )}

//       <Formik key={isUpdate ? initialValues?.id ?? "edit" : "create"} enableReinitialize initialValues={{ ...emptyInit, ...initialValues }} validate={validateForm} onSubmit={onSubmit}>
//         {({ values, setFieldValue, errors, touched }) => {
//           // Set relation automatically for limited/excluded (without mutating props)
//           useEffect(() => {
//             if (mode === "limited") setFieldValue("relation", "INCLUDE", false);
//             if (mode === "excluded") setFieldValue("relation", "EXCLUDE", false);
//             if (mode === "category" && !values.relation) setFieldValue("relation", "", false);
//             // eslint-disable-next-line react-hooks/exhaustive-deps
//           }, [mode]);

//           const itemValue = items.find((i) => String(i.id) === String(values.item_id)) || null;
//           const payerValue = payers.find((p: any) => String(p.id) === String(values.payer_id)) || null;

//           return (
//             <Form>
//               {/* Item */}
//               {!isUpdate ? (<Box mb={3}>
//                 <Typography sx={{ color: "custom.light" }} variant="body1" fontWeight="bold" gutterBottom>
//                   Item *
//                 </Typography>
//                 <Field name="item_id">
//                   {() => (
//                     <Autocomplete<Item, false, false, false>
//                       options={items}
//                       loading={loading}
//                       value={itemValue}
//                       onChange={(_, newValue) => setFieldValue("item_id", newValue?.id ?? null)}
//                       isOptionEqualToValue={(opt, val) => opt.id === val.id}
//                       getOptionLabel={(opt) => (opt && typeof opt === "object" ? `${opt.id ?? ""} - ${opt.description ?? ""}`.trim() : "")}
//                       onInputChange={(_, inputValue, reason) => {
//                         if (reason === "input" && inputValue.trim().length > 1) handleSearch(inputValue.trim());
//                       }}
//                       renderInput={(params) => <TextField {...params} placeholder="Item" error={touched.item_id && !!errors.item_id} helperText={touched.item_id && errors.item_id} />}
//                     />
//                   )}
//                 </Field>
//               </Box>) : (
//                   <Box
//                                     sx={{
//                                       p: 1.5,
//                                       border: "1px solid",
//                                       borderColor: "divider",
//                                       borderRadius: 1,
//                                       bgcolor: "background.paper",
//                                     }}>
//                                     <Typography variant="body2" color="text.primary">
//                                       {`${values.item_id} - ${values.package_name}`}
//                                     </Typography>
//                                   </Box>
//               )}
              

//        {/* Relation */}
// <Box mb={3}>
//   <Typography sx={{ color: "custom.light" }} variant="body1" fontWeight="bold" gutterBottom>
//     Relation *
//   </Typography>
//   {isUpdate ? (
//     // 🔓 Edit mode → always editable
//     <Field name="relation">
//       {({ field }: FieldProps) => (
//         <RadioGroup row {...field} value={field.value ?? ""} onChange={field.onChange}>
//           <FormControlLabel sx={{ color: "custom.light" }} value="INCLUDE" control={<Radio />} label="Include" />
//           <FormControlLabel sx={{ color: "custom.light" }} value="EXCLUDE" control={<Radio />} label="Exclude" />
//         </RadioGroup>
//       )}
//     </Field>
//   ) : mode === "category" ? (
//     // Add mode + category → user chooses
//     <Field name="relation">
//       {({ field }: FieldProps) => (
//         <RadioGroup row {...field} value={field.value ?? ""} onChange={field.onChange}>
//           <FormControlLabel sx={{ color: "custom.light" }} value="INCLUDE" control={<Radio />} label="Include" />
//           <FormControlLabel sx={{ color: "custom.light" }} value="EXCLUDE" control={<Radio />} label="Exclude" />
//         </RadioGroup>
//       )}
//     </Field>
//   ) : (
//     // Add mode + limited/excluded → fixed
//     <Typography variant="caption" color="custom.light">
//       Relation: <strong>{mode === "limited" ? "INCLUDE" : "EXCLUDE"}</strong>
//     </Typography>
//   )}

//   {touched.relation && errors.relation && (
//     <Typography variant="caption" color="error">
//       {errors.relation}
//     </Typography>
//   )}
// </Box>

//               {/* Limits */}
//               <Box mb={3}>
//                 <Typography sx={{ color: "custom.light" }} variant="body1" fontWeight="bold" gutterBottom>
//                   Limit Quantity
//                 </Typography>
//                 <Field name="limit_quantity">
//                   {({ field }: FieldProps) => <TextField {...field} type="number" fullWidth variant="outlined" placeholder="Enter limit quantity" value={field.value ?? ""} />}
//                 </Field>
//               </Box>

//               <Box mb={3}>
//                 <Typography sx={{ color: "custom.light" }} variant="body1" fontWeight="bold" gutterBottom>
//                   Limit Amount
//                 </Typography>
//                 <Field name="limit_amount">
//                   {({ field }: FieldProps) => <TextField {...field} type="number" fullWidth variant="outlined" placeholder="Enter limit amount" value={field.value ?? ""} />}
//                 </Field>
//               </Box>

//               <Box mb={3}>
//                 <Typography sx={{ color: "custom.light" }} variant="body1" fontWeight="bold" gutterBottom>
//                   Day Limit
//                 </Typography>
//                 <Field name="limit_day_amount">
//                   {({ field }: FieldProps) => <TextField {...field} type="number" fullWidth variant="outlined" placeholder="Enter day limit" value={field.value ?? ""} />}
//                 </Field>
//               </Box>

//               {/* Actions */}
//               {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}

//               <Box display="flex" justifyContent="flex-end" gap={2}>
//                 <Button variant="outlined" onClick={onClose}>
//                   Cancel
//                 </Button>
//                 <Button type="submit" variant="contained" color="primary">
//                   {isUpdate ? "Update" : "Create"}
//                 </Button>
//               </Box>
//             </Form>
//           );
//         }}
//       </Formik>
//     </Box>
//   );
// };

// export default AddEditPackageForm;
