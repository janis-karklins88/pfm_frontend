// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/dashboard',    label: 'Dashboard' },
  { to: '/expenses',     label: 'Expenses' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/accounts',     label: 'Accounts' },
  { to: '/budgets',      label: 'Budgets' },
  { to: '/savings',      label: 'Savings' },
  { to: '/recurringexpenses', label: 'Auto Payments' },
];

const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="w-48 bg-white shadow p-2 flex flex-col">
      {/* Logo / Title */}
      <div className="mb-4 text-lg font-bold text-gray-900 px-2">
        Menu
      </div>

      {/* Nav Links */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`block px-2 py-1 rounded ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
