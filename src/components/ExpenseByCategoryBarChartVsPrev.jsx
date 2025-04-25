// src/components/ExpenseByCategoryChartVsPrev.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getPreviousMonthRange } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currency';

// Register datalabels plugin
Bar.register && Bar.register(ChartDataLabels);

const ExpenseByCategoryChartVsPrev = ({ token, BASE_URL, startDate, endDate, userPreferredCurrency, userPreferredLocale }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current and previous month data
        const currReq = axios.get(
          `${BASE_URL}/api/reports/spending-by-category?start=${startDate}&end=${endDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { startDate: prevStart, endDate: prevEnd } = getPreviousMonthRange();
        const prevReq = axios.get(
          `${BASE_URL}/api/reports/spending-by-category?start=${prevStart}&end=${prevEnd}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const [currRes, prevRes] = await Promise.all([currReq, prevReq]);
        const curr = currRes.data;
        const prev = prevRes.data;

        // Combine category labels
        const labels = Array.from(
          new Set([...prev.map(i => i.categoryName), ...curr.map(i => i.categoryName)])
        );

        // Map data arrays
        const prevData = labels.map(label => prev.find(i => i.categoryName === label)?.totalAmount || 0);
        const currData = labels.map(label => curr.find(i => i.categoryName === label)?.totalAmount || 0);

        // Build chartData: last month first
        setChartData({
          labels,
          datasets: [
            {
              label: 'Last Month',
              data: prevData,
              backgroundColor: '#89bafb',
              borderRadius: 6,
              borderSkipped: 'bottom',
              // disable labels
              datalabels: { display: false },
              maxBarThickness: 50,
            },
            {
              label: 'This Month',
              data: currData,
              backgroundColor: '#14B8A6',
              borderRadius: 6,
              maxBarThickness: 50,
              borderSkipped: 'bottom',
              // show labels only for this dataset
              datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: val => formatCurrency(val, userPreferredCurrency, userPreferredLocale),
                font: { weight: 'bold' },
                color: '#374151',
              },
            },
          ],
        });
      } catch (err) {
        console.error('Error fetching expenses by category', err);
      }
    };

    if (startDate && endDate) fetchData();
  }, [token, BASE_URL, startDate, endDate]);

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full" />

      <h3 className="text-lg font-semibold text-gray-700 mb-4">Expenses by Category</h3>

      {chartData ? (
        <div className="h-64">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top', align: 'end', labels: { boxWidth: 12, padding: 16 } },
                // no global datalabels config so only dataset settings apply
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { callback: v => formatCurrency(v, userPreferredCurrency, userPreferredLocale) }
                },
                x: {
                  ticks: { autoSkip: false },
                  grid: { display: false },
                  categoryPercentage: 0.6,
                  barPercentage: 0.6,
                },
              },
            }}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No data available.</p>
      )}
    </div>
  );
};

export default ExpenseByCategoryChartVsPrev;
