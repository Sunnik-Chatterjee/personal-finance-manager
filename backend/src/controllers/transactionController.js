'use strict';

const { validationResult } = require('express-validator');
const transactionService = require('../services/transactionService');
const { sendSuccess, sendError } = require('../middleware/responseHelper');

async function getAll(req, res, next) {
  try {
    const result = await transactionService.getAll(req.user.id, req.query);
    return sendSuccess(res, 200, result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const transaction = await transactionService.getById(req.params.id, req.user.id);
    return sendSuccess(res, 200, { transaction });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, errors.array().map((e) => e.msg).join(', '));
    }
    const transaction = await transactionService.create(req.user.id, req.body);
    return sendSuccess(res, 201, { transaction }, 'Transaction created');
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 422, errors.array().map((e) => e.msg).join(', '));
    }
    const transaction = await transactionService.update(req.params.id, req.user.id, req.body);
    return sendSuccess(res, 200, { transaction }, 'Transaction updated');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await transactionService.remove(req.params.id, req.user.id);
    return sendSuccess(res, 200, null, 'Transaction deleted');
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
