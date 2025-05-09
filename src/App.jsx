// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Transactions from './pages/Transactions/Transactions';
import Accounts from './pages/Accounts/Accounts';
import Budgets from './pages/Budgets/Budgets';
import RecurringExpenses from './pages/RecurringExpenses/RecurringExpenses';
import Savings from './pages/Savings/Savings';
import ExpensesPage from './pages/Expenses/Expensespage';
import SettingsPage from './pages/Settings/SettingsPage';

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
          path="/expenses"
          element={
            <PrivateRoute>
              <Layout>
                <ExpensesPage />
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
        <Route 
          path="/budgets" 
          element={
            <PrivateRoute>
              <Layout>
                <Budgets />
              </Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/recurringexpenses" 
          element={
            <PrivateRoute>
              <Layout>
                <RecurringExpenses />
              </Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/savings" 
          element={
            <PrivateRoute>
              <Layout>
                <Savings />
              </Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <Layout>
                <SettingsPage />
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
