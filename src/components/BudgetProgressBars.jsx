import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/currency';

const BudgetProgressBars = ({ token, BASE_URL, startDate, endDate, userPreferredCurrency, userPreferredLocale }) => {
  const [budgetItems, setBudgetItems] = useState([]);

  // Fetch budgets and then fetch spent amount for each.
  const fetchBudgetData = async () => {
    try {
      let url = `${BASE_URL}/api/budgets`;
      const params = new URLSearchParams();
      if (startDate) params.append('filterStart', startDate);
      if (endDate) params.append('filterEnd', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const budgetRes = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const budgets = budgetRes.data;

      const budgetsWithSpent = await Promise.all(
        budgets.map(async (budget) => {
          try {
            const spentRes = await axios.get(
              `${BASE_URL}/api/budgets/spent/${budget.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...budget, spent: spentRes.data };
          } catch (err) {
            console.error(`Error fetching spent for budget id ${budget.id}`, err);
            return { ...budget, spent: 0 };
          }
        })
      );

      setBudgetItems(budgetsWithSpent);
    } catch (err) {
      console.error('Error fetching budgets', err);
    }
  };

  useEffect(() => {
    if (startDate && endDate) fetchBudgetData();
  }, [startDate, endDate, token, BASE_URL]);

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full" />

      <h3 className="text-lg font-semibold text-gray-700 mb-4">Budget Spending</h3>

      {budgetItems.length === 0 ? (
        <p className="text-sm text-gray-500">No budget data available.</p>
      ) : (
        <div className="space-y-1">
          {budgetItems.map((item) => {
            const budgetAmount = item.amount || 0;
            const spent = item.spent || 0;
            const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
            const barWidth = Math.min(percentage, 100);
            const label = item.category?.name || item.name || `Budget ${item.id}`;

            return (
              <div key={item.id}>
                <div className="flex justify-between items-center mb-1 text-sm font-medium text-gray-700">
                  <span className="truncate">{label}</span>
                  <span>
                    {formatCurrency(spent, userPreferredCurrency, userPreferredLocale)} /{' '}
                    {formatCurrency(budgetAmount, userPreferredCurrency, userPreferredLocale)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`${percentage > 100 ? 'bg-red-400' : 'bg-teal-500'} h-2.5`}
                    style={{ width: `${barWidth}%`, borderRadius: '4px' }}
                  />
                </div>
                <div
                  className={`text-right text-xs mt-1 ${
                    percentage > 100 ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  {percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetProgressBars;
