import Joi from "joi";

export const setFormSchema = Joi.object({
  set_description: Joi.string()
    .max(500)
    .required()
    .messages({
      "string.base": "Description must be a string",
      "string.max": "Description must not exceed 500 characters",
      "any.required": "Description is required",
    }),

  set_query: Joi.string()
  .max(4000)
  .allow(null, '')
    .messages({
      "string.base": "Query must be a string",
       "string.max": "Query must not exceed 4000 characters",
    }),

 
    code_type: Joi.number()
    .allow(null)
    .optional()
    .messages({
      "any.required": "Code type is required",
      "object.base": "Invalid code type selection",
    }),
});
