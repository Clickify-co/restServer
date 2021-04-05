const router = require('express').Router()

// Import Models here
const ShortURLs = require('../models/ShortURL')

router.post('/getFullURL', (request, response) => {
    let { shortURL } = request.body
    ShortURLs.findOne({ $or: [{ shortURL: shortURL }, { customBackPart: shortURL }] })
        .then(foundShortURL => {
            if (foundShortURL) {
                response.send({ done: true, fullURL: foundShortURL.fullURL })
            }
            else {
                response.send({ done: false, errorType: 'entityDoesNotExist', errorObject: { entityNotFound: 'shortURL' } })
            }
        })
        .catch(err => {
            response.send({ done: false, errorType: 'mongoDB', errorObject: err })
        })
})

router.post('/addVisitToShortURL', (request, response) => {
    let { shortURL } = request.body
    ShortURLs.findOne({ $or: [{ shortURL: shortURL }, { customBackPart: shortURL }] })
        .then(foundShortURL => {
            if (foundShortURL) {
                foundShortURL.numberOfVisits = foundShortURL.numberOfVisits + 1;
                foundShortURL.save()
                    .then(updatedShortURL => {
                        response.send({ done: true })
                    })
                    .catch(err => {
                        response.send({ done: false, errorType: 'mongoDB', errorObject: err })
                    })
            }
            else {
                response.send({ done: false, errorType: 'entityDoesNotExist', errorObject: { entityNotFound: 'shortURL' } })
            }
        })
})

module.exports = router