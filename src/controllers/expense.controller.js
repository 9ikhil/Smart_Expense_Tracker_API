const expenseService = require('../services/expense.service');

/**
 * POST /expenses
 * Body has already been validated by validation.middleware.js.
 */
async function createExpense(req, res, next) {
  try {
    const expense = await expenseService.addExpense(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /expenses
 * GET /expenses?category=Food
 */
async function listExpenses(req, res, next) {
  try {
    const { category } = req.query;
    const expenses = await expenseService.getAllExpenses(category);
    res.status(200).json({ success: true, data: expenses });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /expenses/summary
 */
async function getSummary(req, res, next) {
  try {
    const summary = await expenseService.getSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /expenses/:id
 */
async function removeExpense(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await expenseService.deleteExpense(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Expense with id "${id}" not found`,
      });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createExpense,
  listExpenses,
  getSummary,
  removeExpense,
};
