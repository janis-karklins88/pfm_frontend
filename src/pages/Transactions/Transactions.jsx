// src/pages/Transactions/Transactions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  // States for listing transactions (filters)
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [error, setError] = useState('');

  // States for accounts and categories lists (used in both filtering and creation)
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // States for transaction creation form
  const [newTxnDate, setNewTxnDate] = useState('');
  const [newTxnAmount, setNewTxnAmount] = useState('');
  const [newTxnCategory, setNewTxnCategory] = useState('');
  const [newTxnAccount, setNewTxnAccount] = useState('');
  const [newTxnType, setNewTxnType] = useState('');
  const [newTxnDescription, setNewTxnDescription] = useState('');

  // States for inline new category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Fetch transactions based on filter parameters
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

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch transactions', err);
      setError('Failed to fetch transactions');
    }
  };

  // Fetch accounts and categories for the form dropdowns
  const fetchAccounts = async () => {
    try {
      const url = `${BASE_URL}/api/accounts`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Accounts fetched:', res.data);
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
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    }
  };

  // Load transactions when filter options change
  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, filterCategory, filterAccount]);

  // Load accounts and categories on mount
  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  // Handle creation of a new transaction
  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date: newTxnDate,
        amount: newTxnAmount,
        categoryName: newTxnCategory,
        accountName: newTxnAccount,
        type: newTxnType,
        description: newTxnDescription,
      };
      await axios.post(`${BASE_URL}/api/transactions`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Clear form fields
      setNewTxnDate('');
      setNewTxnAmount('');
      setNewTxnCategory('');
      setNewTxnAccount('');
      setNewTxnType('');
      setNewTxnDescription('');
      // Refresh transactions list
      fetchTransactions();
    } catch (err) {
      setError('Failed to create transaction');
    }
  };

  // Handle inline category creation
  const handleAddCategory = async () => {
    try {
      const payload = { name: newCategoryName };
      const res = await axios.post(`${BASE_URL}/api/categories`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const createdCategory = res.data;
      setCategories([...categories, createdCategory]);
      // Set the new category in the transaction creation form
      setNewTxnCategory(createdCategory.name);
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (err) {
      setError('Failed to create category');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Transactions</h1>

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
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Accounts</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
        <button 
          onClick={fetchTransactions}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Filter
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

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
                  <button 
                    onClick={() => handleDelete(txn.id)}
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

      {/* Transaction Creation Form */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Create Transaction</h2>
        <form onSubmit={handleCreateTransaction} className="flex flex-col gap-4">
          <input 
            type="date" 
            value={newTxnDate} 
            onChange={(e) => setNewTxnDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input 
            type="number" 
            step="0.01" 
            value={newTxnAmount} 
            onChange={(e) => setNewTxnAmount(e.target.value)}
            placeholder="Amount" 
            className="border p-2 rounded"
          />
          <select 
            value={newTxnAccount} 
            onChange={(e) => setNewTxnAccount(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.name}>{acc.name}</option>
            ))}
          </select>
          <select 
            value={newTxnCategory} 
            onChange={(e) => {
              if (e.target.value === 'addNew') {
                setShowCategoryModal(true);
              } else {
                setNewTxnCategory(e.target.value);
              }
            }}
            className="border p-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
            <option value="addNew">Add New Category</option>
          </select>
          <input 
            type="text" 
            value={newTxnType} 
            onChange={(e) => setNewTxnType(e.target.value)}
            placeholder="Type" 
            className="border p-2 rounded"
          />
          <input 
            type="text" 
            value={newTxnDescription} 
            onChange={(e) => setNewTxnDescription(e.target.value)}
            placeholder="Description" 
            className="border p-2 rounded"
          />
          <button 
            type="submit" 
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Transaction
          </button>
        </form>
      </div>

      {/* Inline Modal for Adding New Category */}
      {showCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-xl font-bold mb-4">Add New Category</h3>
            <input 
              type="text" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category Name" 
              className="border p-2 rounded mb-4"
            />
            <div className="flex gap-4">
              <button 
                onClick={handleAddCategory} 
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button 
                onClick={() => setShowCategoryModal(false)} 
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default Transactions;
