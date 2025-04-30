// src/components/MonthlyExpenseChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatCurrency } from '../utils/currency';

// Register datalabels plugin
Line.register && Line.register(ChartDataLabels);

const MonthlyExpenseChart = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/reports/expense-and-prediction`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = response.data;
        const allLabels = Object.keys(data);
        const allValues = Object.values(data).map(v => Number(v));

        const historicalCount = 10;
        const historicalLabels = allLabels.slice(0, historicalCount);
        const historicalValues = allValues.slice(0, historicalCount);
        const predictedLabels = allLabels.slice(historicalCount);
        const predictedValues = allValues.slice(historicalCount);

        const filteredHistorical = historicalLabels.map((label,i) => ({ label, value: historicalValues[i] })).filter(item => item.value !== 0);
        const filteredPredicted  = predictedLabels.map((label,i) => ({ label, value: predictedValues[i] })).filter(item => item.value !== 0);

        const mergedLabels = [...filteredHistorical, ...filteredPredicted].map(item => item.label);
        const mergedValues = [...filteredHistorical, ...filteredPredicted].map(item => item.value);
        const histLen = filteredHistorical.length;

        setChartData({
          labels: mergedLabels,
          datasets: [{
            label: 'Expenses',
            data: mergedValues,
            borderColor: '#14B8A6',             // teal-500
            backgroundColor: 'rgba(20,184,166,0.2)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#14B8A6',
            pointBorderColor: '#fff',
            segment: {
              borderDash: ctx => ctx.p0DataIndex >= histLen - 1 ? [5,5] : []
            }
          }]
        });
      } catch (err) {
        console.error('Error fetching monthly expense:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, BASE_URL]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Monthly Expenses', padding:{ bottom:20} },
      datalabels: {
        display: ctx => ctx.dataIndex !== 0,
        anchor: 'end', align: 'top', offset: 4, clamp: true,
        formatter: v => formatCurrency(v, userPreferredCurrency, userPreferredLocale),
        font: { weight: 'bold' }, color: '#374151'
      },
      tooltip: {
        callbacks: { label: ctx => formatCurrency(ctx.raw, userPreferredCurrency, userPreferredLocale) }
      }
    },
    scales: {
      x: { offset: false, ticks: { autoSkip: false }, grid: { display: true } },
      y: {
        beginAtZero: true,
        ticks: { callback: v => formatCurrency(v, userPreferredCurrency, userPreferredLocale) }
      }
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full" />
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Expenses</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Loading chart data...</p>
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

export default MonthlyExpenseChart;
