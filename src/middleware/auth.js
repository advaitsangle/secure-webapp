// handles signing and verifying auth JWTs

import jwt from 'jsonwebtoken';

export function signAuthJWT(payload, secret) {
  // Short TTL to reduce risk; rotate tokens as needed
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '1h' });
}

export function verifyAuthJWT(secret) {
  return function (req, res, next) {
    const token = req.cookies?.auth;
    if (!token) return res.status(401).json({ error: 'Unauthenticated' });
    try {
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
      req.user = decoded;
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid/expired token' });
    }
  };
}
