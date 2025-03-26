// src/pages/Transactions/TransactionCreationForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const TransactionCreationForm = ({
  token,
  BASE_URL,
  onTransactionCreated,
  accounts,
  categories,
  refreshAccountsAndCategories
}) => {
  const [newTxnDate, setNewTxnDate] = useState('');
  const [newTxnAmount, setNewTxnAmount] = useState('');
  const [newTxnCategory, setNewTxnCategory] = useState('');
  const [newTxnAccount, setNewTxnAccount] = useState('');
  const [newTxnType, setNewTxnType] = useState('Expense'); // default value
  const [newTxnDescription, setNewTxnDescription] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

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
        headers: { Authorization: `Bearer ${token}` },
      });
      // Clear form fields
      setNewTxnDate('');
      setNewTxnAmount('');
      setNewTxnCategory('');
      setNewTxnAccount('');
      setNewTxnType('Expense');
      setNewTxnDescription('');
      onTransactionCreated();
    } catch (err) {
      console.error('Failed to create transaction', err);
      setError('Failed to create transaction');
    }
  };

  const handleAddCategory = async () => {
    try {
      const payload = { name: newCategoryName };
      const res = await axios.post(`${BASE_URL}/api/categories`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshAccountsAndCategories();
      setNewTxnCategory(res.data.name);
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Failed to create category', err);
      setError('Failed to create category');
    }
  };

  return (
    <div>
      <form onSubmit={handleCreateTransaction} className="flex flex-row gap-4 items-end mb-6">
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
            <option key={acc.id} value={acc.name}>
              {acc.name}
            </option>
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
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
          <option value="addNew">Add New Category</option>
        </select>
        <select
          value={newTxnType}
          onChange={(e) => setNewTxnType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="Deposit">Deposit</option>
          <option value="Expense">Expense</option>
        </select>
        <input
          type="text"
          value={newTxnDescription}
          onChange={(e) => setNewTxnDescription(e.target.value)}
          placeholder="Description"
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create
        </button>
      </form>

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
              <button onClick={handleAddCategory} className="bg-blue-500 text-white px-4 py-2 rounded">
                Save
              </button>
              <button onClick={() => setShowCategoryModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
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

export default TransactionCreationForm;
