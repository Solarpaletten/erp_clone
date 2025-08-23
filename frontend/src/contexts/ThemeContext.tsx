import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'auto';
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  currentMode: ThemeMode;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [currentMode, setCurrentMode] = useState<ThemeMode>('light');

  // 🌙 AUTO DARK MODE: после 18:00 или при усталости
  const getAutoTheme = (): ThemeMode => {
    const hour = new Date().getHours();
    const isEvening = hour >= 18 || hour <= 6; // 18:00 - 06:00
    
    // 💡 БУДУЩАЯ ФУНКЦИЯ: определение усталости по активности
    // const isUserTired = detectUserFatigue();
    
    return isEvening ? 'dark' : 'light';
  };

  useEffect(() => {
    // 💾 Загружаем сохраненную тему
    const savedTheme = localStorage.getItem('accountantTheme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // 🌙 По умолчанию auto (забота о глазах)
      setTheme('auto');
    }
  }, []);

  useEffect(() => {
    // 🎨 Определяем текущий режим
    let mode: ThemeMode;
    
    if (theme === 'auto') {
      mode = getAutoTheme();
    } else {
      mode = theme as ThemeMode;
    }
    
    setCurrentMode(mode);
    
    // 💾 Сохраняем в localStorage
    localStorage.setItem('accountantTheme', theme);
    
    // 🎨 Применяем CSS класс
    document.documentElement.className = mode === 'dark' ? 'dark-theme' : 'light-theme';
    
    console.log('🎨 Theme applied:', { theme, mode, time: new Date().getHours() });
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme(currentMode === 'dark' ? 'light' : 'dark');
  };

  const value = {
    theme,
    currentMode,
    setTheme: handleSetTheme,
    toggleTheme,
    isDarkMode: currentMode === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
