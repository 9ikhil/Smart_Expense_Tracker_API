const path = require('path');
const fs = require('fs');

// Point the app at an isolated data file BEFORE requiring the app,
// so tests never touch src/data/expenses.json.
const TEST_DATA_PATH = path.join(__dirname, 'test-expenses.json');
process.env.EXPENSES_FILE_PATH = TEST_DATA_PATH;

const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

beforeEach(() => {
  fs.writeFileSync(TEST_DATA_PATH, '[]', 'utf8');
});

afterAll(() => {
  if (fs.existsSync(TEST_DATA_PATH)) {
    fs.unlinkSync(TEST_DATA_PATH);
  }
});

describe('GET /health', () => {
  test('returns 200 ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /expenses', () => {
  test('creates a new expense and returns 201', async () => {
    const res = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: 4.5, category: 'Food', date: '2026-01-15' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      title: 'Coffee',
      amount: 4.5,
      category: 'Food',
      date: '2026-01-15',
    });
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.createdAt).toBeDefined();
  });

  test('trims whitespace from title and category', async () => {
    const res = await request(app)
      .post('/expenses')
      .send({ title: '  Coffee  ', amount: 4.5, category: '  Food  ', date: '2026-01-15' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Coffee');
    expect(res.body.data.category).toBe('Food');
  });

  test('rejects a request with a missing title', async () => {
    const res = await request(app)
      .post('/expenses')
      .send({ amount: 10, category: 'Food', date: '2026-01-15' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/title/i);
  });

  test('rejects a request with an empty-string title', async () => {
    const res = await request(app)
      .post('/expenses')
      .send({ title: '   ', amount: 10, category: 'Food', date: '2026-01-15' });

    expect(res.status).toBe(400);
  });

  test('rejects a request with a negative amount', async () => {
    const res = await request(app)
      .post('/expenses')
      .send({ title: 'Refund', amount: -5, category: 'Food', date: '2026-01-15' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/amount/i);
  });

  test('rejects a request with a zero amount', async () => {
    const res = await request(app)
      .post('/expenses')
      .send({ title: 'Free item', amount: 0, category: 'Food', date: '2026-01-15' });

    expect(res.status).toBe(400);
  });

  test('rejects a request where amount is a numeric string, not a number', async () => {
    const res = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: '4.5', category: 'Food', date: '2026-01-15' });

    expect(res.status).toBe(400);
  });

  test('rejects a request with a missing category', async () => {
    const res = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: 4.5, date: '2026-01-15' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/category/i);
  });

  test('rejects a request with an invalid date', async () => {
    const res = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: 4.5, category: 'Food', date: 'not-a-date' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/date/i);
  });

  test('accepts a full ISO datetime, not just a plain date', async () => {
    const res = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: 4.5, category: 'Food', date: '2026-01-15T10:30:00Z' });

    expect(res.status).toBe(201);
  });

 test('rejects a malformed JSON body', async () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  const res = await request(app)
    .post('/expenses')
    .set('Content-Type', 'application/json')
    .send('{ this is not valid json');

  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);

  consoleErrorSpy.mockRestore();
});
});

