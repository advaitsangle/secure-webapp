// handles 404 and 500 errors

export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err, req, res, _next) {
  // Handle CSRF errors explicitly
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Internal server error' });
}
