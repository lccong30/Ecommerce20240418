'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
// Sign up
router.post('/shop/login', asyncHandler(accessController.login));
router.post('/shop/signup', asyncHandler(accessController.signUp));

// Authentication
router.use(authenticationV2);
router.post('/shop/logout', asyncHandler(accessController.logout));
router.post('/shop/handlerRefreshToken', asyncHandler(accessController.handlerRefreshToken));
module.exports = router