require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')
const { dbConnect, countConnect, checkOverLload } = require('./helpers/check.connect')
const app = express()

// Init middleware
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

// Init DB
require('./dbs/init.db.mongodb')
dbConnect()
countConnect()

// Init routes
app.use('', require('./routes'))

// Handling error
app.use((req, res, next) => {
    const error = new Error('Not Found router')
    error.status = 404
    next(error)
})

app.use((err, req, res, next) => {
    const statusCode = err.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: err.stack,
        message: err.message || 'Internal Server Error'
    })
})


module.exports = app