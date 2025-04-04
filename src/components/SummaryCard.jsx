import React from 'react';

const SummaryCard = ({ title, value, formatCurrency }) => {
  return (
    <div className="bg-white shadow-md rounded p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-2xl font-bold">{formatCurrency(value)}</p>
    </div>
  );
};

export default SummaryCard;
