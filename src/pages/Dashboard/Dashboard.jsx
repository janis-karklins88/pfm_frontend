// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SummaryCard from '../../components/SummaryCard';
import RecentTransactions from '../../components/RecentTransactions';
import NextPayments from '../../components/NextPayments';
import ExpenseByCategoryChartVsPrev from '../../components/ExpenseByCategoryBarChartVsPrev';
import BudgetBarChart from '../../components/BudgetBarChart';
import CashFlow from '../../components/CashFlow';
import BalanceBreakdownChart from '../../components/BalanceBreakdownChart';
import SavingsGoalsProgress from '../../components/SavingsGoalsProgress';
import { getCurrentMonthRange, getPreviousMonthRange } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currency';
import { useSettings } from "../../contexts/SettingsContext";

const Dashboard = () => {
  // Date range state
  const { startDate: initialStart, endDate: initialEnd } = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);

  // Summary values
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [totalAccountBalance, setTotalAccountBalance] = useState(0);
  const [changes, setChanges] = useState({});

  const token = localStorage.getItem('token');
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const { currency: userPreferredCurrency } = useSettings();
  const userPreferredLocale = navigator.language;

  //wraper
  const formatCurr = (value) =>
    formatCurrency(value, userPreferredCurrency, userPreferredLocale);

 
  // Fetch summary and change data
  useEffect(() => {
    axios.get(`${BASE_URL}/api/reports/summary?start=${startDate}&end=${endDate}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setTotalIncome(res.data.totalIncome);
        setTotalExpenses(res.data.totalSpending);
      });

    axios.get(`${BASE_URL}/api/reports/balance`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTotalBalance(res.data));

    axios.get(`${BASE_URL}/api/savings-goals/savings-balance`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTotalSavings(res.data));

    axios.get(`${BASE_URL}/api/reports/balance-change`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const map = {};
        res.data.forEach(({ name, percentage }) => { map[name] = percentage; });
        setChanges(map);
      });
      axios.get(`${BASE_URL}/api/accounts/total-balance`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTotalAccountBalance(res.data));
  }, [startDate, endDate, token, BASE_URL]);

 
  return (
    <div className="p-4">
      {/* Main flex: 2 columns */}
      <div className="flex gap-4">

        {/* Left Column */}
        <div className="flex-1 flex flex-col space-y-4">

          {/* Summary Cards (full width) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <SummaryCard title="Total Balance" value={totalBalance} formatCurrency={formatCurr} change={changes.totalBalance} />
            <SummaryCard title="Account Balance" value={totalAccountBalance} formatCurrency={formatCurr} change={changes.accountBalance} />
            <SummaryCard title="Income" value={totalIncome} formatCurrency={formatCurr} change={changes.Income} />
            <SummaryCard title="Expenses" value={totalExpenses} formatCurrency={formatCurr} change={changes.Expense} />
            <SummaryCard title="Savings" value={totalSavings} formatCurrency={formatCurr} change={changes.Savings} />
          </div>

          {/* Row 1: Expense by Category + Cash Flow */}
          <div className="flex gap-4">
            <div className="flex-1">
              <ExpenseByCategoryChartVsPrev 
              token={token} 
              BASE_URL={BASE_URL} 
              startDate={startDate} 
              endDate={endDate}
              userPreferredCurrency={userPreferredCurrency}
              userPreferredLocale={userPreferredLocale} />
            </div>
            <div className="flex-1">
              <CashFlow token={token} BASE_URL={BASE_URL} userPreferredCurrency={userPreferredCurrency} userPreferredLocale={userPreferredLocale} />
            </div>
          </div>

          {/* Row 2: Budget (1/2), Savings Goals (1/4), Balance Breakdown (1/4) */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <BudgetBarChart 
              token={token} 
              BASE_URL={BASE_URL} 
              startDate={startDate} 
              endDate={endDate} 
              userPreferredCurrency={userPreferredCurrency} 
              userPreferredLocale={userPreferredLocale} />
            </div>
            <div className="w-1/4">
              <SavingsGoalsProgress token={token} BASE_URL={BASE_URL} userPreferredCurrency={userPreferredCurrency} userPreferredLocale={userPreferredLocale} />
            </div>
            <div className="w-1/4">
              <BalanceBreakdownChart token={token} 
              BASE_URL={BASE_URL}
              userPreferredCurrency={userPreferredCurrency}
              userPreferredLocale={userPreferredLocale} />
            </div>
          </div>

        </div>

        {/* Right Column: Recent + Next Payments stacked */}
        <div className="w-1/4 flex flex-col space-y-4">
          <RecentTransactions token={token} BASE_URL={BASE_URL} userPreferredCurrency={userPreferredCurrency} userPreferredLocale={userPreferredLocale} />
          <NextPayments token={token} BASE_URL={BASE_URL} userPreferredCurrency={userPreferredCurrency} userPreferredLocale={userPreferredLocale}/>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
