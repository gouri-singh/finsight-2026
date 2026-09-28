const express = require('express');
const router = express.Router();
const db = require('../db/database');

const getUserId = (req) => {
  return req.headers['x-user-id'] || 'demo_user';
};

// GET all transactions with filters
router.get('/', (req, res) => {
  const userId = getUserId(req);
  const { category, type, startDate, endDate, search, limit, offset } = req.query;

  let query = 'SELECT * FROM transactions WHERE user_id = ?';
  let params = [userId];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (type && type !== 'All') {
    query += ' AND type = ?';
    params.push(type.toLowerCase());
  }

  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }

  if (search) {
    query += ' AND (description LIKE ? OR category LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit));
    if (offset) {
      query += ' OFFSET ?';
      params.push(parseInt(offset));
    }
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// POST add new transaction
router.post('/', (req, res) => {
  const userId = getUserId(req);
  const { type, amount, category, date, description } = req.body;

  if (!type || !amount || !category || !date) {
    return res.status(400).json({ error: 'Type, amount, category, and date are required.' });
  }

  const id = 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  db.run(
    'INSERT INTO transactions (id, user_id, type, amount, category, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, userId, type.toLowerCase(), parseFloat(amount), category, date, description || ''],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id,
        user_id: userId,
        type: type.toLowerCase(),
        amount: parseFloat(amount),
        category,
        date,
        description: description || ''
      });
    }
  );
});

// PUT update transaction
router.put('/:id', (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;
  const { type, amount, category, date, description } = req.body;

  db.run(
    'UPDATE transactions SET type = ?, amount = ?, category = ?, date = ?, description = ? WHERE id = ? AND user_id = ?',
    [type.toLowerCase(), parseFloat(amount), category, date, description || '', id, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
      res.json({ id, user_id: userId, type, amount, category, date, description });
    }
  );
});

// DELETE transaction
router.delete('/:id', (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;

  db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted successfully' });
  });
});

// SEED sample transactions for testing analytics
router.post('/seed', (req, res) => {
  const userId = getUserId(req);

  // Clear existing transactions for user first
  db.run('DELETE FROM transactions WHERE user_id = ?', [userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const categories = ['Food', 'Shopping', 'Transport', 'Education', 'Entertainment', 'Bills', 'Healthcare', 'Travel'];
    const sampleData = [];

    // Helper to format date
    const getDateStr = (monthsAgo, day) => {
      const d = new Date();
      d.setMonth(d.getMonth() - monthsAgo);
      d.setDate(day);
      return d.toISOString().split('T')[0];
    };

    // Generate 6 months of data
    for (let m = 5; m >= 0; m--) {
      // Monthly Salary
      sampleData.push({
        id: `seed_sal_${m}`,
        user_id: userId,
        type: 'income',
        amount: 4500.00,
        category: 'Salary',
        date: getDateStr(m, 1),
        description: 'Monthly Paycheck'
      });

      // Freelance Income (some months)
      if (m % 2 === 0) {
        sampleData.push({
          id: `seed_free_${m}`,
          user_id: userId,
          type: 'income',
          amount: 850.00,
          category: 'Freelance',
          date: getDateStr(m, 15),
          description: 'UI Design Client Project'
        });
      }

      // Rent / Bills
      sampleData.push({
        id: `seed_rent_${m}`,
        user_id: userId,
        type: 'expense',
        amount: 1400.00,
        category: 'Bills',
        date: getDateStr(m, 2),
        description: 'Apartment Rent & Utilities'
      });

      // Internet & Phone
      sampleData.push({
        id: `seed_net_${m}`,
        user_id: userId,
        type: 'expense',
        amount: 95.00,
        category: 'Bills',
        date: getDateStr(m, 5),
        description: 'High-speed Fiber & Mobile'
      });

      // Food & Groceries
      sampleData.push({ id: `seed_food1_${m}`, user_id: userId, type: 'expense', amount: 165.40, category: 'Food', date: getDateStr(m, 4), description: 'Weekly WholeFoods Grocery' });
      sampleData.push({ id: `seed_food2_${m}`, user_id: userId, type: 'expense', amount: 48.50, category: 'Food', date: getDateStr(m, 10), description: 'Dinner with colleagues' });
      sampleData.push({ id: `seed_food3_${m}`, user_id: userId, type: 'expense', amount: 180.20, category: 'Food', date: getDateStr(m, 18), description: 'Supermarket restock' });
      sampleData.push({ id: `seed_food4_${m}`, user_id: userId, type: 'expense', amount: 62.00, category: 'Food', date: getDateStr(m, 24), description: 'Weekend Brunch' });

      // Transport
      sampleData.push({ id: `seed_trans1_${m}`, user_id: userId, type: 'expense', amount: 65.00, category: 'Transport', date: getDateStr(m, 6), description: 'Monthly Transit Pass' });
      sampleData.push({ id: `seed_trans2_${m}`, user_id: userId, type: 'expense', amount: 42.50, category: 'Transport', date: getDateStr(m, 20), description: 'Uber rides' });

      // Shopping
      sampleData.push({ id: `seed_shop1_${m}`, user_id: userId, type: 'expense', amount: 120.00 + (m === 1 ? 450.00 : 0), category: 'Shopping', date: getDateStr(m, 12), description: m === 1 ? 'New Laptop Monitor (Spike Anomaly!)' : 'Clothing & Essentials' });

      // Entertainment
      sampleData.push({ id: `seed_ent1_${m}`, user_id: userId, type: 'expense', amount: 35.00, category: 'Entertainment', date: getDateStr(m, 8), description: 'Streaming subscriptions' });
      sampleData.push({ id: `seed_ent2_${m}`, user_id: userId, type: 'expense', amount: 85.00, category: 'Entertainment', date: getDateStr(m, 22), description: 'Concert Tickets' });

      // Healthcare
      sampleData.push({ id: `seed_health_${m}`, user_id: userId, type: 'expense', amount: 75.00, category: 'Healthcare', date: getDateStr(m, 14), description: 'Pharmacy & Dental Checkup' });

      // Travel (1 special month)
      if (m === 2) {
        sampleData.push({ id: `seed_travel_${m}`, user_id: userId, type: 'expense', amount: 680.00, category: 'Travel', date: getDateStr(m, 16), description: 'Weekend Beach Getaway' });
      }
    }

    const stmt = db.prepare('INSERT INTO transactions (id, user_id, type, amount, category, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)');
    sampleData.forEach((item) => {
      stmt.run([item.id, item.user_id, item.type, item.amount, item.category, item.date, item.description]);
    });
    stmt.finalize();

    // Also seed realistic budgets
    const seedBudgets = [
      { category: 'Food', amount: 500.00 },
      { category: 'Shopping', amount: 300.00 },
      { category: 'Transport', amount: 200.00 },
      { category: 'Bills', amount: 1600.00 },
      { category: 'Entertainment', amount: 200.00 },
      { category: 'Healthcare', amount: 150.00 },
      { category: 'Travel', amount: 400.00 }
    ];

    const currMonth = new Date().toISOString().slice(0, 7);
    const bStmt = db.prepare('INSERT OR REPLACE INTO budgets (id, user_id, category, amount, month) VALUES (?, ?, ?, ?, ?)');
    seedBudgets.forEach((b, idx) => {
      bStmt.run([`b_${idx}_${currMonth}`, userId, b.category, b.amount, currMonth]);
    });
    bStmt.finalize();

    res.json({
      message: 'Sample financial data successfully seeded!',
      inserted_transactions: sampleData.length
    });
  });
});

module.exports = router;
