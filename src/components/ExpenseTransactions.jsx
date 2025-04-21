// src/components/ExpenseTransactions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dateUtils';

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

  // Fetch accounts & categories on mount
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

  // Fetch transactions whenever filters change
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate)   params.endDate   = endDate;
        if (selectedAccount)  params.accountId  = selectedAccount;
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

  // Pagination
  const totalPages = Math.ceil(transactions.length / pageSize);
  const paged = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white shadow-md rounded p-4">
      {/* Filters… */}
  
      {/* Table scroll wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b whitespace-nowrap">Date</th>
              <th className="py-2 px-4 border-b whitespace-nowrap">Amount</th>
              <th className="py-2 px-4 border-b whitespace-nowrap">Account</th>
              <th className="py-2 px-4 border-b whitespace-nowrap">Category</th>
              <th className="py-2 px-4 border-b whitespace-nowrap">Description</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td className="py-2 px-4 border-b text-center" colSpan="5">
                  No transactions found.
                </td>
              </tr>
            ) : (
              paged.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b whitespace-nowrap">{formatDate(txn.date)}</td>
                  <td className="py-2 px-4 border-b whitespace-nowrap">
                    {formatCurrency(txn.amount, userPreferredCurrency, userPreferredLocale)}
                  </td>
                  <td className="py-2 px-4 border-b whitespace-nowrap">{txn.account?.name || '—'}</td>
                  <td className="py-2 px-4 border-b whitespace-nowrap">{txn.category?.name || '—'}</td>
                  <td className="py-2 px-4 border-b">{txn.description || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
  
      {/* Pagination… */}
    </div>
  );
  
};

export default ExpenseTransactions;
