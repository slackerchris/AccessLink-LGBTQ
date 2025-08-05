/**
 * Performance-optimized styles for dark theme
 * Reduces shadow complexity in dark mode to improve rendering performance
 */

import { Theme } from '../hooks/useTheme';

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export const getOptimizedShadow = (
  theme: Theme,
  intensity: 'light' | 'medium' | 'heavy' = 'medium'
): ShadowStyle => {
  if (theme === 'dark') {
    // Reduced shadows in dark mode for better performance
    const shadows = {
      light: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 1,
        elevation: 1,
      },
      medium: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 2,
      },
      heavy: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
      },
    };
    return shadows[intensity];
  }

  // Standard shadows for light mode
  const shadows = {
    light: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 3,
    },
    heavy: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
    },
  };
  return shadows[intensity];
};

// Pre-computed shadow styles for common use cases
export const createOptimizedShadows = (theme: Theme) => ({
  card: getOptimizedShadow(theme, 'light'),
  button: getOptimizedShadow(theme, 'medium'),
  modal: getOptimizedShadow(theme, 'heavy'),
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
});
