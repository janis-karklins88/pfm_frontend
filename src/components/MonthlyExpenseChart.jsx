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

const MonthlyExpenseChart = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch expense data (historical + prediction) from your endpoint.
        // Expected response: an object whose keys are month labels and values are expense amounts.
        const response = await axios.get(`${BASE_URL}/api/reports/expense-and-prediction`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data; 
        // For example: { "JAN": 1000, "FEB": 1200, ..., "OCT": 1300, "NOV": 1400, "DEC": 0, "JAN_pred": 1500, "FEB_pred": 1550 }
        const allLabels = Object.keys(data);
        const allValues = Object.values(data).map(val => Number(val));
        
        const historicalCount = 10; // First 10 entries are historical
        
        // Separate historical and predicted data.
        const historicalLabels = allLabels.slice(0, historicalCount);
        const historicalValues = allValues.slice(0, historicalCount);
        const predictedLabels = allLabels.slice(historicalCount);
        const predictedValues = allValues.slice(historicalCount);
        
        // Filter out historical months with 0 expense.
        const filteredHistorical = historicalLabels.map((label, i) => ({ label, value: historicalValues[i] }))
                                  .filter(item => item.value !== 0);
        // Leave predicted data as is (or you could also filter them if needed).
        const filteredPredicted = predictedLabels.map((label, i) => ({ label, value: predictedValues[i] }))
                                  .filter(item => item.value !== 0);
        
        // Merge the filtered historical and predicted data.
        const mergedLabels = filteredHistorical.map(item => item.label)
                              .concat(filteredPredicted.map(item => item.label));
        const mergedValues = filteredHistorical.map(item => item.value)
                              .concat(filteredPredicted.map(item => item.value));
        
        // Use the count of filtered historical months for styling the line.
        const filteredHistoricalCount = filteredHistorical.length;
        
        // Create Chart.js data – one dataset that spans both historical and predicted data.
        const chartJSData = {
          labels: mergedLabels,
          datasets: [
            {
              label: 'Expense',
              data: mergedValues,
              borderColor: 'rgba(75,192,192,1)',
              backgroundColor: 'rgba(75,192,192,0.2)',
              tension: 0.3,
              fill: false,
              // Use the segment plugin to style the predicted portion with a dashed line.
              segment: {
                borderDash: (ctx) => {
                  // When the segment starts after the last historical data point, use dashed border.
                  return ctx.p0DataIndex >= filteredHistoricalCount - 1 ? [5, 5] : [];
                }
              }
            }
          ]
        };
        setChartData(chartJSData);
      } catch (error) {
        console.error('Error fetching monthly expense data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, BASE_URL]);
  
  const options = {
    responsive: true,
    plugins: {
      // Remove the built-in legend.
      legend: { display: false },
      // Add a title.
      title: { display: true, text: 'Monthly Expenses' },
      datalabels: {
        anchor: 'center',
        align: 'top',
        offset: 4,  // Moves labels away from the edge.
        clamp: true,  // Ensures labels do not overflow the chart area.
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
        min: 0,
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
        <Line data={chartData} options={options} plugins={[ChartDataLabels]} />
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default MonthlyExpenseChart;
