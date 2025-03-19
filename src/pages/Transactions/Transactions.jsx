// src/pages/Transactions/Transactions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState(''); // e.g., category id as a string (or number)
  const [account, setAccount] = useState(''); // e.g., account id as a string (or number)
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    try {
      let url = '/api/transactions';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (category) params.append('categoryId', category);
      if (account) params.append('accountId', account);
  
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
  
      const res = await axios.get(url);
      console.log('Response data:', res.data);
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
      
    }
  };
  

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, category, account]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Transactions</h1>

      {/* Filtering Options */}
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
        {/* Example select for category filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          <option value="1">Food</option>
          <option value="2">Transport</option>
          <option value="3">Utilities</option>
          {/* Add other categories based on your backend */}
        </select>
        {/* Example select for account filter */}
        <select
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Accounts</option>
          <option value="1">Checking</option>
          <option value="2">Savings</option>
          {/* Add other accounts as needed */}
        </select>
        <button 
          onClick={fetchTransactions}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Filter
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Transactions List */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Type</th>
            <th className="py-2 px-4 border-b">Account</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
  {transactions.length === 0 ? (
    <tr>
      <td className="py-2 px-4 border-b" colSpan="6">
        No transactions found.
      </td>
    </tr>
  ) : (
    transactions.map((txn) => (
      <tr key={txn.id}>
        <td className="py-2 px-4 border-b">{txn.date}</td>
        <td className="py-2 px-4 border-b">{txn.amount}</td>
        <td className="py-2 px-4 border-b">{txn.category?.name || 'N/A'}</td>
        <td className="py-2 px-4 border-b">{txn.type}</td>
        <td className="py-2 px-4 border-b">{txn.account?.name || 'N/A'}</td>
        <td className="py-2 px-4 border-b">
          <button 
            onClick={() => handleDelete(txn.id)}
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

export default Transactions;
