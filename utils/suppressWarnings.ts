/**
 * Utility to suppress known React Native warnings that come from third-party libraries
 */

import { LogBox } from 'react-native';

export const suppressKnownWarnings = () => {
  // Suppress the pointerEvents deprecation warning that comes from React Native Paper
  // and other third-party libraries that haven't been updated yet
  LogBox.ignoreLogs([
    'props.pointerEvents is deprecated. Use style.pointerEvents',
    // Add other known warnings that come from libraries here
    'Warning: componentWillReceiveProps has been renamed',
    'Warning: componentWillMount has been renamed',
    'Require cycle:', // Common in some navigation libraries
  ]);
};

// Alternative: More specific warning suppression
export const suppressPointerEventsWarning = () => {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('props.pointerEvents is deprecated')) {
      // Skip this warning
      return;
    }
    originalWarn.apply(console, args);
  };
};
