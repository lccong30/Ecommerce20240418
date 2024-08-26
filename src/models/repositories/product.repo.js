'use strict'
const { product, furniture, clothing, electronic } = require('../../models/product.model')
const { Types } = require('mongoose')

// #region QUERY
const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const findAllPublishForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch)
    const results = await product.find(
        {
            $text: { $search: regexSearch },
            isPublished: true
        },
        { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .lean()
    return results;
}
// #endregion

// #region POST
const publishProductByShop = async ({ product_shop, product_id }) => {
    const shop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    console.log('shop :>> ', shop);
    if (!shop) return null

    shop.isDraft = !shop.isDraft
    shop.isPublished = !shop.isPublished

    const { modifiedCount } = await shop.updateOne(shop)
    return modifiedCount
}
// #endregion


// #region Query Common
const queryProduct = async ({ query, limit, skip }) => {
    return await product.find(query)
        .populate('product_shop', 'name email -_id')
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}
// #endregion


module.exports = {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishForShop,
    searchProductByUser
}