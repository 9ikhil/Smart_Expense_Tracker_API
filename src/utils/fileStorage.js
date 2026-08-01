const fs = require('fs/promises');
const path = require('path');

const DEFAULT_DATA_PATH = path.join(__dirname, '..', 'data', 'expenses.json');

/**
 * Resolves the path to the expenses data file.
 * Reads from EXPENSES_FILE_PATH so tests can point at an isolated
 * scratch file instead of the real data file.
 */
function getDataFilePath() {
  return process.env.EXPENSES_FILE_PATH || DEFAULT_DATA_PATH;
}

/**
 * Ensures the data file (and its parent directory) exist.
 * If the file is missing, it is created with an empty array.
 */
async function ensureFileExists(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(filePath);
  } catch (err) {
    // File does not exist yet - create it with an empty list.
    await fs.writeFile(filePath, '[]', 'utf8');
  }
}

/**
 * Reads all expenses from the data file.
 *
 * Handles three failure modes gracefully instead of throwing:
 *   - missing file      -> created on the fly, returns []
 *   - empty file        -> returns []
 *   - malformed JSON     -> logs a warning, returns [] (does not crash the API)
 *
 * Note: a malformed file is NOT overwritten here. We only reset the
 * in-memory view to []; the next successful write is what will repair
 * the file on disk. This avoids silently destroying data a human might
 * want to recover by hand.
 */
async function readExpenses() {
  const filePath = getDataFilePath();
  await ensureFileExists(filePath);

  let raw;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (err) {
    console.warn(`[fileStorage] Failed to read ${filePath}: ${err.message}. Returning empty list.`);
    return [];
  }

  if (!raw || raw.trim().length === 0) {
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn(`[fileStorage] Malformed JSON in ${filePath}: ${err.message}. Returning empty list.`);
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.warn(`[fileStorage] Expected an array in ${filePath} but found ${typeof parsed}. Returning empty list.`);
    return [];
  }

  return parsed;
}

/**
 * Overwrites the data file with the given list of expenses.
 */
async function writeExpenses(expenses) {
  const filePath = getDataFilePath();
  await ensureFileExists(filePath);
  await fs.writeFile(filePath, JSON.stringify(expenses, null, 2), 'utf8');
}

module.exports = {
  readExpenses,
  writeExpenses,
  getDataFilePath,
};
