import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/dateUtils";

const RecentTransactions = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [recentTransactions, setRecentTransactions] = useState([]);

  const fetchRecentTransactions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/transactions/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentTransactions(response.data);
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
    }
  };


  useEffect(() => {
    fetchRecentTransactions();
  }, [token, BASE_URL]);

  return (
    <div className="bg-white shadow-md rounded p-4">
      <h2 className="text-lg font-bold mb-2">Recent Transactions</h2>
      {recentTransactions.length === 0 ? (
        <p className="text-sm">No recent transactions.</p>
      ) : (
        <ul className="space-y-2">
          {recentTransactions.map((txn) => (
            <li key={txn.id} className="border-b pb-2">
              <div className="text-sm">{formatDate(txn.date)}</div>
              <div className="font-bold">
                {formatCurrency(txn.amount, userPreferredCurrency, userPreferredLocale)}
              </div>
              <div className="text-sm">{txn.description}</div>
              <div className="text-sm">{txn.category?.name || 'N/A'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentTransactions;
