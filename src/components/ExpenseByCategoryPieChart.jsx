// src/components/ExpenseByCategoryChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { formatCurrency } from "../utils/currency";

const ExpenseByCategoryChart = ({ token, BASE_URL, startDate, endDate }) => {
  const [chartData, setChartData] = useState(null);

  const fetchExpenseByCategory = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/reports/spending-by-category?start=${startDate}&end=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data; // Expecting an array of DTOs with categoryName and totalAmount

      // Extract labels and values from the data.
      const labels = data.map((item) => item.categoryName);
      const values = data.map((item) => item.totalAmount);

      // Generate background colors for each category.
      const backgroundColors = [
        '#FF6384', // pink/red
        '#36A2EB', // blue
        '#FFCE56', // yellow
        '#4BC0C0', // teal
        '#9966FF', // purple
        '#FF9F40', // orange
        '#8E44AD', // additional purple
        '#2980B9', // additional blue
        '#27AE60', // green
        '#E67E22', // orange-ish
        '#C0392B', // red
        '#F1C40F', // bright yellow
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

  // Custom legend component which displays labels and amounts.
  const renderLegend = () => {
    if (!chartData) return null;
    return (
      <ul className="space-y-2">
        {chartData.labels.map((label, index) => (
          <li key={index} className="flex items-center space-x-2">
            {/* Colored Box */}
            <div
              className="w-4 h-4"
              style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
            ></div>
            {/* Category and Amount */}
            <span className="text-sm">
              {label}: {formatCurrency(chartData.datasets[0].data[index])}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white shadow-md rounded p-4">
      <h2 className="text-lg font-bold mb-2">Expenses by Category</h2>
      {chartData ? (
        <div className="flex gap-10 items-start">
          {/* Custom Legend on the left */}
          <div className="w-1/3">{renderLegend()}</div>
          {/* Pie Chart on the right */}
          <div className="w-2/3">
            <div className="chart-container" style={{ height: '300px', width: '100%' }}>
              <Pie 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false, // Disable default legend if using custom legend
                    },
                    datalabels: {
                      display: false,
                    }
                  },
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm">No data available.</p>
      )}
    </div>
  );
};

export default ExpenseByCategoryChart;
