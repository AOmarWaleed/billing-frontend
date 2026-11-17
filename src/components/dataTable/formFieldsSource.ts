

export const dataFormItemsComponent = [
   
    
    {
        id: "description",
        name: "description",
        label: "Description",
        type: "text",
        value: "",
        comtype: ""
    },
    {
        id: "long_description",
        name: "long_description",
        label: "Long Description",
        type: "text",
        value: "",
        comtype: ""
    },
    {
        id: "item_bk",
        name: "item_bk",
        label: "Item BK",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "legacy_code",
        name: "legacy_code",
        label: "Legacy Code",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "category_code",
        name: "category_code",
        label: "Category Code",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "sub_category_code",
        name: "sub_category_code",
        label: "Sub Category Code",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "generic_id",
        name: "generic_id",
        label: "Generic ID",
        type: "number",
        value: 0,
        comtype: ""
    },
    {
        id: "item_type",
        name: "item_type",
        label: "Item Type",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "pharmacy_type",
        name: "pharmacy_type",
        label: "Pharmacy Type",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "orderable",
        name: "orderable",
        label: "Orderable",
        type: "text",
        value:"",
        comtype: ""
    },
    {
        id: "inventory",
        name: "inventory",
        label: "Inventory",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "inventory_price",
        name: "inventory_price",
        label: "Inventory Price",
        type: "text",
        value:"",
        comtype: ""
    },
    {
        id: "stocked_uom_code",
        name: "stocked_uom_code",
        label: "Stocked UOM Code",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "sales_uom_code",
        name: "sales_uom_code",
        label: "Sales UOM Code",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "sales_conv_factor",
        name: "sales_conv_factor",
        label: "Sales Conversion Factor",
        type: "number",
        value: 0,
        comtype: ""
    },
    {
        id: "product_ind",
        name: "product_ind",
        label: "Product Indicator",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "activity_indicator",
        name: "activity_indicator",
        label: "Activity Indicator",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "stocked_indicator",
        name: "stocked_indicator",
        label: "Stocked Indicator",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "image_id",
        name: "image_id",
        label: "Image ID",
        type: "number",
        value: 0,
        comtype: ""
    },
    {
        id: "brand_generic_id",
        name: "brand_generic_id",
        label: "Brand Generic ID",
        type: "number",
        value: 0,
        comtype: ""
    },
    {
        id: "external_doctor_price_editable",
        name: "external_doctor_price_editable",
        label: "External Doctor Price Editable",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "standard_price_editable",
        name: "standard_price_editable",
        label: "Standard Price Editable",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "national_drug_code",
        name: "national_drug_code",
        label: "National Drug Code",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "vat_cat_type",
        name: "vat_cat_type",
        label: "VAT Category Type",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "nphies_service_type",
        name: "nphies_service_type",
        label: "NPHIES Service Type",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "drug_dispensing_type",
        name: "drug_dispensing_type",
        label: "Drug Dispensing Type",
        type: "text",
        value: "", comtype: ""
    },
    {
        id: "scientific_code",
        name: "scientific_code",
        label: "Scientific Code",
        type: "text",
        value: "", comtype: "" 
    },
    {
        id: "created_by",
        name: "created_by",
        label: "Created By",
        type: "number",
        value: 0,
        comtype: ""
    },
    {
        id: "creation_date",
        name: "creation_date",
        label: "Creation Date",
        type: "datetime-local",
        value: "", 
        comtype: ""
    },
    {
        id: "modified_by",
        name: "modified_by",
        label: "Modified By",
        type: "number",
        value: 0,
        comtype: ""
    },
    {
        id: "modification_date",
        name: "modification_date",
        label: "Modification Date",
        type: "datetime-local",
        value: "", comtype: ""
    },
];

