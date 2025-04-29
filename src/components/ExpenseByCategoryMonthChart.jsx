// src/components/CategoryMonthlyExpenseChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatCurrency } from '../utils/currency';

// Register datalabels plugin
Line.register && Line.register(ChartDataLabels);

const CategoryMonthlyExpenseChart = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/categories`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCategories(data);
        if (data.length) setSelectedCategory(data[0].id);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, [token, BASE_URL]);

  // Fetch expense for selected category
  useEffect(() => {
    if (!selectedCategory) return;
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/reports/expense-for-category?categoryId=${selectedCategory}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const labels = [];
        const values = [];
        Object.entries(data).forEach(([key, val], idx) => {
          const num = Number(val);
          if (num !== 0) {
            labels.push(key);
            values.push(num);
          }
        });
        setChartData({
          labels,
          datasets: [{
            label: 'Expense',
            data: values,
            borderColor: '#14B8A6',        // teal-500
            backgroundColor: 'rgba(20,184,166,0.2)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#14B8A6',
            pointBorderColor: '#fff',
            segment: {
              borderDash: (ctx) => (ctx.p0DataIndex >= values.length - 3 ? [5,5] : [])
            }
          }]
        });
      } catch (err) {
        console.error('Error fetching category expenses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory, token, BASE_URL]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Monthly Expenses by Category' },
      datalabels: {
        display: ctx => ctx.dataIndex !== 0,
        anchor: 'end', align: 'top', offset: 4, clamp: true,
        formatter: v => formatCurrency(v, userPreferredCurrency, userPreferredLocale),
        font: { weight: 'bold' },
        color: '#374151'
      },
      tooltip: {
        callbacks: { label: ctx => formatCurrency(ctx.raw, userPreferredCurrency, userPreferredLocale) }
      }
    },
    scales: {
      x: {
        offset: false,
        grid: { display: true },
        title: { display: false },
        ticks: { autoSkip: false }
      },
      y: {
        beginAtZero: true,
        grid: { display: true },
        title: { display: false },
        ticks: { callback: v => formatCurrency(v, userPreferredCurrency, userPreferredLocale) }
      }
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full" />
      <div className="mb-4">
        <label className="text-sm font-medium mr-2">Category:</label>
        <select
          value={selectedCategory || ''}
          onChange={e => setSelectedCategory(e.target.value)}
          className="border p-2 rounded"
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : chartData ? (
        <div className="h-64">
          <Line data={chartData} options={options} plugins={[ChartDataLabels]} redraw />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No data available.</p>
      )}
    </div>
  );
};

export default CategoryMonthlyExpenseChart;
