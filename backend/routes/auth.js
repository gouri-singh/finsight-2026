const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateId = () => 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'finsight_secure_jwt_secret_key_2026';

// Register
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const id = 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  db.run(
    'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
    [id, username, email, passwordHash],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }

      const token = jwt.sign({ id, username, email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        user: { id, username, email },
        token
      });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  });
});

// Get current user or create demo session
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json({
      user: { id: 'demo_user', username: 'Demo User', email: 'demo@finsight.app' }
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.json({
      user: { id: 'demo_user', username: 'Demo User', email: 'demo@finsight.app' }
    });
  }
});

module.exports = router;
