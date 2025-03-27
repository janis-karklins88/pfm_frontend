import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecurringExpenseCreationForm from './RecurringExpenseCreationForm';

const RecurringExpenses = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [showCreationForm, setShowCreationForm] = useState(false);

  // Fetch recurring payments with filtering
  const fetchRecurringExpenses = async () => {
    try {
      let url = `${BASE_URL}/api/recurring-expenses`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (filterCategory) params.append('categoryId', filterCategory);
      if (filterAccount) params.append('accountId', filterAccount);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setRecurringExpenses(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch automatic payments', err);
      setError('Failed to fetch automatic payments');
    }
  };

  const fetchAccounts = async () => {
    try {
      const url = `${BASE_URL}/api/accounts`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setAccounts(res.data);
    } catch (err) {
      console.error('Failed to fetch accounts', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const url = `${BASE_URL}/api/categories`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    fetchRecurringExpenses();
  }, [startDate, endDate, filterCategory, filterAccount]);

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/recurring-expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRecurringExpenses();
    } catch (err) {
      console.error('Failed to delete automatic payment', err);
      setError('Failed to delete automatic payment');
    }
  };

  const refreshAccountsAndCategories = () => {
    fetchAccounts();
    fetchCategories();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Automatic Payments</h1>

      {/* Toggle the creation form */}
      <button
        onClick={() => setShowCreationForm(!showCreationForm)}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        {showCreationForm ? 'Cancel Payment Creation' : 'Add Payment'}
      </button>

      {showCreationForm && (
        <RecurringExpenseCreationForm
          token={token}
          BASE_URL={BASE_URL}
          onExpenseCreated={() => {
            fetchRecurringExpenses();
            setShowCreationForm(false);
          }}
          accounts={accounts}
          categories={categories}
          refreshAccountsAndCategories={refreshAccountsAndCategories}
        />
      )}

      {error && <p className="text-red-500">{error}</p>}

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
        <button
          onClick={fetchRecurringExpenses}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Filter
        </button>
      </div>

      {/* Recurring Payments List */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Frequency</th>
            <th className="py-2 px-4 border-b">Start Date</th>
            <th className="py-2 px-4 border-b">Next Due Date</th>
            <th className="py-2 px-4 border-b">Account</th>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recurringExpenses.length === 0 ? (
            <tr>
              <td className="py-2 px-4 border-b" colSpan="7">
                No automatic payments found.
              </td>
            </tr>
          ) : (
            recurringExpenses.map((expense) => (
              <tr key={expense.id}>
                <td className="py-2 px-4 border-b">{expense.name}</td>
                <td className="py-2 px-4 border-b">{expense.amount}</td>
                <td className="py-2 px-4 border-b">{expense.frequency}</td>
                <td className="py-2 px-4 border-b">{expense.startDate}</td>
                <td className="py-2 px-4 border-b">{expense.nextDueDate}</td>
                <td className="py-2 px-4 border-b">
                  {expense.account?.name || 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">
                  {expense.category?.name || 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
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

export default RecurringExpenses;
