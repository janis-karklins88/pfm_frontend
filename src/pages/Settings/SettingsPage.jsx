// src/pages/Settings/SettingsPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function SettingsPage() {
  const { token, login } = useAuth();
  const { currency: currentCurrency, locale: currentLocale, refreshSettings } = useSettings();

  // Currency selection state
  const [currency, setCurrency] = useState(currentCurrency);
  const [currencySaving, setCurrencySaving] = useState(false);
  const [currencyMsg, setCurrencyMsg] = useState("");

  // Username change state
  const [username, setUsername] = useState("");
  const [usernameMsg, setUsernameMsg] = useState("");

  // Password change state
  const [passwordData, setPasswordData] = useState({
    password: "",
    newPassword: "",
    newPasswordCheck: ""
  });
  const [passwordMsg, setPasswordMsg] = useState("");

  // Categories preferences state
  const [categories, setCategories] = useState([]);

  // Fetch all categories on mount or token change
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${BASE_URL}/api/categories/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setCategories(res.data))
      .catch(err => console.error("Failed to load categories:", err));
  }, [token]);

  // Handlers
  const saveCurrency = () => {
    setCurrencySaving(true);
    axios.patch(
      `${BASE_URL}/api/users/settings/currency`,
      { currency },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        setCurrencyMsg("Currency updated");
        refreshSettings();
      })
      .catch(() => setCurrencyMsg("Failed to update currency"))
      .finally(() => setCurrencySaving(false));
  };

  const changeUsername = () => {
    axios
      .patch(
        `${BASE_URL}/api/users/change-username`,
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(res => {
        const newToken = res.data.token;
        login(newToken);
        setUsernameMsg("Username updated");
      })
      .catch(() => setUsernameMsg("Failed to update username"));
  };

  const changePassword = () => {
    // Client-side validation: ensure new passwords match
    if (passwordData.newPassword !== passwordData.newPasswordCheck) {
      setPasswordMsg("New passwords do not match");
      return;
    }

    axios
      .patch(
        `${BASE_URL}/api/users/change-password`,
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => setPasswordMsg("Password updated"))
      .catch(err => {
        // Extract meaningful message from backend
        const data = err.response?.data;
        let msg = "Password update failed";
        if (data) {
          if (typeof data === 'string') {
            msg = data;
          } else if (data.message) {
            msg = data.message;
          }
        }
        setPasswordMsg(msg);
      });
  };

  const toggleCategory = (id, active) => {
    axios
      .patch(
        `${BASE_URL}/api/categories/${id}`,
        { active: !active },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setCategories(categories.map(c =>
          c.id === id ? { ...c, active: !active } : c
        ));
      })
      .catch(err => console.error("Failed to toggle category:", err));
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="absolute -top-2 left-6 w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
      <h1 className="text-2xl font-bold text-gray-700 mb-6">Settings</h1>

      {/* Currency */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-600 mb-2">Currency</h2>
        <div className="flex items-center gap-2">
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="border border-gray-300 bg-white text-sm px-3 py-1 rounded-lg focus:ring-2 focus:ring-teal-300"
          >
            <option value="EUR">€ EUR</option>
            <option value="USD">$ USD</option>
            <option value="GBP">£ GBP</option>
          </select>
          <button
            onClick={saveCurrency}
            disabled={currencySaving}
            className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            Save
          </button>
          {currencyMsg && <span className="text-sm text-gray-500">{currencyMsg}</span>}
        </div>
      </section>

      {/* Username */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-600 mb-2">Username</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:ring-2 focus:ring-teal-300"
          />
          <button
            onClick={changeUsername}
            className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-teal-700"
          >
            Change
          </button>
          {usernameMsg && <span className="text-sm text-gray-500">{usernameMsg}</span>}
        </div>
      </section>

      {/* Password */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-600 mb-2">Password</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="password"
            placeholder="Current password"
            value={passwordData.password}
            onChange={e => setPasswordData({ ...passwordData, password: e.target.value })}
            className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:ring-2 focus:ring-teal-300"
          />
          <input
            type="password"
            placeholder="New password"
            value={passwordData.newPassword}
            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:ring-2 focus:ring-teal-300"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwordData.newPasswordCheck}
            onChange={e => setPasswordData({ ...passwordData, newPasswordCheck: e.target.value })}
            className="border border-gray-300 text-sm px-3 py-1 rounded-lg focus:ring-2 focus:ring-teal-300"
          />
          <button
            onClick={changePassword}
            className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-teal-700"
          >
            Change
          </button>
          {passwordMsg && <span className="w-full text-sm text-gray-500">{passwordMsg}</span>}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-lg font-semibold text-gray-600 mb-2">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={cat.active}
                onChange={() => toggleCategory(cat.id, cat.active)}
                className="form-checkbox h-4 w-4 text-teal-600"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
