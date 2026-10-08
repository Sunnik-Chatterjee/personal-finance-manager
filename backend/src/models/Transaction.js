'use strict';

const mongoose = require('mongoose');
const CATEGORIES = require('../config/categories');

const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: TRANSACTION_TYPES,
        message: 'Type must be INCOME or EXPENSE',
      },
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      validate: {
        validator: function (value) {
          const allowed = CATEGORIES[this.type];
          return allowed ? allowed.includes(value) : false;
        },
        message: function (props) {
          const allowed = CATEGORIES[this.type] || [];
          return `"${props.value}" is not a valid category for type ${this.type}. Allowed: ${allowed.join(', ')}`;
        },
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
