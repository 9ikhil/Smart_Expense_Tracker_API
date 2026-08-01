const express = require('express');
const swaggerUi = require('swagger-ui-express');

const expenseRoutes = require('./routes/expense.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const openapiSpec = require('./docs/openapi.json');

/**
 * Builds a fresh Express app instance.
 *
 * This is a factory (rather than a module-level singleton) so that
 * tests can create isolated app instances without ever calling
 * `.listen()`, and so `server.js` stays a thin entry point.
 */
function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (req, res) => {
    res.status(200).json({ success: true, data: { status: 'ok' } });
  });

  app.use('/expenses', expenseRoutes);

  // Bonus: interactive API docs at /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

  // Must be registered after all real routes.
  app.use(notFoundHandler);
  // Must be registered last of all.
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
