// src/contexts/AuthContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
  } from "react";
  
  interface AuthContextType {
    token: string | null;
    login: (newToken: string) => void;
    logout: () => void;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Initialize from localStorage (so page reload preserves login)
    const [token, setToken] = useState<string | null>(
      () => localStorage.getItem("token")
    );
  
    // Whenever token state changes, mirror it to localStorage
    useEffect(() => {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    }, [token]);
  
    const login = (newToken: string) => {
      setToken(newToken);
    };
  
    const logout = () => {
      setToken(null);
    };
  
    return (
      <AuthContext.Provider value={{ token, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  // Custom hook for consuming the context
  export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
  };
  