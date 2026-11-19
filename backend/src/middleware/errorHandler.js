class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const notFound = (req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });

// Turns any error into a clean JSON response. Never crashes the app.
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  const map = {
    ER_DUP_ENTRY: [409, 'A record with the same unique value already exists.'],
    ER_ROW_IS_REFERENCED_2: [409, 'Cannot delete: this record is used by other records.'],
    ER_NO_REFERENCED_ROW_2: [400, 'Related record does not exist (check the IDs).'],
    ER_CHECK_CONSTRAINT_VIOLATED: [400, 'A value breaks a database rule (e.g. negative stock).'],
    ECONNREFUSED: [503, 'Database is unavailable. Please try again shortly.'],
    PROTOCOL_CONNECTION_LOST: [503, 'Database connection was lost. Please try again.'],
    ER_ACCESS_DENIED_ERROR: [503, 'Database login failed. Check the .env settings.'],
    ER_BAD_DB_ERROR: [503, 'Database not found. Run database/schema.sql first.'],
  };
  const hit = map[err.code];
  if (hit) return res.status(hit[0]).json({ error: hit[1] });
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
}

module.exports = { HttpError, notFound, errorHandler };
