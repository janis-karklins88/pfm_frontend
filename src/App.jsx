// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard/Dashboard'; // Create this page as needed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element = {<PrivateRoute><Dashboard/></PrivateRoute> } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;

//temp removal <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />