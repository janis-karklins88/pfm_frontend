import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/currency';

const SavingsGoalsProgress = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [savingsGoals, setSavingsGoals] = useState([]);

  const fetchSavingsGoals = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/savings-goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavingsGoals(response.data);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
    }
  };

  useEffect(() => {
    fetchSavingsGoals();
  }, [token, BASE_URL]);

  return (
    <div className="bg-white shadow-md rounded p-4 mt-4">
      <h2 className="text-lg font-bold mb-4">Savings Goals</h2>
      {savingsGoals.length === 0 ? (
        <p className="text-sm">No savings goals found.</p>
      ) : (
        <div className="space-y-2">
          {savingsGoals.map((goal) => {
            // Calculate the percentage of the goal reached
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <div key={goal.id} className="border p-3 rounded">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">{goal.name}</span>
                  <span className="text-sm">
                    {formatCurrency(goal.currentAmount, userPreferredCurrency, userPreferredLocale)}{' '}
                    / {formatCurrency(goal.targetAmount, userPreferredCurrency, userPreferredLocale)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
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
