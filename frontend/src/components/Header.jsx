import React from 'react';
import { PlusCircle, Database, User, LogIn } from 'lucide-react';

export default function Header({ activeTab, onOpenAddModal, onSeedData, user, onOpenAuthModal, seeding }) {
  const titles = {
    dashboard: 'Financial Overview',
    transactions: 'Transaction History & Records',
    analytics: 'Statistical Data Analytics & Anomaly Detection',
    budget: 'Monthly Budget Planning & Tracking',
    savings: 'Savings Behavior & Rate Analysis',
    reports: 'Financial Summary & Insights Report'
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="page-title">{titles[activeTab] || 'FinSight'}</h1>
      </div>

      <div className="header-right">
        <button
          className="btn btn-secondary"
          onClick={onSeedData}
          disabled={seeding}
          title="Populate 6 months of realistic data for testing"
        >
          <Database size={18} />
          {seeding ? 'Seeding...' : 'Seed Sample Data'}
        </button>

        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <PlusCircle size={18} />
          Add Transaction
        </button>

        <div className="user-badge" style={{ cursor: 'pointer' }} onClick={onOpenAuthModal}>
          <div className="avatar">
            {user ? user.username.charAt(0).toUpperCase() : <User size={18} />}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
            {user ? user.username : 'Demo User'}
          </span>
        </div>
      </div>
    </header>
  );
}
