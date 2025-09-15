// Helper: append to log
function log(line, obj) {
  const el = document.getElementById('log');
  const ts = new Date().toISOString();
  const msg = obj ? `${line}\n${JSON.stringify(obj, null, 2)}` : line;
  el.textContent += `\n[${ts}] ${msg}`;
  el.scrollTop = el.scrollHeight;
}

// CSRF: fetch a fresh token before each mutating request
async function getCsrfToken() {
  const r = await fetch('/csrf-token', {
    method: 'GET',
    credentials: 'include'
  });
  if (!r.ok) throw new Error(`csrf-token failed: ${r.status}`);
  const data = await r.json();
  return data.csrfToken;
}

// Simple JSON POST with CSRF header and cookie credentials
async function postJSON(url, body) {
  const token = await getCsrfToken();
  const r = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': token
    },
    body: JSON.stringify(body || {})
  });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!r.ok) {
    const err = new Error(`POST ${url} -> ${r.status}`);
    err.data = data;
    throw err;
  }
  return data;
}

// GET helper (for /me)
async function getJSON(url) {
  const r = await fetch(url, { credentials: 'include' });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!r.ok) {
    const err = new Error(`GET ${url} -> ${r.status}`);
    err.data = data;
    throw err;
  }
  return data;
}

// Wire up forms/buttons
window.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const whoamiBtn = document.getElementById('whoami-btn');
  const logoutBtn = document.getElementById('logout-btn');

  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-pass').value;
    try {
      const res = await postJSON('/auth/register', { email, password });
      log('Registered:', res);
    } catch (err) {
      log('Register error:', err.data || err.message);
    }
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-pass').value;
    try {
      const res = await postJSON('/auth/login', { email, password });
      log('Logged in:', res);
    } catch (err) {
      log('Login error:', err.data || err.message);
    }
  });

  whoamiBtn.addEventListener('click', async () => {
    try {
      const me = await getJSON('/me');
      log('Me:', me);
    } catch (err) {
      log('Me error:', err.data || err.message);
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      const res = await postJSON('/auth/logout', {});
      log('Logged out:', res);
    } catch (err) {
      log('Logout error:', err.data || err.message);
    }
  });

  log('UI initialized. Use the forms above.');
});
