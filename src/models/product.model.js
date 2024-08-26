'use strict'
// Erase if already required
const { Schema, model } = require('mongoose');
const slugify = require('slugify')

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

// Declare the Schema of the Mongo model
const productSchema = new Schema({
    product_name: {
        type: String,
        required: true,
    },
    product_thumb: {
        type: String,
        required: true,
    },
    product_description: String,
    product_slug: String,
    product_price: {
        type: Number,
        required: true
    },
    product_quantity: {
        type: Number,
        required: true
    },
    product_type: {
        type: String,
        required: true,
        enum: ['Electronics', 'Clothing', 'Furniture']
    },
    product_shop: { type: Schema.ObjectId, ref: 'Shop' },
    product_attributes: {
        type: Schema.Types.Mixed,
        required: true
    },
    // Extends
    product_rattingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Ratting must be above 1.0'],
        max: [5, 'Ratting must be below 5.0'],
        // 4.334343 => 4.3
        set: (val) => Math.round(val * 10) / 10
    },
    product_variation: {
        type: Array,
        default: []
    },
    isDraft: {
        type: Boolean,
        default: true,
        // Sử dung nhiều nhất đánh index = true
        index: true,
        // Khi find không lấy giá trị này
        // select: false
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
        // select: false
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

// Create index for search
productSchema.index({ product_name: 'text', product_description: 'text' })

// Document middleware
// Xử lý trước khi save
productSchema.pre('save', function (next) {
    this.product_slug = slugify(this.product_name, { lower: true })
    next()
})

const clothingSchema = new Schema({
    brand: {
        type: String,
        required: true
    },
    size: String,
    material: String
}, {
    timestamps: true,
    collection: 'clothes'
})

const electronicSchema = new Schema({
    manufacturer: {
        type: String,
        required: true
    },
    model: String,
    color: String
}, {
    timestamps: true,
    collection: 'electronics'
})

const furnitureSchema = new Schema({
    brand: {
        type: String,
        required: true
    },
    size: String,
    material: String
}, {
    timestamps: true,
    collection: 'furnitures'
})

//Export the model
module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model("Electronics", electronicSchema),
    clothing: model("Clothings", clothingSchema),
    furniture: model("Furnitures", furnitureSchema)
}