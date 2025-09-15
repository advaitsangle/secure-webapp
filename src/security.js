// helmet, rate limiting, cookie parsing, CSRF protection

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';

export function helmetMiddleware() {
  // Conservative defaults + CSP (adjust if you host a frontend)
  return helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],      // disallow inline
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'none'"],
        "img-src": ["'self' data:"],
        "connect-src": ["'self'"],
        "form-action": ["'self'"],
        "upgrade-insecure-requests": []
      }
    },
    referrerPolicy: { policy: "no-referrer" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" }
  });
}

export function parseCookies() {
  return cookieParser();
}

// Rate limit auth endpoints: brute-force mitigation
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
});

// CSRF: double-submit cookie
export function csrfMiddleware({ secureCookie, sameSite = 'strict' } = {}) {
  return csrf({
    cookie: {
      httpOnly: true,              // prevent JS access
      sameSite,
      secure: !!secureCookie,      // true in prod behind HTTPS
      // Lax expiration: session cookie is fine for most cases
    }
  });
}
