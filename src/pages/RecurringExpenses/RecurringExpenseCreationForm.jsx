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
  // State variables for each recurring expense field
  const [newRecExpName, setNewRecExpName] = useState('');
  const [newRecExpAmount, setNewRecExpAmount] = useState('');
  const [newRecExpStartDate, setNewRecExpStartDate] = useState('');
  const [newRecExpFrequency, setNewRecExpFrequency] = useState('');
  // For account, we continue to use accountName (if backend expects name)
  const [newRecExpAccount, setNewRecExpAccount] = useState('');
  // For category, we now use category id instead of category name
  const [newRecExpCategory, setNewRecExpCategory] = useState('');
  const [error, setError] = useState('');
  
  // State for controlling the "Add New Category" modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Handler for creating a new recurring expense
  const handleCreateRecurringExpense = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newRecExpName,
        amount: newRecExpAmount,
        startDate: newRecExpStartDate,
        frequency: newRecExpFrequency,
        accountName: newRecExpAccount,
        // Send the categoryId (not name)
        categoryId: newRecExpCategory,
      };
      await axios.post(`${BASE_URL}/api/recurring-expenses`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Clear the form fields
      setNewRecExpName('');
      setNewRecExpAmount('');
      setNewRecExpStartDate('');
      setNewRecExpFrequency('');
      setNewRecExpAccount('');
      setNewRecExpCategory('');
      onExpenseCreated();
    } catch (err) {
      console.error('Failed to create recurring expense', err);
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to create recurring expense';
      setError(errorMsg);
    }
  };

  // Handler for adding a new category via the modal
  const handleAddCategory = async () => {
    try {
      const payload = { name: newCategoryName };
      const res = await axios.post(`${BASE_URL}/api/categories`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh accounts and categories lists
      refreshAccountsAndCategories();
      // Set the recurring expense's category to the newly created category's id
      setNewRecExpCategory(res.data.id);
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Failed to add category', err);
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to add category';
      setError(errorMsg);
    }
  };

  return (
    <div>
      {/* Horizontal Recurring Expense Creation Form */}
      <form onSubmit={handleCreateRecurringExpense} className="flex flex-row gap-4 items-end mb-6">
        {/* Expense Name Field */}
        <div>
          <label className="block text-sm mb-1">Expense Name</label>
          <input
            type="text"
            value={newRecExpName}
            onChange={(e) => setNewRecExpName(e.target.value)}
            placeholder="Expense Name"
            className="border p-2 rounded"
          />
        </div>
        {/* Amount Field */}
        <div>
          <label className="block text-sm mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            value={newRecExpAmount}
            onChange={(e) => setNewRecExpAmount(e.target.value)}
            placeholder="Amount"
            className="border p-2 rounded"
          />
        </div>
        {/* Start Date Field */}
        <div>
          <label className="block text-sm mb-1">Start Date</label>
          <input
            type="date"
            value={newRecExpStartDate}
            onChange={(e) => setNewRecExpStartDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        {/* Frequency Dropdown */}
        <div>
          <label className="block text-sm mb-1">Frequency</label>
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
        </div>
        {/* Account Dropdown */}
        <div>
          <label className="block text-sm mb-1">Account</label>
          <select
            value={newRecExpAccount}
            onChange={(e) => setNewRecExpAccount(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Account</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.name}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
        {/* Category Dropdown */}
        <div>
          <label className="block text-sm mb-1">Category</label>
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
            {/* Map through categories using category id as value */}
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
            <option value="addNew">Add New Category</option>
          </select>
        </div>
        {/* Create Button */}
        <div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Create
          </button>
        </div>
      </form>

      {/* Modal for adding a new category */}
      {showCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            {/* Modal Header */}
            <h3 className="text-xl font-bold mb-4">Add New Category</h3>
            {/* Input for new category name */}
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category Name"
              className="border p-2 rounded mb-4"
            />
            {/* Modal Action Buttons */}
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

      {/* Display error message if any */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default RecurringExpenseCreationForm;
