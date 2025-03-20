// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Transactions from './pages/Transactions/Transactions';
import Accounts from './pages/Accounts/Accounts';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with sidebar layout */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
        path="/transactions"
        element={
        <PrivateRoute>
          <Layout>
            <Transactions />
          </Layout>
        </PrivateRoute>
  }
        />
        <Route 
          path="/accounts" 
          element={
            <PrivateRoute>
              <Layout>
                <Accounts />
              </Layout>
            </PrivateRoute>
          } 
        />

        {/* You can add other protected routes using the same Layout */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
