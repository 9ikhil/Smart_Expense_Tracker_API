# Smart Expense Tracker API

A small REST API for tracking personal expenses: add them, list them, filter by
category, see totals, and delete them. Data is persisted to a local JSON file —
there is no database.

## Project Overview

- **Stack:** Node.js, Express.js
- **Storage:** local JSON file (`src/data/expenses.json`), no database
- **Testing:** Jest + Supertest
- **Docs (bonus):** interactive Swagger UI at `/api-docs`
- **Architecture:** routes → controllers (thin, HTTP-only) → services (business
  logic) → file storage utility, with centralized validation and error handling

```
src/
  app.js                          Express app factory (no .listen() here)
  server.js                       Entry point — creates the app and starts listening
  routes/expense.routes.js        URL → controller wiring
  controllers/expense.controller.js  Thin HTTP layer, delegates to the service
  services/expense.service.js     All business logic (add/list/filter/summary/delete)
  models/expense.model.js         Expense shape + how a new one is constructed
  middleware/validation.middleware.js  Request body validation for POST /expenses
  middleware/error.middleware.js  404 handler + centralized error handler
  utils/fileStorage.js            Safe async JSON file read/write
  data/expenses.json              The actual data file
  docs/openapi.json               Hand-written OpenAPI 3.0 spec (bonus)
tests/
  expense.test.js                 Jest + Supertest test suite
```

## Installation

Requires Node.js 18+.

```bash
npm install
npm start
npm test
```

- `npm start` runs the API on `http://localhost:3000` (override with `PORT=xxxx npm start`)
- `npm run dev` does the same but restarts on file changes (`node --watch`)
- `npm test` runs the Jest + Supertest suite with a coverage report
- Interactive docs (bonus): once the server is running, open
  `http://localhost:3000/api-docs`

## API Documentation

All responses follow the same envelope:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "Expense not found" }
```

### `POST /expenses`

Creates a new expense.

**Request body**

| Field    | Type   | Rules                                   |
|----------|--------|------------------------------------------|
| title    | string | required, non-empty                     |
| amount   | number | required, must be a positive JSON number (not a numeric string) |
| category | string | required, non-empty                     |
| date     | string | required, valid ISO date (`2026-01-15` or `2026-01-15T10:30:00Z`) |

**Example request**

```bash
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -d '{"title": "Groceries", "amount": 42.5, "category": "Food", "date": "2026-01-15"}'
```

**201 Created**

```json
{
  "success": true,
  "data": {
    "id": "b3f1e2b0-1e3a-4b0e-8f9a-2c3d4e5f6a7b",
    "title": "Groceries",
    "amount": 42.5,
    "category": "Food",
    "date": "2026-01-15",
    "createdAt": "2026-01-15T09:12:03.000Z"
  }
}
```

**400 Bad Request** (e.g. missing title, negative amount, invalid date)

```json
{
  "success": false,
  "message": "amount is required and must be a positive number"
}
```

### `GET /expenses`

Returns every expense.

```bash
curl http://localhost:3000/expenses
```

**200 OK**

```json
{
  "success": true,
  "data": [
    { "id": "...", "title": "Groceries", "amount": 42.5, "category": "Food", "date": "2026-01-15", "createdAt": "..." }
  ]
}
```

### `GET /expenses?category=Food`

Same as above, filtered by category (case-insensitive).

```bash
curl "http://localhost:3000/expenses?category=Food"
```

**200 OK** — same shape as `GET /expenses`, filtered.

### `GET /expenses/summary`

Overall total and per-category totals.

```bash
curl http://localhost:3000/expenses/summary
```

**200 OK**

```json
{
  "success": true,
  "data": {
    "total": 142.75,
    "byCategory": { "Food": 82.5, "Transport": 60.25 },
    "count": 5
  }
}
```

### `DELETE /expenses/:id`

Deletes a single expense by id.

```bash
curl -X DELETE http://localhost:3000/expenses/b3f1e2b0-1e3a-4b0e-8f9a-2c3d4e5f6a7b
```

**204 No Content** — empty body on success.

**404 Not Found**

```json
{ "success": false, "message": "Expense with id \"xyz\" not found" }
```

### `GET /health`

Simple liveness check, returns `{ "success": true, "data": { "status": "ok" } }`.

### `GET /api-docs`

Interactive Swagger UI, generated from `src/docs/openapi.json`.

## Response Codes

| Code | Meaning                                    |
|------|---------------------------------------------|
| 200  | OK — GET succeeded                          |
| 201  | Created — expense added                     |
| 204  | No Content — expense deleted                |
| 400  | Bad Request — validation failed / malformed JSON body |
| 404  | Not Found — unknown route or missing expense id |
| 500  | Internal Server Error — unexpected failure  |

## Design Decisions & Trade-offs

- **File storage, not a database**, per the assignment. Reads/writes go through
  `utils/fileStorage.js`, which handles a missing file, an empty file, and
  malformed/non-array JSON by logging a warning and falling back to an empty
  list rather than crashing the process.
- **No write locking.** Each request reads the whole file, mutates in memory,
  and writes it back. For a small local tool this is fine; under heavy
  concurrent writes there's a theoretical last-write-wins race. A real
  production version would use a proper embedded store (SQLite) or a write
  queue — out of scope here per "do not use a database" / "do not
  over-engineer."
- **Strict `amount` typing.** `"amount": "10"` (a string) is rejected, not
  coerced. Silently coercing types tends to hide client bugs; the 400 makes
  the mistake visible immediately.
- **Category filtering is case-insensitive** (`?category=food` matches
  `"Food"`) since that's how most users expect search/filter to behave, even
  though the assignment didn't specify it either way.
- **Swagger docs are a static hand-written `openapi.json`** rather than
  generated from JSDoc comments (`swagger-jsdoc`). One fewer dependency, and
  the spec can't drift silently out of sync with comments nobody re-reads.

See `AI_NOTES.md` for what was AI-generated vs. manually reviewed, and what
AI suggestions were rejected.
