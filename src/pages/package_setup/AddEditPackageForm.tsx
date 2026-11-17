// import React, { useEffect, useState } from "react";
// import { Formik, Form, Field, FieldProps } from "formik";
// import { TextField, Button, Box, Typography, Autocomplete, RadioGroup, FormControlLabel, Radio } from "@mui/material";
// import { useAppSelector } from "../../hooks/hooks";
// import axios from "../../utils/Api";
// import ItemSelect, { ItemOption } from "../../components/paged-autocomplete/ItemSelect";

// interface AddEditPackageFormProps {
//   initialValues: any;
//   onSubmit: (values: any) => void;
//   onClose: () => void;
//   error?: string;
//   isUpdate: boolean;
// }
// interface Item {
//   id: number;
//   description: string;
//   category_code: string;
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

// const AddEditPackageForm: React.FC<AddEditPackageFormProps> = ({ initialValues, onSubmit, onClose, error, isUpdate }) => {
//   const payers = useAppSelector((state) => state.package.payers) || [];
//   const [items, setItems] = useState<Item[]>([]);

//   // ✅ local state to hold selected item option for Autocomplete
//   const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null);

//   const validateForm = (values: any) => {
//     const errors: any = {};
//     if (!values.item_id) errors.item_id = "Item is required";
//    // if (!values.payer_id) errors.payer_id = "Payer is required";
//     if (!values.relation) errors.relation = "Relation is required";
//     return errors;
//   };

//   return (
//     <Box sx={{ maxWidth: 600, p: 2 }}>
//       {error && (
//         <Typography sx={{ color: "red" }} variant="body2" mb={2}>
//           {error}
//         </Typography>
//       )}

//       {/* Key forces full reset when switching between create/edit or rows */}
//       <Formik key={isUpdate ? initialValues?.id ?? "Update" : "Set UP"} enableReinitialize initialValues={{ ...emptyInit, ...initialValues }} validate={validateForm} onSubmit={onSubmit}>
//         {({ values, setFieldValue, errors, touched }) => {
//           const itemValue = items.find((i) => String(i.id) === String(values.item_id)) || null;
//           const payerValue = payers.find((p) => String(p.id) === String(values.payer_id)) || null;

//           return (
//             <Form>
//               {/* <Box mb={3}>
//                 <Typography sx={{ color: "custom.light" }} variant="body1" fontWeight="bold" gutterBottom>
//                   Item *
//                 </Typography>

//                 {!isUpdate ? (
//                   <Field name="item_id">
//                     {() => (
//                       <Autocomplete<Item, false, false, false>
//                         options={items}
//                         loading={!items.length}
//                         value={itemValue}
//                         onChange={(_, newValue) => setFieldValue("item_id", newValue?.id ?? null)}
//                         isOptionEqualToValue={(opt, val) => opt.id === val.id}
//                         getOptionLabel={(opt) => (opt && typeof opt === "object" ? `${opt.id ?? ""} - ${opt.description ?? ""}`.trim() : "")}
//                         onInputChange={(_, inputValue, reason) => {
//                           if (reason === "input" && inputValue.trim().length > 1) {
//                             if (!values.category_code && !values.sub_category_code) {
//                               axios.get(`/api/itemgroup/items?search=${encodeURIComponent(inputValue)}`).then((res) => setItems(res.data.data || []));
//                             }
//                           }
//                         }}
//                         renderInput={(params) => (
//                           <TextField {...params} color="whiteField" placeholder="Item" error={touched.item_id && !!errors.item_id} helperText={touched.item_id && errors.item_id} />
//                         )}
//                       />
//                     )}
//                   </Field>
//                 ) : (
//                   <Box
//                     sx={{
//                       p: 1.5,
//                       border: "1px solid",
//                       borderColor: "divider",
//                       borderRadius: 1,
//                       bgcolor: "background.paper",
//                     }}>
//                     <Typography variant="body2" color="text.primary">
//                       {`${values.item_id} - ${values.package_name}`}
//                     </Typography>
//                   </Box>
//                 )}
//               </Box> */}
//               <Box mb={3}>
//                 <Typography sx={{ color: "custom.light" }} variant="body1" fontWeight="bold" gutterBottom>
//                   Package *
//                 </Typography>

