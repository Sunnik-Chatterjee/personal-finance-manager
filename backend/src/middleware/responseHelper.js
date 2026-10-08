'use strict';

function sendSuccess(res, statusCode, data, message = '') {
  return res.status(statusCode).json({ success: true, data, message });
}

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({ success: false, data: null, message });
}

module.exports = { sendSuccess, sendError };
