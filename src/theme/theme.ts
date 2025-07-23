import { DefaultTheme } from 'react-native-paper';

// WCAG AA compliant color palette
export const colors = {
  // Primary colors - LGBTQ+ inclusive
  primary: '#6366F1', // Indigo - main brand color
  primaryLight: '#8B87FF',
  primaryDark: '#4F46E5',
  
  // Secondary colors
  secondary: '#EC4899', // Pink - pride accent
  secondaryLight: '#F472B6',
  secondaryDark: '#DB2777',
  
  // Neutral colors - high contrast for accessibility
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceVariant: '#F1F5F9',
  outline: '#CBD5E1',
  outlineVariant: '#E2E8F0',
  
  // Text colors - WCAG AAA compliant
  onBackground: '#0F172A',
  onSurface: '#1E293B',
  onSurfaceVariant: '#475569',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  
  // Status colors
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',
  
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  
  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',
  
  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
  
  // Accessibility specific colors
  focus: '#2563EB', // Focus indicator
  disabled: '#9CA3AF',
  disabledBackground: '#F3F4F6',
  
  // High contrast mode colors
  highContrast: {
    background: '#000000',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    border: '#FFFFFF',
  },
  
  // Pride colors (optional decorative use)
  pride: {
    red: '#E40303',
    orange: '#FF8C00',
    yellow: '#FFED00',
    green: '#008018',
    blue: '#004CFF',
    purple: '#732982',
  },
};

// Typography scale - accessible font sizes
export const typography = {
  fontFamily: {
    regular: 'System', // Will use system font for best accessibility
    medium: 'System',
    bold: 'System',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16, // Base font size for optimal readability
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 28,
    xxl: 32,
    xxxl: 36,
    display: 40,
  },
  
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadows (minimal for accessibility)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Accessibility constants
export const accessibility = {
  minimumTouchTarget: 44, // iOS Human Interface Guidelines
  focusOutlineWidth: 2,
  animationDuration: 200, // For reduced motion
  highContrastBorderWidth: 2,
};

// React Native Paper theme
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    background: colors.background,
    error: colors.error,
    errorContainer: colors.errorLight,
    onPrimary: colors.onPrimary,
    onSecondary: colors.onSecondary,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    onBackground: colors.onBackground,
    outline: colors.outline,
    outlineVariant: colors.outlineVariant,
  },
  fonts: {
    ...DefaultTheme.fonts,
    bodyLarge: {
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.lg,
      fontWeight: typography.fontWeight.normal,
    },
    bodyMedium: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.base,
      fontWeight: typography.fontWeight.normal,
    },
    bodySmall: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.sm,
      fontWeight: typography.fontWeight.normal,
    },
    headlineLarge: {
      fontSize: typography.fontSize.display,
      lineHeight: typography.lineHeight.display,
      fontWeight: typography.fontWeight.bold,
    },
    headlineMedium: {
      fontSize: typography.fontSize.xxxl,
      lineHeight: typography.lineHeight.xxxl,
      fontWeight: typography.fontWeight.bold,
    },
    headlineSmall: {
      fontSize: typography.fontSize.xxl,
      lineHeight: typography.lineHeight.xxl,
      fontWeight: typography.fontWeight.bold,
    },
    titleLarge: {
      fontSize: typography.fontSize.xl,
      lineHeight: typography.lineHeight.xl,
      fontWeight: typography.fontWeight.semibold,
    },
    titleMedium: {
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.lg,
      fontWeight: typography.fontWeight.semibold,
    },
    titleSmall: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.base,
      fontWeight: typography.fontWeight.semibold,
    },
  },
};

// High contrast theme for accessibility
export const highContrastTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    ...colors.highContrast,
    primary: colors.highContrast.text,
    onPrimary: colors.highContrast.background,
    surface: colors.highContrast.surface,
    onSurface: colors.highContrast.text,
    background: colors.highContrast.background,
    onBackground: colors.highContrast.text,
    outline: colors.highContrast.border,
  },
};
