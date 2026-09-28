import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function AddTransactionModal({ isOpen, onClose, onSave, editingTransaction }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other Income'];
  const expenseCategories = ['Food', 'Shopping', 'Transport', 'Education', 'Entertainment', 'Bills', 'Healthcare', 'Travel', 'Other'];

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || 'expense');
      setAmount(editingTransaction.amount || '');
      setCategory(editingTransaction.category || 'Food');
      setDate(editingTransaction.date || new Date().toISOString().split('T')[0]);
      setDescription(editingTransaction.description || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
  }, [editingTransaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    onSave({
      id: editingTransaction ? editingTransaction.id : undefined,
      type,
      amount: parseFloat(amount),
      category,
      date,
      description
    });

    onClose();
  };

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type Selector Toggle */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className={`btn ${type === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
                onClick={() => { setType('expense'); setCategory('Food'); }}
              >
                Expense
              </button>
              <button
                type="button"
                className={`btn ${type === 'income' ? 'btn-accent' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
                onClick={() => { setType('income'); setCategory('Salary'); }}
              >
                Income
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-control"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Groceries at Trader Joe's"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              <Check size={18} /> {editingTransaction ? 'Update' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
