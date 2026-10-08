'use strict';

const { Router } = require('express');
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const router = Router();

router.get('/summary', auth, dashboardController.getSummary);

module.exports = router;
