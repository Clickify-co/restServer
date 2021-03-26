const { Schema, model } = require("mongoose");
const shortid = require("shortid");

let ShortURLSchema = new Schema({
    shortURL: {
        type: String,
        required: true,
        min: 7,
        max: 14,
        default: shortid.generate
    },
    fullURL: {
        type: String,
        required: true,
    },
    customBackPart: {
        type: String,
        required: false,
    },
    numberOfVisits: {
        type: Number,
        required: true,
        default: 0
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
})

module.exports = model('short_url', ShortURLSchema)