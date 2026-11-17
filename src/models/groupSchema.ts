import Joi from "joi";
const groupSchema = Joi.object({
  group_name: Joi.string().trim().max(100).required().messages({
    "string.empty": "Group name is required",
  }),
  description: Joi.string().trim().max(200).required().messages({
    "string.empty": "Description is required",
  }),
  auth_provider_group: Joi.string().trim().max(200).required().messages({
    "string.empty": "Auth provider group is required",
  }),
  menu_id: Joi.number()
    .integer()
    .min(-2147483648)
    .max(2147483647)
    .required()
    .messages({
      "any.required": "Menu is required",
      "number.base": "Menu must be selected",
    }),
});

export default groupSchema;
