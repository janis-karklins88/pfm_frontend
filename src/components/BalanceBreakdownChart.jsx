import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatCurrency } from '../utils/currency';

ChartJS.register(ArcElement, Tooltip, Legend);

const BalanceBreakdownChart = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [breakdownData, setBreakdownData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define an array of colors to use for chart segments and custom legend.
  const backgroundColors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
  ];

  useEffect(() => {
    const fetchBreakdown = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/reports/balance-breakdown`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBreakdownData(response.data);
      } catch (error) {
        console.error('Error fetching balance breakdown:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdown();
  }, [token, BASE_URL]);

  // Prepare the labels and values from the fetched data.
  const labels = breakdownData.map(item => item.name);
  const values = breakdownData.map(item => item.amount);

  // Prepare chart data.
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors.slice(0, labels.length),
        hoverBackgroundColor: backgroundColors.slice(0, labels.length),
      },
    ],
  };

  return (
    <div className="bg-white shadow-md rounded p-4 mt-4">
      <h2 className="text-lg font-bold mb-2">Overall Fund Breakdown</h2>
      {loading ? (
        <p>Loading...</p>
      ) : breakdownData.length > 0 ? (
        <>
          {/* Chart container with fixed size */}
          <div style={{ width: '180px', height: '180px', margin: '0 auto' }}>
            <Pie 
            data={data} 
            options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
          {/* Custom legend with labels and amounts */}
          <div className="mt-4">
            {breakdownData.map((item, index) => (
              <div key={index} className="flex items-center mb-1">
                <span
                  className="inline-block mr-2"
                  style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: backgroundColors[index],
                  }}
                ></span>
                <span className="font-bold text-sm">{item.name}:</span>
                <span className="ml-1 text-sm">
                  {formatCurrency(item.amount, userPreferredCurrency, userPreferredLocale)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default BalanceBreakdownChart;
