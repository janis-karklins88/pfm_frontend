import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SavingsGoalCreationForm from './SavingsGoalCreationForm';
import { formatCurrency } from "../../utils/currency";
import { CheckIcon, Edit2Icon, Trash2Icon, ArrowUpDownIcon } from 'lucide-react';
import { useSettings } from "../../contexts/SettingsContext";
import { useAuth } from  "../../contexts/AuthContext";

const Savings = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const { token } = useAuth();
  const { currency: userPreferredCurrency } = useSettings();
  const userPreferredLocale = navigator.language;

  const [savingsGoals, setSavingsGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [showCreationForm, setShowCreationForm] = useState(false);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferType, setTransferType] = useState('Deposit');
  const [transferAccount, setTransferAccount] = useState('');

  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalAmount, setEditGoalAmount] = useState('');


  const fetchSavingsGoals = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/savings-goals`, { headers: { Authorization: `Bearer ${token}` } });
      setSavingsGoals(res.data);
      setError('');
    } catch {
      setError('Failed to fetch savings goals');
    }
  };
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/accounts`, { headers: { Authorization: `Bearer ${token}` } });
      setAccounts(res.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => { fetchSavingsGoals(); fetchAccounts(); }, []);

  const handleDelete = async id => {
    if (window.confirm('Delete this savings goal?')) {
      try {
        await axios.delete(`${BASE_URL}/api/savings-goals/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchSavingsGoals();
      } catch (err) {
        console.error('Delete savings goal error:', err);
        const msg = err.response?.data?.message || 'Failed to delete savings goal';
        setError(msg);
      }
    }
  };

  const openTransferModal = goalId => {
    setSelectedGoalId(goalId);
    setTransferAmount('');
    setTransferType('Deposit');
    setTransferAccount('');
    setShowTransferModal(true);
  };

  const handleTransferSubmit = async e => {
    e.preventDefault();
    try {
      await axios.patch(
        `${BASE_URL}/api/savings-goals/${selectedGoalId}/transfer-funds`,
        { accountName: transferAccount, amount: transferAmount, type: transferType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowTransferModal(false);
      fetchSavingsGoals();
    } catch {
      setError('Failed to transfer funds');
    }
  };

  const handleEditClick = goal => {
    setEditGoalId(goal.id);
    setEditGoalAmount(goal.targetAmount);
  };
  const handleEditSave = async id => {
    try {
      await axios.patch(
        `${BASE_URL}/api/savings-goals/${id}/amount`,
        { amount: editGoalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditGoalId(null);
      setEditGoalAmount('');
      fetchSavingsGoals();
    } catch {
      setError('Failed to update savings goal');
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
      <h1 className="text-2xl font-bold text-gray-700 mb-4">Savings Goals</h1>
      <button
        onClick={() => setShowCreationForm(!showCreationForm)}
        className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg mb-4"
      >
        {showCreationForm ? 'Cancel' : 'Add Savings Goal'}
      </button>
      {showCreationForm && (
        <div className="mb-4">
          <SavingsGoalCreationForm
            token={token}
            BASE_URL={BASE_URL}
            onGoalCreated={() => { fetchSavingsGoals(); setShowCreationForm(false); }}
          />
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-50">
            <tr>
              {['Name','Target','Current','Description',''].map(col => (
                <th key={col} className="px-4 py-2 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {savingsGoals.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500">No savings goals found.</td></tr>
            ) : (
              savingsGoals.map(goal => (
                <tr key={goal.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{goal.name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">
                    {editGoalId === goal.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editGoalAmount}
                          onChange={e => setEditGoalAmount(e.target.value)}
                          className="border border-gray-300 text-sm px-2 py-1 rounded-lg"
                        />
                        <button onClick={() => handleEditSave(goal.id)} className="p-1 rounded hover:bg-gray-100" title="Confirm">
                          <CheckIcon size={16} className="text-green-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {formatCurrency(goal.targetAmount, userPreferredCurrency, userPreferredLocale)}
                        <button onClick={() => handleEditClick(goal)} className="p-1 rounded hover:bg-gray-100" title="Edit target">
                          <Edit2Icon size={16} className="text-gray-500" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(goal.currentAmount, userPreferredCurrency, userPreferredLocale)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 truncate">{goal.description}</td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <button onClick={() => openTransferModal(goal.id)} className="p-1 rounded hover:bg-gray-100" title="Transfer funds">
                      <ArrowUpDownIcon size={16} className="text-purple-500" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1 rounded hover:bg-gray-100" title="Delete goal">
                      <Trash2Icon size={16} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showTransferModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Transfer Funds</h3>
            <form onSubmit={handleTransferSubmit} className="flex flex-col gap-4">
              <input
                type="number"
                step="0.01"
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
                placeholder="Amount"
                className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                required
              />
              <select
                value={transferType}
                onChange={e => setTransferType(e.target.value)}
                className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                required
              >
                <option value="Deposit">Deposit</option>
                <option value="Withdraw">Withdraw</option>
              </select>
              <select
                value={transferAccount}
                onChange={e => setTransferAccount(e.target.value)}
                className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                required
              >
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.name}>{acc.name}</option>
                ))}
              </select>
              <div className="flex gap-4 justify-end">
                <button type="submit" className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">Submit</button>
                <button type="button" onClick={() => setShowTransferModal(false)} className="bg-gray-500 text-white text-sm px-3 py-1 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