describe('GET /expenses', () => {
  test('returns an empty list when no expenses exist', async () => {
    const res = await request(app).get('/expenses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  test('returns all created expenses', async () => {
    await request(app).post('/expenses').send({ title: 'Coffee', amount: 4.5, category: 'Food', date: '2026-01-15' });
    await request(app).post('/expenses').send({ title: 'Bus ticket', amount: 2, category: 'Transport', date: '2026-01-16' });

    const res = await request(app).get('/expenses');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});

describe('GET /expenses?category=', () => {
  beforeEach(async () => {
    await request(app).post('/expenses').send({ title: 'Coffee', amount: 4.5, category: 'Food', date: '2026-01-15' });
    await request(app).post('/expenses').send({ title: 'Lunch', amount: 10.5, category: 'Food', date: '2026-01-15' });
    await request(app).post('/expenses').send({ title: 'Bus ticket', amount: 2, category: 'Transport', date: '2026-01-16' });
  });

  test('filters expenses by category', async () => {
    const res = await request(app).get('/expenses?category=Food');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  test('filter is case-insensitive', async () => {
    const res = await request(app).get('/expenses?category=food');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  test('returns an empty list for a category with no matches', async () => {
    const res = await request(app).get('/expenses?category=Entertainment');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('GET /expenses/summary', () => {
  test('computes the overall total and per-category totals', async () => {
    await request(app).post('/expenses').send({ title: 'Coffee', amount: 4.5, category: 'Food', date: '2026-01-15' });
    await request(app).post('/expenses').send({ title: 'Lunch', amount: 10.5, category: 'Food', date: '2026-01-15' });
    await request(app).post('/expenses').send({ title: 'Bus ticket', amount: 2, category: 'Transport', date: '2026-01-16' });

    const res = await request(app).get('/expenses/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(17);
    expect(res.body.data.byCategory).toEqual({ Food: 15, Transport: 2 });
    expect(res.body.data.count).toBe(3);
  });

  test('returns zeroed summary when there are no expenses', async () => {
    const res = await request(app).get('/expenses/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(0);
    expect(res.body.data.byCategory).toEqual({});
    expect(res.body.data.count).toBe(0);
  });

  test('merges differently-cased categories into a single bucket', async () => {
    await request(app).post('/expenses').send({ title: 'Snacks', amount: 5, category: 'Food', date: '2026-01-01' });
    await request(app).post('/expenses').send({ title: 'Dinner', amount: 15, category: 'food', date: '2026-01-02' });
    await request(app).post('/expenses').send({ title: 'Brunch', amount: 20, category: 'FOOD', date: '2026-01-03' });

    const res = await request(app).get('/expenses/summary');
    expect(Object.keys(res.body.data.byCategory)).toHaveLength(1);
    expect(res.body.data.byCategory.Food).toBe(40);
    expect(res.body.data.total).toBe(40);
  });

  test('avoids floating point drift (0.1 + 0.2 case)', async () => {
    await request(app).post('/expenses').send({ title: 'A', amount: 0.1, category: 'X', date: '2026-01-01' });
    await request(app).post('/expenses').send({ title: 'B', amount: 0.2, category: 'X', date: '2026-01-01' });

    const res = await request(app).get('/expenses/summary');
    expect(res.body.data.total).toBe(0.3);
  });
});

describe('DELETE /expenses/:id', () => {
  test('deletes an existing expense and returns 204 with no body', async () => {
    const createRes = await request(app)
      .post('/expenses')
      .send({ title: 'Coffee', amount: 4.5, category: 'Food', date: '2026-01-15' });

    const { id } = createRes.body.data;

    const deleteRes = await request(app).delete(`/expenses/${id}`);
    expect(deleteRes.status).toBe(204);
    expect(deleteRes.body).toEqual({});

    const listRes = await request(app).get('/expenses');
    expect(listRes.body.data).toHaveLength(0);
  });

  test('returns 404 when deleting a non-existent expense', async () => {
    const res = await request(app).delete('/expenses/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });
});

describe('Unknown routes', () => {
  test('returns 404 for a completely unknown route', async () => {
    const res = await request(app).get('/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api-docs', () => {
  test('serves the Swagger UI page', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/swagger/i);
  });
});

describe('fileStorage resilience (exercised through the API)', () => {
  test('gracefully handles a missing data file', async () => {
    if (fs.existsSync(TEST_DATA_PATH)) {
      fs.unlinkSync(TEST_DATA_PATH);
    }

    const res = await request(app).get('/expenses');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('gracefully handles an empty data file', async () => {
    fs.writeFileSync(TEST_DATA_PATH, '', 'utf8');

    const res = await request(app).get('/expenses');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('gracefully handles a malformed (corrupted) data file', async () => {
    fs.writeFileSync(TEST_DATA_PATH, '{ this is not valid json', 'utf8');

    const res = await request(app).get('/expenses');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('gracefully handles a data file that is valid JSON but not an array', async () => {
    fs.writeFileSync(TEST_DATA_PATH, '{"oops": true}', 'utf8');

    const res = await request(app).get('/expenses');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});
