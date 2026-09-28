const express = require('express');
const router = express.Router();
const db = require('../db/database');

const getUserId = (req) => req.headers['x-user-id'] || 'demo_user';

// GET budgets for month with real-time actual spending calculation
router.get('/', (req, res) => {
  const userId = getUserId(req);
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  // Get budget limits
  db.all('SELECT * FROM budgets WHERE user_id = ? AND month = ?', [userId, month], (err, budgetRows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Get actual expense spending per category for this month
    const monthPrefix = month + '%';
    db.all(
      `SELECT category, SUM(amount) as spent 
       FROM transactions 
       WHERE user_id = ? AND type = 'expense' AND date LIKE ? 
       GROUP BY category`,
      [userId, monthPrefix],
      (err, spendingRows) => {
        if (err) return res.status(500).json({ error: err.message });

        const spentMap = {};
        (spendingRows || []).forEach(r => {
          spentMap[r.category] = r.spent || 0;
        });

        const result = (budgetRows || []).map(b => {
          const spent = spentMap[b.category] || 0;
          const remaining = b.amount - spent;
          const usage_pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
          let status = 'normal';
          if (usage_pct >= 100) status = 'exceeded';
          else if (usage_pct >= 80) status = 'warning';

          return {
            id: b.id,
            category: b.category,
            budget_amount: b.amount,
            spent: round(spent, 2),
            remaining: round(remaining, 2),
            usage_percentage: round(usage_pct, 1),
            status,
            month: b.month
          };
        });

        res.json({ month, budgets: result });
      }
    );
  });
});

// POST upsert budget for a category
router.post('/', (req, res) => {
  const userId = getUserId(req);
  const { category, amount, month } = req.body;

  if (!category || amount === undefined) {
    return res.status(400).json({ error: 'Category and amount are required' });
  }

  const targetMonth = month || new Date().toISOString().slice(0, 7);
  const id = `b_${Date.now()}_${Math.floor(Math.random()*1000)}`;

  db.run(
    `INSERT INTO budgets (id, user_id, category, amount, month)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, category, month) DO UPDATE SET amount = excluded.amount`,
    [id, userId, category, parseFloat(amount), targetMonth],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Budget updated successfully', category, amount: parseFloat(amount), month: targetMonth });
    }
  );
});

function round(val, decimals = 2) {
  return Number(Math.round(val + 'e' + decimals) + 'e-' + decimals);
}

module.exports = router;
