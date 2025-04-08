import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/dateUtils";

const NextPayments = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [nextPayments, setNextPayments] = useState([]);

  const fetchNextPayments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/recurring-expenses/next-payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNextPayments(response.data);
    } catch (err) {
      console.error('Error fetching next payments:', err);
    }
  };

  useEffect(() => {
    fetchNextPayments();
  }, [token, BASE_URL]);

  return (
    <div className="bg-white shadow-md rounded p-4">
      <h2 className="text-lg font-bold mb-2">Next Payments</h2>
      {nextPayments.length === 0 ? (
        <p className="text-sm">No upcoming payments.</p>
      ) : (
        <ul className="space-y-2">
          {nextPayments.map((payment) => (
            <li key={payment.id} className="border-b pb-2">
              <div className="text-sm">{formatDate(payment.nextDueDate)}</div>
              <div className="font-bold">
                {formatCurrency(payment.amount, userPreferredCurrency, userPreferredLocale)}
              </div>
              <div className="text-sm">{payment.name || 'Untitled Payment'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NextPayments;
