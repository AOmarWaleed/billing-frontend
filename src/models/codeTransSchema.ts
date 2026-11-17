

import Joi from 'joi'; 

const codeTransSchema = Joi.object({ 
    code: Joi.number().integer().min(1).max(9223372036854775807).required(),
    user_code: Joi.string().max(30).required(),
    code_type: Joi.number().integer().min(-2147483648).max(2147483647), 
    language_code:Joi.string().max(3),
    description: Joi.string().max(200).required(),  
    created_by: Joi.number().integer().min(-2147483648).max(2147483647).required(), 
    creation_date: Joi.date().iso().required(), 
    modified_by: Joi.number().integer().min(-2147483648).max(2147483647), 
    modification_date: Joi.date().iso() }); 
    
export default codeTransSchema;