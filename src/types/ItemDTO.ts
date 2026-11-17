export interface ItemDTO {
  description: string;
  long_description: string;
  item_bk: string;
  legacy_code: string;
  category_code: string;
  sub_category_code: string;
  generic_id: number;
  //item_type: string;
  pharmacy_type: string;
  orderable: string;
  inventory: string;
  inventory_price: string;
  //stocked_uom_code: string;
  sales_uom_code: string;
  sales_conv_factor: number;
  //product_ind: string;
  activity_indicator: string | null;
  stocked_indicator: string;
  image_id: number | null;
  brand_generic_id: number;
  external_doctor_price_editable: string;
  standard_price_editable: string;
  national_drug_code: string | null;
  vat_cat_type: string | null;
  nphies_service_type: string;
  drug_dispensing_type: string | null;
  scientific_code: string | null;
}
