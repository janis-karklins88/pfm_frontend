import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MonthlyExpenseChart from '../../components/MonthlyExpenseChart';
import ExpenseByCategoryBarChart from '../../components/ExpenseByCategoryBarChart';
import ExpenseByCategoryMonthChart from '../../components/ExpenseByCategoryMonthChart';
import NetMonthlyBalanceChart from '../../components/NetMonthlySavingsBalanceChart';
import BudgetProgressBars from '../../components/BudgetProgressBars';


const ExpensePage = () => {
  // Date filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem('token');
    // Currency settings
    const userPreferredCurrency = 'EUR';
    const userPreferredLocale = 'en-GB';


  // Helper function to format Date objects as yyyy-MM-dd
  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) { month = '0' + month; }
    if (day.length < 2) { day = '0' + day; }
    return [year, month, day].join('-');
  };

  // Preset filter buttons for current month and previous 4 months
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
        start = new Date();
        end = new Date();
    }
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };

  // Set default dates to the current month on mount.
  useEffect(() => {
    handlePreset('current');
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Expenses</h1>
      
      {/* Date Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => handlePreset('current')} className="bg-blue-500 text-white px-4 py-2 rounded">
          Current Month
        </button>
        <button onClick={() => handlePreset('last')} className="bg-blue-500 text-white px-4 py-2 rounded">
          Last Month
        </button>
        <button onClick={() => handlePreset('2ago')} className="bg-blue-500 text-white px-4 py-2 rounded">
          2 Months Ago
        </button>
        <button onClick={() => handlePreset('3ago')} className="bg-blue-500 text-white px-4 py-2 rounded">
          3 Months Ago
        </button>
        
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
          className="border p-2 rounded" 
          placeholder="Start Date"
        />
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
          className="border p-2 rounded" 
          placeholder="End Date"
        />
      </div>
      
      {/* Two-column Layout */}
      <div className="flex gap-4">
        {/* Left Column (2/3 width): Expense Charts & Analytics */}
        <div className="w-2/3 flex flex-col gap-4">

        {/* cExpense by month */}
          <MonthlyExpenseChart 
            token={token} 
            BASE_URL={BASE_URL} 
            userPreferredCurrency={userPreferredCurrency} 
            userPreferredLocale={userPreferredLocale}
          />
          
          {/* Expense by category */}
          <ExpenseByCategoryBarChart 
          token={token} 
          BASE_URL={BASE_URL} 
          startDate={startDate} 
          endDate={endDate} 
          userPreferredCurrency={userPreferredCurrency}
          userPreferredLocale={userPreferredLocale}/>
          
          {/* Monthly expense for category*/}
          <ExpenseByCategoryMonthChart 
          token={token} 
          BASE_URL={BASE_URL} />

          {/* Monthly Savings Net Balance*/}
          <NetMonthlyBalanceChart 
          token={token}
          BASE_URL={BASE_URL}
          userPreferredCurrency={userPreferredCurrency}
          userPreferredLocale={userPreferredLocale}
          />
          
          {/* Budget progress bars */}
          <BudgetProgressBars 
          token={token} 
          BASE_URL={BASE_URL} 
          startDate={startDate} 
          endDate={endDate} 
          userPreferredCurrency={userPreferredCurrency}
          userPreferredLocale={userPreferredLocale}/>

          {/* You can add additional expense analytics components here */}
          </div>
        
        {/* Right Column (1/3 width): Recent Transactions */}
        <div className="w-1/3">
          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-lg font-bold mb-2">Transactions</h2>
            <p>Transaction list coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensePage;
