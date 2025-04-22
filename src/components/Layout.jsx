// src/components/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => (
  <>
    {/* Fixed Sidebar */}
    <Sidebar className="fixed top-0 left-0 h-screen" />

    {/* Main Content Area */}
    <main className="fixed top-0 left-52 right-0 bottom-0 overflow-auto p-6 bg-gray-100">
      {children}
    </main>
  </>
);

export default Layout;