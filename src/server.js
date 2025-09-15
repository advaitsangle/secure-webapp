import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// create the express app
import express from 'express';
import { helmetMiddleware, parseCookies, csrfMiddleware, authLimiter } from './security.js';
import { notFound, errorHandler } from './middleware/errors.js';
import { buildAuthRouter } from './authRoutes.js';
import { verifyAuthJWT } from './middleware/auth.js';
import { stmts } from './db.js';

const app = express();

const PORT = process.env.PORT || 8787;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET missing in environment');
  process.exit(1);
}

const CSRF_COOKIE_SECURE = String(process.env.CSRF_COOKIE_SECURE || 'false') === 'true';
const AUTH_COOKIE_SECURE = String(process.env.AUTH_COOKIE_SECURE || 'false') === 'true';
const sameSite = 'strict';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// configure middleware: security headers → cookies → body parsing → CSRF
app.use(helmetMiddleware()); // set http response headers for security
app.use(parseCookies()); 
app.use(express.json({ limit: '100kb' })); 
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// CSRF (cookie-based). Must come after cookie-parser & body parsers.
app.use(csrfMiddleware({ secureCookie: CSRF_COOKIE_SECURE, sameSite }));

app.use(express.static(path.join(__dirname, '..', 'public')));

// CSRF token provisioning endpoint. Frontend should hit this first, then
// include the token in the "x-csrf-token" header for all state-changing requests.
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Rate-limit auth routes
app.use('/auth', authLimiter, buildAuthRouter({
  jwtSecret: JWT_SECRET,
  authCookieSecure: AUTH_COOKIE_SECURE,
  sameSite
}));

// Example protected route
app.get('/me', verifyAuthJWT(JWT_SECRET), (req, res) => {
  const user = stmts.findUserByEmail.get(req.user.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email });
});

// Health
app.get('/healthz', (_req, res) => res.json({ ok: true, env: NODE_ENV }));

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Secure app listening on http://localhost:${PORT}`);
});
