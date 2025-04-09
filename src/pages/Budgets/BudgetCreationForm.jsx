import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentMonthRange, getNextMonthRange, formatDate } from '../../utils/dateUtils';

const BudgetCreationForm = ({ token, BASE_URL, onBudgetCreated }) => {
  // State variables for budget details
  const [amount, setAmount] = useState('');
  const { startDate: initialStart, endDate: initialEnd } = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');


  //handle next month
  const handleNextMonth = () => {
        const { startDate, endDate } = getNextMonthRange();
        setStartDate(startDate);
        setEndDate(endDate);
      };

  // When the component mounts, fetch the list of categories.
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, [BASE_URL, token]);

  // Handler for adding a new category using the modal.
  const handleAddCategory = async () => {
    try {
      const payload = { name: newCategoryName };
      // Create a new category on the backend.
      const res = await axios.post(`${BASE_URL}/api/categories`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Append the newly created category to the list.
      setCategories([...categories, res.data]);
      // Set the selected category to the new category's id.
      setSelectedCategory(res.data.id);
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

  // Handler for submitting the budget creation form.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build payload with categoryId (instead of categoryName)
      const payload = { amount, startDate, endDate, categoryId: selectedCategory };
      await axios.post(`${BASE_URL}/api/budgets`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Clear form fields upon success
      setAmount('');
      setStartDate(initialStart);
      setEndDate(initialEnd);
      setSelectedCategory('');
      setError('');
      onBudgetCreated();
    } catch (err) {
      console.error('Failed to add budget', err);
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to add budget';
      setError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-row gap-4 items-end mb-6 p-4 border rounded">
      {/* Amount Field */}
      <div>
        <label className="block text-sm mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
      </div>
      {/* Next month Field */}
      <button
          type="button"
          onClick={handleNextMonth}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next Month
        </button>
      {/* Start Date Field */}
      <div>
        <label className="block text-sm mb-1">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
      </div>
      {/* End Date Field */}
      <div>
        <label className="block text-sm mb-1">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
      </div>
      {/* Category Dropdown */}
      <div>
        <label className="block text-sm mb-1">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            if (e.target.value === 'addNew') {
              setShowCategoryModal(true);
            } else {
              setSelectedCategory(e.target.value);
            }
          }}
          className="border p-2 rounded w-full"
          required
        >
          <option value="">Select Category</option>
          {/* Map through categories and use category id as the value */}
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
          <option value="addNew">Add New Category</option>
        </select>
      </div>
      {/* Create Budget Button */}
      <div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Create Budget
        </button>
      </div>
      {/* Display error message if present */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Modal for Adding a New Category */}
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
    </form>
  );
};

export default BudgetCreationForm;
