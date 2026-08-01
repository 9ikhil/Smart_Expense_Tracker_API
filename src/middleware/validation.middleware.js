// Matches YYYY-MM-DD, optionally followed by a full time component
// (T HH:MM:SS, optional milliseconds, optional Z or +HH:MM offset).
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?)?$/;

function isValidISODate(value) {
  if (typeof value !== 'string' || !ISO_DATE_REGEX.test(value)) {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

/**
 * Validates the request body for POST /expenses.
 *
 * Intentionally strict: `amount` must be a JSON number (not a numeric
 * string like "10"). This is a deliberate design decision - see
 * AI_NOTES.md for the reasoning.
 */
function validateExpense(req, res, next) {
  const { title, amount, category, date } = req.body || {};
  const errors = [];

  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string');
  }

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    errors.push('amount is required and must be a positive number');
  }

  if (typeof category !== 'string' || category.trim().length === 0) {
    errors.push('category is required and must be a non-empty string');
  }

  if (!isValidISODate(date)) {
    errors.push('date is required and must be a valid ISO date string (e.g. 2026-01-15)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join('; '),
    });
  }

  return next();
}

module.exports = { validateExpense, isValidISODate };
