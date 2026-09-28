import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
import Budget from './components/Budget';
import Savings from './components/Savings';
import Reports from './components/Reports';
import AddTransactionModal from './components/AddTransactionModal';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('finsight_token') || '');

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (user?.id) headers['x-user-id'] = user.id;
    else headers['x-user-id'] = 'demo_user';
    return headers;
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();
      const [txRes, bRes, aRes] = await Promise.all([
        fetch('/api/transactions', { headers }),
        fetch(`/api/budgets?month=${currentMonth}`, { headers }),
        fetch('/api/analytics', { headers })
      ]);

      const txData = await txRes.json();
      const bData = await bRes.json();
      const aData = await aRes.json();

      setTransactions(Array.isArray(txData) ? txData : []);
      setBudgets(bData.budgets || []);
      setAnalytics(aData);
    } catch (err) {
      console.error('Error fetching FinSight data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user, token]);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/transactions/seed', {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      await fetchAllData();
    } catch (err) {
      console.error('Failed to seed sample data:', err);
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveTransaction = async (txData) => {
    try {
      const isEdit = !!txData.id;
      const endpoint = isEdit ? `/api/transactions/${txData.id}` : '/api/transactions';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(txData)
      });

      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error('Failed to save transaction:', err);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const handleSetBudget = async (category, amount, month) => {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ category, amount, month })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error('Failed to set budget:', err);
    }
  };

  const handleLoginSuccess = (userData, tokenStr) => {
    setUser(userData);
    setToken(tokenStr);
    localStorage.setItem('finsight_token', tokenStr);
  };

  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          onOpenAddModal={handleOpenAddModal}
          onSeedData={handleSeedData}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          seeding={seeding}
        />

        <main className="content-container">
          {activeTab === 'dashboard' && (
            <Dashboard
              analytics={analytics}
              transactions={transactions}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'transactions' && (
            <Transactions
              transactions={transactions}
              onDelete={handleDeleteTransaction}
              onEdit={handleOpenEditModal}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics analytics={analytics} />
          )}

          {activeTab === 'budget' && (
            <Budget
              budgets={budgets}
              onSetBudget={handleSetBudget}
              currentMonth={currentMonth}
            />
          )}

          {activeTab === 'savings' && (
            <Savings analytics={analytics} />
          )}

          {activeTab === 'reports' && (
            <Reports analytics={analytics} transactions={transactions} />
          )}
        </main>
      </div>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingTransaction(null); }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
