import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatCurrency } from '../utils/currency';

// Register datalabels plugin
Bar.register && Bar.register(ChartDataLabels);

const ExpenseBreakdownChart = ({
  token,
  BASE_URL,
  userPreferredCurrency,
  userPreferredLocale,
  startDate,
  endDate
}) => {
  const [breakdownType, setBreakdownType] = useState('Category');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);

  // Load accounts once for Account breakdown
  useEffect(() => {
    axios.get(`${BASE_URL}/api/accounts`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAccounts(res.data))
      .catch(() => {});
  }, [BASE_URL, token]);

  // Fetch data when breakdown type or props dates change
  useEffect(() => {
    // Only proceed if both dates are provided
    if (!startDate || !endDate) return;

    setLoading(true);

    const endpoint = breakdownType === 'Account'
      ? `${BASE_URL}/api/reports/spending-by-account?start=${startDate}&end=${endDate}`
      : `${BASE_URL}/api/reports/spending-by-category?start=${startDate}&end=${endDate}`;

    axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const labels = [];
        const values = [];

        if (breakdownType === 'Account') {
          res.data.forEach(({ accountName, totalAmount }) => {
            labels.push(accountName);
            values.push(Number(totalAmount));
          });
        } else {
          res.data.forEach(({ categoryName, totalAmount }) => {
            labels.push(categoryName);
            values.push(Number(totalAmount));
          });
        }

        setChartData({
          labels,
          datasets: [{
            label: `Expenses by ${breakdownType}`,
            data: values,
            backgroundColor: 'rgba(20,184,166,0.2)', // teal
            borderColor: '#14B8A6',
            borderWidth: 1
          }]
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [breakdownType, startDate, endDate, token, BASE_URL]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: `Expenses by ${breakdownType}` },
      datalabels: {
        anchor: 'end',
        align: 'start',
        formatter: v => formatCurrency(v, userPreferredCurrency, userPreferredLocale),
        font: { weight: 'bold' },
        clamp: true
      },
      tooltip: {
        callbacks: {
          label: ctx => formatCurrency(ctx.raw, userPreferredCurrency, userPreferredLocale)
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { callback: v => formatCurrency(v, userPreferredCurrency, userPreferredLocale) } }
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />

      <div className="flex items-center space-x-4 mb-4">
        <label className="text-sm font-medium text-gray-700">Expenses by:</label>
        <select
          value={breakdownType}
          onChange={e => setBreakdownType(e.target.value)}
          className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:ring-2 focus:ring-teal-300"
        >
          <option value="Category">Category</option>
          <option value="Account">Account</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : chartData ? (
        <div className="h-64">
          <Bar data={chartData} options={options} plugins={[ChartDataLabels]} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No data available.</p>
      )}
    </div>
  );
};

export default ExpenseBreakdownChart;
