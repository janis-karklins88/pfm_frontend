import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dateUtils';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const ExpenseTransactions = ({
  token,
  BASE_URL,
  startDate,
  endDate,
  userPreferredCurrency,
  userPreferredLocale,
}) => {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Fetch filter data
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [acctRes, catRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/accounts`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setAccounts(acctRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Error loading filter data', err);
      }
    };
    fetchFilters();
  }, [token, BASE_URL]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (selectedAccount) params.accountId = selectedAccount;
        if (selectedCategory) params.categoryId = selectedCategory;

        const res = await axios.get(`${BASE_URL}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setTransactions(res.data || []);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error fetching transactions', err);
      }
    };
    fetchTransactions();
  }, [token, BASE_URL, startDate, endDate, selectedAccount, selectedCategory]);

  // Pagination calculations
  const totalPages = Math.ceil(transactions.length / pageSize);
  const paged = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Accent Bar */}
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Transactions</h3>
        <div className="flex space-x-2">
          <select
            className="border border-gray-300 bg-white text-sm rounded-lg px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            className="border border-gray-300 bg-white text-sm rounded-lg px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-50">
            <tr>
              {['Date', 'Amount', 'Account', 'Category', 'Description'].map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 text-left text-xs font-semibold text-teal-600 uppercase tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paged.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              paged.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(txn.date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                    {formatCurrency(txn.amount, userPreferredCurrency, userPreferredLocale)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{txn.account?.name || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{txn.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 truncate">{txn.description || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeftIcon size={16} className="text-teal-500" />
          </button>
          <span className="text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRightIcon size={16} className="text-teal-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseTransactions;