//                 {!isUpdate ? (
//                   <ItemSelect
//                     typeId={"P"} // 👈 use your type (you had "/items/types/P")
//                     value={selectedItem}
//                     onChange={(opt) => {
//                       setSelectedItem(opt);
//                       setFieldValue("item_id", opt?.id ?? null);
//                     }}
//                     placeholder="Select ... "
//                   />
//                 ) : (
//                   <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.paper" }}>
//                     <Typography variant="body2" color="text.primary">
//                       {`${values.item_id} - ${values.package_name}`}
//                     </Typography>
//                   </Box>
//                 )}

//                 {!isUpdate && touched.item_id && errors.item_id && (
//                   <Typography variant="caption" color="error">
//                     {errors.item_id}
//                   </Typography>
//                 )}
//               </Box>

//               {/* Payer */}
//               {/* <Box mb={3}>
//                 <Typography sx={{ color: "custom.light" }} variant="body1" fontWeight="bold" gutterBottom>
//                   Payer *
//                 </Typography>
//                 <Field name="payer_id">
//                   {() => (
//                     <Autocomplete
//                       options={payers}
//                       loading={!payers.length}
//                       value={payerValue}
//                       onChange={(_, newValue) => setFieldValue("payer_id", newValue?.id ?? null)}
//                       isOptionEqualToValue={(opt: any, val: any) => opt.id === val.id}
//                       getOptionLabel={(p: any) => (p && typeof p === "object" ? `${p.id ?? ""} - ${p.name ?? ""}`.trim() : "")}
//                       renderInput={(params) => (
//                         <TextField {...params} placeholder="Select or search payer..." error={touched.payer_id && !!errors.payer_id} helperText={touched.payer_id && errors.payer_id} />
//                       )}
//                     />
//                   )}
//                 </Field>
//               </Box> */}

//               {/* Status */}
//               {isUpdate && (

//                 <Box mb={3}>
//                   <Typography sx={{ color: "custom.light" }} variant="body1" fontWeight="bold" gutterBottom>
//                     Status *
//                   </Typography>
//                   <Field name="status">
//                     {({ field }: FieldProps) => (

//                       <RadioGroup  row {...field} value={field.value ?? ""} onChange={field.onChange} >
//                         {/* {field.value} */}
//                         <FormControlLabel  value="ACTIVE" control={<Radio />} label="Active" />
//                         <FormControlLabel  value="INACTIVE" control={<Radio />} label="Inactive" />
//                       </RadioGroup>
//                     )}
//                   </Field>
//                   {touched.status && errors.status && (
//                     <Typography variant="caption" color="error">
//                       {errors.status}
//                     </Typography>
//                   )}
//                 </Box>
//               )}

//               {/* Limits */}
//               <Box mb={3}>
//                 <Typography sx={{ color: "custom.light" }} variant="body1" fontWeight="bold" gutterBottom>
//                   Limit Quantity
//                 </Typography>
//                 <Field name="limit_quantity">
//                   {({ field }: FieldProps) => (
//                     <TextField
//                       {...field}
//                       type="number"
//                       fullWidth
//                       variant="outlined"
//                       placeholder="Enter limit quantity"
//                       value={field.value ?? ""} // handles null from API
//                     />
//                   )}
//                 </Field>
//               </Box>

//               <Box mb={3}>
//                 <Typography sx={{ color: "custom.light" }} variant="body1" fontWeight="bold" gutterBottom>
//                   Limit Amount
//                 </Typography>
//                 <Field name="limit_amount">
//                   {({ field }: FieldProps) => <>
//                   {/* {field.value} */}
//                   <TextField {...field} type="number" fullWidth variant="outlined" placeholder="Enter limit amount" value={field.value ?? ""} />
//                   </>}
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
