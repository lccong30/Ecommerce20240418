'use strict'

const { BadRequestError } = require("../core/error.response")
const { product, electronic, clothing, furniture } = require("../models/product.model")
const { findAllDraftsForShop, findAllPublishForShop, publishProductByShop, searchProductByUser } = require('../models/repositories/product.repo')

/*
type:
payload
*/
class ProductFactory {

    static productRegistry = {}
    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`Invalid product Types ${type}`)

        return new productClass(payload).createProduct()
    }

    // #region POST
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id })
    }
    // #endregion POST

    // #region Query
    /**
     * @desc Get all drafts for shop
     * @param {Object} product_shop 
     * @param {Number} limit 
     * @param {Number} skip 
     * @returns Json
     */
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true }
        console.log('query :>> ', query);
        return await findAllDraftsForShop({ query, limit, skip })
    }

    /**
     * @desc Get all product published for shop
     * @param {Object} product_shop 
     * @param {Number} limit 
     * @param {Number} skip 
     * @returns Json
     */
    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true }
        return await findAllPublishForShop({ query, limit, skip })
    }

    static async searchProductByUser(keySearch) {
        return await searchProductByUser(keySearch)
    }
    // #endregion Query
}

class Product {
    constructor({ product_name, product_thumb, product_description, product_price, product_quantity, product_type, product_shop, product_attributes }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id })
    }
}

// Define sub class for different product types clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({ ...this.product_attributes, product_shop: this.product_shop })
        if (!newClothing) throw new BadRequestError('Create new clothing error!')

        const newProduct = await super.createProduct(newClothing._id)
        if (!newProduct) throw new BadRequestError('Create new product error!')

        return newProduct
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newElectronic) throw new BadRequestError('Create new electronic error!')

        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) throw new BadRequestError('Create new product error!')

        return newProduct
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newFurniture) throw new BadRequestError('Create new furniture error!')

        const newProduct = await super.createProduct(newFurniture._id)
        if (!newProduct) throw new BadRequestError('Create new product error!')

        return newProduct
    }
}

ProductFactory.registerProductType('Electronics', Electronics)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory