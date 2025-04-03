// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Header = () => {

  const navigate = useNavigate();

  // Logout handler: clear local storage and redirect to login
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      {/* Logo or App Name */}
      <div className="text-2xl font-bold text-gray-900">
        FinanceApp
      </div>

      {/* Top Navigation Actions */}
      <nav>
      <ul className="flex space-x-4">
  <li>
    <Link
      to="/settings"
      className="relative top-1 flex items-center justify-center text-gray-800 text-base hover:text-gray-600"
    >
      Settings
    </Link>
  </li>
  <li>
    <button 
    onClick={handleLogout}
    className="w-25 h-8 flex items-center justify-center bg-gray-700 text-white text-base rounded hover:bg-gray-800 active:scale-98 transition transform duration-100 ease-in-out">
      Logout
    </button>
  </li>
</ul>

      </nav>
    </header>
  );
};

export default Header;
