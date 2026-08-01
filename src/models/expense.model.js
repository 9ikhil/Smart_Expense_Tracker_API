const crypto = require('crypto');

/**
 * Plain data model for an Expense.
 *
 * There's no database/ORM here, so this class exists purely to keep the
 * "shape" of an expense and the rules for constructing a new one in one
 * place, instead of scattering `{ id: ..., title: ..., ... }` literals
 * across the service layer.
 */
class Expense {
  constructor({ id, title, amount, category, date, createdAt }) {
    this.id = id;
    this.title = title;
    this.amount = amount;
    this.category = category;
    this.date = date;
    this.createdAt = createdAt;
  }

  /**
   * Builds a brand new Expense from validated user input.
   * Assumes `data` has already passed validation middleware.
   */
  static create({ title, amount, category, date }) {
    return new Expense({
      id: crypto.randomUUID(),
      title: title.trim(),
      amount: Number(amount),
      category: category.trim(),
      date,
      createdAt: new Date().toISOString(),
    });
  }
}

module.exports = Expense;
