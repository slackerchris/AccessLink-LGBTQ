import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createOptimizedShadows } from '../utils/performanceStyles';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  highVisibility: boolean;
  toggleTheme: () => void;
  toggleHighVisibility: () => void;
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    header: string;
    headerText: string;
    shadow: string;
  };
  shadows: {
    card: any;
    button: any;
    modal: any;
    none: any;
  };
}

const lightTheme = {
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#f1f5f9',
  primary: '#6366f1',
  header: '#6366f1',
  headerText: '#ffffff',
  shadow: '#000000',
};

const darkTheme = {
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#475569',
  primary: '#818cf8',
  header: '#1e293b',
  headerText: '#f8fafc',
  shadow: '#ffffff', // Use white shadows in dark mode for better performance
};

// High visibility themes with enhanced contrast and larger elements
const lightHighVisibilityTheme = {
  background: '#ffffff',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#000000',
  textSecondary: '#333333',
  border: '#000000',
  primary: '#0066cc',
  header: '#0066cc',
  headerText: '#ffffff',
  shadow: '#000000',
};

const darkHighVisibilityTheme = {
  background: '#000000',
  surface: '#1a1a1a',
  card: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#cccccc',
  border: '#ffffff',
  primary: '#66aaff',
  header: '#000000',
  headerText: '#ffffff',
  shadow: '#ffffff',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [highVisibility, setHighVisibility] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedTheme, savedHighVisibility] = await Promise.all([
        AsyncStorage.getItem('theme'),
        AsyncStorage.getItem('highVisibility')
      ]);
      
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      }
      
      if (savedHighVisibility !== null) {
        setHighVisibility(JSON.parse(savedHighVisibility));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const saveHighVisibility = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('highVisibility', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving high visibility setting:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // Save asynchronously without blocking UI
    saveTheme(newTheme);
  };

  const toggleHighVisibility = () => {
    const newValue = !highVisibility;
    setHighVisibility(newValue);
    // Save asynchronously without blocking UI
    saveHighVisibility(newValue);
  };

  const getColors = () => {
    if (highVisibility) {
      return theme === 'light' ? lightHighVisibilityTheme : darkHighVisibilityTheme;
    }
    return theme === 'light' ? lightTheme : darkTheme;
  };

  const colors = useMemo(() => getColors(), [theme, highVisibility]);
  const shadows = useMemo(() => createOptimizedShadows(theme), [theme]);

  const contextValue = useMemo(() => ({
    theme,
    highVisibility,
    toggleTheme,
    toggleHighVisibility,
    colors,
    shadows
  }), [theme, highVisibility, colors, shadows]);

  return React.createElement(
    ThemeContext.Provider,
    { value: contextValue },
    children
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
