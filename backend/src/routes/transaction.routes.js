'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');
const CATEGORIES = require('../config/categories');
const { sendSuccess } = require('../middleware/responseHelper');

const router = Router();

// ─── Validation rules ────────────────────────────────────────────────────────
const allCategories = [...CATEGORIES.INCOME, ...CATEGORIES.EXPENSE];

const createRules = [
  body('type').isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn(allCategories).withMessage('Invalid category'),
  body('description').optional().isString().trim(),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
];

const updateRules = [
  body('type').optional().isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE'),
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('category').optional().isIn(allCategories).withMessage('Invalid category'),
  body('description').optional().isString().trim(),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
];

// ─── GET /api/categories (public — for frontend dropdowns) ───────────────────
router.get('/categories', (_req, res) => {
  return sendSuccess(res, 200, CATEGORIES);
});

// ─── All transaction routes require authentication ────────────────────────────
router.use(auth);

router.get('/', transactionController.getAll);
router.post('/', createRules, transactionController.create);
router.get('/:id', transactionController.getById);
router.put('/:id', updateRules, transactionController.update);
router.delete('/:id', transactionController.remove);

module.exports = router;
