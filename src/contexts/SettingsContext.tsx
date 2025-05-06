import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface Settings {
  currency: string;
}

const SettingsContext = createContext<Settings | null>(null);

export const SettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if(!token){
      setSettings(null);
      return;
    }

    setSettings(null);

    axios
      .get<Settings>("/api/users/settings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => setSettings(res.data))
      .catch(err => {
        console.error("Failed to load settings", err);
        // you could fallback to a default here, e.g. { currency: "EUR" }
        setSettings({ currency: "EUR" });
      });
  }, [token]);

  // You can render a spinner if settings are still null
  if (!settings) return <div>Loading user preferences…</div>;

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
