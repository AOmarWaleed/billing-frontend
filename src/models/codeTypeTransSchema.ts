import Joi from 'joi'; 

const codeTypeTransSchema = Joi.object({ 
    code_type: Joi.number().integer().min(-128).max(127),
    language_code: Joi.string().max(3).required(),
    description: Joi.string().max(80).required(), 
    created_by: Joi.number().integer().min(-2147483648).max(2147483647), 
    creation_date: Joi.date().iso(), 
    modified_by: Joi.number().integer().min(-2147483648).max(2147483647), 
    modification_date: Joi.date().iso() }); 
    
export default codeTypeTransSchema;