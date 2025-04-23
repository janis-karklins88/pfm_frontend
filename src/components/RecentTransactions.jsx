// src/components/RecentTransactions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/dateUtils";
import { ArrowRightCircle } from 'lucide-react';

const RecentTransactions = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/transactions/recent`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRecentTransactions(data);
      } catch (err) {
        console.error('Error fetching recent transactions:', err);
      }
    };
    fetchRecentTransactions();
  }, [token, BASE_URL]);

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-4 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full" />

      {/* Header with view-all icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Recent Transactions</h3>
        <ArrowRightCircle size={20} className="text-gray-400 hover:text-gray-600 cursor-pointer" />
      </div>

      {/* Transactions List: one row per transaction */}
      <div className="space-y-1">
        {recentTransactions.length === 0 && (
          <p className="text-sm text-gray-500">No recent transactions.</p>
        )}
        {recentTransactions.map(txn => (
          <div
            key={txn.id}
            className="flex items-center justify-between py-2"
          >
            {/* Date */}
            <div className="text-sm text-gray-600 w-2/6">{formatDate(txn.date)}</div>

            {/* Description (optional) or Category */}
            <div className="text-sm text-gray-800 truncate w-2/6">
              {txn.description || txn.category?.name || 'N/A'}
            </div>

            {/* Category (if showing separately) */}
            <div className="text-sm text-gray-500 w-1/6 truncate">
              {txn.category?.name || ''}
            </div>

            {/* Amount, colored subtly */}
            <div
              className={`text-sm font-medium text-right w-1/6 ${
                txn.amount >= 0 ?  'text-red-700' : 'text-green-700'
              }`}
            >
              {formatCurrency(txn.amount, userPreferredCurrency, userPreferredLocale)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
