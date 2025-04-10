import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatCurrency } from '../utils/currency';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CashFlow = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [cashFlowData, setCashFlowData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCashFlow = async () => {
      try {
        // Adjust this endpoint if needed to fetch your monthly cash flow data
        const response = await axios.get(`${BASE_URL}/api/reports/monthly-cashflow`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCashFlowData(response.data);
      } catch (err) {
        console.error('Error fetching monthly cash flow data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCashFlow();
  }, [token, BASE_URL]);

  // Filter to keep only months where at least one value is non-zero.
  const filteredData = cashFlowData.filter(
    item => item.inflow !== 0 || item.outflow !== 0 || item.netFlow !== 0
  );
  
  // Prepare the month labels and datasets using the filtered data.
  const labels = filteredData.map(item => item.month);
  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: filteredData.map(item => item.inflow),
        backgroundColor: '#27AE60', // Green for Income
      },
      {
        label: 'Expense',
        data: filteredData.map(item => item.outflow),
        backgroundColor: '#E74C3C', // Red for Expense
      },
      {
        label: 'Net Flow',
        data: filteredData.map(item => item.netFlow),
        backgroundColor: '#3498DB', // Blue for Net Flow
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top', // Legend (color labels) appear on top
      },
      title: {
        display: true,
        text: 'Monthly Cash Flow',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
      y: {
        title: {
          display: false,
          text: 'Money',
        },
        ticks: {
          beginAtZero: true,
          // Format the y-axis ticks as currency using your formatCurrency utility
          callback: (value) =>
            formatCurrency(value, userPreferredCurrency, userPreferredLocale),
        },
      },
    },
  };

  return (
    <div className="bg-white shadow-md rounded p-4 mt-4">
      <h2 className="text-lg font-bold mb-2">Monthly Cash Flow</h2>
      {loading ? (
        <p>Loading cash flow data...</p>
      ) : filteredData.length > 0 ? (
        <Bar data={data} options={options} />
      ) : (
        <p>No cash flow data available.</p>
      )}
    </div>
  );
};

export default CashFlow;
