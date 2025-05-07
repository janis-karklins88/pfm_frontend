import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface Settings {
  currency: string;
}

const SettingsContext = createContext<Settings | null>(null);

export const SettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {

  const { token } = useAuth();
  const defaultSettings: Settings = { currency: "EUR" };
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(false);
  

  useEffect(() => {
    if(!token){
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    setLoading(true);

    axios
      .get<Settings>("/api/users/settings", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setSettings(res.data))
      .catch(err => {
        console.error("Failed to load settings", err);
        setSettings(defaultSettings);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // You can render a spinner if settings are still null
  if (loading) return <div>Loading user preferences…</div>;

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
