import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionCreationForm from './TransactionCreationForm';
import RecurringExpenseCreationForm from '../RecurringExpenses/RecurringExpenseCreationForm';
import { formatCurrency } from '../../utils/currency';
import { getCurrentMonthRange, getPreviousMonthRange, formatDate } from '../../utils/dateUtils';
import { Trash2Icon } from 'lucide-react';

const Transactions = () => {
  // currency & API config
  const userPreferredCurrency = 'EUR';
  const userPreferredLocale = 'en-GB';
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  // state
  const [transactions, setTransactions] = useState([]);
  const { startDate: initStart, endDate: initEnd } = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(initStart);
  const [endDate, setEndDate] = useState(initEnd);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterType, setFilterType] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [showTxnForm, setShowTxnForm] = useState(false);

  // fetch accounts & categories
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [acctRes, catRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/accounts`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setAccounts(acctRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadFilters();
  }, [BASE_URL, token]);

  // fetch transactions
  const fetchTransactions = async () => {
    try {
      let url = `${BASE_URL}/api/transactions`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (filterCategory) params.append('categoryId', filterCategory);
      if (filterAccount) params.append('accountId', filterAccount);
      if (filterType) params.append('type', filterType);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setTransactions(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch transactions');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, filterCategory, filterAccount, filterType]);

  // date presets
  const handleCurrentMonth = () => {
    const { startDate, endDate } = getCurrentMonthRange();
    setStartDate(startDate);
    setEndDate(endDate);
  };
  const handlePreviousMonth = () => {
    const { startDate, endDate } = getPreviousMonthRange();
    setStartDate(startDate);
    setEndDate(endDate);
  };
  const handleAllDates = () => {
    setStartDate('');
    setEndDate('');
    
  };

  // delete with confirmation
  const handleDeleteConfirm = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      axios.delete(`${BASE_URL}/api/transactions/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(fetchTransactions)
        .catch(() => setError('Failed to delete transaction'));
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />

      <h1 className="text-2xl font-bold text-gray-700 mb-4">Transactions</h1>

      {/* Toggle form button */}
      <button
        onClick={() => setShowTxnForm(!showTxnForm)}
        className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg mb-4"
      >
        {showTxnForm ? 'Cancel' : 'Add Transaction'}
      </button>
      {showTxnForm && (
        <TransactionCreationForm
          token={token}
          BASE_URL={BASE_URL}
          onTransactionCreated={fetchTransactions}
          accounts={accounts}
          categories={categories}
        />
      )}

      {/* Date Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={handleCurrentMonth} className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">Current Month</button>
        <button onClick={handlePreviousMonth} className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">Previous Month</button>
        <button onClick={handleAllDates} className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">All Dates</button>
        <input type="date" value={startDate} max={endDate || undefined} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 text-sm p-2 rounded-lg focus:ring-2 focus:ring-teal-300" />
        <input type="date" value={endDate} min={startDate || undefined}  onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 text-sm p-2 rounded-lg focus:ring-2 focus:ring-teal-300" />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border border-gray-300 bg-white text-sm rounded-lg px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300">
          <option value="">All Categories</option>
          {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
        </select>
        <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)} className="border border-gray-300 bg-white text-sm rounded-lg px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300">
          <option value="">All Accounts</option>
          {accounts.map((acc) => (<option key={acc.id} value={acc.id}>{acc.name}</option>))}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-gray-300 bg-white text-sm rounded-lg px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300">
          <option value="">All Types</option>
          <option value="Deposit">Deposit</option>
          <option value="Expense">Expense</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-50">
            <tr>
              {['Date', 'Amount', 'Category', 'Type', 'Account', 'Description'].map((col) => (
                <th key={col} className="px-4 py-2 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">{col}</th>
              ))}
              <th className="px-4 py-2 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">No transactions found.</td></tr>
            ) : (
              transactions.map((txn) => {
                const name = txn.category?.name;
                const hideDelete = ['Savings', 'Fund Transfer', 'Initial account opening']
                .includes(name);
                return (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(txn.date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">{formatCurrency(txn.amount, userPreferredCurrency, userPreferredLocale)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{txn.category?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{txn.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{txn.account?.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 truncate">{txn.description}</td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {!hideDelete && (
                    <button
                      onClick={() => handleDeleteConfirm(txn.id)}
                      className="p-2 rounded hover:bg-gray-100"
                      title="Delete Transaction"
                    >
                      <Trash2Icon size={16} className="text-red-500" />
                    </button>
                  )}
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
