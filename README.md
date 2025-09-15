# Secure Web App Demo

A minimal **Node.js + Express** backend showcasing secure authentication practices with a simple frontend demo.

## Features
- Password hashing with bcrypt
- Input validation via `express-validator`
- Parameterized SQLite queries
- JWT auth in `httpOnly`, `SameSite=Strict` cookies
- CSRF protection with `csurf`
- Security headers via Helmet (CSP, frame-ancestors, etc.)
- Rate limiting on `/auth/*`
- Centralized error handling
- Static demo UI

## Structure
```secure-app/
├─ package.json
├─ .env
├─ src/
│  ├─ server.js              # Entry point: wires middleware, routes, errors
│  ├─ db.js                  # SQLite setup + prepared statements
│  ├─ security.js            # Helmet, CSRF, rate limiting
│  ├─ validators.js          # express-validator rules
│  ├─ authRoutes.js          # /register, /login, /logout
│  └─ middleware/
│     ├─ auth.js             # JWT sign/verify helpers
│     └─ errors.js           # Not found + error handler
└─ public/
   ├─ index.html             # Demo UI
   └─ app.js                 # JS that calls backend (with CSRF token, cookies)
```


## Setup
```bash
git clone https://github.com/advaitsangle/secure-webapp.git
cd secure-webapp
npm install
cp .env.example .env   # set a strong JWT_SECRET
npm run start

