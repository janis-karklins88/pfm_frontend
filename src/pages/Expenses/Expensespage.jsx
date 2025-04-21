import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MonthlyExpenseChart from '../../components/MonthlyExpenseChart';
import ExpenseByCategoryBarChart from '../../components/ExpenseByCategoryBarChart';
import ExpenseByCategoryMonthChart from '../../components/ExpenseByCategoryMonthChart';
import NetMonthlyBalanceChart from '../../components/NetMonthlySavingsBalanceChart';
import BudgetProgressBars from '../../components/BudgetProgressBars';
import ExpenseTransactions from '../../components/ExpenseTransactions';

const ExpensePage = () => {
  // Date filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');
  const userPreferredCurrency = 'EUR';
  const userPreferredLocale = 'en-GB';

  // Helper to format Date as yyyy-MM-dd
  const formatDate = (date) => {
    const d = new Date(date);
    let m = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const y = d.getFullYear();
    if (m.length < 2) m = '0' + m;
    if (day.length < 2) day = '0' + day;
    return [y, m, day].join('-');
  };

  // Preset filters
  const handlePreset = (preset) => {
    const today = new Date();
    let start, end;
    switch (preset) {
      case 'current':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'last':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case '2ago':
        start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        end = new Date(today.getFullYear(), today.getMonth() - 1, 0);
        break;
      case '3ago':
        start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        end = new Date(today.getFullYear(), today.getMonth() - 2, 0);
        break;
      case '4ago':
        start = new Date(today.getFullYear(), today.getMonth() - 4, 1);
        end = new Date(today.getFullYear(), today.getMonth() - 3, 0);
        break;
      default:
        start = today;
        end = today;
    }
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };

  // Initialize to current month
  useEffect(() => {
    handlePreset('current');
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Expenses</h1>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handlePreset('current')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Current Month
        </button>
        <button
          onClick={() => handlePreset('last')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Last Month
        </button>
        <button
          onClick={() => handlePreset('2ago')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          2 Months Ago
        </button>
        <button
          onClick={() => handlePreset('3ago')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          3 Months Ago
        </button>
        <button
          onClick={() => handlePreset('4ago')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          4 Months Ago
        </button>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Responsive Two‑Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Left: charts & analytics */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="w-full h-80">
            <MonthlyExpenseChart
              token={token}
              BASE_URL={BASE_URL}
              userPreferredCurrency={userPreferredCurrency}
              userPreferredLocale={userPreferredLocale}
            />
          </div>

          <div className="w-full h-80">
            <ExpenseByCategoryBarChart
              token={token}
              BASE_URL={BASE_URL}
              startDate={startDate}
              endDate={endDate}
              userPreferredCurrency={userPreferredCurrency}
              userPreferredLocale={userPreferredLocale}
            />
          </div>

          <div className="w-full h-80">
            <ExpenseByCategoryMonthChart
              token={token}
              BASE_URL={BASE_URL}
              startDate={startDate}
              endDate={endDate}
              userPreferredCurrency={userPreferredCurrency}
              userPreferredLocale={userPreferredLocale}
            />
          </div>

          <div className="w-full h-80">
            <NetMonthlyBalanceChart
              token={token}
              BASE_URL={BASE_URL}
              userPreferredCurrency={userPreferredCurrency}
              userPreferredLocale={userPreferredLocale}
            />
          </div>
          <div className="w-full">
          <BudgetProgressBars
            token={token}
            BASE_URL={BASE_URL}
            startDate={startDate}
            endDate={endDate}
            userPreferredCurrency={userPreferredCurrency}
            userPreferredLocale={userPreferredLocale}
          />
          </div>
        </div>

        {/* Right: transactions */}
        <div className="md:col-span-2 flex flex-col gap-4">

            <ExpenseTransactions
              token={token}
              BASE_URL={BASE_URL}
              startDate={startDate}
              endDate={endDate}
              userPreferredCurrency={userPreferredCurrency}
              userPreferredLocale={userPreferredLocale}
            />

        </div>
      </div>
    </div>
  );
};

export default ExpensePage;
