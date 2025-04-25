// src/components/BalanceBreakdownChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chart.js/auto';
import { formatCurrency } from '../utils/currency';

// Register datalabels plugin
Pie.register && Pie.register(ChartDataLabels);

const BalanceBreakdownChart = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [breakdownData, setBreakdownData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/reports/balance-breakdown`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBreakdownData(data);
      } catch (err) {
        console.error('Error fetching breakdown:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, BASE_URL]);

  // Filter out categories with no amount
  const filteredData = breakdownData.filter(item => item.amount > 0);

  // Teal shades palette
  const tealShades = ['#99F6E4', '#5EEAD4', '#2DD4BF', '#14B8A6', '#0D9488', '#0F766E'];
  const labels = filteredData.map(item => item.name);
  const values = filteredData.map(item => item.amount);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: tealShades.slice(0, labels.length),
        hoverBackgroundColor: tealShades.slice(0, labels.length).map(c => {
          // darken by 15%
          const num = parseInt(c.replace('#', ''), 16) * 0.85;
          return `#${Math.floor(num).toString(16).padStart(6, '0')}`;
        }),
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      // Hide Chart.js built-in legend to keep only custom manual legend below
      legend: { display: false },
      datalabels: { display: false },
    },
    layout: { padding: 8 },
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full" />
      <h3 className="text-lg font-semibold text-gray-700 mb-1">Fund Breakdown</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : filteredData.length > 0 ? (
        <div className="flex flex-col">
          <div className="w-40 h-40 mx-auto">
            <Pie data={data} options={options} />
          </div>
          <div className="mt-4 md:mt-0 md:ml-1">
            {filteredData.map((item, idx) => (
              <div key={idx} className="flex items-center mb-1">
                <span
                  className="inline-block mr-0 rounded-full ml-2"
                  style={{ width: '12px', height: '12px', backgroundColor: tealShades[idx] }}
                />
                <span className="text-sm font-medium text-gray-800 ml-2">{item.name}:</span>

                <span className="text-sm text-gray-600 ml-1">
                  {formatCurrency(item.amount, userPreferredCurrency, userPreferredLocale)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No data available.</p>
      )}
    </div>
  );
};

export default BalanceBreakdownChart;
