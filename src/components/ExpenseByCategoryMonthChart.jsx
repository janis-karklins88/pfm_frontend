// src/components/CategoryMonthlyExpenseChart.jsx
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

const CategoryMonthlyExpenseChart = ({ token, BASE_URL, userPreferredCurrency, userPreferredLocale }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for categories and selected category.
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Load all categories once on mount.
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
        if (response.data && response.data.length > 0) {
          // Default to first category.
          setSelectedCategory(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [token, BASE_URL]);
  
  // Fetch expense data for the selected category.
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCategory) return;
      
      try {
        // Expected response: an object whose keys are month labels and values are amounts.
        const response = await axios.get(
          `${BASE_URL}/api/reports/expense-for-category?categoryId=${selectedCategory}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data; 
        // Example structure: { "JAN": 1000, "FEB": 1200, ..., "OCT": 1300, "NOV": 1400, "DEC": 0, "JAN_pred": 1500, "FEB_pred": 1550 }
        const allLabels = Object.keys(data);
        const allValues = Object.values(data).map(val => Number(val));
        
        // Assuming the first 10 entries are historical data.
        const historicalCount = 10;
        const historicalLabels = allLabels.slice(0, historicalCount);
        const historicalValues = allValues.slice(0, historicalCount);
        const predictedLabels = allLabels.slice(historicalCount);
        const predictedValues = allValues.slice(historicalCount);
        
        // Filter out historical months with zero expense.
        const filteredHistorical = historicalLabels
          .map((label, i) => ({ label, value: historicalValues[i] }))
          .filter(item => item.value !== 0);
        // Leave predicted data as is (or filter if needed).
        const filteredPredicted = predictedLabels
          .map((label, i) => ({ label, value: predictedValues[i] }))
          .filter(item => item.value !== 0);
        
        const mergedLabels = filteredHistorical.map(item => item.label)
          .concat(filteredPredicted.map(item => item.label));
        const mergedValues = filteredHistorical.map(item => item.value)
          .concat(filteredPredicted.map(item => item.value));
        
        // Use the count of filtered historical months for styling the line segments.
        const filteredHistoricalCount = filteredHistorical.length;
        
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
              // Configure the predicted portion to appear dashed.
              segment: {
                borderDash: (ctx) => {
                  return ctx.p0DataIndex >= filteredHistoricalCount - 1 ? [5, 5] : [];
                }
              }
            }
          ]
        };
        setChartData(chartJSData);
      } catch (error) {
        console.error('Error fetching expense for category:', error);
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
      {/* Category selection dropdown */}
      <div className="mb-4">
        <label className="text-sm font-bold mr-2">Select Category:</label>
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      
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

export default CategoryMonthlyExpenseChart;
