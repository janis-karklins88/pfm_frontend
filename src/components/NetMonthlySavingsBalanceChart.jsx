// src/components/NetMonthlyBalanceChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatCurrency } from '../utils/currency';

// Register datalabels plugin
Line.register && Line.register(ChartDataLabels);

const NetMonthlyBalanceChart = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/savings-goals/net-balance`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const labels = Object.keys(data);
        const values = Object.values(data).map(Number);

        setChartData({
          labels,
          datasets: [{
            label: 'Net Savings',
            data: values,
            borderColor: '#14B8A6',         // teal-500
            backgroundColor: 'rgba(20, 184, 166, 0.2)', // translucent teal
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#14B8A6',
            pointBorderColor: '#fff',
          }]
        });
      } catch (err) {
        console.error('Error fetching net monthly balance data:', err);
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
      title: {
        display: true,
        text: 'Net Monthly Savings',
      },
      datalabels: {
        display: ctx => ctx.dataIndex !== 0,
        anchor: ctx => (ctx.raw < 0 ? 'start' : 'end'),
        align: ctx => (ctx.raw < 0 ? 'bottom' : 'top'),
        offset: 4,
        clamp: true,
        formatter: value => formatCurrency(value, userPreferredCurrency, userPreferredLocale),
        font: { weight: 'bold' },
        color: '#374151',
      },
      tooltip: {
        callbacks: {
          label: context => formatCurrency(context.raw, userPreferredCurrency, userPreferredLocale)
        }
      }
    },
    scales: {
      x: {
        offset: false,
        ticks: { autoSkip: false },
        grid: { display: true }
      },
      y: {
        beginAtZero: false,    // allow negative values to show
        ticks: {
          callback: value => formatCurrency(value, userPreferredCurrency, userPreferredLocale)
        }
      }
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full" />
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Net Monthly Savings</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Loading chart data...</p>
      ) : chartData ? (
        <div className="h-64">
          <Line data={chartData} options={options} plugins={[ChartDataLabels]} redraw={true} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No data available.</p>
      )}
    </div>
  );
};

export default NetMonthlyBalanceChart;
