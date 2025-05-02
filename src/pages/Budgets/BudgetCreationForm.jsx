import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentMonthRange, getNextMonthRange } from '../../utils/dateUtils';

const BudgetCreationForm = ({ token, BASE_URL, onBudgetCreated }) => {
  const [amount, setAmount] = useState('');
  const { startDate: initStart, endDate: initEnd } = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(initStart);
  const [endDate, setEndDate] = useState(initEnd);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, [BASE_URL, token]);

  // Handlers for presets
  const handleNextMonth = () => {
    const { startDate: s, endDate: e } = getNextMonthRange();
    setStartDate(s);
    setEndDate(e);
  };

  // Create new category
  const handleAddCategory = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/categories`,
        { name: newCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories([...categories, res.data]);
      setSelectedCategory(res.data.id);
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Failed to add category', err);
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  // Submit budget
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/api/budgets`,
        { amount, startDate, endDate, categoryId: selectedCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAmount('');
      setStartDate(initStart);
      setEndDate(initEnd);
      setSelectedCategory('');
      setError('');
      onBudgetCreated();
    } catch (err) {
      console.error('Failed to add budget', err);
      setError(err.response?.data?.message || 'Failed to add budget');
    }
  };

  return (
    <div className="mb-6 p-0 rounded-lg bg-white">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
        {/* Amount */}
        <div>
          <label className="block text-sm mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          />
        </div>
        {/* Preset Next Month */}
        <button
          type="button"
          onClick={handleNextMonth}
          className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg"
        >
          Next Month
        </button>
        {/* Start Date */}
        <div>
          <label className="block text-sm mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          />
        </div>
        {/* End Date */}
        <div>
          <label className="block text-sm mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          />
        </div>
        {/* Category */}
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={e => e.target.value === 'addNew' ? setShowCategoryModal(true) : setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
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
          <button
            type="submit"
            className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg"
          >
            Create Budget
          </button>
        </div>

      </form>

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
              className="w-full border border-gray-300 text-sm px-3 py-1 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            {error && (
             <p className="text-red-500 text-sm mb-4">
               {error}
             </p>
            )}
            <div className="flex gap-2 justify-end">
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

export default BudgetCreationForm;
