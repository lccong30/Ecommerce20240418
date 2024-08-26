'use strict'
const keytokenModel = require("../models/keytoken.model");
const { Types, mongoose } = require('mongoose')

class KeyTokenService {

    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            // Level 0
            // const token = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })
            // return token ? token.publicKey : null

            // Level siêu cấp vip pro
            const filter = { user: userId }
            const update = { publicKey, privateKey, refreshTokenUsed: [], refreshToken }
            // upsert: true: chưa có thêm mới, có rồi update
            const options = { upsert: true, new: true }

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)
            return tokens ? tokens.publicKey : null
        } catch (error) {
            console.log('keyTokenService_ERR :>> ', error);
            return error
        }
    }

    static findByUserId = async (userId) => {
        return await keytokenModel.findOne({ user: new mongoose.Types.ObjectId(userId) })
    }

    static removeKeyById = async (id) => {
        return await keytokenModel.deleteOne(id)
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshTokensUsed: refreshToken }).lean()
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshToken: refreshToken })
    }

    static deleteKeyById = async (userId) => {
        return await keytokenModel.deleteOne({ user: new mongoose.Types.ObjectId(userId) })
    }
}

module.exports = KeyTokenService