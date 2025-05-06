import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecurringExpenseCreationForm from './RecurringExpenseCreationForm';
import { formatCurrency } from '../../utils/currency';
import { getCurrentMonthRange, getNextMonthRange } from '../../utils/dateUtils';
import { PauseIcon, PlayIcon, Trash2Icon, Edit2Icon, CheckIcon } from 'lucide-react';
import { useSettings } from "../../contexts/SettingsContext";


const RecurringExpenses = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  const { currency: userPreferredCurrency } = useSettings();
  const userPreferredLocale = navigator.language;

  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showCreationForm, setShowCreationForm] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');

  // Inline edit states
  const [editAmountId, setEditAmountId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDueId, setEditDueId] = useState(null);
  const [editDue, setEditDue] = useState('');
  const [editAccountId, setEditAccountId] = useState(null);
  const [editAccount, setEditAccount] = useState('');

  // Fetch functions
  const fetchRecurring = async () => {
    try {
      let url = `${BASE_URL}/api/recurring-expenses`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (filterCategory) params.append('categoryId', filterCategory);
      if (filterAccount) params.append('accountId', filterAccount);
      if (params.toString()) url += `?${params.toString()}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setRecurringExpenses(res.data);
      setError('');
    } catch {
      setError('Failed to fetch automatic payments');
    }
  };
  const fetchAccounts = async () => {
    const res = await axios.get(`${BASE_URL}/api/accounts`, { headers: { Authorization: `Bearer ${token}` } });
    setAccounts(res.data);
  };
  const fetchCategories = async () => {
    const res = await axios.get(`${BASE_URL}/api/categories`, { headers: { Authorization: `Bearer ${token}` } });
    setCategories(res.data);
  };

  useEffect(() => { fetchAccounts(); fetchCategories(); }, []);
  useEffect(() => { fetchRecurring(); }, [startDate, endDate, filterCategory, filterAccount]);

  // Inline edits
  const saveAmount = async id => {
    await axios.patch(`${BASE_URL}/api/recurring-expenses/amount/${id}`, { amount: editAmount }, { headers: { Authorization: `Bearer ${token}` } });
    setEditAmountId(null);
    fetchRecurring();
  };
  const saveDue = async id => {
    await axios.patch(`${BASE_URL}/api/recurring-expenses/name/${id}`, { date: editDue }, { headers: { Authorization: `Bearer ${token}` } });
    setEditDueId(null);
    fetchRecurring();
  };
  const saveAccount = async id => {
    await axios.patch(`${BASE_URL}/api/recurring-expenses/account/${id}`, { accountName: editAccount }, { headers: { Authorization: `Bearer ${token}` } });
    setEditAccountId(null);
    fetchRecurring();
  };
  const handleDelete = async id => {
    if (window.confirm('Delete this payment?')) {
      await axios.delete(`${BASE_URL}/api/recurring-expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchRecurring();
    }
  };
  const handlePause = async id => {
    await axios.patch(`${BASE_URL}/api/recurring-expenses/${id}/pause`, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchRecurring();
  };
  const handleResume = async id => {
    await axios.patch(`${BASE_URL}/api/recurring-expenses/${id}/resume`, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchRecurring();
  };

  // Handlers for preset filters
  const handleThisMonth = () => {
    const { startDate: s, endDate: e } = getCurrentMonthRange();
    setStartDate(s);
    setEndDate(e);
  };
  const handleNextMonth = () => {
    const { startDate: s, endDate: e } = getNextMonthRange();
    setStartDate(s);
    setEndDate(e);
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
      <h1 className="text-2xl font-bold text-gray-700 mb-4">Automatic Payments</h1>
      <button
        onClick={() => setShowCreationForm(!showCreationForm)}
        className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg mb-4"
        title={showCreationForm ? 'Cancel' : 'Add Payment'}
      >
        {showCreationForm ? 'Cancel' : 'Add Payment'}
      </button>
      {showCreationForm && (
        <RecurringExpenseCreationForm
          token={token}
          BASE_URL={BASE_URL}
          onExpenseCreated={() => { fetchRecurring(); setShowCreationForm(false); }}
          accounts={accounts}
          categories={categories}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={handleThisMonth} className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">This Month</button>
        <button onClick={handleNextMonth} className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">Next Month</button>
        <button onClick={() => { setStartDate(''); setEndDate(''); }} className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">All</button>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:ring-2 focus:ring-teal-300"/>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:ring-2 focus:ring-teal-300"/>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-300">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterAccount} onChange={e => setFilterAccount(e.target.value)} className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-300">
          <option value="">All Accounts</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-50">
            <tr>
              {['Name','Amount','Frequency','Start','Next Due','Account','Category','Status',''].map(col => (
                <th key={col} className="px-4 py-2 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recurringExpenses.length === 0 ? (
              <tr><td colSpan="9" className="px-4 py-4 text-center text-sm text-gray-500">No automatic payments found.</td></tr>
            ) : recurringExpenses.map(exp => (
              <tr key={exp.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{exp.name}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-700">{/* inline edit amount */}
                  {editAmountId === exp.id ? (
                    <div className="flex items-center gap-2">
                      <input type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="border border-gray-300 text-sm px-2 py-1 rounded-lg" />
                      <button onClick={() => saveAmount(exp.id)} className="p-1 rounded hover:bg-gray-100" title="Confirm"><CheckIcon size={16} className="text-green-500"/></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {formatCurrency(exp.amount, userPreferredCurrency, userPreferredLocale)}
                      <button onClick={() => { setEditAmountId(exp.id); setEditAmount(exp.amount); }} className="p-1 rounded hover:bg-gray-100" title="Edit amount"><Edit2Icon size={16} className="text-gray-500"/></button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{exp.frequency}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{exp.startDate}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{/* inline edit next due */}
                  {editDueId === exp.id ? (
                    <div className="flex items-center gap-2">
                      <input type="date" value={editDue} onChange={e => setEditDue(e.target.value)} className="border border-gray-300 text-sm px-2 py-1 rounded-lg" />
                      <button onClick={() => saveDue(exp.id)} className="p-1 rounded hover:bg-gray-100" title="Confirm"><CheckIcon size={16} className="text-green-500"/></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {exp.nextDueDate}
                      <button onClick={() => { setEditDueId(exp.id); setEditDue(exp.nextDueDate); }} className="p-1 rounded hover:bg-gray-100" title="Edit due date"><Edit2Icon size={16} className="text-gray-500"/></button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{/* inline edit account */}
                  {editAccountId === exp.id ? (
                    <div className="flex items-center gap-2">
                      <select value={editAccount} onChange={e => setEditAccount(e.target.value)} className="border border-gray-300 text-sm px-2 py-1 rounded-lg">
                        <option value="">Select</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <button onClick={() => saveAccount(exp.id)} className="p-1 rounded hover:bg-gray-100" title="Confirm"><CheckIcon size={16} className="text-green-500"/></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {exp.account?.name || 'N/A'}
                      <button onClick={() => { setEditAccountId(exp.id); setEditAccount(exp.account?.id || ''); }} className="p-1 rounded hover:bg-gray-100" title="Edit account"><Edit2Icon size={16} className="text-gray-500"/></button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{exp.category?.name || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{exp.active ? 'Active' : 'Paused'}</td>
                <td className="px-4 py-3 text-sm flex gap-2">{/* actions */}
                  {exp.active ? (
                    <button onClick={() => handlePause(exp.id)} className="p-1 rounded hover:bg-gray-100" title="Pause"><PauseIcon size={16} className="text-orange-500"/></button>
                  ) : (
                    <button onClick={() => handleResume(exp.id)} className="p-1 rounded hover:bg-gray-100" title="Resume"><PlayIcon size={16} className="text-purple-500"/></button>
                  )}
                  <button onClick={() => handleDelete(exp.id)} className="p-1 rounded hover:bg-gray-100" title="Delete"><Trash2Icon size={16} className="text-red-500"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecurringExpenses;
