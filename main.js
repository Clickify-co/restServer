// Importing beautiful stuff here
const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

// Setting up the Application
const app = express()
dotenv.config()

// Connecting to MongoDB with URI process.env.MONGO_DB_URI
let mongooseConnectionOptions = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }
function callbackToMongooseConnect(err) {
    if (err) return console.error(`Unexpected Error Occured ${err}`);
    return console.log('Connected to MongoDB Cloud')
}
mongoose.connect(process.env.MONGO_DB_URI, mongooseConnectionOptions, callbackToMongooseConnect)

// Setting up Middleware
app.use(express.json())

// Setting up routes
app.use('/', require('./routes/baseRoutes'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/dashboard', require('./routes/dashboardRoutes'))

// Start Listening on PORT process.env.PORT
function callbackToExpressListen() {
    console.log(`Server is ready for requests on Port: ${process.env.PORT}`)
}
app.listen(process.env.PORT, callbackToExpressListen)