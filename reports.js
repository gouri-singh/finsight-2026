const express = require('express');
const router = express.Router();
const db = require('../db/database');

const getUserId = (req) => req.headers['x-user-id'] || 'demo_user';

router.get('/summary', (req, res) => {
  const userId = getUserId(req);
  const { month } = req.query;

  let txQuery = 'SELECT * FROM transactions WHERE user_id = ?';
  let txParams = [userId];

  if (month) {
    txQuery += ' AND date LIKE ?';
    txParams.push(`${month}%`);
  }

  txQuery += ' ORDER BY date DESC';

  db.all(txQuery, txParams, (err, transactions) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all('SELECT * FROM budgets WHERE user_id = ?', [userId], (err, budgets) => {
      if (err) return res.status(500).json({ error: err.message });

      let income = 0;
      let expenses = 0;
      const catMap = {};

      transactions.forEach(t => {
        const amt = parseFloat(t.amount) || 0;
        if (t.type === 'income') {
          income += amt;
        } else {
          expenses += amt;
          catMap[t.category] = (catMap[t.category] || 0) + amt;
        }
      });

      const savings = income - expenses;
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;

      const categoryBreakdown = Object.keys(catMap).map(c => ({
        category: c,
        amount: catMap[c],
        percentage: expenses > 0 ? ((catMap[c] / expenses) * 100).toFixed(1) : 0
      })).sort((a, b) => b.amount - a.amount);

      res.json({
        reportTitle: 'FinSight Financial Health & Analytics Summary',
        generatedAt: new Date().toISOString(),
        period: month || 'All Time',
        metrics: {
          totalIncome: income,
          totalExpenses: expenses,
          netSavings: savings,
          savingsRate: savingsRate.toFixed(1) + '%',
          transactionCount: transactions.length
        },
        categoryBreakdown,
        transactions: transactions.slice(0, 50),
        budgets
      });
    });
  });
});

module.exports = router;
