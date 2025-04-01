import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecurringExpenseCreationForm from './RecurringExpenseCreationForm';

const RecurringExpenses = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [showCreationForm, setShowCreationForm] = useState(false);

  // Inline editing states for amount, next due date, and account
  const [editAmountId, setEditAmountId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDueId, setEditDueId] = useState(null);
  const [editDue, setEditDue] = useState('');
  const [editAccountId, setEditAccountId] = useState(null);
  const [editAccount, setEditAccount] = useState('');

  // Fetch recurring expenses with filtering
  const fetchRecurringExpenses = async () => {
    try {
      let url = `${BASE_URL}/api/recurring-expenses`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (filterCategory) params.append('categoryId', filterCategory);
      if (filterAccount) params.append('accountId', filterAccount);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setRecurringExpenses(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch automatic payments', err);
      setError('Failed to fetch automatic payments');
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(res.data);
    } catch (err) {
      console.error('Failed to fetch accounts', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    fetchRecurringExpenses();
  }, [startDate, endDate, filterCategory, filterAccount]);

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/recurring-expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRecurringExpenses();
    } catch (err) {
      console.error('Failed to delete automatic payment', err);
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to delete automatic payment';
      setError(errorMsg);
      
    }
  };

  // ----- Inline Edit Handlers for Amount -----
  const handleEditAmountClick = (expense) => {
    setEditAmountId(expense.id);
    setEditAmount(expense.amount);
  };

  const handleEditAmountSave = async (id) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/recurring-expenses/amount/${id}`,
        { amount: editAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditAmountId(null);
      setEditAmount('');
      fetchRecurringExpenses();
    } catch (err) {
      console.error('Failed to update amount', err);
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to update amount';
      setError(errorMsg);
    }
  };

  // ----- Inline Edit Handlers for Next Due Date -----
  const handleEditDueClick = (expense) => {
    setEditDueId(expense.id);
    setEditDue(expense.nextDueDate);
  };

  const handleEditDueSave = async (id) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/recurring-expenses/name/${id}`,
        { date: editDue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditDueId(null);
      setEditDue('');
      fetchRecurringExpenses();
    } catch (err) {
      console.error('Failed to update next due date', err);
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to update next due date';
      setError(errorMsg);
    }
  };

  // ----- Inline Edit Handlers for Account -----
  const handleEditAccountClick = (expense) => {
    setEditAccountId(expense.id);
    setEditAccount(expense.account?.name || '');
  };

  const handleEditAccountSave = async (id) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/recurring-expenses/account/${id}`,
        { accountName: editAccount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditAccountId(null);
      setEditAccount('');
      fetchRecurringExpenses();
    } catch (err) {
      console.error('Failed to update account', err);
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to update account';
      setError(errorMsg);
    }
  };

  // ----- Pause/Resume Handlers -----
  const handlePause = async (id) => {
    try {
      await axios.patch(`${BASE_URL}/api/recurring-expenses/${id}/pause`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRecurringExpenses();
    } catch (err) {
      console.error('Failed to pause', err);
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to pause';
      setError(errorMsg);
    }
  };

  const handleResume = async (id) => {
    try {
      await axios.patch(`${BASE_URL}/api/recurring-expenses/${id}/resume`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRecurringExpenses();
    } catch (err) {
      console.error('Failed to resume', err);
      const errorMsg =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to resume';
      setError(errorMsg);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Automatic Payments</h1>

      {/* Toggle the creation form */}
      <button
        onClick={() => setShowCreationForm(!showCreationForm)}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        {showCreationForm ? 'Cancel Payment Creation' : 'Add Payment'}
      </button>

      {showCreationForm && (
        <RecurringExpenseCreationForm
          token={token}
          BASE_URL={BASE_URL}
          onExpenseCreated={() => {
            fetchRecurringExpenses();
            setShowCreationForm(false);
          }}
          accounts={accounts}
          categories={categories}
        />
      )}

      {error && <p className="text-red-500">{error}</p>}

      {/* Filtering Options (you can remove these later if not needed) */}
      <div className="mb-4 flex flex-wrap gap-2">
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
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Accounts</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
        <button
          onClick={fetchRecurringExpenses}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Filter
        </button>
      </div>

      {/* Recurring Payments List */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Frequency</th>
            <th className="py-2 px-4 border-b">Start Date</th>
            <th className="py-2 px-4 border-b">Next Due Date</th>
            <th className="py-2 px-4 border-b">Account</th>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recurringExpenses.length === 0 ? (
            <tr>
              <td className="py-2 px-4 border-b" colSpan="9">
                No automatic payments found.
              </td>
            </tr>
          ) : (
            recurringExpenses.map((expense) => (
              <tr key={expense.id}>
                <td className="py-2 px-4 border-b">{expense.name}</td>
                <td className="py-2 px-4 border-b">
                  {editAmountId === expense.id ? (
                    <>
                      <input
                        type="number"
                        step="0.01"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="border p-1 rounded"
                      />
                      <button
                        onClick={() => handleEditAmountSave(expense.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded ml-1"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      {expense.amount}
                      <button
                        onClick={() => handleEditAmountClick(expense)}
                        className="bg-blue-500 text-white px-2 py-1 rounded ml-1"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </td>
                <td className="py-2 px-4 border-b">{expense.frequency}</td>
                <td className="py-2 px-4 border-b">{expense.startDate}</td>
                <td className="py-2 px-4 border-b">
                  {editDueId === expense.id ? (
                    <>
                      <input
                        type="date"
                        value={editDue}
                        onChange={(e) => setEditDue(e.target.value)}
                        className="border p-1 rounded"
                      />
                      <button
                        onClick={() => handleEditDueSave(expense.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded ml-1"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      {expense.nextDueDate}
                      <button
                        onClick={() => handleEditDueClick(expense)}
                        className="bg-blue-500 text-white px-2 py-1 rounded ml-1"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {editAccountId === expense.id ? (
                    <>
                      <select
                        value={editAccount}
                        onChange={(e) => setEditAccount(e.target.value)}
                        className="border p-1 rounded"
                      >
                        <option value="">Select Account</option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.name}>
                            {acc.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleEditAccountSave(expense.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded ml-1"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      {expense.account?.name || 'N/A'}
                      <button
                        onClick={() => handleEditAccountClick(expense)}
                        className="bg-blue-500 text-white px-2 py-1 rounded ml-1"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </td>
                {/* category */}
                <td className="py-2 px-4 border-b">{expense.category?.name}</td>
                <td className="py-2 px-4 border-b">
                  {expense.active ? 'Active' : 'Paused'}
                </td>
                <td className="py-2 px-4 border-b">
                  {expense.active ? (
                    <button
                      onClick={() => handlePause(expense.id)}
                      className="bg-orange-500 text-white px-2 py-1 rounded mr-1"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => handleResume(expense.id)}
                      className="bg-purple-500 text-white px-2 py-1 rounded mr-1"
                    >
                      Resume
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecurringExpenses;
