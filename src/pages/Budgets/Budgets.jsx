import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetCreationForm from './BudgetCreationForm';

const Budgets = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  const [budgets, setBudgets] = useState([]);
  const [totalSpent, setTotalSpent] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [editBudgetId, setEditBudgetId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  // Set default filter to current month on mount
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  const fetchBudgets = async () => {
    try {
      let url = `${BASE_URL}/api/budgets`;
      const params = new URLSearchParams();
      if (startDate) params.append('filterStart', startDate);
      if (endDate) params.append('filterEnd', endDate);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(res.data);
      setError('');

      // Fetch total spent for each budget in parallel
      const totalSpentMap = {};
      await Promise.all(
        res.data.map(async (budget) => {
          try {
            const resSpent = await axios.get(
              `${BASE_URL}/api/budgets/spent/${budget.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            totalSpentMap[budget.id] = resSpent.data;
          } catch (err) {
            totalSpentMap[budget.id] = 'Error';
          }
        })
      );
      setTotalSpent(totalSpentMap);
    } catch (err) {
      console.error('Failed to fetch budgets', err);
      const errorMsg =
      err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Failed to fetch budgets';
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchBudgets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const handleEditClick = (budget) => {
    setEditBudgetId(budget.id);
    setEditAmount(budget.amount);
  };

  const handleEditSave = async (budgetId) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/budgets/${budgetId}`,
        { amount: editAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditBudgetId(null);
      setEditAmount('');
      fetchBudgets();
    } catch (err) {
      console.error('Failed to update budgett', err);
      const errorMsg =
      err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Failed to update budget';
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const handlePreviousMonth = () => {
    const now = new Date();
    const previousMonth = now.getMonth() - 1;
    const year = previousMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = (previousMonth + 12) % 12;
    const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
    const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBudgets();
    } catch (err) {
      console.error('Failed to delete budget', err);
      const errorMsg =
      err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Failed to delete budget';
    }
  };
  

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Budgets</h1>

      {/* Toggle Budget Creation Form */}
      <div className="mb-4">
        <button
          onClick={() => setShowBudgetForm(!showBudgetForm)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {showBudgetForm ? 'Cancel Budget Creation' : 'Create Budget'}
        </button>
      </div>

      {showBudgetForm && (
        <BudgetCreationForm token={token} BASE_URL={BASE_URL} onBudgetCreated={fetchBudgets} />
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Filtering Options */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={handleCurrentMonth}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Current Month
        </button>
        <button
          onClick={handlePreviousMonth}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Previous Month
        </button>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
          placeholder="End Date"
        />
        <button
          onClick={fetchBudgets}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Filter
        </button>
      </div>

      {/* Budgets List */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Budgeted Amount</th>
            <th className="py-2 px-4 border-b">Total Spent</th>
            <th className="py-2 px-4 border-b">Start Date</th>
            <th className="py-2 px-4 border-b">End Date</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {budgets.length === 0 ? (
            <tr>
              <td className="py-2 px-4 border-b" colSpan="6">
                No budgets found.
              </td>
            </tr>
          ) : (
            budgets.map((budget) => (
              <tr key={budget.id}>
                <td className="py-2 px-4 border-b">
                  {budget.category?.name || 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">
                  {editBudgetId === budget.id ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="border p-1 rounded"
                    />
                  ) : (
                    budget.amount
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {totalSpent[budget.id] || 0}
                </td>
                <td className="py-2 px-4 border-b">{budget.startDate}</td>
                <td className="py-2 px-4 border-b">{budget.endDate}</td>
                <td className="py-2 px-4 border-b">
                  {editBudgetId === budget.id ? (
                    <button
                      onClick={() => handleEditSave(budget.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Save
                    </button>
                  ) : (
                    <>
                    <button
                      onClick={() => handleEditClick(budget)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                    onClick={() => handleDelete(budget.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Budgets;
