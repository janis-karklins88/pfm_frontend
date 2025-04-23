// src/components/SummaryCard.jsx
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const SummaryCard = ({ title, value, formatCurrency, change }) => {
  const changeValue = Number(change);
  const isPositive = !isNaN(changeValue) && changeValue >= 0;
  const Icon = isPositive ? ChevronUp : ChevronDown;

  return (
    <div className="relative bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      {/* Accent bar */}
      <div className="absolute -top-2 left-6 w-12 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full" />

      {/* Title */}
      <h3 className="text-sm font-semibold uppercase text-gray-500">{title}</h3>

      {/* Value */}
      <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(value)}</p>

      {/* Change vs last month */}
      {change != null && (
        <div className="mt-2 flex items-center">
          <Icon size={16} className={isPositive ? 'text-green-500' : 'text-red-500'} />
          <span className={`ml-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{Math.abs(changeValue)}%</span>
          <span className="ml-2 text-xs text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;