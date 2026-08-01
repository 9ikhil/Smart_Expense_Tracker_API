/**
 * Catches any request that didn't match a route.
 * Must be registered AFTER all other routes.
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Centralized error handler. Any `next(err)` call from a controller,
 * or a synchronous throw inside Express middleware (e.g. malformed
 * JSON bodies from express.json()), ends up here.
 *
 * Must be registered LAST, and must keep all four arguments
 * (req, res, next are still required even though `next` is unused -
 * Express identifies error handlers by arity).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = { notFoundHandler, errorHandler };
