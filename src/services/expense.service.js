const fileStorage = require('../utils/fileStorage');
const Expense = require('../models/expense.model');

/**
 * Rounds to 2 decimal places to avoid floating point noise
 * (e.g. 0.1 + 0.2 === 0.30000000000000004) leaking into API responses.
 */
function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Creates a new expense and persists it.
 * @param {{title: string, amount: number, category: string, date: string}} data
 * @returns {Promise<Expense>}
 */
async function addExpense(data) {
  const expenses = await fileStorage.readExpenses();
  const expense = Expense.create(data);
  expenses.push(expense);
  await fileStorage.writeExpenses(expenses);
  return expense;
}

/**
 * Returns all expenses, optionally filtered by category (case-insensitive).
 * @param {string} [category]
 */
async function getAllExpenses(category) {
  const expenses = await fileStorage.readExpenses();

  if (!category) {
    return expenses;
  }

  const normalized = category.toLowerCase();
  return expenses.filter((expense) => expense.category.toLowerCase() === normalized);
}

/**
 * Computes the overall total and the total broken down by category.
 *
 * Categories are grouped case-insensitively (so "Food" and "food" combine
 * into one bucket), matching how getAllExpenses() filters by category.
 * The display label used is whichever casing was encountered first.
 */
async function getSummary() {
  const expenses = await fileStorage.readExpenses();

  const total = round2(expenses.reduce((sum, expense) => sum + expense.amount, 0));

  const byCategoryMap = new Map(); // normalized category -> { label, amount }

  for (const expense of expenses) {
    const normalizedKey = expense.category.toLowerCase();
    const existing = byCategoryMap.get(normalizedKey);

    if (existing) {
      existing.amount += expense.amount;
    } else {
      byCategoryMap.set(normalizedKey, { label: expense.category, amount: expense.amount });
    }
  }

  const byCategory = {};
  for (const { label, amount } of byCategoryMap.values()) {
    byCategory[label] = round2(amount);
  }

  return {
    total,
    byCategory,
    count: expenses.length,
  };
}

/**
 * Deletes an expense by id.
 * @returns {Promise<boolean>} true if an expense was deleted, false if no match was found
 */
async function deleteExpense(id) {
  const expenses = await fileStorage.readExpenses();
  const index = expenses.findIndex((expense) => expense.id === id);

  if (index === -1) {
    return false;
  }

  expenses.splice(index, 1);
  await fileStorage.writeExpenses(expenses);
  return true;
}

module.exports = {
  addExpense,
  getAllExpenses,
  getSummary,
  deleteExpense,
};
