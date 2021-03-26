const jwt = require('jsonwebtoken')
const fs = require('fs')

/**
* * To be used by the Login Route to generate a JWT Token
* Todo Make the Token Expirable and send along a refresh Token
* @param payload -> Payload contains the data that JWT will contain
*/
function generateToken(payload) {
    const privateSecret = fs.readFileSync(__dirname + '/../secrets/jwtSecret', { encoding: 'utf-8' })
    return jwt.sign(payload, privateSecret, { algorithm: 'RS256' })
}

// Exporting the JWT functions using the module.exports
module.exports = { generateToken }