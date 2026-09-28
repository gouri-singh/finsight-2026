import React from 'react';
import { LayoutDashboard, ReceiptText, PieChart, Wallet, PiggyBank, FileText, Headphones, Sparkles } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'analytics', label: 'Data Analytics', icon: PieChart },
    { id: 'budget', label: 'Budgets', icon: Wallet },
    { id: 'savings', label: 'Savings Analysis', icon: PiggyBank },
    { id: 'reports', label: 'Financial Reports', icon: FileText }
  ];

  return (
    <aside className="sidebar">
      <div className="brand-logo">
        <div className="brand-icon">
          <Headphones size={24} />
        </div>
        <div>
          <div className="brand-title">FinSight</div>
          <div className="brand-subtitle">Data Analytics AI</div>
        </div>
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              <span className="nav-text">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#a5b4fc', fontWeight: '600', marginBottom: '4px' }}>
          <Sparkles size={16} /> Python Powered
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Pandas & NumPy engine active for statistical anomaly detection.
        </p>
      </div>
    </aside>
  );
}
