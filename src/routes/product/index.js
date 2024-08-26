'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');

router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct));

// Authentication
router.use(authentication);

// #region POST
router.post('/product', asyncHandler(productController.createProduct));
// #endregion

// #region post
router.post('/publish/:id', asyncHandler(productController.publishProductByShop));
// #endregion

// #region Query
router.get('/drafts/all', asyncHandler(productController.getAllDraftForShop));
router.get('/publish/all', asyncHandler(productController.getAllPublishForShop));
// #endregion
module.exports = router