import React, { useState } from 'react';
import axios from 'axios';

const SavingsGoalCreationForm = ({ token, BASE_URL, onGoalCreated }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = { name, targetAmount, description };
      await axios.post(
        `${BASE_URL}/api/savings-goals`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName('');
      setTargetAmount('');
      setDescription('');
      setError('');
      onGoalCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create savings goal');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end mb-6">
      {/* Name Field */}
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
          required
        />
      </div>

      {/* Target Amount Field */}
      <div>
        <label className="block text-sm mb-1">Target Amount</label>
        <input
          type="number"
          step="0.01"
          value={targetAmount}
          onChange={e => setTargetAmount(e.target.value)}
          className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
          required
        />
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
      </div>

      {/* Create Button */}
      <div>
        <button
          type="submit"
          className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg"
        >
          Create Savings Goal
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="w-full text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};

export default SavingsGoalCreationForm;
