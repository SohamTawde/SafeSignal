import React, { createContext, useContext, useState, useEffect } from 'react';

const MobileThemeContext = createContext({});

export const MobileThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nirbhaya_mobile_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('nirbhaya_mobile_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'bright' : 'dark'));
  };

  const isDark = theme === 'dark';

  return (
    <MobileThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </MobileThemeContext.Provider>
  );
};

export const useMobileTheme = () => useContext(MobileThemeContext);
