import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetCreationForm from './BudgetCreationForm';
import { formatCurrency } from "../../utils/currency";
import { getCurrentMonthRange, getPreviousMonthRange, getNextMonthRange, formatDate } from '../../utils/dateUtils';

const Budgets = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  // State for storing budgets retrieved from the backend
  const [budgets, setBudgets] = useState([]);
  const [totalSpent, setTotalSpent] = useState({});
  const { startDate: initialStart, endDate: initialEnd } = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [error, setError] = useState('');
  const [editBudgetId, setEditBudgetId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  // Currency settings
  const userPreferredCurrency = 'EUR';
  const userPreferredLocale = 'en-GB';

  useEffect(() => {
    handleCurrentMonth();
  }, []);

  const handleCurrentMonth = () => {
    const { startDate, endDate } = getCurrentMonthRange();
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const handlePreviousMonth = () => {
    const { startDate, endDate } = getPreviousMonthRange();
    setStartDate(startDate);
    setEndDate(endDate);
  };

  // Handle next month filter
  const handleNextMonth = () => {
    const { startDate, endDate } = getNextMonthRange();
    setStartDate(startDate);
    setEndDate(endDate);
  };

  // Fetch budgets from the backend, applying any set filters
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

      // For each budget, fetch the total spent amount in parallel.
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
      setError(errorMsg);
    }
  };

  // When startDate or endDate changes, fetch budgets
  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Called when the user clicks the Edit button for a budget.
  const handleEditClick = (budget) => {
    setEditBudgetId(budget.id);
    setEditAmount(budget.amount);
  };

  // Called when the user clicks Save after editing the budget amount.
  const handleEditSave = async (budgetId) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/budgets/${budgetId}`,
        { amount: editAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Reset editing states and re-fetch budgets to reflect the update.
      setEditBudgetId(null);
      setEditAmount('');
      fetchBudgets();
    } catch (err) {
      console.error('Failed to update budget', err);
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to update budget';
      setError(errorMsg);
    }
  };

  // Called when the user wants to delete a budget.
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
      setError(errorMsg);
    }
  };

  // New handler to update the monthly flag using a checkbox.
  const handleMonthlyChange = async (budgetId, newValue) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/budgets/${budgetId}/monthly?active=${newValue}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBudgets();
    } catch (err) {
      console.error('Failed to update monthly status', err);
      setError('Failed to update monthly status');
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-4">Budgets</h1>

      {/* Button to toggle the Budget Creation Form */}
      <div className="mb-4">
        <button
          onClick={() => setShowBudgetForm(!showBudgetForm)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {showBudgetForm ? 'Cancel Budget Creation' : 'Create Budget'}
        </button>
      </div>

      {/* Render the Budget Creation Form if toggled */}
      {showBudgetForm && (
        <BudgetCreationForm token={token} BASE_URL={BASE_URL} onBudgetCreated={fetchBudgets} />
      )}

      {/* Display error message if any */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Filtering Options */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={handleCurrentMonth} className="bg-blue-500 text-white px-4 py-2 rounded">
          Current Month
        </button>
        <button onClick={handlePreviousMonth} className="bg-blue-500 text-white px-4 py-2 rounded">
          Previous Month
        </button>
        <button
          type="button"
          onClick={handleNextMonth}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next Month
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
      </div>

      {/* Budgets Table */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Budgeted Amount</th>
            <th className="py-2 px-4 border-b">Total Spent</th>
            <th className="py-2 px-4 border-b">Start Date</th>
            <th className="py-2 px-4 border-b">End Date</th>
            <th className="py-2 px-4 border-b">Monthly</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {budgets.length === 0 ? (
            <tr>
              <td className="py-2 px-4 border-b" colSpan="7">
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
                    formatCurrency(budget.amount, userPreferredCurrency, userPreferredLocale)
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {formatCurrency(totalSpent[budget.id], userPreferredCurrency, userPreferredLocale)}
                </td>
                <td className="py-2 px-4 border-b">{formatDate(budget.startDate)}</td>
                <td className="py-2 px-4 border-b">{formatDate(budget.endDate)}</td>
                <td className="py-2 px-4 border-b">
                  <input
                    type="checkbox"
                    checked={!!budget.monthly}
                    onChange={(e) => handleMonthlyChange(budget.id, e.target.checked)}
                  />
                </td>
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
