import React, { useState } from 'react';
import { Search, Filter, Download, Trash2, Edit3, PlusCircle } from 'lucide-react';

export default function Transactions({ transactions, onDelete, onEdit, onOpenAddModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');

  const categories = ['All', 'Salary', 'Freelance', 'Food', 'Shopping', 'Transport', 'Education', 'Entertainment', 'Bills', 'Healthcare', 'Travel', 'Other'];

  // Filtering & Sorting logic
  let filtered = transactions.filter(t => {
    const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesType = selectedType === 'All' || t.type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesCategory && matchesType;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount_high') return parseFloat(b.amount) - parseFloat(a.amount);
    if (sortBy === 'amount_low') return parseFloat(a.amount) - parseFloat(b.amount);
    return 0;
  });

  // Export CSV function
  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Description'];
    const rows = filtered.map(t => [t.id, t.date, t.type, `"${t.category}"`, t.amount, `"${t.description || ''}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinSight_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Transaction History ({filtered.length})</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage and audit all your incoming and outgoing transactions</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={18} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <PlusCircle size={18} /> Add New
          </button>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="form-control" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map(c => (
            <option key={c} value={c}>Category: {c}</option>
          ))}
        </select>

        <select className="form-control" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="All">Type: All</option>
          <option value="income">Type: Income</option>
          <option value="expense">Type: Expense</option>
        </select>

        <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date_desc">Sort: Date (Newest)</option>
          <option value="date_asc">Sort: Date (Oldest)</option>
          <option value="amount_high">Sort: Amount (Highest)</option>
          <option value="amount_low">Sort: Amount (Lowest)</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
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
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 10px', marginRight: '6px' }} onClick={() => onEdit(tx)}>
                    <Edit3 size={14} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => onDelete(tx.id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No matching transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
