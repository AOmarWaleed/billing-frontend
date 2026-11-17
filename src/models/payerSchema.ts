import Joi from "joi";

const payerSchema = Joi.object({
  payer_bk: Joi.string().required().max(50).messages({
    "any.required": "Code is required",
    "string.empty": "Code is required",
    "string.max": "Code must be less than or equal to 50 characters",
  }),
  description: Joi.string().required().max(160).messages({
    "any.required": "Name is required",
    "string.empty": "Name is required",
    "string.max": "Name must be less than or equal to 160 characters",
  }),
  address_1: Joi.string()
    .max(40)
    .optional()
    .allow(null, "")
    .empty("")
    .messages({
      "string.max": "address_1 must be less than or equal to 40 characters",
    }),
  address_2: Joi.string()
    .max(40)
    .optional()
    .allow(null, "")
    .empty("")
    .messages({
      "string.max": "address_2 must be less than or equal to 40 characters",
    }),
  address_3: Joi.string()
    .max(40)
    .optional()
    .allow(null, "")
    .empty("")
    .messages({
      "string.max": "address_3 must be less than or equal to 40 characters",
    }),
  address_4: Joi.string()
    .max(40)
    .optional()
    .allow(null, "")
    .empty("")
    .messages({
      "string.max": "address_4 must be less than or equal to 40 characters",
    }),
  tel_no: Joi.string().max(20).optional().allow(null, "").empty("").messages({
    "string.max": "tel_no must be less than or equal to 20 characters",
  }),
  contact: Joi.string().max(30).optional().allow(null, "").empty("").messages({
    "string.max": "contact must be less than or equal to 30 characters",
  }),
  email_address: Joi.string()
    .max(250)
    .optional()
    .allow(null, "")
    .empty("")
    .messages({
      "string.max":
        "email_address must be less than or equal to 250 characters",
    }),
  eligibility_no_days: Joi.number()
    .integer()
    .min(1)
    .max(9223372036854775807)
    .optional()
    .allow(null)
    .empty(""),
  eligibility_no_visits: Joi.number()
    .integer()
    .min(1)
    .max(9223372036854775807)
    .optional()
    .allow(null)
    .empty(""),
  price_date: Joi.string().max(10).optional().allow(null, "").empty(""),
  cchi_no: Joi.string().max(25).optional().allow(null, "").empty("").messages({
    "string.max": "cchi_no must be less than or equal to 25 characters",
  }),
  claim_config_id: Joi.number()
    .integer()
    .min(1)
    .max(9223372036854775807)
    .optional()
    .allow(null, "")
    .empty(""),
  active: Joi.string().max(1).optional().default("Y"),
  nphies_license: Joi.string().max(80).optional().allow(null, "").empty(""),
  provider_id: Joi.string().max(25).optional().allow(null, "").empty(""),
  non_mapped_service_code: Joi.string()
    .max(30)
    .optional()
    .allow(null, "")
    .empty(""),
  is_tpa: Joi.string().max(25).optional().default("Y"),
  facility_id: Joi.number()
    .integer()
    .min(1)
    .max(9223372036854775807)
    .optional()
    .allow(null, "")
    .empty(""),
  send_medication_as_pharmacy: Joi.string()
    .max(100)
    .optional()
    .allow(null, "")
    .empty(""),
  shadow_billing_code: Joi.string()
    .max(25)
    .optional()
    .allow(null, "")
    .empty(""),
  created_by: Joi.number()
    .integer()
    .min(-2147483648)
    .max(2147483647)
    .optional()
    .allow(null, "")
    .empty(""),
  creation_date: Joi.date().iso().optional().allow(null, "").empty(""),
  modified_by: Joi.number()
    .integer()
    .min(-2147483648)
    .max(2147483647)
    .optional()
    .allow(null, "")
    .empty(""),
  modification_date: Joi.date().iso().optional().allow(null, "").empty(""),
  tpa_id: Joi.number()
    .integer()
    .min(1)
    .max(9223372036854775807)
    .optional()
    .allow(null)
    .empty(""),
  short_name: Joi.string().required().max(80).messages({
    "any.required": "Short Name is required",
    "string.empty": "Short Name is required",
    "string.max": "Short Name must be less than or equal to 80 characters",
  }),
  // icon bytea ignored
  vat_register_no: Joi.string()
    .max(25)
    .optional()
    .allow(null, "")
    .empty("")
    .messages({
      "string.max":
        "vat_register_no must be less than or equal to 25 characters",
    }),
  claim_in_open_episode: Joi.string()
    .max(1)
    .optional()
    .allow(null, "")
    .default("N"),
  claim_out_open_episode: Joi.string()
    .max(1)
    .optional()
    .allow(null, "")
    .default("N"),
  id: Joi.number().integer().optional().allow(null, "").empty(""),
  account_no: Joi.string().max(50).optional().allow(null, "").empty(""),
  plot_identification: Joi.string()
    .max(50)
    .optional()
    .allow(null, "")
    .empty(""),
  description_locale: Joi.string()
    .max(160)
    .optional()
    .allow(null, "")
    .empty(""),
  street_name: Joi.string().max(100).optional().allow(null, "").empty(""),
  street_name_locale: Joi.string()
    .max(100)
    .optional()
    .allow(null, "")
    .empty(""),
  building_no: Joi.string().max(50).optional().allow(null, "").empty(""),
  district: Joi.string().max(100).optional().allow(null, "").empty(""),
  district_locale: Joi.string().max(100).optional().allow(null, "").empty(""),
  city: Joi.string().max(100).optional().allow(null, "").empty(""),
  city_locale: Joi.string().max(100).optional().allow(null, "").empty(""),
  province: Joi.string().max(100).optional().allow(null, "").empty(""),
  province_locale: Joi.string().max(100).optional().allow(null, "").empty(""),
  postal_code: Joi.string().max(20).optional().allow(null, "").empty(""),
  country_code: Joi.string().max(10).optional().allow(null, "").empty(""),
});

export default payerSchema;
