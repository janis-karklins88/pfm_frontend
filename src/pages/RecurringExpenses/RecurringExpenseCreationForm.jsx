// src/pages/RecurringExpenses/RecurringExpenseCreationForm.jsx
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

  const handleCreateRecurringExpense = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newRecExpName,
        amount: newRecExpAmount,
        startDate: newRecExpStartDate,
        frequency: newRecExpFrequency,
        accountName: newRecExpAccount,
        categoryName: newRecExpCategory,
      };
      await axios.post(`${BASE_URL}/api/recurring-expenses`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Clear form fields
      setNewRecExpName('');
      setNewRecExpAmount('');
      setNewRecExpStartDate('');
      setNewRecExpFrequency('');
      setNewRecExpAccount('');
      setNewRecExpCategory('');
      onExpenseCreated();
    } catch (err) {
      console.error('Failed to create recurring expense', err);
      setError('Failed to create recurring expense');
    }
  };

  const handleAddCategory = async () => {
    try {
      const payload = { name: newCategoryName };
      const res = await axios.post(`${BASE_URL}/api/categories`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshAccountsAndCategories();
      setNewRecExpCategory(res.data.name);
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Failed to add category', err);
      const errorMsg =
      err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Failed to add category';
    }
  };

  return (
    <div>
      <form onSubmit={handleCreateRecurringExpense} className="flex flex-row gap-4 items-end mb-6">
        <input
          type="text"
          value={newRecExpName}
          onChange={(e) => setNewRecExpName(e.target.value)}
          placeholder="Expense Name"
          className="border p-2 rounded"
        />
        <input
          type="number"
          step="0.01"
          value={newRecExpAmount}
          onChange={(e) => setNewRecExpAmount(e.target.value)}
          placeholder="Amount"
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={newRecExpStartDate}
          onChange={(e) => setNewRecExpStartDate(e.target.value)}
          className="border p-2 rounded"
        />
        <select
         value={newRecExpFrequency}
          onChange={(e) => setNewRecExpFrequency(e.target.value)}
          className="border p-2 rounded"
>
        <option value="">Select Frequency</option>
        <option value="WEEKLY">Weekly</option>
        <option value="MONTHLY">Monthly</option>
        <option value="ANNUALLY">Annually</option>
        </select>
        <select
          value={newRecExpAccount}
          onChange={(e) => setNewRecExpAccount(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Account</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.name}>{acc.name}</option>
          ))}
        </select>
        <select
          value={newRecExpCategory}
          onChange={(e) => {
            if (e.target.value === 'addNew') {
              setShowCategoryModal(true);
            } else {
              setNewRecExpCategory(e.target.value);
            }
          }}
          className="border p-2 rounded"
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
          <option value="addNew">Add New Category</option>
        </select>
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

export default RecurringExpenseCreationForm;
