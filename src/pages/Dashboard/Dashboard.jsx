import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SummaryCard from '../../components/SummaryCard';
import { getCurrentMonthRange, getPreviousMonthRange } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currency';
import RecentTransactions from '../../components/RecentTransactions';
import ExpenseByCategoryPieChart from '../../components/ExpenseByCategoryPieChart';
import ExpenseByCategoryBarChart from '../../components/ExpenseByCategoryBarChart';
import BudgetBarChart from '../../components/BudgetBarChart';
import NextPayments from '../../components/NextPayments';
import SavingsGoalsProgress from '../../components/SavingsGoalsProgress';
import CashFlow from '../../components/CashFlow';
import BalanceBreakdownChart from '../../components/BalanceBreakdownChart';


const Dashboard = () => {
  const { startDate: initialStart, endDate: initialEnd } = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  
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
      const response = await axios.get('/api/reports/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalBalance(response.data);
    } catch (err) {
      console.error('Error fetching total balance:', err);
    }
  };

  //Fetch total savings
  const fetchTotalSavings = async () => {
    try {
      const response = await axios.get('/api/savings-goals/savings-balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalSavings(response.data);
    } catch (err) {
      console.error('Error fetching total balance:', err);
    }
  }

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
    fetchTotalSavings();
  }, []);


  return (
<div className="p-4">
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
  {/* Layout with flex: left side for summary & charts, right side for recent transactions and next payments */}
  <div className="flex gap-4">


    {/* *************************** Left Column ***************************** */}
    <div className="flex-1">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <SummaryCard title="Total Balance" value={totalBalance} formatCurrency={formatCurrency} />
        <SummaryCard title="Total Income" value={totalIncome} formatCurrency={formatCurrency} />
        <SummaryCard title="Total Expenses" value={totalExpenses} formatCurrency={formatCurrency} />
        <SummaryCard title="Total Savings" value={totalSavings} formatCurrency={formatCurrency} />
      </div>
      
      {/* Category and Budget Bar Chart container */}
      <div className="flex gap-4">

        {/* Expense by Category */}
        <div className="w-1/2">
          <ExpenseByCategoryBarChart token={token} BASE_URL={BASE_URL} startDate={startDate} endDate={endDate} />
        </div>
        
        {/* Budget Bar Chart */}
        <div className="w-1/2">
          <BudgetBarChart token={token} BASE_URL={BASE_URL} startDate={startDate} endDate={endDate} />
        </div>
      </div>

      {/* CashFlow & something else */}
      <div className="flex gap-4">

        {/* CashFlow */}
      <div className="w-1/2">
          <CashFlow
            token={token}
            BASE_URL={BASE_URL}
            userPreferredCurrency={userPreferredCurrency}
            userPreferredLocale={userPreferredLocale}
          />
      </div>

        {/* Balance breakdown */}
          <div className="w-1/4">
          <BalanceBreakdownChart token={token} BASE_URL={BASE_URL} />
          </div>

        {/* Savings */}
          <div className="w-1/4">
          <SavingsGoalsProgress
              token={token}
              BASE_URL={BASE_URL}
              userPreferredCurrency={userPreferredCurrency}
              userPreferredLocale={userPreferredLocale}
          />
    </div>
      </div>

      {/* next row */}
      <div className="flex gap-4">

      </div>



    </div>



    {/* Right Column for Recent Transactions and Next Payments */}
    <div className="flex gap-4">

      <div className="w-1/2">
      <RecentTransactions
        token={token}
        BASE_URL={BASE_URL}
        userPreferredCurrency={userPreferredCurrency}
        userPreferredLocale={userPreferredLocale}
      />
      </div>
      <div className="w-1/2">
      <NextPayments token={token} BASE_URL={BASE_URL} />
      </div>
    </div>
  </div>
</div>


  );
};

export default Dashboard;
