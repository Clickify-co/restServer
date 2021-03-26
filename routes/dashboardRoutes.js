const router = require('express').Router()

// Import Models
const ShortURLs = require('../models/ShortURL')
const Users = require('../models/User')
const { isAuthenticated } = require('../functions/authFunctions')

// Import Functions
const { validateAddNewShortURLData } = require('../functions/validations')

// Middlewares
function addNewShortURLValidation(request, response, next) {
    let validation = validateAddNewShortURLData(request.body)
    if (validation.error) {
        response.send({ done: false, errorType: 'validation', errorObject: validation.error })
    }
    else {
        next()
    }

}

// Routes Go here
router.get('/', isAuthenticated, (request, response) => {
    let { _id } = request.user
    Users.findById(_id, { password: 0 })
        .then(foundUser => {
            if (foundUser) {
                ShortURLs.find({ _id: { $in: foundUser.urls } })
                    .then(allURLsOfUser => {
                        console.log(allURLsOfUser);
                        foundUser.urls = allURLsOfUser
                        response.send({ done: true, userData: foundUser })
                    })
            }
        })
})


router.post('/addNewShortURL', isAuthenticated, addNewShortURLValidation, (request, response) => {
    let { fullURL } = request.body
    new ShortURLs({ fullURL, owner: request.user._id })
        .save()
        .then((createdShortURL) => {
            Users.findById(request.user._id)
                .then((foundUser) => {
                    if (foundUser) {
                        foundUser.urls.push(createdShortURL._id)
                        foundUser.save()
                            .then(updatedUser => {
                                if (updatedUser) {
                                    response.send({ done: true })
                                }
                            })
                            .catch(err => {
                                response.send({ done: false, errorType: 'mongoDB', errorObject: err })
                            })
                    }
                    else {
                        ShortURLs.findByIdAndDelete(createdShortURL._id)
                            .then(() => {
                                response.send({ done: false, errorType: 'accessDenied', errorObject: { reason: 'invalidPayloadWithToken' } })
                            })
                    }
                })
                .catch(err => {
                    response.send({ done: false, errorType: 'mongoDB', errorObject: err })
                })
        })
        .catch(err => {
            response.send({ done: false, errorType: 'mongoDB', errorObject: err })
        })
})

module.exports = router