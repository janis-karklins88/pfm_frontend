import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetCreationForm from './BudgetCreationForm';
import { formatCurrency } from '../../utils/currency';
import { getCurrentMonthRange, getNextMonthRange, formatDate } from '../../utils/dateUtils';
import { Edit2Icon, CheckIcon, Trash2Icon } from 'lucide-react';

const Budgets = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  // State
  const [budgets, setBudgets] = useState([]);
  const [totalSpent, setTotalSpent] = useState({});
  const { startDate: initStart, endDate: initEnd } = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(initStart);
  const [endDate, setEndDate] = useState(initEnd);
  const [editBudgetId, setEditBudgetId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [error, setError] = useState('');

  const userPreferredCurrency = 'EUR';
  const userPreferredLocale = 'en-GB';

  // Fetch budgets and spent amounts
  const fetchBudgets = async () => {
    try {
      let url = `${BASE_URL}/api/budgets`;
      const params = new URLSearchParams();
      if (startDate) params.append('filterStart', startDate);
      if (endDate) params.append('filterEnd', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setBudgets(res.data);
      setError('');

      const spentMap = {};
      await Promise.all(
        res.data.map(async b => {
          try {
            const { data } = await axios.get(
              `${BASE_URL}/api/budgets/spent/${b.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            spentMap[b.id] = data;
          } catch {
            spentMap[b.id] = 0;
          }
        })
      );
      setTotalSpent(spentMap);
    } catch (err) {
      setError('Failed to load budgets');
    }
  };

  // Preset handlers
  const handleThisMonth = () => {
    const { startDate, endDate } = getCurrentMonthRange();
    setStartDate(startDate);
    setEndDate(endDate);
  };
  const handleNextMonth = () => {
    const { startDate, endDate } = getNextMonthRange();
    setStartDate(startDate);
    setEndDate(endDate);
  };

  // Effects
  useEffect(() => {
    handleThisMonth();
  }, []);
  useEffect(() => {
    fetchBudgets();
  }, [startDate, endDate]);

  // Inline edit save
  const saveEdit = async id => {
    try {
      await axios.patch(
        `${BASE_URL}/api/budgets/${id}`,
        { amount: editAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditBudgetId(null);
      setEditAmount('');
      fetchBudgets();
    } catch {
      setError('Failed to update budget');
    }
  };

  const handleDelete = async id => {
    if (window.confirm('Delete this budget?')) {
      try {
        await axios.delete(`${BASE_URL}/api/budgets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchBudgets();
      } catch {
        setError('Failed to delete budget');
      }
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
      <h1 className="text-2xl font-bold text-gray-700 mb-4">Budgets</h1>
      <button
        onClick={() => setShowBudgetForm(!showBudgetForm)}
        className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg mb-4"
      >
        {showBudgetForm ? 'Cancel' : 'Create Budget'}
      </button>
      {showBudgetForm && (
        <BudgetCreationForm
          token={token}
          BASE_URL={BASE_URL}
          onBudgetCreated={() => { fetchBudgets(); setShowBudgetForm(false); }}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={handleThisMonth} className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">This Month</button>
        <button onClick={handleNextMonth} className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">Next Month</button>
        <button onClick={() => { setStartDate(''); setEndDate(''); }} className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">All</button>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:ring-2 focus:ring-teal-300"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:ring-2 focus:ring-teal-300"
        />
      </div>

      {/* Budgets Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-50">
            <tr>
              {['Category','Budgeted','Spent','Start','End','Monthly',''].map(col => (
                <th
                  key={col}
                  className="px-4 py-2 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide"
                >{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {budgets.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">No budgets found.</td></tr>
            ) : budgets.map(budget => {
              const spent = totalSpent[budget.id] || 0;
              return (
                <tr key={budget.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{budget.category?.name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">
                    {editBudgetId === budget.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editAmount}
                          onChange={e => setEditAmount(e.target.value)}
                          className="border border-gray-300 text-sm px-2 py-1 rounded-lg"
                        />
                        <button onClick={() => saveEdit(budget.id)} className="p-1 rounded hover:bg-gray-100" title="Confirm edit">
                          <CheckIcon size={16} className="text-green-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {formatCurrency(budget.amount, userPreferredCurrency, userPreferredLocale)}
                        <button onClick={() => { setEditBudgetId(budget.id); setEditAmount(budget.amount); }} className="p-1 rounded hover:bg-gray-100" title="Edit budget amount">
                          <Edit2Icon size={16} className="text-gray-500" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(spent, userPreferredCurrency, userPreferredLocale)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(budget.startDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(budget.endDate)}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    <input
                      type="checkbox"
                      checked={!!budget.monthly}
                      onChange={e => axios.patch(
                        `${BASE_URL}/api/budgets/${budget.id}/monthly?active=${e.target.checked}`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                      ).then(fetchBudgets)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm flex gap-2 justify-end">
                    <button onClick={() => handleDelete(budget.id)} className="p-1 rounded hover:bg-gray-100" title="Delete budget">
                      <Trash2Icon size={16} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Budgets;
