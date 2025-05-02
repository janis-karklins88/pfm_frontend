import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../../utils/currency';
import { getCurrentMonthRange } from '../../utils/dateUtils';

const TransactionCreationForm = ({
  token,
  BASE_URL,
  onTransactionCreated,
  accounts,
  // note: removed refreshAccountsAndCategories prop
}) => {
  const [newTxnDate, setNewTxnDate] = useState('');
  const [newTxnAmount, setNewTxnAmount] = useState('');
  const [newTxnCategory, setNewTxnCategory] = useState('');
  const [newTxnAccount, setNewTxnAccount] = useState('');
  const [newTxnType, setNewTxnType] = useState('Expense');
  const [newTxnDescription, setNewTxnDescription] = useState('');

  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    axios.get(`${BASE_URL}/api/categories`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to fetch categories', err));
  }, [BASE_URL, token]);

  // Create transaction
  const handleCreateTransaction = async e => {
    e.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/api/transactions`,
        {
          date: newTxnDate,
          amount: newTxnAmount,
          categoryId: newTxnCategory,
          accountName: newTxnAccount,
          type: newTxnType,
          description: newTxnDescription,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Reset
      setNewTxnDate('');
      setNewTxnAmount('');
      setNewTxnCategory('');
      setNewTxnAccount('');
      setNewTxnType('Expense');
      setNewTxnDescription('');
      setError('');
      onTransactionCreated();
    } catch (err) {
      console.error('Failed to create transaction', err);
      setError(err.response?.data?.message || 'Failed to create transaction');
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/categories`,
        { name: newCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // append locally
      setCategories(prev => [...prev, res.data]);
      setNewTxnCategory(res.data.id);
      setNewCategoryName('');
      setShowCategoryModal(false);
      setError('');
    } catch (err) {
      console.error('Failed to add category', err);
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  return (
    <div className="mb-6 p-0 rounded-lg bg-white">
      <form onSubmit={handleCreateTransaction} className="flex flex-wrap gap-2 items-end">
        {/* Date */}
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input
            type="date"
            value={newTxnDate}
            onChange={e => setNewTxnDate(e.target.value)}
            className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            value={newTxnAmount}
            onChange={e => setNewTxnAmount(e.target.value)}
            placeholder="Amount"
            className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          />
        </div>

        {/* Account */}
        <div>
          <label className="block text-sm mb-1">Account</label>
          <select
            value={newTxnAccount}
            onChange={e => setNewTxnAccount(e.target.value)}
            className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          >
            <option value="">Select Account</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.name}>{acc.name}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            value={newTxnCategory}
            onChange={e => e.target.value === 'addNew'
              ? setShowCategoryModal(true)
              : setNewTxnCategory(e.target.value)
            }
            className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
            <option value="addNew">Add New Category</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm mb-1">Type</label>
          <select
            value={newTxnType}
            onChange={e => setNewTxnType(e.target.value)}
            className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
          >
            <option value="Deposit">Deposit</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

        {/* Description */}
        <div className="flex-1">
          <label className="block text-sm mb-1">Description</label>
          <input
            type="text"
            value={newTxnDescription}
            onChange={e => setNewTxnDescription(e.target.value)}
            placeholder="Description"
            className="w-full border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        {/* Create */}
        <div>
          <button
            type="submit"
            className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg"
          >Create</button>
        </div>

        {/* Error */}
        {error && <p className="w-full text-red-500 text-sm mt-2">{error}</p>}
      </form>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="Category Name"
              className="w-full border border-gray-300 text-sm px-3 py-1 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            {error && (
             <p className="text-red-500 text-sm mb-4">
               {error}
             </p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleAddCategory}
                className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg"
              >Save</button>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setError('');
                }}
                className="bg-gray-500 text-white text-sm px-3 py-1 rounded-lg"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionCreationForm;
