// src/pages/Accounts/Accounts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountAmount, setNewAccountAmount] = useState('');
  const [editAccountId, setEditAccountId] = useState(null);
  const [editAccountName, setEditAccountName] = useState('');
  const [error, setError] = useState('');

  // Fetch all accounts from the backend
  const fetchAccounts = async () => {
    try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/accounts`; 
        const token = localStorage.getItem('token');
      const res = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
          }
      });
      console.log('Accounts fetched:', res.data);
      setAccounts(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to fetch accounts');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

// Handler to add a new account
const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/accounts`;
      const token = localStorage.getItem('token');
      // Retrieve the stored username from local storage
      const username = localStorage.getItem('username');
      
      const payload = {
        name: newAccountName,
        amount: newAccountAmount,
        username: username,
      };
  
      await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setNewAccountName('');
      setNewAccountAmount('');
      fetchAccounts();
    } catch (err) {
      console.error('Error adding account:', err);
      setError('Failed to add account');
    }
  };
  
  

  // Handler to delete an account
  const handleDeleteAccount = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccounts();
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account');
    }
  };
  

  // Prepare to edit an account's name
  const handleStartEdit = (account) => {
    setEditAccountId(account.id);
    setEditAccountName(account.name);
  };

  // Submit updated account name
  const handleEditAccount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/accounts/${editAccountId}/name`, 
        { name: editAccountName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditAccountId(null);
      setEditAccountName('');
      fetchAccounts();
    } catch (err) {
      console.error('Error updating account:', err);
      setError('Failed to update account');
    }
  };
  

  // Calculate total balance by summing all account amounts
  const totalBalance = accounts.reduce((acc, account) => acc + Number(account.amount), 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Accounts</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Display total balance */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          Total Balance: ${totalBalance.toFixed(2)}
        </h2>
      </div>

      {/* Form to add a new account */}
      <form onSubmit={handleAddAccount} className="mb-4">
        <div className="flex space-x-2">
          <input 
            type="text"
            placeholder="Account Name"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input 
            type="number"
            step="0.01"
            placeholder="Amount"
            value={newAccountAmount}
            onChange={(e) => setNewAccountAmount(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button type="submit" className="w-30 bg-gray-700 text-white py-2 rounded hover:bg-gray-800 active:scale-98 transition transform duration-100 ease-in-out">
            Add Account
          </button>
        </div>
      </form>

      {/* List of Accounts */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id}>
              <td className="py-2 px-4 border-b">{account.id}</td>
              <td className="py-2 px-4 border-b">
                {editAccountId === account.id ? (
                  <form onSubmit={handleEditAccount} className="flex space-x-2">
                    <input 
                      type="text"
                      value={editAccountName}
                      onChange={(e) => setEditAccountName(e.target.value)}
                      className="border p-2 rounded"
                      required
                    />
                    <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
                      Save
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditAccountId(null)}
                      className="bg-gray-500 text-white px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  account.name
                )}
              </td>
              <td className="py-2 px-4 border-b">${Number(account.amount).toFixed(2)}</td>
              <td className="py-2 px-4 border-b">
                {editAccountId !== account.id && (
                  <>
                    <button 
                      onClick={() => handleStartEdit(account)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteAccount(account.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Accounts;
