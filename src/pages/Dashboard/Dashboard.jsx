import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SummaryCard from '../../components/SummaryCard';
import { getCurrentMonthRange, getPreviousMonthRange } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currency';
import RecentTransactions from '../../components/RecentTransactions';
import ExpenseByCategory from '../../components/ExpenseByCategory';

const Dashboard = () => {
  const { startDate: initialStart, endDate: initialEnd } = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  const token = localStorage.getItem('token');
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Currency settings
  const userPreferredCurrency = 'EUR';
  const userPreferredLocale = 'en-GB';

  //getting current month dates
  const handleCurrentMonth = () => {
    const { startDate, endDate } = getCurrentMonthRange();
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const handlePreviousMonth = () => {
    const { startDate, endDate } = getPreviousMonthRange();
    setStartDate(startDate);
    setEndDate(endDate);
  };

  // Fetch total balance
  const fetchTotalBalance = async () => {
    try {
      const response = await axios.get('/api/accounts/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalBalance(response.data);
    } catch (err) {
      console.error('Error fetching total balance:', err);
    }
  };

  // Fetch income and expense summary based on current date filters
  const fetchSpendingAndIncome = async () => {
    try {
      const response = await axios.get(
        `/api/reports/summary?start=${startDate}&end=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTotalExpenses(response.data.totalSpending);
      setTotalIncome(response.data.totalIncome);
    } catch (err) {
      console.error('Error fetching spending and income summary:', err);
    }
  };

  // Fetch summary whenever date range changes
  useEffect(() => {

      fetchSpendingAndIncome();
    
  }, [startDate, endDate]);

  // Fetch total balance on mount
  useEffect(() => {
    fetchTotalBalance();
  }, []);


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {/* Date Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={handleCurrentMonth} className="bg-blue-500 text-white px-4 py-2 rounded">
              Current Month
            </button>
            <button onClick={handlePreviousMonth} className="bg-blue-500 text-white px-4 py-2 rounded">
              Previous Month
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
      {/* Layout with flex: left side for summary, right side for recent transactions */}
      <div className="flex gap-4">
        {/* Left Column (flex-grow) */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <SummaryCard title="Total Balance" value={totalBalance} formatCurrency={formatCurrency} />
            <SummaryCard title="Total Income" value={totalIncome} formatCurrency={formatCurrency} />
            <SummaryCard title="Total Expenses" value={totalExpenses} formatCurrency={formatCurrency} />
          </div>
          
          {/* Expense by category*/}
          <div className="w-2/3">
          <ExpenseByCategory token={token} BASE_URL={BASE_URL} startDate={startDate} endDate={endDate} />
          </div>
          {/* Budgeting Placeholder on the left */}
          <div className="w-1/3 flex items-center justify-center border-2 border-dashed border-gray-300 p-4">
          <span className="text-gray-500">Budget Info Placeholder</span>
          </div>

      </div>

        {/* Right Column for Recent Transactions */}
        <div className="w-full md:w-1/3">
          <RecentTransactions
            token={token}
            BASE_URL={BASE_URL}
            userPreferredCurrency={userPreferredCurrency}
            userPreferredLocale={userPreferredLocale}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
