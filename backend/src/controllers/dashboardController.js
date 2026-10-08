'use strict';

const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../middleware/responseHelper');

async function getSummary(req, res, next) {
  try {
    const summary = await dashboardService.getSummary(req.user.id);
    return sendSuccess(res, 200, summary);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary };
