// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow p-4">
      {/* You can include a mini logo or title here as well */}
      <div className="mb-6 text-xl font-bold text-gray-900">
        Menu
      </div>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link to="/dashboard" className="block text-gray-800 hover:text-gray-600">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/transactions" className="block text-gray-800 hover:text-gray-600">
              Transactions
            </Link>
          </li>
          <li>
            <Link to="/accounts" className="block text-gray-800 hover:text-gray-600">
              Accounts
            </Link>
          </li>
          {/* Add more navigation items as needed */}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
