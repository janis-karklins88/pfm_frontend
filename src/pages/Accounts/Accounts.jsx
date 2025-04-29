import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from "../../utils/currency";
import { Trash2Icon, Edit2Icon } from 'lucide-react';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountAmount, setNewAccountAmount] = useState('');
  const [editAccountId, setEditAccountId] = useState(null);
  const [editAccountName, setEditAccountName] = useState('');
  const [error, setError] = useState('');

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
    } catch {
      setError('Failed to fetch accounts');
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
    } catch {
      setError('Failed to add account');
    }
  };

  const handleDeleteAccount = async id => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await axios.delete(`${BASE_URL}/api/accounts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchAccounts();
      } catch {
        setError('Failed to delete account');
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
    } catch {
      setError('Failed to update account');
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.amount), 0);

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
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button onClick={() => handleStartEdit(account)} className="p-1 rounded hover:bg-gray-100 mr-2" title="Edit">
                    <Edit2Icon size={16} className="text-gray-500" />
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
    </div>
  );
};

export default Accounts;
