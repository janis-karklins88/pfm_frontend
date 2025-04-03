// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/users/login`;
      const credentials = {
        username: username, // use the username state
        password: password, // use the password state
      };
  
      const response = await axios.post(url, credentials);
      // response.data is expected to be something like "Bearer <token>"
      const rawToken = response.data;
      // Remove the "Bearer " prefix if it exists
      const token = rawToken.startsWith('Bearer ') ? rawToken.substring(7) : rawToken;
  
      // Store the token and the username in local storage
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
  
      // Navigate to dashboard or another protected route after successful login
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please check your credentials and try again.');
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen w-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded p-2 text-slate-950"
            value={username}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            className="mt-1 block w-full border border-gray-300 rounded p-2 text-slate-950"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800 active:scale-98 transition transform duration-100 ease-in-out"
        >
          Login
        </button>
      </form>
      
    </div>
  );
};

export default Login;
