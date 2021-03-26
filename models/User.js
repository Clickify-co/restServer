const { Schema, model } = require("mongoose");

let userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    emailAddress: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    urls: [{
        type: Schema.Types.ObjectId, ref: 'short_url'
    }]
})

module.exports = model('user', userSchema)
