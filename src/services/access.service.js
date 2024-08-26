'use strict';

const bcrypt = require('bcrypt');
const crypto = require('node:crypto');

const { BadRequestError, ForbiddenError, AuthFailureError } = require('../core/error.response');
const { createTokenPair, verifyToken } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const shopModel = require("../models/shop.model");
const KeyTokenService = require('./keyToken.service');
const { findByEmail } = require('./shop.service');
const keytokenModel = require('../models/keytoken.model');

const RoleShop = {
    SHOP: '01',
    ADMIN: '02',
    WRITER: '03',
    EDITOR: '04',
}

class AccessService {

    // Version 02
    static handlerRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
        const { userId, email } = user
        console.log("keyStore >>", keyStore);
        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Somethings wrong happend! Please relogin')
        }

        if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop not registered')
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('Shop is not register')
        const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)

        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })
        return {
            user: { userId, email },
            tokens
        }
    }
    /*
        check this token used
    */
    static handlerRefreshToken = async (refreshToken) => {
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        if (foundToken) {
            const { userId, email } = await verifyToken(refreshToken, foundToken.privateKey)
            console.log('[1]handlerRefreshToken_userId :>> ', userId);
            console.log('[1]handlerRefreshToken_email :>> ', email);

            const deleted = await KeyTokenService.deleteKeyById(userId)
            console.log('handlerRefreshToken_deleted :>> ', deleted);
            throw new ForbiddenError('Something is wrongs! Please re-login!')
        }

        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if (!holderToken) throw new AuthFailureError('Shop is not register')

        const { userId, email } = await verifyToken(refreshToken, holderToken.privateKey)
        console.log('[2]handlerRefreshToken_userId :>> ', userId);
        console.log('[2]handlerRefreshToken_email :>> ', email);
        await KeyTokenService.createKeyToken({ userId })
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('Shop is not register')

        const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)

        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })
        return {
            user: { userId, email },
            tokens
        }
    }

    static logout = async (keyStore) => {
        return await KeyTokenService.removeKeyById(keyStore._id)
    }

    static login = async ({ email, password, refreshToken = null }) => {
        const shop = await findByEmail({ email })
        if (!shop) throw new BadRequestError('Shop is not found')

        const isValid = await bcrypt.compare(password, shop.password)
        if (isValid === false) throw new AuthFailureError('Authentication invalid')

        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        const tokens = await createTokenPair({ userId: shop._id, email }, publicKey, privateKey)
        await KeyTokenService.createKeyToken({
            userId: shop._id,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken,
        })

        return {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: shop }),
            tokens
        }
    }

    static signUp = async ({ name, email, password }) => {
        try {
            // Step 1: Check email existence
            const shop = await shopModel.findOne({ email: email }).lean(); // return object of mongoose model
            console.log('shop :>> ', shop);
            if (shop) {
                throw new BadRequestError('Shop already registered')
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const newShop = await shopModel.create({
                name,
                email: email,
                password: passwordHash,
                roles: [RoleShop.SHOP]
            })

            if (newShop) {
                // Only deployed on large systems (firebase, google cloud...)
                // Create publickey, privatekey
                // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // })
                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if (!keyStore) {
                    return {
                        code: 'xxx',
                        message: 'keyStore is error',
                        status: error.status
                    }
                }

                // const publicKeyObject = crypto.createPublicKey(publicKeyStr)
                // console.log('publicKeyObject :>> ', publicKeyObject);

                // Created token pair
                const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
                        tokens
                    }
                }
            }
            return {
                code: 200,
                metada: null
            }
        } catch (error) {
            return {
                code: 'xxx1',
                message: error.message,
                status: 'Error'
            }
        }
    }
}

module.exports = AccessService   