// src/components/RecentTransactions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/dateUtils";
import { ArrowRightCircle } from 'lucide-react';

const RecentTransactions = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [recentTransactions, setRecentTransactions] = useState([]);
  const navigate = useNavigate();

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

      {/* Header with navigate icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Recent Transactions</h3>
        <button
          onClick={() => navigate('/transactions')}
          className="text-gray-400 hover:text-gray-600"
          aria-label="View all transactions"
        >
          <ArrowRightCircle size={20} className="cursor-pointer" />
        </button>
      </div>

      {/* Transactions List: one row per transaction */}
      <div className="space-y-1">
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-gray-500">No recent transactions.</p>
        ) : (
          recentTransactions.map(txn => {
            // Determine color by transaction type
            const isExpense = txn.type === 'Expense';

            return (
              <div key={txn.id} className="flex items-center justify-between py-2">
                {/* Date */}
                <div className="text-sm text-gray-600 w-2/6">{formatDate(txn.date)}</div>

                {/* Description or Category */}
                <div className="text-sm font-semibold text-gray-800 truncate w-3/6">
                  {txn.description || txn.category?.name || 'N/A'}
                </div>

                {/* Amount, color-coded by type */}
                <div
                  className={`text-sm font-medium text-right w-1/6 ${
                    isExpense ? 'text-red-600' : 'text-teal-600'
                  }`
                }
                >
                  {formatCurrency(txn.amount, userPreferredCurrency, userPreferredLocale)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
