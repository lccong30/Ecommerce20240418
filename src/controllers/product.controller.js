'use strict'

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductServiceXXX = require("../services/product.service.xxx");


class ProductController {
    // Level mầm non
    // createProduct = async (req, res, next) => {
    //     new SuccessResponse({
    //         message: 'Create new product success!',
    //         metadata: await ProductService.createProduct(
    //             req.body.product_type,
    //             {
    //                 ...req.body,
    //                 product_shop: req.user.userId
    //             })
    //     }).send(res)
    // }

    // Level siêu cấp vip pro
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new product success!',
            metadata: await ProductServiceXXX.createProduct(
                req.body.product_type,
                {
                    ...req.body,
                    product_shop: req.user.userId
                })
        }).send(res)
    }

    // #region GET
    getAllDraftForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list product draft success',
            metadata: await ProductServiceXXX.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list product publish success',
            metadata: await ProductServiceXXX.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list search product success',
            metadata: await ProductServiceXXX.searchProductByUser(req.params)
        }).send(res)
    }

    // #endregion GET

    // #region POST
    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Publish success',
            metadata: await ProductServiceXXX.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }
    // #endregion POST
}

module.exports = new ProductController()