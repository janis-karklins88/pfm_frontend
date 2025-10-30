// src/components/SavingsGoalsProgress.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/currency';

const SavingsGoalsProgress = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [savingsGoals, setSavingsGoals] = useState([]);

  // Fetch savings goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/savings-goals`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSavingsGoals(data);
      } catch (error) {
        console.error('Error fetching savings goals:', error);
      }
    };
    fetchGoals();
  }, [token, BASE_URL]);

  

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full" />

      <h3 className="text-lg font-semibold text-gray-700 mb-4">Savings Goals</h3>

      {savingsGoals.length === 0 ? (
        <p className="text-sm text-gray-500">No savings goals found.</p>
      ) : (
        <div className="space-y-4">
          {savingsGoals.map(goal => {
            const { id, name, currentAmount, targetAmount } = goal;
            const percentage = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;
            const amountText = `${formatCurrency(currentAmount, userPreferredCurrency, userPreferredLocale)} / ${formatCurrency(targetAmount, userPreferredCurrency, userPreferredLocale)}`;
            const forceStack = (name?.length || 0) + amountText.length > 33; // tweak threshold

            return (
              <div key={id}>
                <div className={`mb-2 text-sm font-medium text-gray-700 ${forceStack ? 'flex flex-col gap-1' : 'flex items-center justify-between'}`}>
  <span className={`${forceStack ? 'truncate' : 'min-w-0 truncate'}`}>{name}</span>
  <span className={`${forceStack ? 'whitespace-nowrap' : 'shrink-0 whitespace-nowrap'}`}>{amountText}</span>
</div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-500 h-2"
                    style={{ width: `${percentage}%`, borderRadius: '4px' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavingsGoalsProgress;
