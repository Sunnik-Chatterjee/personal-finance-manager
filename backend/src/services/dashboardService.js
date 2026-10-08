'use strict';

const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

async function getSummary(userId) {
  const userObjId = new mongoose.Types.ObjectId(userId);

  const [typeAggregation, categoryAggregation, monthlyAggregation, recentTransactions, totalCount] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId: userObjId } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]),

    Transaction.aggregate([
      { $match: { userId: userObjId, type: 'EXPENSE' } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),

    Transaction.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    Transaction.find({ userId }).sort({ date: -1 }).limit(5).lean(),

    Transaction.countDocuments({ userId }),
  ]);

  let totalIncome = 0;
  let totalExpense = 0;

  for (const group of typeAggregation) {
    if (group._id === 'INCOME') totalIncome = group.total;
    if (group._id === 'EXPENSE') totalExpense = group.total;
  }

  const categoryBreakdown = categoryAggregation.map((cat) => ({
    category: cat._id,
    amount: cat.total,
    percentage: totalExpense > 0 ? Math.round((cat.total / totalExpense) * 100) : 0,
  }));

  const monthMap = new Map();

  for (const item of monthlyAggregation) {
    const year = item._id.year;
    const monthNum = item._id.month;
    const key = `${year}-${String(monthNum).padStart(2, '0')}`;
    const label = `${MONTH_NAMES[monthNum - 1]} ${year}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, { month: label, year, monthNum, income: 0, expense: 0, savings: 0 });
    }

    const entry = monthMap.get(key);
    if (item._id.type === 'INCOME') {
      entry.income += item.total;
    } else if (item._id.type === 'EXPENSE') {
      entry.expense += item.total;
    }
    entry.savings = entry.income - entry.expense;
  }

  const monthlyCashFlow = Array.from(monthMap.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([, val]) => ({
      month: val.month,
      income: val.income,
      expense: val.expense,
      savings: val.savings,
    }));

  const savingsRate = totalIncome > 0
    ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
    : 0;

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    savingsRate,
    monthlyCashFlow,
    categoryBreakdown,
    recentTransactions,
    totalTransactionsCount: totalCount,
  };
}

module.exports = { getSummary };
