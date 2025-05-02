import React, { useState } from 'react';
import axios from 'axios';

const RecurringExpenseCreationForm = ({
  token,
  BASE_URL,
  onExpenseCreated,
  accounts,
  categories,
  refreshAccountsAndCategories
}) => {
  const [newRecExpName, setNewRecExpName] = useState('');
  const [newRecExpAmount, setNewRecExpAmount] = useState('');
  const [newRecExpStartDate, setNewRecExpStartDate] = useState('');
  const [newRecExpFrequency, setNewRecExpFrequency] = useState('');
  const [newRecExpAccount, setNewRecExpAccount] = useState('');
  const [newRecExpCategory, setNewRecExpCategory] = useState('');
  const [error, setError] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreateRecurringExpense = async e => {
    e.preventDefault();
    try {
      const payload = {
        name: newRecExpName,
        amount: newRecExpAmount,
        startDate: newRecExpStartDate,
        frequency: newRecExpFrequency,
        accountName: newRecExpAccount,
        categoryId: newRecExpCategory,
      };
      await axios.post(
        `${BASE_URL}/api/recurring-expenses`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewRecExpName('');
      setNewRecExpAmount('');
      setNewRecExpStartDate('');
      setNewRecExpFrequency('');
      setNewRecExpAccount('');
      setNewRecExpCategory('');
      onExpenseCreated();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create recurring expense';
      setError(msg);
    }
  };

  const handleAddCategory = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/categories`,
        { name: newCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshAccountsAndCategories();
      setNewRecExpCategory(res.data.id);
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add category';
      setError(msg);
    }
  };

  return (
    <div>
      <form onSubmit={handleCreateRecurringExpense} className="flex flex-wrap gap-2 items-end mb-6">
        {/* Name */}
        <div>
          <label className="block text-sm mb-1">Expense Name</label>
          <input
            type="text"
            value={newRecExpName}
            onChange={e => setNewRecExpName(e.target.value)}

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
            value={newRecExpAmount}
            onChange={e => setNewRecExpAmount(e.target.value)}

            className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          />
        </div>
        {/* Start Date */}
        <div>
          <label className="block text-sm mb-1">Start Date</label>
          <input
            type="date"
            value={newRecExpStartDate}
            onChange={e => setNewRecExpStartDate(e.target.value)}
            className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          />
        </div>
        {/* Frequency */}
        <div>
          <label className="block text-sm mb-1">Frequency</label>
          <select
            value={newRecExpFrequency}
            onChange={e => setNewRecExpFrequency(e.target.value)}
            className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          >
            <option value="">Select Frequency</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="ANNUALLY">Annually</option>
          </select>
        </div>
        {/* Account */}
        <div>
          <label className="block text-sm mb-1">Account</label>
          <select
            value={newRecExpAccount}
            onChange={e => setNewRecExpAccount(e.target.value)}
            className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
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
            value={newRecExpCategory}
            onChange={e => {
              if (e.target.value === 'addNew') setShowCategoryModal(true);
              else setNewRecExpCategory(e.target.value);
            }}
            className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
            <option value="addNew">Add New Category</option>
          </select>
        </div>
        {/* Create Button */}
        <div>
          <button type="submit" className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">
            Create
          </button>
        </div>

      </form>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}    
      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="Category Name"
              className="border border-gray-300 text-sm px-3 py-1 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <div className="flex gap-2">
              <button onClick={handleAddCategory} className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">
                Save
              </button>
              <button onClick={() => setShowCategoryModal(false)} className="bg-gray-500 text-white text-sm px-3 py-1 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default RecurringExpenseCreationForm;
