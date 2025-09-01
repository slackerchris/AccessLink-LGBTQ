import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createOptimizedShadows } from '../utils/performanceStyles';
import { StyleSheet } from 'react-native';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryMuted: string;
  notification: string;
  notificationMuted: string;
  header: string;
  headerText: string;
  shadow: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  info: string;
  infoMuted: string;
}

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  highVisibility: boolean;
  toggleTheme: () => void;
  toggleHighVisibility: () => void;
  colors: ThemeColors;
  shadows: {
    card: any;
    button: any;
    modal: any;
    none: any;
  };
  createStyles: <T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
    stylesFactory: (colors: ThemeColors, isDarkMode: boolean) => T
  ) => T;
}

const lightTheme: ThemeColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#f1f5f9',
  primary: '#6366f1',
  primaryMuted: '#ede9fe',
  notification: '#ef4444', // red-500
  notificationMuted: '#fee2e2', // red-100
  header: '#6366f1',
  headerText: '#ffffff',
  shadow: '#000000',
  success: '#10b981', // green-500
  successMuted: '#dcfce7', // green-100
  warning: '#f59e0b', // amber-500
  warningMuted: '#fef3c7', // amber-100
  info: '#3b82f6', // blue-500
  infoMuted: '#dbeafe', // blue-100
};

const darkTheme: ThemeColors = {
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#475569',
  primary: '#818cf8',
  primaryMuted: '#4338ca', // indigo-800
  notification: '#f87171', // red-400
  notificationMuted: '#991b1b', // red-900
  header: '#1e293b',
  headerText: '#f8fafc',
  shadow: '#ffffff', // Use white shadows in dark mode for better performance
  success: '#34d399', // green-400
  successMuted: '#14532d', // green-900
  warning: '#fbbf24', // amber-400
  warningMuted: '#78350f', // amber-900
  info: '#60a5fa', // blue-400
  infoMuted: '#1e40af', // blue-900
};

// High visibility themes with enhanced contrast and larger elements
const lightHighVisibilityTheme: ThemeColors = {
  background: '#ffffff',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#000000',
  textSecondary: '#333333',
  border: '#000000',
  primary: '#0066cc',
  primaryMuted: '#cce0ff',
  notification: '#d92626',
  notificationMuted: '#ffcccc',
  header: '#0066cc',
  headerText: '#ffffff',
  shadow: '#000000',
  success: '#008000',
  successMuted: '#ccffcc',
  warning: '#ffcc00',
  warningMuted: '#ffffcc',
  info: '#007acc',
  infoMuted: '#cce5ff',
};

const darkHighVisibilityTheme: ThemeColors = {
  background: '#000000',
  surface: '#1a1a1a',
  card: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#cccccc',
  border: '#ffffff',
  primary: '#66aaff',
  primaryMuted: '#003366',
  notification: '#ff4d4d',
  notificationMuted: '#660000',
  header: '#000000',
  headerText: '#ffffff',
  shadow: '#ffffff',
  success: '#33cc33',
  successMuted: '#006600',
  warning: '#ffd633',
  warningMuted: '#665200',
  info: '#3399ff',
  infoMuted: '#004c99',
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
  const isDarkMode = theme === 'dark';

  const createStyles = useCallback(
    <T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
      stylesFactory: (colors: ThemeColors, isDarkMode: boolean) => T
    ): T => {
      return StyleSheet.create(stylesFactory(colors, isDarkMode));
    },
    [colors, isDarkMode]
  );

  const contextValue = useMemo(() => ({
    theme,
    isDarkMode,
    highVisibility,
    toggleTheme,
    toggleHighVisibility,
    colors,
    shadows,
    createStyles
  }), [theme, isDarkMode, highVisibility, colors, shadows, createStyles]);

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
