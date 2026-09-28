import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, PlusCircle, Target } from 'lucide-react';

export default function Budget({ budgets, onSetBudget, currentMonth }) {
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Food', 'Shopping', 'Transport', 'Education', 'Entertainment', 'Bills', 'Healthcare', 'Travel', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) return;
    setIsSubmitting(true);
    await onSetBudget(selectedCategory, parseFloat(budgetAmount), currentMonth);
    setBudgetAmount('');
    setIsSubmitting(false);
  };

  const totalBudget = budgets.reduce((acc, b) => acc + (b.budget_amount || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div>
      {/* Overview Cards */}
      <div className="metrics-grid" style={{ marginBottom: '28px' }}>
        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Monthly Budget</div>
            <div className="metric-value">${totalBudget.toFixed(2)}</div>
          </div>
          <div className="metric-icon budget">
            <Target size={24} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Spent</div>
            <div className="metric-value" style={{ color: totalSpent > totalBudget ? 'var(--color-expense)' : 'var(--text-primary)' }}>
              ${totalSpent.toFixed(2)}
            </div>
          </div>
          <div className="metric-icon expense">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Remaining Budget</div>
            <div className="metric-value" style={{ color: totalRemaining >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
              ${totalRemaining.toFixed(2)}
            </div>
          </div>
          <div className="metric-icon income">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', flexWrap: 'wrap' }}>
        {/* Category Budget Meters */}
        <div className="card">
          <div className="chart-header" style={{ marginBottom: '20px' }}>
            <h3 className="chart-title">Category Budget Status</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Month: {currentMonth}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {budgets.map((b) => {
              const spent = b.spent || 0;
              const limit = b.budget_amount || 0;
              const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
              const realPct = limit > 0 ? (spent / limit) * 100 : 0;

              let statusColor = '#10b981'; // Green
              let badgeClass = 'badge-income';
              let statusText = 'On Track';

              if (realPct >= 100) {
                statusColor = '#ef4444'; // Red
                badgeClass = 'badge-danger';
                statusText = 'Exceeded!';
              } else if (realPct >= 80) {
                statusColor = '#f59e0b'; // Amber
                badgeClass = 'badge-warning';
                statusText = 'Approaching Limit';
              }

              return (
                <div key={b.category} style={{ background: 'rgba(15,23,42,0.5)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{b.category}</strong>
                      <span className={`badge ${badgeClass}`} style={{ marginLeft: '10px' }}>
                        {statusText}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      <span style={{ color: spent > limit ? '#f87171' : 'var(--text-primary)', fontWeight: '700' }}>
                        ${spent.toFixed(2)}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}> / ${limit.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${pct}%`, background: statusColor }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>{realPct.toFixed(1)}% used</span>
                    <span>Remaining: ${(limit - spent).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}

            {budgets.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                No budgets configured yet for {currentMonth}. Set one below!
              </p>
            )}
          </div>
        </div>

        {/* Set / Update Budget Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="chart-title" style={{ marginBottom: '16px' }}>Set Category Budget</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Limit ($)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                className="form-control"
                placeholder="e.g. 500.00"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting}>
              <PlusCircle size={18} /> {isSubmitting ? 'Saving...' : 'Set Budget Limit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
