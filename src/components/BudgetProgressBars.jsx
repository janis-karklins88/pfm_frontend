import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/currency';

const BudgetProgressBars = ({ token, BASE_URL, startDate, endDate, userPreferredCurrency, userPreferredLocale }) => {
  const [budgetItems, setBudgetItems] = useState([]);

  // Fetch budgets and then fetch spent amount for each.
  const fetchBudgetData = async () => {
    try {
      // Build URL with query parameters for filtering
      let url = `${BASE_URL}/api/budgets`;
      const params = new URLSearchParams();
      if (startDate) params.append('filterStart', startDate);
      if (endDate) params.append('filterEnd', endDate);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      // Fetch budgets
      const budgetRes = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const budgets = budgetRes.data;
      
      // For each budget, fetch its spent amount in parallel.
      const budgetsWithSpent = await Promise.all(
        budgets.map(async (budget) => {
          try {
            const spentRes = await axios.get(
              `${BASE_URL}/api/budgets/spent/${budget.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { 
              ...budget, 
              spent: spentRes.data 
            };
          } catch (err) {
            console.error(`Error fetching spent for budget id ${budget.id}`, err);
            return { 
              ...budget, 
              spent: 0 
            };
          }
        })
      );
      
      setBudgetItems(budgetsWithSpent);
    } catch (err) {
      console.error('Error fetching budgets', err);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchBudgetData();
    }
  }, [startDate, endDate, token, BASE_URL]);

  return (
    <div className="bg-white shadow-md rounded p-4">
      <h2 className="text-lg font-bold mb-2">Budget Spending</h2>
      {budgetItems.length > 0 ? (
        <div className="space-y-2">
        {budgetItems.map((item) => {
          const budgetAmount = item.amount || 0;
          const spent = item.spent || 0;
          // Calculate the actual percentage
          const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
          // Cap the width at 100%
          const barWidth = Math.min(percentage, 100);
          const label = item.category?.name || item.name || `Budget ${item.id}`;
          return (
            <div key={item.id}>
              {/* Label and Amount */}
              <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span>
                  {formatCurrency(spent, userPreferredCurrency, userPreferredLocale)} / {formatCurrency(budgetAmount, userPreferredCurrency, userPreferredLocale)}
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${percentage > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
              {/* Percentage Text: colored red if over 100% */}
              <div className={`text-right text-xs mt-1 ${percentage > 100 ? 'text-red-600' : 'text-gray-600'}`}>
                {percentage.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
      
      ) : (
        <p className="text-sm">No budget data available.</p>
      )}
    </div>
  );
};

export default BudgetProgressBars;
