// auth.js
// Small helper functions shared across pages for talking to the API
// and managing the JWT stored in the browser.

const API_BASE = 'https://expense-tracker-1-ezbr.onrender.com';

function saveToken(token) {
  // In-memory + localStorage would be typical in a real app; for this
  // learning project localStorage is fine since there's no sensitive
  // data beyond the user's own expenses.
  localStorage.setItem('token', token);
}

function getToken() {
  return localStorage.getItem('token');
}

function clearToken() {
  localStorage.removeItem('token');
}

function requireLoginOrRedirect() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 401) {
    // token missing/expired - send them back to login
    clearToken();
    window.location.href = 'login.html';
    return;
  }

  return response;
}
