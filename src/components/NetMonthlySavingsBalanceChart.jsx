import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatCurrency } from '../utils/currency';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ChartDataLabels);

const NetMonthlyBalanceChart = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch net monthly balance from your endpoint.
        // Expected response: an object with keys as month labels and values as the net savings amount.
        const response = await axios.get(`${BASE_URL}/api/savings-goals/net-balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data; // e.g. { "JAN": 500, "FEB": 600, "MAR": 700, ... }
        
        const labels = Object.keys(data);
        const values = Object.values(data).map(val => Number(val));
        
        const chartJSData = {
          labels: labels,
          datasets: [
            {
              label: 'Net Savings',
              data: values,
              borderColor: 'rgba(54, 162, 235, 1)', // Blue tone
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              tension: 0.3,
              fill: false,
              pointBackgroundColor: 'rgba(54, 162, 235, 1)',
              pointBorderColor: '#fff'
            }
          ]
        };
        
        setChartData(chartJSData);
      } catch (error) {
        console.error('Error fetching net monthly balance data:', error);
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
      legend: {
        display: false, // Hide the default legend
      },
      title: {
        display: true,
        text: 'Net Monthly Deposits in to Savings',
      },
      datalabels: {
        anchor: 'center',
        align: 'top',
        offset: 4,
        clamp: true,
        formatter: (value) => value !== null ? formatCurrency(value, userPreferredCurrency, userPreferredLocale) : '',
        font: { weight: 'bold' },
        color: '#000'
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            formatCurrency(context.raw, userPreferredCurrency, userPreferredLocale)
        }
      }
    },
    scales: {
      x: {
        title: { display: false },
      },
      y: {
        title: { display: false },
        min: 0, // Force the y-axis to start from 0
        ticks: {
          beginAtZero: true,
          stepSize: 100,
          callback: (value) =>
            formatCurrency(value, userPreferredCurrency, userPreferredLocale),
        },
      },
    }
  };

  return (
    <div className="bg-white shadow-md rounded p-4 mt-4">
      {loading ? (
        <p>Loading chart data...</p>
      ) : chartData ? (
        <div style={{ height: '300px', width: '100%' }}>
          <Line data={chartData} options={options} plugins={[ChartDataLabels]} />
        </div>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default NetMonthlyBalanceChart;
