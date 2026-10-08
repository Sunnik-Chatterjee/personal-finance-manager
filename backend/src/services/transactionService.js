'use strict';

const Transaction = require('../models/Transaction');

async function getAll(userId, filters = {}) {
  const { type, category, dateFrom, dateTo, page = 1, limit = 10 } = filters;

  const query = { userId };

  if (type) query.type = type;
  if (category) query.category = category;
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [transactions, total] = await Promise.all([
    Transaction.find(query).sort({ date: -1 }).skip(skip).limit(Number(limit)),
    Transaction.countDocuments(query),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getById(id, userId) {
  const transaction = await Transaction.findOne({ _id: id, userId });
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
  }
  return transaction;
}

async function create(userId, dto) {
  return Transaction.create({ userId, ...dto });
}

async function update(id, userId, dto) {
  const transaction = await Transaction.findOne({ _id: id, userId });
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
  }

  Object.assign(transaction, dto);
  await transaction.save();
  return transaction;
}

async function remove(id, userId) {
  const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
  }
  return transaction;
}

module.exports = { getAll, getById, create, update, remove };
