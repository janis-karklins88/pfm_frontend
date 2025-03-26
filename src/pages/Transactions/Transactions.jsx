// src/pages/Transactions/Transactions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionCreationForm from './TransactionCreationForm';
import RecurringExpenseCreationForm from '../RecurringExpenses/RecurringExpenseCreationForm';

const Transactions = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  // States for filtering and listing transactions
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [error, setError] = useState('');

  // States for accounts and categories (for filters & forms)
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Toggle states for creation forms
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [showRecExpForm, setShowRecExpForm] = useState(false);

  const fetchTransactions = async () => {
    try {
      let url = `${BASE_URL}/api/transactions`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (filterCategory) params.append('categoryId', filterCategory);
      if (filterAccount) params.append('accountId', filterAccount);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setTransactions(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch transactions', err);
      setError('Failed to fetch transactions');
    }
  };

  const fetchAccounts = async () => {
    try {
      const url = `${BASE_URL}/api/accounts`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setAccounts(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to fetch accounts');
    }
  };

  const fetchCategories = async () => {
    try {
      const url = `${BASE_URL}/api/categories`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, filterCategory, filterAccount]);

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/transactions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  // Function to refresh both accounts and categories after a new one is added
  const refreshAccountsAndCategories = () => {
    fetchAccounts();
    fetchCategories();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Transactions</h1>

      {/* Toggle buttons for creation forms */}
      <div className="mb-4 flex gap-4">
        <button onClick={() => setShowTxnForm(!showTxnForm)} className="bg-green-500 text-white px-4 py-2 rounded">
          {showTxnForm ? 'Cancel Transaction' : 'Add Transaction'}
        </button>
        <button onClick={() => setShowRecExpForm(!showRecExpForm)} className="bg-green-500 text-white px-4 py-2 rounded">
          {showRecExpForm ? 'Cancel Recurring Expense' : 'Add Recurring Expense'}
        </button>
      </div>

      {/* Render Transaction Creation Form */}
      {showTxnForm && (
        <TransactionCreationForm
          token={token}
          BASE_URL={BASE_URL}
          onTransactionCreated={fetchTransactions}
          accounts={accounts}
          categories={categories}
          refreshAccountsAndCategories={refreshAccountsAndCategories}
        />
      )}

      {/* Render Recurring Expense Creation Form */}
      {showRecExpForm && (
        <RecurringExpenseCreationForm
          token={token}
          BASE_URL={BASE_URL}
          onExpenseCreated={() => { /* Optionally refresh recurring expense list if needed */ }}
          accounts={accounts}
          categories={categories}
          refreshAccountsAndCategories={refreshAccountsAndCategories}
        />
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Filtering Options */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
          placeholder="End Date"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Accounts</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
        <button onClick={fetchTransactions} className="bg-blue-500 text-white px-4 py-2 rounded">
          Filter
        </button>
      </div>

      {/* Transactions List */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Type</th>
            <th className="py-2 px-4 border-b">Account</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td className="py-2 px-4 border-b" colSpan="6">
                No transactions found.
              </td>
            </tr>
          ) : (
            transactions.map((txn) => (
              <tr key={txn.id}>
                <td className="py-2 px-4 border-b">{txn.date}</td>
                <td className="py-2 px-4 border-b">{txn.amount}</td>
                <td className="py-2 px-4 border-b">{txn.category?.name || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{txn.type}</td>
                <td className="py-2 px-4 border-b">{txn.account?.name || 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => handleDelete(txn.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
