import Joi from "joi";

const codeDataSchema = Joi.object({
  user_code: Joi.string()
    .trim()
    .max(50)
    .required()
    .messages({
      "any.required": "User Code is required",
      "string.empty": "User Code is required",
      "string.max": "User Code must be less than or equal to 50 characters",
    }),
  description: Joi.string()
    .trim()
    .max(50000)
    .required()
    .messages({
      "any.required": "Description is required",
      "string.empty": "Description is required",
      "string.max": "Description must be less than or equal to 50000 characters",
    }),
  linked_code: Joi.number()
    .integer()
    .positive()
    .max(2147483647)
    .optional()
    .allow(null, "")
    .empty(""),
  linked_user_code: Joi.string().max(50).optional().allow(null, "").empty(""),
  sub_code_type: Joi.number()
    .integer()
    .positive()
    .max(2147483647)
    .optional()
    .allow(null, "")
    .empty(""),
  cat_code: Joi.any().allow(null).optional(),
  col_1: Joi.any().allow(null, "").optional(),
  col_2: Joi.any().allow(null, "").optional(),
  col_3: Joi.any().allow(null, "").optional(),
});

export default codeDataSchema;
