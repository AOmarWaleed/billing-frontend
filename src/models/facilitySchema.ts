import Joi from "joi";

const facilitySchema = Joi.object({
  name: Joi.string().max(255).required().messages({
    "string.empty": "Facility name is required",
    "string.max": "Facility name must be less than or equal to 255 characters",
  }),
  vat_number: Joi.string().allow("").messages({
    "string.max": "VAT number must be less than or equal to 25 characters",
  }),
  crn: Joi.string().allow("").messages({
    "string.max": "CRN must be less than or equal to 50 characters",
  }),
  phone: Joi.string().max(30).allow("").messages({
    "string.max": "Phone must be less than or equal to 30 characters",
  }),
  p_o_box: Joi.string().max(15).allow("").messages({
    "string.max": "P.O. Box must be less than or equal to 15 characters",
  }),
  email: Joi.string().max(100).allow("").email({ tlds: false }).messages({
    "string.email": "Email must be a valid email address",
    "string.max": "Email must be less than or equal to 100 characters",
  }),
  website: Joi.string().max(100).allow("").messages({
    "string.max": "Website must be less than or equal to 100 characters",
  }),
  street: Joi.string().max(128).allow("").messages({
    "string.max": "Street must be less than or equal to 128 characters",
  }),
  building_number: Joi.alternatives().try(Joi.number().integer(), Joi.string().allow("")).allow(null, "").messages({
    "number.base": "Building number must be a number",
  }),
  plot_id: Joi.alternatives().try(Joi.number().integer(), Joi.string().allow("")).allow(null, "").messages({
    "number.base": "Plot ID must be a number",
  }),
  district: Joi.string().max(128).allow("").messages({
    "string.max": "District must be less than or equal to 128 characters",
  }),
  city: Joi.string().max(128).allow("").messages({
    "string.max": "City must be less than or equal to 128 characters",
  }),
  postal_code: Joi.alternatives().try(Joi.number().integer(), Joi.string().allow("")).allow(null, "").messages({
    "number.base": "Postal code must be a number",
  }),
  region: Joi.string().max(128).allow("").messages({
    "string.max": "Region must be less than or equal to 128 characters",
  }),
  country_code: Joi.string().max(16).allow("").messages({
    "string.max": "Country code must be less than or equal to 16 characters",
  }),
  cchi_no: Joi.string().max(10).allow("").messages({
    "string.max": "CCHI No must be less than or equal to 10 characters",
  }),
  nphies_license: Joi.string().max(20).allow("").messages({
    "string.max": "NPHIES License must be less than or equal to 20 characters",
  }),
  org_id: Joi.alternatives().try(Joi.number().integer(), Joi.string().allow("")).allow(null, "").messages({
    "number.base": "Org ID must be a number",
  }),
  his_db_driver: Joi.string().allow("").messages({
    "string.max": "DB Driver must be less than or equal to 50 characters",
  }),
  his_db_host: Joi.string().allow("").messages({
    "string.max": "DB Host must be less than or equal to 100 characters",
  }),
  his_db_port: Joi.string().allow("").messages({
    "string.max": "DB Port must be less than or equal to 10 characters",
  }),
  his_db_name: Joi.string().allow("").messages({
    "string.max": "DB Name must be less than or equal to 50 characters",
  }),
  his_db_username: Joi.string().allow("").messages({
    "string.max": "DB Username must be less than or equal to 50 characters",
  }),
  his_db_password: Joi.string().allow("").messages({
    "string.max": "DB Password must be less than or equal to 50 characters",
  }),
  nphies_cs_org_id: Joi.string().allow("").messages({
    "string.max": "NPHIES CS Org ID must be less than or equal to 50 characters",
  }),
  name_locale: Joi.string().allow("").messages({
    "string.max": "Name Locale must be less than or equal to 255 characters",
  }),
  street_locale: Joi.string().allow("").messages({
    "string.max": "Street Locale must be less than or equal to 128 characters",
  }),
  district_locale: Joi.string().allow("").messages({
    "string.max": "District Locale must be less than or equal to 128 characters",
  }),
  city_locale: Joi.string().allow("").messages({
    "string.max": "City Locale must be less than or equal to 128 characters",
  }),
  region_locale: Joi.string().allow("").messages({
    "string.max": "Region Locale must be less than or equal to 128 characters",
  }),
});

export default facilitySchema;
