const Joi = require("joi");

function validateRegistrationData(body) {
    const schema = Joi.object({
        username: Joi.string().min(6).max(30).required(),
        fullname: Joi.string().min(3).max(100).required(),
        emailAddress: Joi.string().email().required(),
        password: Joi.string().regex(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        confirmPassword: Joi.ref('password')
    })

    return schema.validate(body)
}

function validateLoginAuthenticationData(body) {
    const schema = Joi.object({
        username: Joi.string().min(6).max(30).required(),
        password: Joi.string().min(6)
    })

    return schema.validate(body)
}

function validateAddNewShortURLData(body) {
    const schema = Joi.object({
        fullURL: Joi.string().uri()
    })

    return schema.validate(body)
}

module.exports = { validateRegistrationData, validateLoginAuthenticationData, validateAddNewShortURLData }