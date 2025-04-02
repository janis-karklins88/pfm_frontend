import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionCreationForm from './TransactionCreationForm';
import RecurringExpenseCreationForm from '../RecurringExpenses/RecurringExpenseCreationForm';

const Transactions = () => {
  // Base URL for your backend API
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  // Retrieve token from localStorage (assumes user is logged in)
  const token = localStorage.getItem('token');

  // State variables for transactions list and filters
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Now filterCategory will hold a category id (string or number)
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [error, setError] = useState('');

  // State variables for accounts and categories (used in filters and forms)
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Toggle states for the creation forms
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [showRecExpForm, setShowRecExpForm] = useState(false);

  // Fetch transactions with optional filtering parameters
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

  // Fetch the list of accounts
  const fetchAccounts = async () => {
    try {
      const url = `${BASE_URL}/api/accounts`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      // Use the spread operator to force conversion to a proper array
      setAccounts([...res.data]);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to fetch accounts');
    }
  };

  // Fetch the list of categories from the reworked category endpoint
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

  // Run the fetch methods when filters change or on initial mount
  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, filterCategory, filterAccount]);

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, []);

  // Handler to delete a transaction by id
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/transactions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  // Function to refresh both accounts and categories (used after creating new ones)
  const refreshAccountsAndCategories = () => {
    fetchAccounts();
    fetchCategories();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-4">Transactions</h1>

      {/* Toggle buttons for showing/hiding creation forms */}
      <div className="mb-4 flex gap-4">
        <button onClick={() => setShowTxnForm(!showTxnForm)} className="bg-green-500 text-white px-4 py-2 rounded">
          {showTxnForm ? 'Cancel Transaction' : 'Add Transaction'}
        </button>
        {/* You could toggle recurring expense form similarly if needed */}
      </div>

      {/* Transaction Creation Form */}
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

      {/* Recurring Expense Creation Form (if needed) */}
      {showRecExpForm && (
        <RecurringExpenseCreationForm
          token={token}
          BASE_URL={BASE_URL}
          onExpenseCreated={() => {
            /* Optionally refresh recurring expense list if needed */
          }}
          accounts={accounts}
          categories={categories}
          refreshAccountsAndCategories={refreshAccountsAndCategories}
        />
      )}

      {/* Error Message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Filtering Options */}
      <div className="mb-4 flex flex-wrap gap-2">
        {/* Start Date Filter */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
          placeholder="Start Date"
        />
        {/* End Date Filter */}
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
          placeholder="End Date"
        />
        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          {/* Use category id as the value; display the category name */}
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {/* Account Filter */}
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
        {/* Filter Button */}
        <button onClick={fetchTransactions} className="bg-blue-500 text-white px-4 py-2 rounded">
          Filter
        </button>
      </div>

      {/* Transactions List Table */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            {/* Table Headers */}
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Type</th>
            <th className="py-2 px-4 border-b">Account</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            // If no transactions, show a message spanning all columns
            <tr>
              <td className="py-2 px-4 border-b" colSpan="7">
                No transactions found.
              </td>
            </tr>
          ) : (
            // Map through transactions and create a row for each transaction
            transactions.map((txn) => (
              <tr key={txn.id}>
                <td className="py-2 px-4 border-b">{txn.date}</td>
                <td className="py-2 px-4 border-b">{txn.amount}</td>
                {/* For category, check if the object exists and display its name */}
                <td className="py-2 px-4 border-b">{txn.category?.name || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{txn.type}</td>
                <td className="py-2 px-4 border-b">{txn.account?.name || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{txn.description}</td>
                <td className="py-2 px-4 border-b">
                  {/* Delete button for a transaction */}
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
