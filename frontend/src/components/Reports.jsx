import React, { useState, useEffect } from 'react';
import { Printer, Download, FileText, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export default function Reports({ analytics, transactions }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/summary');
      const data = await res.json();
      setReportData(data);
    } catch (e) {
      console.error('Failed to fetch report summary:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = analytics?.summary || {};
  const categoryBreakdown = analytics?.category_breakdown || [];
  const insights = analytics?.smart_insights || [];
  const unusualSpending = analytics?.unusual_spending || [];

  return (
    <div>
      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Executive Financial Summary Report</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Generated audit-ready report for print, PDF export, or personal archiving</p>
        </div>

        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={18} /> Print / Export PDF
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="card" id="printable-report" style={{ padding: '36px', background: '#1e293b' }}>
        {/* Report Document Header */}
        <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>FinSight</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '600' }}>Personal Financial Performance & Analytics Report</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div>Status: Audit Verified</div>
          </div>
        </div>

        {/* Executive Summary Metrics Table */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>1. Key Performance Indicators</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Income</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-income)' }}>
                ${(summary.total_income || 0).toFixed(2)}
              </div>
            </div>

            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Expenses</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-expense)' }}>
                ${(summary.total_expenses || 0).toFixed(2)}
              </div>
            </div>

            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Net Savings</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-savings)' }}>
                ${(summary.net_savings || 0).toFixed(2)}
              </div>
            </div>

            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Savings Rate</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#a855f7' }}>
                {(summary.savings_rate || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>2. Expense Category Distribution</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((cat) => (
                  <tr key={cat.category}>
                    <td><strong>{cat.category}</strong></td>
                    <td>${cat.amount.toFixed(2)}</td>
                    <td>{cat.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytical Insights & Anomalies */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>3. Data Analytics Insights & Anomalies</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {insights.map((ins, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'rgba(15,23,42,0.5)', borderRadius: '8px', borderLeft: '4px solid #6366f1', fontSize: '0.9rem' }}>
                <Sparkles size={16} style={{ display: 'inline', marginRight: '8px', color: '#818cf8' }} />
                {ins}
              </div>
            ))}
            {unusualSpending.map((anom, idx) => (
              <div key={`rep_anom_${idx}`} style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', borderLeft: '4px solid #f59e0b', fontSize: '0.9rem', color: '#fef3c7' }}>
                <AlertTriangle size={16} style={{ display: 'inline', marginRight: '8px', color: '#f59e0b' }} />
                <strong>Anomaly:</strong> {anom.reason}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
