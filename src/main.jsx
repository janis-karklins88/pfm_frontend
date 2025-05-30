import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SettingsProvider } from './contexts/SettingsContext'
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <SettingsProvider>
    <App />
    </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
)
