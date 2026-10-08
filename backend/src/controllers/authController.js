'use strict';

const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../middleware/responseHelper');

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, errors.array().map((e) => e.msg).join(', '));
    }

    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    return sendSuccess(res, 201, result, 'Registration successful');
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, errors.array().map((e) => e.msg).join(', '));
    }

    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return sendSuccess(res, 200, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
