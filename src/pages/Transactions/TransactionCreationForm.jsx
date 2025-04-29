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
  // State variables for the new transaction fields
  const [newTxnDate, setNewTxnDate] = useState('');
  const [newTxnAmount, setNewTxnAmount] = useState('');
  const [newTxnCategory, setNewTxnCategory] = useState('');
  const [newTxnAccount, setNewTxnAccount] = useState('');
  const [newTxnType, setNewTxnType] = useState('Expense'); // default value
  const [newTxnDescription, setNewTxnDescription] = useState('');
  // State to control the modal for adding a new category
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

  // Handler to create a new transaction
  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      // Construct payload using categoryId instead of categoryName.
      // You may update your backend accordingly to accept a category id.
      const payload = {
        date: newTxnDate,
        amount: newTxnAmount,
        categoryId: newTxnCategory,
        accountName: newTxnAccount,
        type: newTxnType,
        description: newTxnDescription,
      };
      await axios.post(`${BASE_URL}/api/transactions`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Clear form fields upon success
      setNewTxnDate('');
      setNewTxnAmount('');
      setNewTxnCategory('');
      setNewTxnAccount('');
      setNewTxnType('Expense');
      setNewTxnDescription('');
      onTransactionCreated();
    } catch (err) {
      console.error('Failed to create transaction', err);
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to create transaction';
      setError(errorMsg);
    }
  };

  // Handler to add a new category
  const handleAddCategory = async () => {
    try {
      const payload = { name: newCategoryName };
      // Backend creates a new category and returns it
      const res = await axios.post(`${BASE_URL}/api/categories`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshAccountsAndCategories();
      // Set the new transaction category to the newly created category's id
      // Assuming the response includes the category id and name.
      setNewTxnCategory(res.data.id);
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
      {/* Transaction creation form (horizontal layout) */}
      <form onSubmit={handleCreateTransaction} className="flex flex-row flex-wrap gap-2 items-end mb-6 w-3/4">
  {/* Date Input */}
  <div>
    <label className="block text-sm mb-1">Date</label>
    <input
      type="date"
      value={newTxnDate}
      onChange={e => setNewTxnDate(e.target.value)}
      className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
    />
  </div>

  {/* Amount Input */}
  <div>
    <label className="block text-sm mb-1">Amount</label>
    <input
      type="number"
      step="0.01"
      value={newTxnAmount}
      onChange={e => setNewTxnAmount(e.target.value)}
      placeholder="Amount"
      className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
    />
  </div>

  {/* Account Dropdown */}
  <div>
    <label className="block text-sm mb-1">Account</label>
    <select
      value={newTxnAccount}
      onChange={e => setNewTxnAccount(e.target.value)}
      className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
    >
      <option value="">Select Account</option>
      {accounts.map(acc => (
        <option key={acc.id} value={acc.name}>{acc.name}</option>
      ))}
    </select>
  </div>

  {/* Category Dropdown */}
  <div>
    <label className="block text-sm mb-1">Category</label>
    <select
      value={newTxnCategory}
      onChange={e => {
        if (e.target.value === 'addNew') {
          setShowCategoryModal(true);
        } else {
          setNewTxnCategory(e.target.value);
        }
      }}
      className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
    >
      <option value="">Select Category</option>
      {categories.map(cat => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
      <option value="addNew">Add New Category</option>
    </select>
  </div>

  {/* Type Dropdown */}
  <div>
    <label className="block text-sm mb-1">Type</label>
    <select
      value={newTxnType}
      onChange={e => setNewTxnType(e.target.value)}
      className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
    >
      <option value="Deposit">Deposit</option>
      <option value="Expense">Expense</option>
    </select>
  </div>

  {/* Description Input */}
  <div className="flex-1 w-[200px]">
    <label className="block text-sm mb-1">Description</label>
    <input
      type="text"
      value={newTxnDescription}
      onChange={e => setNewTxnDescription(e.target.value)}
      placeholder="Description"
      className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 w-full"
    />
  </div>

  {/* Create Button */}
  <div>
    <button
      type="submit"
      className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg"
    >
      Create
    </button>
  </div>
</form>


      {/* Modal for adding a new category */}
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

      {/* Display any error messages */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default TransactionCreationForm;
