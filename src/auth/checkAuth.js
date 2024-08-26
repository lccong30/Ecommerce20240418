'use strict'

const { BadRequestError } = require("../core/error.response")
const { findById } = require("../services/apiKey.service")

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString()
        if (!key) {
            return res.status(400).json({ error: 'API key is missing or invalid 1' });
        }
        // Check obj key
        const objKey = await findById(key)
        console.log('objKey :>> ', objKey);
        if (!objKey) {
            return res.status(400).json({ error: 'API key is missing or invalid 2' });
        }
        req.objKey = objKey
        return next()
    } catch (err) {
        console.log('checkAuth_ERR :>> ', er.mesage);
        return res.status(500).json({
            code: 500,
            message: 'Something is wrongs'
        })
    }
}

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            throw new BadRequestError('You dont have permission to access!')
        }
        const isValidPermission = req.objKey.permissions.includes(permission)
        if (!isValidPermission)
            throw new BadRequestError('Permission is denied')
        return next()
    }
}

module.exports = {
    apiKey,
    permission,
}