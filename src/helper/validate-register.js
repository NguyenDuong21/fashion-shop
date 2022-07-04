const Joi = require('joi');

const registerSchema = Joi.object({
    email : Joi.string().email().required().min(3).max(30),
    username : Joi.string().alphanum().required().min(3).max(30),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    confirmpassword : Joi.ref('password')
});

module.exports = {'valRegister' : registerSchema};