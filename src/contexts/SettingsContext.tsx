// src/contexts/SettingsContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface Settings {
  currency: string;
  // …add other settings here
}

interface SettingsContextType extends Settings {
  refreshSettings: () => void;
}

const defaultSettings: Settings = { currency: "EUR" };

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  // central load function
  const loadSettings = () => {
    if (!token) {
      setSettings(defaultSettings);
      return;
    }
    setLoading(true);
    axios
      .get<Settings>("/api/users/settings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setSettings(r.data))
      .catch(() => setSettings(defaultSettings))
      .finally(() => setLoading(false));
  };

  // initial & token-change fetch
  useEffect(loadSettings, [token]);

  if (loading) return <div>Loading preferences…</div>;

  return (
    <SettingsContext.Provider
      value={{ ...settings, refreshSettings: loadSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
