// handles register/login/logout.

import { Router } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { db, stmts, newSessionId } from './db.js';
import { registerValidator, loginValidator } from './validators.js';
import { signAuthJWT } from './middleware/auth.js';

export function buildAuthRouter({ jwtSecret, authCookieSecure, sameSite = 'strict' }) {
  const router = Router();

  // Helper: uniform validator error response
  function ensureValid(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array().map(e => e.msg) });
      return false;
    }
    return true;
  }

  router.post('/register', registerValidator, async (req, res) => {
    if (!ensureValid(req, res)) return;
    const { email, password } = req.body;

    const existing = stmts.findUserByEmail.get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    try {
      stmts.insertUser.run(email, hash); // PARAMETERIZED
    } catch (e) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
    return res.status(201).json({ ok: true });
  });

  router.post('/login', loginValidator, async (req, res) => {
    if (!ensureValid(req, res)) return;
    const { email, password } = req.body;

    const user = stmts.findUserByEmail.get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Optional: persist a server-side session id; not strictly required for JWT auth
    const sid = newSessionId();
    stmts.insertSession.run(sid, user.id);

    const token = signAuthJWT({ uid: user.id, sid, email: user.email }, jwtSecret);
    res.cookie('auth', token, {
      httpOnly: true,
      sameSite,
      secure: !!authCookieSecure,
      // Set a short maxAge to match JWT ttl (in ms). Here: ~1 hour.
      maxAge: 60 * 60 * 1000
    });

    return res.json({ ok: true });
  });

  router.post('/logout', (req, res) => {
    // Clear cookie and (optionally) best-effort delete session by sid if provided
    const token = req.cookies?.auth;
    if (token) {
      try {
        const decoded = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString('utf8')
        );
        if (decoded?.sid) {
          stmts.deleteSession.run(decoded.sid);
        }
      } catch { /* ignore */ }
    }
    res.clearCookie('auth');
    return res.json({ ok: true });
  });

  return router;
}
