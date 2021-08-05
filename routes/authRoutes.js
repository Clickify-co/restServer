// Beautiful Imports go here
const router = require('express').Router()
const bcrypt = require('bcrypt')


// Import Models
const Users = require('../models/User')

// Import Functions
const { validateRegistrationData, validateLoginAuthenticationData } = require('../functions/validations')
const { generateToken } = require('../functions/jwtFunctions.js')
const { isUnAuthenticated } = require('../functions/authFunctions')


// Middleware Functions Go here
/**
 * 
 * @param {Object} request The Request Object from the Middleware pass
 * @param {Object} response The Response Object to manipulate the response
 * @param {Function} next Next Function to go the next middleware callback
 * * Checks if the request has a valid body
 */
function registerValidation(request, response, next) {
    let validation = validateRegistrationData(request.body)
    if (validation.error) {
        response.send({ done: false, errorType: 'validation', errorObject: validation.error })
    }
    else {
        next()
    }
}

/**
 * 
 * @param {Object} request The Request Object from the Middleware pass
 * @param {Object} response The Response Object to manipulate the response
 * @param {Function} next Next Function to go the next middleware callback
 * * Checks if the request has a valid body
 */
function loginAuthenticationValidation(request, response, next) {
    let validation = validateLoginAuthenticationData(request.body)
    if (validation.error) {
        response.send({ done: false, errorType: 'validation', errorObject: validation.error })
    }
    else {
        next()
    }
}


/**
 * 
 * @param {Object} request The Request Object from the Middleware pass
 * @param {Object} response The Response Object to manipulate the response
 * @param {Function} next Next Function to go the next middleware callback
 * * Checks if the user already Exists.
 */
function checkExistingUser(request, response, next) {
    let { username, emailAddress } = request.body
    Users.findOne({ $or: [{ username: username }, { emailAddress: emailAddress }] })
        .then((existingEntity) => {
            if (!existingEntity) {
                next()
            }
            else {
                if (existingEntity.username == username) {
                    response.send({ done: false, errorType: 'existingEntity', errorObject: { existingProperty: 'username' } })
                }
                else {
                    response.send({ done: false, errorType: 'existingEntity', errorObject: { existingProperty: 'emailAddress' } })
                }
            }
        })
        .catch((reason) => {
            response.send({ done: false, errorType: 'mongoDB', errorObject: reason })
        })
}


// Routes Go here
router.post('/registerUser', isUnAuthenticated, registerValidation, checkExistingUser, (request, response) => {
    request.body.password = bcrypt.hashSync(request.body.password, 10)
    let newUserToBeRegistered = new Users(request.body)
    newUserToBeRegistered.save(function (err) {
        if (err) {
            response.send({ done: false, errorType: 'mongoDB', errorObject: err })
        }
        else {
            response.send({ done: true })
        }
    })
})

router.post('/loginUser', isUnAuthenticated, loginAuthenticationValidation, (request, response) => {
    let { username, password } = request.body
    Users.findOne({ $or: [{ username: username }, { emailAddress: username }] })
        .then((foundUser => {
            if (foundUser) {
                if (bcrypt.compareSync(password, foundUser.password)) {
                    let payload = { _id: foundUser._id }
                    let jsonWebToken = generateToken(payload)
                    response.send({ done: true, token: jsonWebToken })
                }
                else {
                    response.send({ done: false, errorType: 'invalidCredentials', errorObject: { credentialProperty: 'password' } })
                }
            }
            else {
                response.send({ done: false, errorType: 'invalidCredentials', errorObject: { credentialProperty: 'username' } })
            }
        }))
        .catch(err => {
            response.send({ done: false, errorType: 'mongoDB', errorObject: err })
        })
})


module.exports = router