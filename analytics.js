const express = require('express');
const router = express.Router();
const path = require('path');
const { spawn } = require('child_process');
const db = require('../db/database');

const getUserId = (req) => req.headers['x-user-id'] || 'demo_user';

// GET Analytics Data by calling Python Analytics Engine
router.get('/', (req, res) => {
  const userId = getUserId(req);

  db.all('SELECT * FROM transactions WHERE user_id = ?', [userId], (err, transactions) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all('SELECT * FROM budgets WHERE user_id = ?', [userId], (err, budgets) => {
      if (err) return res.status(500).json({ error: err.message });

      const payload = JSON.stringify({ transactions, budgets });
      const scriptPath = path.join(__dirname, '..', 'analytics', 'analytics_engine.py');

      // Execute Python script
      const pythonProcess = spawn('python', [scriptPath]);
      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdin.write(payload);
      pythonProcess.stdin.end();

      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData.trim());
            return res.json({ source: 'python_pandas_engine', ...parsed });
          } catch (e) {
            console.error('Failed to parse Python analytics JSON output:', e.message);
          }
        }
        console.warn('Fallback to JS Analytics engine:', stderrData);
        // Fallback JS processing
        return res.json({ source: 'js_fallback_engine', ...computeJsAnalytics(transactions, budgets) });
      });
    });
  });
});

// JavaScript fallback analytics function
function computeJsAnalytics(transactions = [], budgets = []) {
  if (!transactions || transactions.length === 0) {
    return {
      summary: { total_income: 0, total_expenses: 0, net_savings: 0, savings_rate: 0, avg_monthly_expense: 0, avg_daily_expense: 0, transaction_count: 0 },
      category_breakdown: [],
      monthly_trends: [],
      unusual_spending: [],
      smart_insights: ["No transactions recorded yet."]
    };
  }

  let total_income = 0;
  let total_expenses = 0;
  const categoryMap = {};
  const monthlyMap = {};

  transactions.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    const dateStr = t.date;
    const monthKey = dateStr ? dateStr.slice(0, 7) : 'Unknown';

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { income: 0, expenses: 0 };
    }

    if (t.type === 'income') {
      total_income += amt;
      monthlyMap[monthKey].income += amt;
    } else {
      total_expenses += amt;
      monthlyMap[monthKey].expenses += amt;
      categoryMap[t.category] = (categoryMap[t.category] || 0) + amt;
    }
  });

  const net_savings = total_income - total_expenses;
  const savings_rate = total_income > 0 ? (net_savings / total_income) * 100 : 0;

  const category_breakdown = Object.keys(categoryMap).map(cat => ({
    category: cat,
    amount: categoryMap[cat],
    percentage: total_expenses > 0 ? (categoryMap[cat] / total_expenses) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  const monthly_trends = Object.keys(monthlyMap).sort().map(mKey => ({
    month_key: mKey,
    month: mKey,
    income: monthlyMap[mKey].income,
    expenses: monthlyMap[mKey].expenses,
    savings: monthlyMap[mKey].income - monthlyMap[mKey].expenses
  }));

  return {
    summary: {
      total_income,
      total_expenses,
      net_savings,
      savings_rate,
      avg_monthly_expense: total_expenses / Math.max(1, monthly_trends.length),
      avg_daily_expense: total_expenses / 30,
      transaction_count: transactions.length
    },
    category_breakdown,
    monthly_trends,
    unusual_spending: [],
    smart_insights: [
      category_breakdown.length > 0 ? `Top Category: ${category_breakdown[0].category} ($${category_breakdown[0].amount.toFixed(2)})` : "No expense categories recorded.",
      `Current Savings Rate is ${savings_rate.toFixed(1)}%.`
    ]
  };
}

module.exports = router;
