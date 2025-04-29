// src/components/ExpenseByCategoryChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatCurrency } from "../utils/currency";

// Register datalabels plugin
Bar.register && Bar.register(ChartDataLabels);

const ExpenseByCategoryChart = ({ token, BASE_URL, startDate, endDate, userPreferredCurrency, userPreferredLocale }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchExpenseByCategory = async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/reports/spending-by-category?start=${startDate}&end=${endDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const labels = data.map(item => item.categoryName);
        const values = data.map(item => item.totalAmount);
        const backgroundColors = data.map((_, i) => {
          // preserve original palette by index
          const palette = ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#8E44AD','#2980B9','#27AE60','#E67E22','#C0392B','#F1C40F'];
          return palette[i % palette.length];
        });

        setChartData({
          labels,
          datasets: [{
            label: 'Expenses',
            data: values,
            backgroundColor: backgroundColors,
            borderRadius: 6,
            borderSkipped: 'bottom',
            datalabels: {
              anchor: 'end',
              align: 'end',
              formatter: v => formatCurrency(v, userPreferredCurrency, userPreferredLocale),
              font: { weight: 'bold' },
              color: '#374151'
            }
          }]
        });
      } catch (err) {
        console.error('Error fetching expense by category:', err);
      }
    };
    if (startDate && endDate) fetchExpenseByCategory();
  }, [startDate, endDate, token, BASE_URL, userPreferredCurrency, userPreferredLocale]);

  const options = {
    layout: { padding: { top: 20 } },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: { display: true },
    },
    scales: {
      x: {
        offset: true,
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
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Expenses by Category</h3>

      {chartData ? (
        <div className="h-64">
          <Bar data={chartData} options={options} plugins={[ChartDataLabels]} redraw />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No data available.</p>
      )}
    </div>
  );
};

export default ExpenseByCategoryChart;
