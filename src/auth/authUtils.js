'use strict'

const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')
const KeyTokenService = require('../services/keyToken.service')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // accessToken
        const accessToken = await JWT.sign(
            payload,
            publicKey,
            {
                expiresIn: '2d'
            })
        // refreshToken
        const refreshToken = await JWT.sign(
            payload,
            privateKey,
            {
                expiresIn: '7d'
            })
        await JWT.verify(
            accessToken,
            publicKey,
            (err, decode) => {
                if (err) {
                    console.log('verifyERR :>> ', err);
                } else {
                    console.log(decode);
                }
            })
        return { accessToken, refreshToken }
    } catch (err) {
        console.log('authUtils_createTokenPair:>> ', err);
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    console.log("vv")
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid request')

    const keyStore = await findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Not found keyStore')

    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError('Invalid request')
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid user id')

        req.keyStore = keyStore
        req.user = decodeUser
        return next()
    } catch (error) {
        throw error
    }
})

const authenticationV2 = asyncHandler(async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid request')

    const keyStore = await KeyTokenService.findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Not found keyStore')

    if (req.headers[HEADER.REFRESHTOKEN]) {
        try {
            console.log('req.headers[HEADER.REFRESHTOKEN] :>> ', req.headers[HEADER.REFRESHTOKEN]);
            const refreshToken = req.headers[HEADER.REFRESHTOKEN]
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)

            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken

            return next()
        } catch (error) {
            throw new AuthFailureError("Invalid request [refresh token]")
        }
    }
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError('Invalid request')
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid user id')

        req.keyStore = keyStore
        req.user = decodeUser
        return next()
    } catch (error) {
        throw error
    }
})

const verifyToken = async (token, keySecret) => {
    return await JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2,
    verifyToken,
}