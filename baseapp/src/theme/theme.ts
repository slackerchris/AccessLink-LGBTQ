/**
 * Theme configuration for the AccessLink app
 */

export const colors = {
  // Primary colors
  primary: '#6a0dad', // Purple - main brand color
  secondary: '#f8f8f8', // Light gray - background color
  
  // Accent colors
  accent1: '#e74c3c', // Red - for alerts, emergencies
  accent2: '#3498db', // Blue - for information
  accent3: '#2ecc71', // Green - for success
  
  // Text colors
  textDark: '#333333',
  textMedium: '#666666',
  textLight: '#999999',
  
  // Backgrounds
  backgroundPrimary: '#ffffff',
  backgroundSecondary: '#f8f8f8',
  
  // UI elements
  border: '#e0e0e0',
  divider: '#f0f0f0',
  
  // Status colors
  success: '#2ecc71',
  warning: '#f39c12',
  error: '#e74c3c',
  info: '#3498db',
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  tiny: 10,
  small: 12,
  regular: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24,
  xxxlarge: 28,
  huge: 32,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
};

export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 20,
  round: 100, // For circular elements
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
};

export default {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
};
