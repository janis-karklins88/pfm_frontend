// src/pages/Dashboard/Dashboard.jsx
import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="font-bold text-black">Dashboard</h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl text-slate-950 font-semibold">Total Income</h2>
          <p className="text-2xl text-slate-950">$0.00</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl text-slate-950 font-semibold">Total Expenses</h2>
          <p className="text-2xl text-slate-950">$0.00</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
