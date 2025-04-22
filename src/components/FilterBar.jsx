// src/components/FilterBar.jsx
import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const FilterBar = ({
  onCurrentMonth,
  onPreviousMonth,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}) => (
  <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow">
    <button
      onClick={onPreviousMonth}
      className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
    >
      <ChevronLeft size={16} />
      Previous Month
    </button>

    <button
      onClick={onCurrentMonth}
      className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
    >
      This Month
n      <ChevronRight size={16} />
    </button>

    <div className="flex items-center gap-2">
      <CalendarIcon size={16} className="text-gray-500" />
      <input
        type="date"
        value={startDate}
        onChange={e => onStartChange(e.target.value)}
        className="border border-gray-200 rounded p-2 text-sm"
      />
      <span className="text-gray-400">–</span>
      <input
        type="date"
        value={endDate}
        onChange={e => onEndChange(e.target.value)}
        className="border border-gray-200 rounded p-2 text-sm"
      />
    </div>
  </div>
);

