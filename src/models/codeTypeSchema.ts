import Joi from "joi";

const codeTypeSchema = Joi.object({
  code_type: Joi.number()
    .integer()
    .positive()
    .max(2147483647)
    .required()
    .messages({
      "any.required": "Code Type is required",
      "number.base": "Code Type is required and must be a number",
      "number.positive": "Code Type must be a positive number",
      "number.integer": "Code Type must be an integer",
      "number.max": "Code Type must be less than or equal to 2147483647",
    }),
  description: Joi.string()
    .trim()
    .required()
    .max(80)
    .messages({
      "any.required": "Description is required",
      "string.empty": "Description is required",
      "string.max": "Description must be less than or equal to 80 characters",
    }),
  linked_type: Joi.number()
    .integer()
    .positive()
    .max(2147483647)
    .optional()
    .allow(null, "")
    .empty(""),
});

export default codeTypeSchema;

