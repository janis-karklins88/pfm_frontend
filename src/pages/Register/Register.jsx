// src/pages/Register/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/auth';

const Register = () => {
  const [username, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      await registerUser({ username, password });
      // After registration, navigate to login page
      navigate('/login', { state: { successMessage: 'Registration successful! Please log in.' } });
    } catch (err) {
        console.error('Registration error: ', err.response);
        setError(err.response?.data || 'Registration failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
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
        <div className="mb-4">
          <label className="block text-gray-700">Confirm Password</label>
          <input
            type="password"
            className="mt-1 block w-full border border-gray-300 rounded p-2 text-slate-950"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
