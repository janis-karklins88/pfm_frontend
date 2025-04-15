// src/components/ExpenseByCategoryChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { formatCurrency } from "../utils/currency";

const ExpenseByCategoryChart = ({ token, BASE_URL, startDate, endDate, userPreferredCurrency, userPreferredLocale }) => {
  const [chartData, setChartData] = useState(null);

  const fetchExpenseByCategory = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/reports/spending-by-category?start=${startDate}&end=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data; // Expecting an array with categoryName and totalAmount

      // Extract labels and values from the data
      const labels = data.map((item) => item.categoryName);
      const values = data.map((item) => item.totalAmount);

      // Generate background colors for each bar
      const backgroundColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
        '#FF9F40', '#8E44AD', '#2980B9', '#27AE60', '#E67E22', 
        '#C0392B', '#F1C40F'
      ];

      setChartData({
        labels,
        datasets: [
          {
            label: 'Expenses',
            data: values,
            backgroundColor: backgroundColors.slice(0, labels.length),
          },
        ],
      });
    } catch (err) {
      console.error('Error fetching expense by category:', err);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchExpenseByCategory();
    }
  }, [startDate, endDate, token, BASE_URL]);

  return (
    <div className="bg-white shadow-md rounded p-4">
      <h2 className="text-lg font-bold mb-2">Expenses by Category</h2>
      {chartData ? (
        <div className="chart-container" style={{ height: '300px', width: '100%' }}>
          <Bar 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false, // Remove the default legend
                },
                datalabels: {
                  display: true, // Enable data labels directly on the bars
                  anchor: 'end',
                  offset: 1,
                  align: 'end',
                  formatter: (value) =>
                    formatCurrency(value, userPreferredCurrency, userPreferredLocale),
                  color: '#000',
                  font: { weight: 'bold' },
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                }
              }
            }}
          />
        </div>
      ) : (
        <p className="text-sm">No data available.</p>
      )}
    </div>
  );
};

export default ExpenseByCategoryChart;
