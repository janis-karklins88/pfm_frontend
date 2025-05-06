// src/components/NextPayments.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/dateUtils";
import { ArrowRightCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NextPayments = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [nextPayments, setNextPayments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNextPayments = async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/recurring-expenses/next-payments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNextPayments(data);
      } catch (err) {
        console.error('Error fetching next payments:', err);
      }
    };
    fetchNextPayments();
  }, [token, BASE_URL]);

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />

      {/* Header with view-all icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Next Payments</h3>
        <button
        onClick={() => navigate('/recurringexpenses')}
        >
        <ArrowRightCircle size={20} className="text-gray-400 hover:text-gray-600 cursor-pointer" />
        </button>
      </div>

      {/* Payments List: one row per payment */}
      <div className="space-y-1">
        {nextPayments.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming payments.</p>
        ) : (
          nextPayments.map(payment => (
            <div key={payment.id} className="flex items-center justify-between py-2">
              {/* Date */}
              <div className="text-sm text-gray-600 w-2/6">{formatDate(payment.nextDueDate)}</div>

              {/* Payment Name */}
              <div className="text-sm font-semibold text-gray-800 truncate w-3/6">
                {payment.name || 'Untitled Payment'}
              </div>

              {/* Amount */}
              <div className="text-sm font-medium text-right w-1/6 text-blue-600">
                {formatCurrency(payment.amount, userPreferredCurrency, userPreferredLocale)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NextPayments;
