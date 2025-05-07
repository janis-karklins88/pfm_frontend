// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from  "../contexts/AuthContext";
import { NavLink, useNavigate } from 'react-router-dom';
import {
  GridIcon,
  DollarSign,
  List,
  Calendar,
  ShoppingCart,
  BarChart2,
  Settings,
  LogOut,
  User,
  PiggyBank,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',        label: 'Overview',     icon: GridIcon },
  { to: '/expenses',         label: 'Expenses',     icon: ShoppingCart },
  { to: '/transactions',     label: 'Transactions', icon: List },
  { to: '/accounts',         label: 'Accounts',     icon: DollarSign },
  { to: '/recurringexpenses', label: 'Auto Payments', icon: Calendar },
  { to: '/budgets',          label: 'Budgets',      icon: BarChart2 },
  { to: '/savings',          label: 'Savings',      icon: PiggyBank },
  { to: '/settings',         label: 'Settings',     icon: Settings },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const { token } = useAuth();

  const { logout } = useAuth();

  useEffect(() => {
    if (token) {
      fetch('/api/users/name', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.text() : Promise.reject('Fetch username failed'))
        .then(name => setUsername(name))
        .catch(err => console.error(err));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <aside className="flex flex-col h-screen justify-between bg-[#151925] text-gray-300 w-52 p-3">
      {/* Top: Logo + Nav */}
      <div>
        <div className="mb-6 px-2">
          <span className="text-xl font-bold text-white">FinanceManager</span>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200
                    ${isActive ? 'bg-teal-500 text-white' : 'hover:bg-gray-700 hover:text-white'}`
                  }
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Bottom: Logout + Profile */}
      <div className="px-2">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 mb-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm">Logout</span>
        </button>
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition-colors">
          <User size={20} />
          <p className="text-sm font-semibold text-white truncate">{username || 'Loading...'}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;