// src/components/CashFlow.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatCurrency } from '../utils/currency';

// Register datalabels plugin
Bar.register && Bar.register(ChartDataLabels);

const CashFlow = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [cashFlowData, setCashFlowData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCashFlow = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/reports/monthly-cashflow`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCashFlowData(response.data);
      } catch (err) {
        console.error('Error fetching monthly cash flow data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCashFlow();
  }, [token, BASE_URL]);

  // Filter out if all zero
  const filtered = cashFlowData.filter(item => item.inflow || item.outflow || item.netFlow);

  const labels = filtered.map(item => item.month.substring(0,3));
  const data = {
    labels,
    datasets: [
      {
        label: 'Expenses',
        data: filtered.map(item => item.outflow),
        backgroundColor: '#F87171', // red-400
        borderRadius: 6,
        borderSkipped: 'bottom',
        maxBarThickness: 50,
      },
      {
        label: 'Income',
        data: filtered.map(item => item.inflow),
        backgroundColor: '#14B8A6', // teal-500
        borderRadius: 6,
        maxBarThickness: 50,
        borderSkipped: 'bottom',
        datalabels: {
          anchor: 'end', align: 'end',
          formatter: val => formatCurrency(val, userPreferredCurrency, userPreferredLocale),
          font: { weight: 'bold' }, color: '#374151'
        }
      },
      {
        label: 'Net Flow',
        data: filtered.map(item => item.netFlow),
        backgroundColor: '#60A5FA', // blue-400
        borderRadius: 6,
        borderSkipped: 'bottom',
        maxBarThickness: 50,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { boxWidth: 12, padding: 16 } },
      datalabels: {display: false},
    },
    scales: {
      x: {
        ticks: { autoSkip: false },
        grid: { display: false },
        categoryPercentage: 0.6, barPercentage: 0.6,
      },
      y: {
        beginAtZero: true,
        ticks: { callback: v => formatCurrency(v, userPreferredCurrency, userPreferredLocale) }
      }
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full" />
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Cash Flow</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Loading cash flow data...</p>
      ) : filtered.length > 0 ? (
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No cash flow data available.</p>
      )}
    </div>
  );
};

export default CashFlow;
