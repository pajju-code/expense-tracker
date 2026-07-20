// routes/auth.js
// Handles account creation and login.
// Passwords are never stored in plain text - only a bcrypt hash.

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loadData, saveData } = require('../db');

const router = express.Router();

// POST /signup
router.post('/signup', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const data = loadData();

  const existing = data.users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10); // 10 salt rounds is a reasonable default

  const user = {
    id: data.nextUserId,
    email,
    password_hash: passwordHash,
  };
  data.users.push(user);
  data.nextUserId += 1;
  saveData(data);

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.status(201).json({ token, user: { id: user.id, email: user.email } });
});

// POST /login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const data = loadData();
  const user = data.users.find((u) => u.email === email);
  if (!user) {
    // Deliberately vague error - don't reveal whether the email exists
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatches = bcrypt.compareSync(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({ token, user: { id: user.id, email: user.email } });
});

module.exports = router;
