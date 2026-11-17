import Joi from "joi";

const employeeSchema = Joi.object({
  employee_no: Joi.string().trim().required().max(50).messages({
    "any.required": "Employee Number is required",
    "string.empty": "Employee Number is required",
    "string.max": "Employee Number must be less than or equal to 50 characters",
  }),
  employee_job: Joi.number().integer().required().messages({
    "any.required": "Employee Job is required",
    "number.base": "Employee Job is required",
  }),
  first_name: Joi.string().trim().required().max(50).messages({
    "any.required": "First Name is required",
    "string.empty": "First Name is required",
    "string.max": "First Name must be less than or equal to 50 characters",
  }),
  middle_names: Joi.string().allow(null, "").optional().max(50).messages({
    "string.max": "Middle Name must be less than or equal to 50 characters",
  }),
  last_name: Joi.string().trim().required().max(50).messages({
    "any.required": "Last Name is required",
    "string.empty": "Last Name is required",
    "string.max": "Last Name must be less than or equal to 50 characters",
  }),
  date_of_birth: Joi.date().required().messages({
    "any.required": "Date of Birth is required",
    "date.base": "Date of Birth is required",
  }),
  gender: Joi.string().valid("M", "F").required().messages({
    "any.required": "Gender is required",
    "string.empty": "Gender is required",
    "any.only": "Gender must be either Male or Female",
  }),
  email: Joi.string().max(80).allow(null, "").email({ tlds: { allow: false } }).messages({
    "string.email": "Please enter a valid email address",
    "string.max": "Email must be less than or equal to 80 characters",
  }),
  mobile_no: Joi.string()
    .max(40)
    .allow(null, "")
    .pattern(/^\+?[0-9\s\-()]{7,20}$/)
    .messages({
      "string.pattern.base": "Phone must be a valid phone number",
      "string.max": "Phone must be less than or equal to 40 characters",
    }),
  nationality_code: Joi.number().allow(null, "").messages({
    "number.base": "Nationality must be a number",
  }),
  marital_code: Joi.number().allow(null, "").messages({
    "number.base": "Marital status must be a number",
  }),
  occupation_code: Joi.number().integer().allow(null, "").messages({
    "number.base": "Occupation must be a number",
  }),
  religion_code: Joi.number().allow(null, "").messages({
    "number.base": "Religion must be a number",
  }),
});

export default employeeSchema;