export const dataFormAddItem = [
    {
        description: '',long_description: '',item_bk :'', legacy_code: '',category_code: '',
        sub_category_code: '', generic_id: '',
        item_type: ' ', pharmacy_type: '', orderable: '',inventory: '',
        inventory_price: '', stocked_uom_code: '',
        sales_uom_code: '',sales_conv_factor: '',product_ind: '',activity_indicator: '',
        image_id: '', brand_generic_id: '',external_doctor_price_editable:'',
        standard_price_editable:'',national_drug_code:'',vat_cat_type:'',nphies_service_type:'',
        drug_dispensing_type:'',scientific_code:'',created_by:'',creation_date:'',
        modified_by:'',modification_date:''
    }
];
// Items cols in details section
export const dataItemsComponent = [
   
    
    {
        id: "description",
        name: "description",
        label: "Description",
        type: "label",
        value: "",
        comtype: "label"
    },
    {
        id: "long_description",
        name: "long_description",
        label: "Long Description",
        type: "text",
        value: "",
        comtype: "label"
    },
    {
        id: "item_type",
        name: "item_type",
        label: "Item Type",
        type: "text",
        value: "",
        comtype: "checkbox"
    },
    {
        id: "generic_id",
        name: "generic_id",
        label: "Generic ID",
        type: "number",
        value: 0,
        comtype: "label"
    },
    
  
    {
        id: "item_bk",
        name: "item_bk",
        label: "Item BK",
        type: "text",
        value: "",
        comtype: "label"
    },
    {
        id: "pharmacy_type",
        name: "pharmacy_type",
        label: "Pharmacy Type",
        type: "text",
        value: "",
        comtype: "checkbox"
    },
    {
        id: "legacy_code",
        name: "legacy_code",
        label: "Legacy Code",
        type: "text",
        value: "",
        comtype: "label"
    },
    {
        id: "category_code",
        name: "category_code",
        label: "Category Code",
        type: "text",
        value: "",
        comtype: "label"
    },
    {
        id: "orderable",
        name: "orderable",
        label: "Orderable",
        type: "text",
        value:"",
        comtype: "checkbox"
    },
   
    {
        id: "sub_category_code",
        name: "sub_category_code",
        label: "Sub Category Code",
        type: "text",
        value: "",
        comtype: "label"
    },
    {
        id: "inventory_price",
        name: "inventory_price",
        label: "Inventory Price",
        type: "text",
        value:"",
        comtype: "label"
    },
    {
        id: "inventory",
        name: "inventory",
        label: "Inventory",
        type: "text",
        value: "",
        comtype: "checkbox"
    },
    {
        id: "stocked_uom_code",
        name: "stocked_uom_code",
        label: "Stocked UOM Code",
        type: "text",
        value: "",
        comtype: "label"
    },
  
    {
        id: "sales_uom_code",
        name: "sales_uom_code",
        label: "Sales UOM Code",
        type: "text",
        value: "",
        comtype: "label"
    },
    {
        id: "stocked_indicator",
        name: "stocked_indicator",
        label: "Stocked Indicator",
        type: "text",
        value: "",
        comtype: "checkbox"
    },
    {
        id: "sales_conv_factor",
        name: "sales_conv_factor",
        label: "Sales Conversion Factor",
        type: "number",
        value: 0,
        comtype: "label"
    },
    {
        id: "product_ind",
        name: "product_ind",
        label: "Product Indicator",
        type: "text",
        value: "",
        comtype: "label"
    },
    {
        id: "external_doctor_price_editable",
        name: "external_doctor_price_editable",
        label: "External Doctor Price Editable",
        type: "text",
        value: "",
        comtype: "checkbox"
    },
   
    {
        id: "activity_indicator",
        name: "activity_indicator",
        label: "Activity Indicator",
        type: "text",
        value: "",
        comtype: "label"
    },
  
    {
        id: "image_id",
        name: "image_id",
        label: "Image ID",
        type: "number",
        value: 0,
        comtype: "label"
    },
    {
        id: "standard_price_editable",
        name: "standard_price_editable",
        label: "Standard Price Editable",
        type: "text",
        value: "",
        comtype: "checkbox"
    },
    {
        id: "brand_generic_id",
        name: "brand_generic_id",
        label: "Brand Generic ID",
        type: "number",
        value: 0,
        comtype: "label"
    },
   
    {
        id: "national_drug_code",
        name: "national_drug_code",
        label: "National Drug Code",
        type: "text",
        value: "",
        comtype: "label"
    },
    {
        id: "vat_cat_type",
        name: "vat_cat_type",
        label: "VAT Category Type",
        type: "text",
        value: "",
        comtype: "label"
    },
   
    {
        id: "nphies_service_type",
        name: "nphies_service_type",
        label: "NPHIES Service Type",
        type: "text",
        value: "",
        comtype: "label"
    },
    
   
    {
        id: "drug_dispensing_type",
        name: "drug_dispensing_type",
        label: "Drug Dispensing Type",
        type: "text",
        value: "",
        comtype: "label"
    },
    {
        id: "scientific_code",
        name: "scientific_code",
        label: "Scientific Code",
        type: "text",
        value: "",
        comtype: "label"
    },
    {
        id: "created_by",
        name: "created_by",
        label: "Created By",
        type: "number",
        value: 0,
        comtype: "label"
    },
   
   
 
    {
        id: "creation_date",
        name: "creation_date",
        label: "Creation Date",
        type: "datetime-local",
        value: "",
        comtype: "label"
    },
    {
        id: "modified_by",
        name: "modified_by",
        label: "Modified By",
        type: "number",
        value: 0,
        comtype: "label"
    },
    {
        id: "modification_date",
        name: "modification_date",
        label: "Modification Date",
        type: "datetime-local",
        value: "",
        comtype: "label"
    },
];


