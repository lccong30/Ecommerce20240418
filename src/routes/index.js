'use strict';

const express = require('express');
const { apiKey, permission } = require('../auth/checkAuth');
const router = express.Router()

router.use(apiKey)
router.use(permission('000'))
router.use('/v1/api', require('./access'));
router.use('/v1/api', require('./product'));


module.exports = router