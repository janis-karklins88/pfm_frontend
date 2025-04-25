// src/components/BudgetBarChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register datalabels plugin to disable labels across chart
Bar.register && Bar.register(ChartDataLabels);

const BudgetBarChart = ({ token, BASE_URL, startDate, endDate }) => {
  const [budgetItems, setBudgetItems] = useState([]);

  // Fetch budgets and spent amounts
  const fetchBudgetData = async () => {
    try {
      let url = `${BASE_URL}/api/budgets`;
      const params = new URLSearchParams();
      if (startDate) params.append('filterStart', startDate);
      if (endDate) params.append('filterEnd', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const { data: budgets } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const budgetsWithSpent = await Promise.all(
        budgets.map(async (budget) => {
          try {
            const { data: spent } = await axios.get(
              `${BASE_URL}/api/budgets/spent/${budget.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...budget, spent };
          } catch (err) {
            console.error(`Error fetching spent for budget ${budget.id}`, err);
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

  // Prepare chart data
  const labels = budgetItems.map(item => item.category?.name || item.name || `Budget ${item.id}`);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Budget',
        data: budgetItems.map(item => item.amount || 0),
        // budget bar color
        backgroundColor: '#89bafb', // blue-400
        borderRadius: 6,
        borderSkipped: 'bottom',
      },
      {
        label: 'Spent',
        data: budgetItems.map(item => item.spent || 0),
        // change to Tailwind teal-500:
        backgroundColor: '#14B8A6', // <-- teal-500
        borderRadius: 6,
        borderSkipped: 'bottom',
        maxBarThickness: 250, // <-- max thickness of spent bars
      },
    ]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { boxWidth: 12, padding: 8 } },
      datalabels: { display: false }, // disable all labels
      title: { display: false, text: 'Budget vs. Spending', font: { size: 14 } },
    },
    scales: {
      x: {
        title: { display: false, text: 'Category', font: { size: 12 } },
        grid: { display: false },
        ticks: { autoSkip: false },
      },
      y: {
        beginAtZero: true,
        title: { display: false, text: 'Amount', font: { size: 12 } },
      },
    },
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full" />
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Budget vs. Spending</h3>

      {budgetItems.length ? (
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No budget data available.</p>
      )}
    </div>
  );
};

export default BudgetBarChart;