export const dataFormPayersComponent = [


{
    id: "payer_bk",
    name: "payer_bk",
    label: "Payer BK",
    type: "text",
    value: "",
},
{
    id: "description",
    name: "description",
    label: "Description",
    type: "text",
    value: "",
},
{
    id: "address_1",
    name: "address_1",
    label: "Address 1",
    type: "text",
    value: "",
},
{
    id: "address_2",
    name: "address_2",
    label: "Address 2",
    type: "text",
    value: "",
},
{
    id: "address_3",
    name: "address_3",
    label: "Address 3",
    type: "text",
    value: "",
},
{
    id: "address_4",
    name: "address_4",
    label: "Address 4",
    type: "text",
    value: "",
},
{
    id: "tel_no",
    name: "tel_no",
    label: "Telephone Number",
    type: "text",
    value: "",
},
{
    id: "contact",
    name: "contact",
    label: "Contact",
    type: "text",
    value: "",
},
{
    id: "email_address",
    name: "email_address",
    label: "Email Address",
    type: "text",
    value: "",
},
{
    id: "eligibility_no_days",
    name: "eligibility_no_days",
    label: "Eligibility No. Days",
    type: "number",
    value: 0,
},
{
    id: "eligibility_no_visits",
    name: "eligibility_no_visits",
    label: "Eligibility No. Visits",
    type: "number",
    value: 0,
},
{
    id: "price_date",
    name: "price_date",
    label: "Price Date",
    type: "text",
    value: "",
},
{
    id: "cchi_no",
    name: "cchi_no",
    label: "CCHI No.",
    type: "text",
    value: "",
},
{
    id: "claim_config_id",
    name: "claim_config_id",
    label: "Claim Config ID",
    type: "number",
    value: 0,
},
{
    id: "activity_indicator",
    name: "activity_indicator",
    label: "Activity Indicator",
    type: "text",
    value: "",
},
{
    id: "nphies_license",
    name: "nphies_license",
    label: "NPHIES License",
    type: "text",
    value: "",
},
{
    id: "provider_id",
    name: "provider_id",
    label: "Provider ID",
    type: "text",
    value: "",
},
{
    id: "non_mapped_service_code",
    name: "non_mapped_service_code",
    label: "Non-Mapped Service Code",
    type: "text",
    value: "",
},
{
    id: "is_tpa",
    name: "is_tpa",
    label: "Is TPA",
    type: "text",
    value: "",
},
{
    id: "facility_id",
    name: "facility_id",
    label: "Facility ID",
    type: "number",
    value: 0,
},
{
    id: "send_medication_as_pharmacy",
    name: "send_medication_as_pharmacy",
    label: "Send Medication as Pharmacy",
    type: "text",
    value: "",
},
{
    id: "shadow_billing_code",
    name: "shadow_billing_code",
    label: "Shadow Billing Code",
    type: "text",
    value: "",
},
{
    id: "created_by",
    name: "created_by",
    label: "Created By",
    type: "text",
    value: "",
},
{
    id: "creation_date",
    name: "creation_date",
    label: "Creation Date",
    type: "Date",
    value: "",
},
{
    id: "modified_by",
    name: "modified_by",
    label: "Modified By",
    type: "number",
    value: 0,
},
{
    id: "modification_date",
    name: "modification_date",
    label: "Modification Date",
    type: "Date",
    value: "",
}
];