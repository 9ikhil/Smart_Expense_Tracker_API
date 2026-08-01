const express = require('express');
const expenseController = require('../controllers/expense.controller');
const { validateExpense } = require('../middleware/validation.middleware');

const router = express.Router();

// NOTE: /summary is registered before the DELETE /:id equivalent path
// is even reachable by GET, but we keep it first anyway - if a
// GET /expenses/:id route is ever added later, this ordering means
// "summary" won't accidentally be swallowed by a wildcard :id param.
router.get('/summary', expenseController.getSummary);

router.post('/', validateExpense, expenseController.createExpense);
router.get('/', expenseController.listExpenses);
router.delete('/:id', expenseController.removeExpense);

module.exports = router;
