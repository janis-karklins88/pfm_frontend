import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from "../../utils/currency";
import { Trash2Icon, Edit2Icon, ArrowUpDownIcon } from 'lucide-react';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountAmount, setNewAccountAmount] = useState('');
  const [editAccountId, setEditAccountId] = useState(null);
  const [editAccountName, setEditAccountName] = useState('');
  const [error, setError] = useState('');

  // Transfer modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFromId, setTransferFromId] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferType, setTransferType] = useState('Deposit'); // or Withdraw
  const [transferAccount, setTransferAccount] = useState('');

  const userPreferredCurrency = 'EUR';
  const userPreferredLocale = 'en-GB';
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/accounts`, { headers: { Authorization: `Bearer ${token}` } });
      setAccounts(res.data);
      setError('');
    } catch (err) {
      console.error('Fetch accounts error:', err);
      const msg = err.response?.data?.message || 'Failed to fetch accounts';
      setError(msg);
    }
  };

  const handleAddAccount = async e => {
    e.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/api/accounts`,
        { name: newAccountName, amount: newAccountAmount, username: localStorage.getItem('username') },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewAccountName('');
      setNewAccountAmount('');
      fetchAccounts();
    } catch (err) {
      console.error('Add account error:', err);
      const msg = err.response?.data?.message || 'Failed to add account';
      setError(msg);
    }
  };

  const handleDeleteAccount = async id => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await axios.delete(`${BASE_URL}/api/accounts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchAccounts();
      } catch (err) {
        console.error('Delete account error:', err);
        const msg = err.response?.data?.message || 'Failed to delete account';
        setError(msg);
      }
    }
  };

  const handleStartEdit = account => {
    setEditAccountId(account.id);
    setEditAccountName(account.name);
  };

  const handleEditAccount = async e => {
    e.preventDefault();
    try {
      await axios.patch(
        `${BASE_URL}/api/accounts/${editAccountId}/name`,
        { name: editAccountName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditAccountId(null);
      setEditAccountName('');
      fetchAccounts();
    } catch (err) {
      console.error('Edit account error:', err);
      const msg = err.response?.data?.message || 'Failed to update account';
      setError(msg);
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.amount), 0);

  const openTransferModal = id => {
    setTransferFromId(id);
    setTransferAmount('');
    setTransferType('Deposit');
    setTransferAccount('');
    setShowTransferModal(true);
  };

  const handleTransferSubmit = async e => {
    e.preventDefault();
    try {
      const payload = { amount: transferAmount, type: transferType, accountName: transferAccount };
      await axios.patch(
        `${BASE_URL}/api/accounts/${transferFromId}/transfer-funds`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowTransferModal(false);
      fetchAccounts();
    } catch (err) {
      console.error('Transfer funds error:', err);
      const msg = err.response?.data?.message || 'Failed to transfer funds';
      setError(msg);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
      <h1 className="text-2xl font-bold text-gray-700 mb-4">Accounts</h1>

      {/* Add Account Form */}
      <form onSubmit={handleAddAccount} className="flex flex-wrap gap-2 items-end mb-6">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            value={newAccountName}
            onChange={e => setNewAccountName(e.target.value)}
            placeholder="Account Name"
            className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            value={newAccountAmount}
            onChange={e => setNewAccountAmount(e.target.value)}
            placeholder="Amount"
            className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
            required
          />
        </div>
        <div>
          <button type="submit" className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">
            Add Account
          </button>
        </div>
      </form>

      {/* Total Balance */}
      <h2 className="text-lg font-medium text-gray-700 mb-4">
        Total Balance: {formatCurrency(totalBalance, userPreferredCurrency, userPreferredLocale)}
      </h2>
      {error && (
      <p className="text-red-500 text-l mb-4">
        {error}
      </p>
    )}
      {/* Accounts Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Name</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Balance</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.map(account => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {editAccountId === account.id ? (
                    <form onSubmit={handleEditAccount} className="flex flex-wrap gap-2 items-center">
                      <input
                        type="text"
                        value={editAccountName}
                        onChange={e => setEditAccountName(e.target.value)}
                        className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                        required
                      />
                      <button type="submit" className="bg-teal-600 text-white text-sm px-3 py-1 rounded-lg">Save</button>
                      <button type="button" onClick={() => setEditAccountId(null)} className="text-sm px-3 py-1">Cancel</button>
                    </form>
                  ) : (
                    account.name
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                  {formatCurrency(account.amount, userPreferredCurrency, userPreferredLocale)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm flex gap-2">
                  <button onClick={() => handleStartEdit(account)} className="p-1 rounded hover:bg-gray-100" title="Edit">
                    <Edit2Icon size={16} className="text-gray-500" />
                  </button>
                  <button onClick={() => openTransferModal(account.id)} className="p-1 rounded hover:bg-gray-100" title="Transfer funds">
                    <ArrowUpDownIcon size={16} className="text-purple-500" />
                  </button>
                  <button onClick={() => handleDeleteAccount(account.id)} className="p-1 rounded hover:bg-gray-100" title="Delete">
                    <Trash2Icon size={16} className="text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transfer Funds Modal */}
{showTransferModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h3 className="text-lg font-semibold mb-2">Transfer Funds</h3>

      {/* 1) Show the source account */}
      <div className="mb-4 flex justify-between items-center">
        
        <span className="text-sm font-semibold">
          {accounts.find(a => a.id === transferFromId)?.name || '—'} {' '}
          {formatCurrency(
            accounts.find(a => a.id === transferFromId)?.amount || 0,
            userPreferredCurrency,
            userPreferredLocale
          )}
        </span>
      </div>

      {/* 2) List of other accounts */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Accounts</h4>
        <ul className="max-h-32 overflow-y-auto text-sm">
          {accounts
            .filter(a => a.id !== transferFromId)
            .map(a => (
              <li key={a.id} className="flex justify-between py-1">
                <span className="truncate">{a.name}</span>
                <span>
                  {formatCurrency(a.amount, userPreferredCurrency, userPreferredLocale)}
                </span>
              </li>
            ))}
        </ul>
      </div>

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
          <option value="Deposit">Deposit from</option>
          <option value="Withdraw">Withdraw to</option>
        </select>

        {/* Filter out the current account here too */}
        <select
          value={transferAccount}
          onChange={e => setTransferAccount(e.target.value)}
          className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
          required
        >
          <option value="">Target Account</option>
          {accounts
            .filter(a => a.id !== transferFromId)
            .map(a => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
        </select>

        <div className="flex gap-4 justify-end">
          <button type="submit" className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg">
            Submit
          </button>
          <button
            type="button"
            onClick={() => setShowTransferModal(false)}
            className="bg-gray-500 text-white text-sm px-3 py-1 rounded-lg"
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

export default Accounts;
