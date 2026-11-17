import Joi from "joi";

const itemSchema = Joi.object({
  item_id: Joi.number().integer().min(1).max(9223372036854775807),
  description: Joi.string().trim().max(160).required(),
  long_description: Joi.string().trim().max(2000).required().label("long description"),
  item_bk: Joi.string().trim().max(50).required().label("item bk"),
  legacy_code: Joi.string().trim().max(25).required().label("legacy code"),
  category_code: Joi.string().trim().max(25).allow(null, "").label("category code"),
  sub_category_code: Joi.string().trim().max(25).allow(null, "").label("sub category code"),
  generic_id: Joi.number().integer().min(0).max(2147483647).required().allow(null).label("generic id"),
  //item_type: Joi.string().trim().max(1).required(), // not in form
  pharmacy_type: Joi.string().trim().max(1).required().label("pharmacy type"),
  orderable: Joi.string().trim().max(1).required(),
  inventory: Joi.string().trim().max(1).required(),
  inventory_price: Joi.string().trim().max(1).required().label("inventory price"),
  //stocked_uom_code: Joi.string().trim().max(10).required(),
  sales_uom_code: Joi.string().trim().max(25).required().label("sales uom code"),
  sales_conv_factor: Joi.number().integer().min(0).max(2147483647).required().allow(null).label("sales conv factor"),
  //product_ind: Joi.string().trim().max(1).required(), //not in form
  activity_indicator: Joi.string().trim().max(1).allow(null).label("activity indicator"),
  stocked_indicator: Joi.string().trim().max(1).required().label("stocked indicator"),
  image_id: Joi.number().integer().min(0).max(2147483647).allow(null).label("image id"),
  brand_generic_id: Joi.number().integer().min(0).max(2147483647).required().allow(null).label("brand generic id"),
  external_doctor_price_editable: Joi.string().trim().max(1).required().label("external doctor price editable"),
  standard_price_editable: Joi.string().trim().max(1).required().label("standard price editable"),
  national_drug_code: Joi.string().trim().max(80).allow(null, "").label("national drug code"), //
  vat_cat_type: Joi.string().trim().max(25).allow(null, "").label("vat cat type"),
  nphies_service_type: Joi.string().trim().max(25).allow(null, "").label("nphies service type"),
  drug_dispensing_type: Joi.string().trim().max(25).allow(null, "").label("drug dispensing type"),
  scientific_code: Joi.string().trim().max(100).allow(null, "").label("scientific code"),
});
export default itemSchema;
