const express = require('express');
const swaggerUi = require('swagger-ui-express');

const expenseRoutes = require('./routes/expense.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const openapiSpec = require('./docs/openapi.json');


function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (req, res) => {
    res.status(200).json({ success: true, data: { status: 'ok' } });
  });

  app.use('/expenses', expenseRoutes);

  // Bonus feature 
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

  app.use(notFoundHandler);
  
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
