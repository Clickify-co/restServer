const router = require('express').Router()

// Import Models
const ShortURLs = require('../models/ShortURL')
const Users = require('../models/User')

// Import Functions
const { validateAddNewShortURLData } = require('../functions/validations')
const { isAuthenticated } = require('../functions/authFunctions')


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
                        foundUser.urls = allURLsOfUser
                        response.send({ done: true, userData: foundUser })
                    })
                    .catch(err => {
                        response.send({ done: false, errorType: 'mongoDB', errorObject: err })
                    })
            }
            else {
                response.send({ done: false, errorType: 'accessDenied', errorObject: { reason: 'invalidPayloadWithToken' } })
            }
        })
        .catch(err => {
            response.send({ done: false, errorType: 'mongoDB', errorObject: err })
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

router.post('/editShortURL', isAuthenticated, (request, response) => {
    let { shortURL, customBackPart } = request.body

    ShortURLs.findOne({ customBackPart: customBackPart }).then((foundURL) => {
        if (!foundURL) {
            ShortURLs.findOneAndUpdate({ shortURL: shortURL }, { customBackPart: customBackPart }, { new: true, context: 'query', runValidators: true })
                .then(editedShortURL => {
                    if (editedShortURL.customBackPart == customBackPart) {
                        response.send({ done: true })
                    }
                    else if (!editedShortURL) {
                        response.send({ done: false, errorType: 'entityDoesNotExist', errorObject: { entityNotFound: 'shortURL' } })
                    }
                    else {
                        response.send({ done: false, errorType: 'unknownError', errorObject: {} })
                    }
                })
                .catch(err => {
                    response.send({ done: false, errorType: 'mongoDB', errorObject: err })
                })
        }
        else {
            response.send({ done: false, errorType: 'existingEntity', errorObject: { existingProperty: 'customBackPart' } })
        }
    })
})

module.exports = router