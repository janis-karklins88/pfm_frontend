// src/components/BudgetBarChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const BudgetBarChart = ({ token, BASE_URL, startDate, endDate }) => {
  const [budgetItems, setBudgetItems] = useState([]);

  // Fetch budgets (using filterStart and filterEnd) and retrieve spent amount for each budget
  const fetchBudgetData = async () => {
    try {
      // Build the URL with query parameters that match your budget page
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

      // For each budget, fetch its spent amount in parallel
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
            console.error(`Error fetching spent amount for budget id ${budget.id}`, err);
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

  // Build chart data for grouped bar chart
  const chartData = {
    // Adjust the label: here using either categoryName, name, or a fallback text.
    labels: budgetItems.map(item => item.category?.name || item.name || `Budget ${item.id}`)
,
    datasets: [
      {
        label: 'Budget',
        backgroundColor: '#36A2EB',
        // Adjust 'budgetAmount' to match your actual budget field if needed.
        data: budgetItems.map(item => item.amount || 0)
      },
      {
        label: 'Spent',
        backgroundColor: '#FF6384',
        data: budgetItems.map(item => item.spent || 0)
      }
    ]
  };

  return (
    <div className="bg-white shadow-md rounded p-4">
      <h2 className="text-lg font-bold mb-2">Budget vs. Spending</h2>
      {budgetItems.length ? (
        <div style={{ height: '300px', width: '100%' }}>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
              plugins: {
                datalabels: {
                  display: false,
                }
              }
            }}
          />
        </div>
      ) : (
        <p className="text-sm">No budget data available.</p>
      )}
    </div>
  );
};

export default BudgetBarChart;
