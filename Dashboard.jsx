import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function Dashboard({ analytics, transactions, onNavigate }) {
  const summary = analytics?.summary || { total_income: 0, total_expenses: 0, net_savings: 0, savings_rate: 0 };
  const insights = analytics?.smart_insights || [];
  const categoryBreakdown = analytics?.category_breakdown || [];
  const monthlyTrends = analytics?.monthly_trends || [];
  const unusualSpending = analytics?.unusual_spending || [];

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div>
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Income</div>
            <div className="metric-value" style={{ color: 'var(--color-income)' }}>
              ${summary.total_income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="metric-icon income">
            <ArrowUpRight size={28} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Total Expenses</div>
            <div className="metric-value" style={{ color: 'var(--color-expense)' }}>
              ${summary.total_expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="metric-icon expense">
            <ArrowDownRight size={28} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Net Savings</div>
            <div className="metric-value" style={{ color: summary.net_savings >= 0 ? 'var(--color-savings)' : 'var(--color-expense)' }}>
              ${summary.net_savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="metric-icon savings">
            <Wallet size={28} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <div className="metric-label">Savings Rate</div>
            <div className="metric-value" style={{ color: '#a855f7' }}>
              {summary.savings_rate.toFixed(1)}%
            </div>
          </div>
          <div className="metric-icon budget">
            <TrendingUp size={28} />
          </div>
        </div>
      </div>

      {/* Smart Insights Banner */}
      <div className="insights-banner">
        <div className="insights-header">
          <Sparkles color="#818cf8" size={24} />
          <h2 className="insights-title">Data-Driven Insights & Anomalies</h2>
        </div>
        <div className="insights-list">
          {insights.map((insight, idx) => (
            <div key={idx} className="insight-item">
              <span style={{ color: 'var(--text-primary)' }}>{insight}</span>
            </div>
          ))}
          {unusualSpending.map((item, idx) => (
            <div key={`anom_${idx}`} className="insight-item" style={{ borderLeftColor: 'var(--color-warning)' }}>
              <AlertTriangle color="var(--color-warning)" size={18} />
              <span>
                <strong>Unusual Spending Alert:</strong> {item.reason}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Monthly Trend Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Income vs Expenses Trend</h3>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" name="Income" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No trend data available yet. Click "Seed Sample Data" above to view!
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Expense Category Share</h3>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `$${Number(val).toFixed(2)}`} contentStyle={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No category data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="card">
        <div className="chart-header" style={{ marginBottom: '16px' }}>
          <h3 className="chart-title">Recent Transactions</h3>
          <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => onNavigate('transactions')}>
            View All Transactions
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td><strong>{tx.category}</strong></td>
                  <td>{tx.description || '-'}</td>
                  <td>
                    <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: tx.type === 'income' ? 'var(--color-income)' : 'var(--text-primary)' }}>
                    {tx.type === 'income' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No transactions recorded. Click "Add Transaction" or "Seed Sample Data" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
