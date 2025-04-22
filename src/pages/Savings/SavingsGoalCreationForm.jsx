import React, { useState } from 'react';
import axios from 'axios';

const SavingsGoalCreationForm = ({ token, BASE_URL, onGoalCreated }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        targetAmount,
        description,
      };
      await axios.post(`${BASE_URL}/api/savings-goals`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setName('');
      setTargetAmount('');
      setDescription('');
      setError('');
      onGoalCreated();
    } catch (err) {
      console.error('Failed to create savings goal', err);
      const errorMsg =
      err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Failed to create savings goal';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-row gap-4 items-end mb-6 p-4 border rounded">
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Target Amount</label>
        <input
          type="number"
          step="0.01"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          className="border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
        />
      </div>
      <div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Create Savings Goal
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default SavingsGoalCreationForm;
