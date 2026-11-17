import Joi from "joi";
// Joi Schema for Validation

const userSchema = Joi.object({
  user_name: Joi.string()
    .trim()
    .regex(/^[A-Za-z][A-Za-z0-9]*$/, "Username must not contain spaces,symbols or start by number") // Pattern for starting with a letter

    .max(80)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.max": "Username must be less than or equal to 80 characters",
      "string.pattren.base": `"" must not contain spaces,symbols or start by number`,
    }),
  first_name: Joi.string().max(40).required().messages({
    "string.empty": "First Name is required",
    "string.max": "First Name must be less than or equal to 40 characters",
  }),
  middle_name: Joi.string().max(40).allow(null, "").messages({
    "string.max": "Middle Name must be less than or equal to 40 characters",
  }),
  family_name: Joi.string().max(40).required().messages({
    "string.empty": "Family Name is required",
    "string.max": "Family Name must be less than or equal to 40 characters",
  }),
  group_id: Joi.number().integer().allow(null, "").messages({
    "number.base": "Group ID must be a number",
  }),
  password_expiry_date: Joi.date().allow(null, "").messages({
    "date.base": "Password Expiry Date must be a valid date",
  }),
  prefered_language: Joi.string().length(2).allow(null, "").messages({
    "string.length": "Preferred Language must be exactly 2 characters",
  }),
  employee_id: Joi.number().integer().allow(null, "").messages({
    "number.base": "Employee ID must be a number",
  }),
  // active: Joi.boolean().allow(null).messages({
  //   "boolean.base": "Active must be a boolean value",
  // }),
  // locked: Joi.boolean().allow(null).messages({
  //   "boolean.base": "Locked must be a boolean value",
  // }),
  password: Joi.string().max(25).required().messages({
    "string.empty": "Password is required",
    "string.max": "Password must be less than or equal to 25 characters",
  }),
  confirm_password: Joi.string()
    .valid(Joi.ref("password")) // Ensure confirm_password matches password
    .required()
    .messages({
      "string.empty": "Confirm Password is required",
      "any.only": "Passwords do not match",
    }),
  email: Joi.string().max(255).email({ tlds: false }).allow(null, ""), // Allow null or empty string
});

export default userSchema;
