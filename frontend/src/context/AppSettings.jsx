import React, { createContext, useContext, useState } from 'react';

// Context for application settings
const AppSettingsContext = createContext();

export const useAppSettings = () => {
  return useContext(AppSettingsContext);
};

// Alias for compatibility with components using useSettings
export const useSettings = useAppSettings;

export const AppSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    showNotifications: true,
  });

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

// Alias for compatibility with components using SettingsProvider
export const SettingsProvider = AppSettingsProvider;

export default AppSettingsContext;