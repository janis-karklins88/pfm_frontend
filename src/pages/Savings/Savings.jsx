import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SavingsGoalCreationForm from './SavingsGoalCreationForm';

const Savings = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  const [savingsGoals, setSavingsGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [showCreationForm, setShowCreationForm] = useState(false);

  // Fund transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferType, setTransferType] = useState('Deposit');
  const [transferAccount, setTransferAccount] = useState('');

  // Editing target amount state
  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalAmount, setEditGoalAmount] = useState('');

  const fetchSavingsGoals = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/savings-goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavingsGoals(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch savings goals', err);
      setError('Failed to fetch savings goals');
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

  useEffect(() => {
    fetchSavingsGoals();
    fetchAccounts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/savings-goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSavingsGoals();
    } catch (err) {
      console.error('Failed to delete savings goal', err);
      const errorMsg =
        err.response &&
        err.response.data &&
        err.response.data.message
          ? err.response.data.message
          : 'Failed to delete savings goal';
      setError(errorMsg);
    }
  };

  const openTransferModal = (goalId) => {
    setSelectedGoalId(goalId);
    setTransferAmount('');
    setTransferType('Deposit');
    setTransferAccount('');
    setShowTransferModal(true);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        accountName: transferAccount,
        amount: transferAmount,
        type: transferType,
      };
      await axios.patch(
        `${BASE_URL}/api/savings-goals/${selectedGoalId}/transfer-funds`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowTransferModal(false);
      fetchSavingsGoals();
    } catch (err) {
      console.error('Failed to transfer funds', err);
      const errorMsg =
        err.response &&
        err.response.data &&
        err.response.data.message
          ? err.response.data.message
          : 'Failed to transfer funds';
      setError(errorMsg);
    }
  };

  // --- Edit functionality for target amount ---
  const handleEditClick = (goal) => {
    setEditGoalId(goal.id);
    setEditGoalAmount(goal.targetAmount);
  };

  const handleEditSave = async (id) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/savings-goals/${id}/amount`,
        { amount: editGoalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditGoalId(null);
      setEditGoalAmount('');
      fetchSavingsGoals();
    } catch (err) {
      console.error('Failed to update savings goal', err);
      const errorMsg =
        err.response &&
        err.response.data &&
        err.response.data.message
          ? err.response.data.message
          : 'Failed to update savings goal';
      setError(errorMsg);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Savings Goals</h1>

      <button
        onClick={() => setShowCreationForm(!showCreationForm)}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        {showCreationForm ? 'Cancel Savings Goal Creation' : 'Add Savings Goal'}
      </button>

      {showCreationForm && (
        <SavingsGoalCreationForm
          token={token}
          BASE_URL={BASE_URL}
          onGoalCreated={() => {
            fetchSavingsGoals();
            setShowCreationForm(false);
          }}
        />
      )}

      {error && <p className="text-red-500">{error}</p>}

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Target Amount</th>
            <th className="py-2 px-4 border-b">Current Amount</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {savingsGoals.length === 0 ? (
            <tr>
              <td className="py-2 px-4 border-b" colSpan="5">
                No savings goals found.
              </td>
            </tr>
          ) : (
            savingsGoals.map((goal) => (
              <tr key={goal.id}>
                <td className="py-2 px-4 border-b">{goal.name}</td>
                <td className="py-2 px-4 border-b">
                  {editGoalId === goal.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editGoalAmount}
                      onChange={(e) => setEditGoalAmount(e.target.value)}
                      className="border p-1 rounded"
                    />
                  ) : (
                    goal.targetAmount
                  )}
                </td>
                <td className="py-2 px-4 border-b">{goal.currentAmount}</td>
                <td className="py-2 px-4 border-b">{goal.description}</td>
                <td className="py-2 px-4 border-b">
                  {editGoalId === goal.id ? (
                    <button
                      onClick={() => handleEditSave(goal.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditClick(goal)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => openTransferModal(goal.id)}
                    className="bg-purple-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Transfer Funds
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
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

      {/* Transfer Funds Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Transfer Funds</h3>
            <form onSubmit={handleTransferSubmit} className="flex flex-col gap-4">
              <input
                type="number"
                step="0.01"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Amount"
                className="border p-2 rounded"
                required
              />
              <select
                value={transferType}
                onChange={(e) => setTransferType(e.target.value)}
                className="border p-2 rounded"
                required
              >
                <option value="Deposit">Deposit</option>
                <option value="Withdraw">Withdraw</option>
              </select>
              <select
                value={transferAccount}
                onChange={(e) => setTransferAccount(e.target.value)}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.name}>
                    {acc.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
