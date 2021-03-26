const jwt = require('jsonwebtoken')
const fs = require('fs')

// Public Key
const publicSecret = fs.readFileSync(__dirname + '/../secrets/jwtSecret.pub', { encoding: 'utf-8' })

function isAuthenticated(request, response, next) {
    const token = request.header('auth-token')
    if (!token) response.send({ done: false, errorType: 'accessDenied', errorObject: { reason: 'noToken' } })
    else {
        jwt.verify(token, publicSecret, (err, decodedUser) => {
            if (err) response.send({ done: false, errorType: 'accessDenied', errorObject: { reason: 'invalidToken' } })
            else {
                request.user = decodedUser
                next()
            }
        })
    }
}


function isUnAuthenticated(request, response, next) {
    const token = request.header('auth-token')
    if (!token) {
        next()
    }
    else {
        jwt.verify(token, publicSecret, (err, decodedUser) => {
            if (err) next()
            else {
                request.user = decodedUser
                response.send({ done: false, errorType: 'invalidAction', errorObject: { reason: 'loggedIn' } })
            }
        })
    }
}

module.exports = { isAuthenticated, isUnAuthenticated }