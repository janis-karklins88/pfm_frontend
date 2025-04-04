import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SummaryCard from '../../components/SummaryCard';
import { getCurrentMonthRange, getPreviousMonthRange } from '../../utils/dateUtils';

const Dashboard = () => {
  const { startDate: initialStart, endDate: initialEnd } = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  const token = localStorage.getItem('token');


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

  // Fetch total balance (assumes it doesn't rely on date range)
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

  // Currency formatting function (you can also extract this as you did before)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {/* Date Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={handleCurrentMonth}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Current Month
        </button>
        <button
          onClick={handlePreviousMonth}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
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
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Total Balance" value={totalBalance} formatCurrency={formatCurrency} />
        <SummaryCard title="Total Income" value={totalIncome} formatCurrency={formatCurrency} />
        <SummaryCard title="Total Expenses" value={totalExpenses} formatCurrency={formatCurrency} />
      </div>
    </div>
  );
};

export default Dashboard;
