import Joi from "joi";

const patientSchema = Joi.object({

  first_name: Joi.string().required().max(50).messages({
    "string.max": "First name must be less than or equal to 50 characters",
    "any.required": "First name is required",
    "string.empty": "First name is required",
  }),
  middle_names: Joi.string().allow(null, "").optional().max(50).messages({
    "string.max": "Middle names must be less than or equal to 50 characters",
  }),
  last_name: Joi.string().required().max(50).messages({
    "string.max": "Last name must be less than or equal to 50 characters",
    "any.required": "Last name is required",
    "string.empty": "Last name is required",
  }),
  birth_date: Joi.date().iso().allow(null).empty("").optional().messages({
    "date.base": "Birth date must be a valid date",
    "date.format": "Birth date must be a valid ISO date",
  }),
  mrn: Joi.string().allow(null, "").max(50).messages({
    "string.max": "MRN must be less than or equal to 50 characters",
  }),
  gender: Joi.string().required().messages({
    "string.base": "Gender must be a string",
    "any.required": "Gender is required",
    "string.empty": "Gender is required",
  }),

  nationality: Joi.string().optional().allow(null, "").max(50).messages({
    "string.max": "Nationality must be less than or equal to 50 characters",
  }),
  phone: Joi.string().required().pattern(/^[0-9]{10,15}$/).messages({
    "any.required": "Phone is required",
    "string.empty": "Phone is required",
    "string.pattern.base": "Phone must be between 10 to 15 digits",
  }),
  marital_status: Joi.string().optional().allow(null, "").max(20).messages({
    "string.max": "Marital status must be less than or equal to 20 characters",
  }),
  //  identityType : "",
  // identityValue : "",
  // identitySystem : "",
  identityType: Joi.string().optional().allow(null, "").max(20).messages({
    "string.max": "Marital status must be less than or equal to 20 characters",
  }),
  identityValue: Joi.string().optional().allow(null, "").max(20).messages({
    "string.max": "Marital status must be less than or equal to 20 characters",
  }),
  identitySystem: Joi.string().optional().allow(null, "").max(20).messages({
    "string.max": "Marital status must be less than or equal to 20 characters",
  }),
  identity: Joi.string().optional().allow(null, "").max(20).messages({
    "string.max": "Marital status must be less than or equal to 20 characters",
  }),
  address_line: Joi.string().optional().allow(null, "").max(100).messages({
    "string.max": "Address line must be less than or equal to 100 characters",
  }),
  street: Joi.string().optional().allow(null, "").max(50).messages({
    "string.max": "Street must be less than or equal to 50 characters",
  }),
  city: Joi.string().optional().allow(null, "").max(50).messages({
    "string.max": "City must be less than or equal to 50 characters",
  }),
  district: Joi.string().optional().allow(null, "").max(50).messages({
    "string.max": "District must be less than or equal to 50 characters",
  }),
  state: Joi.string().allow("").max(50).messages({
    "string.max": "State must be less than or equal to 50 characters",
  }),
  postal_code: Joi.string().optional().allow(null, "").max(10).messages({
    "string.max": "Postal code must be less than or equal to 10 characters",
  }),
  country: Joi.string().optional().allow(null, "").max(50).messages({
    "string.max": "Country must be less than or equal to 50 characters",
  }),
  occupation: Joi.string().optional().allow(null, "").max(50).messages({
    "string.max": "Occupation must be less than or equal to 50 characters",
  }),
  religion: Joi.string().optional().allow(null, "").max(50).messages({
    "string.max": "Religion must be less than or equal to 50 characters",
  }),
  health_id: Joi.string().optional().allow(null, "").max(50).messages({
    "string.max": "Health ID must be less than or equal to 50 characters",
  }),
});

export default patientSchema



