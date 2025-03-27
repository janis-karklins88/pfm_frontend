import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BudgetCreationForm = ({ token, BASE_URL, onBudgetCreated }) => {
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

  // Fetch categories on mount
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

  const handleAddCategory = async () => {
    try {
      const payload = { name: newCategoryName };
      const res = await axios.post(`${BASE_URL}/api/categories`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Add new category to the list and select it
      setCategories([...categories, res.data]);
      setSelectedCategory(res.data.name);
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Failed to create category', err);
      setError('Failed to create category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { amount, startDate, endDate, categoryName: selectedCategory };
      await axios.post(`${BASE_URL}/api/budgets`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Clear form fields
      setAmount('');
      setStartDate('');
      setEndDate('');
      setSelectedCategory('');
      setError('');
      onBudgetCreated();
    } catch (err) {
      console.error('Failed to create budget', err);
      setError('Failed to create budget');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-row gap-4 items-end mb-6 p-4 border rounded">
      <div>
        <label className="block text-sm mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
          required
        />
      </div>
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
          className="border p-2 rounded"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
          <option value="addNew">Add New Category</option>
        </select>
      </div>
      <div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Create Budget
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}

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
    </form>
  );
};

export default BudgetCreationForm;
