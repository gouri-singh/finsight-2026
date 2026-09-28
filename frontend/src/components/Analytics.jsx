import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line } from 'recharts';
import { AlertCircle, Zap, Activity, Cpu, CheckCircle2 } from 'lucide-react';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function Analytics({ analytics }) {
  const summary = analytics?.summary || {};
  const categoryBreakdown = analytics?.category_breakdown || [];
  const monthlyTrends = analytics?.monthly_trends || [];
  const unusualSpending = analytics?.unusual_spending || [];
  const engineSource = analytics?.source || 'pandas_analytics_engine';

  return (
    <div>
      {/* Engine Status Card */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(99,102,241,0.15))', borderColor: 'rgba(99,102,241,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Cpu size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Statistical & Python Data Analytics Engine</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Powered by Python Pandas & NumPy | Z-Score Anomaly Detection Active
              </p>
            </div>
          </div>
          <div className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '6px 12px', fontSize: '0.85rem' }}>
            <CheckCircle2 size={16} /> Engine Status: Active ({engineSource})
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="metrics-grid" style={{ marginBottom: '28px' }}>
        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Avg Daily Expense</div>
            <div className="metric-value">${(summary.avg_daily_expense || 0).toFixed(2)}</div>
          </div>
          <div className="metric-icon expense">
            <Activity size={24} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Avg Monthly Expense</div>
            <div className="metric-value">${(summary.avg_monthly_expense || 0).toFixed(2)}</div>
          </div>
          <div className="metric-icon budget">
            <Zap size={24} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Transactions</div>
            <div className="metric-value">{summary.transaction_count || 0}</div>
          </div>
          <div className="metric-icon income">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Anomalies Detected</div>
            <div className="metric-value" style={{ color: unusualSpending.length > 0 ? 'var(--color-warning)' : 'var(--color-income)' }}>
              {unusualSpending.length}
            </div>
          </div>
          <div className="metric-icon savings">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Unusual Spending & Statistical Outlier Alert Box */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="chart-header" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle color="var(--color-warning)" size={22} />
            <h3 className="chart-title">Unusual Spending & Anomaly Detection (PRD 4.9)</h3>
          </div>
        </div>

        {unusualSpending.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {unusualSpending.map((anom, idx) => (
              <div key={idx} style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-warning">{anom.severity || 'Medium'} Severity</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{anom.date || 'Monthly Aggregated'}</span>
                </div>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>
                  {anom.category} {anom.amount ? `($${anom.amount.toFixed(2)})` : ''}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{anom.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={20} />
            <span>No statistically significant spending anomalies or sudden spikes detected in your current records.</span>
          </div>
        )}
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid">
        {/* Category Comparison Bar Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Category Spending Comparison</h3>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="category" stroke="#64748b" angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" />
                  <Tooltip formatter={(val) => `$${Number(val).toFixed(2)}`} contentStyle={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]}>
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No category data available.
              </div>
            )}
          </div>
        </div>

        {/* Savings Trend Line Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Net Savings Trend</h3>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip formatter={(val) => `$${Number(val).toFixed(2)}`} contentStyle={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="savings" stroke="#06b6d4" strokeWidth={3} dot={{ r: 6 }} name="Net Savings" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No trend data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
