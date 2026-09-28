import React, { useState } from 'react';
import { PiggyBank, ShieldCheck, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function Savings({ analytics }) {
  const summary = analytics?.summary || { total_income: 0, total_expenses: 0, net_savings: 0, savings_rate: 0, avg_monthly_expense: 0 };
  const monthlyTrends = analytics?.monthly_trends || [];

  const [emergencyMonthsGoal, setEmergencyMonthsGoal] = useState(6);
  const avgMonthlyExpense = summary.avg_monthly_expense || 1;
  const targetEmergencyFund = avgMonthlyExpense * emergencyMonthsGoal;
  const currentSavings = Math.max(0, summary.net_savings);
  const fundProgress = targetEmergencyFund > 0 ? Math.min(100, (currentSavings / targetEmergencyFund) * 100) : 0;

  return (
    <div>
      {/* Savings Metric Header */}
      <div className="metrics-grid" style={{ marginBottom: '28px' }}>
        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Cumulative Savings</div>
            <div className="metric-value" style={{ color: 'var(--color-savings)' }}>
              ${summary.net_savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="metric-icon savings">
            <PiggyBank size={28} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Overall Savings Rate</div>
            <div className="metric-value" style={{ color: '#a855f7' }}>
              {summary.savings_rate.toFixed(1)}%
            </div>
          </div>
          <div className="metric-icon budget">
            <TrendingUp size={28} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Emergency Buffer Coverage</div>
            <div className="metric-value">
              {avgMonthlyExpense > 0 ? (summary.net_savings / avgMonthlyExpense).toFixed(1) : 0} months
            </div>
          </div>
          <div className="metric-icon income">
            <ShieldCheck size={28} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {/* Savings Growth Area Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Savings Growth Over Time</h3>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSavingsTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip formatter={(val) => `$${Number(val).toFixed(2)}`} contentStyle={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="savings" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorSavingsTrend)" name="Monthly Savings" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No savings data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Financial Emergency Fund Calculator */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <ShieldCheck color="#06b6d4" size={24} />
            <h3 className="chart-title">Emergency Reserve Goal</h3>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Target Reserve Duration</label>
            <select
              className="form-control"
              value={emergencyMonthsGoal}
              onChange={(e) => setEmergencyMonthsGoal(parseInt(e.target.value))}
            >
              <option value={3}>3 Months Expenses (${(avgMonthlyExpense * 3).toFixed(2)})</option>
              <option value={6}>6 Months Expenses (${(avgMonthlyExpense * 6).toFixed(2)})</option>
              <option value={12}>12 Months Expenses (${(avgMonthlyExpense * 12).toFixed(2)})</option>
            </select>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span>Target Reserve:</span>
              <strong>${targetEmergencyFund.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '10px' }}>
              <span>Current Buffer:</span>
              <strong style={{ color: 'var(--color-savings)' }}>${currentSavings.toFixed(2)}</strong>
            </div>

            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${fundProgress}%`, background: '#06b6d4' }} />
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {fundProgress.toFixed(1)}% Achieved
            </div>
          </div>

          <div style={{ padding: '12px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.8rem', color: '#a5b4fc' }}>
            <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Saving 20% of monthly income accelerates your 6-month safety net goal significantly.
          </div>
        </div>
      </div>
    </div>
  );
}
