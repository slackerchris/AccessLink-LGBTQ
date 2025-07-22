import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../src/App';

// Mock modules that require native dependencies
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('@react-native-firebase/app', () => ({
  initializeApp: jest.fn(),
}));
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(),
}));
jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(),
}));
jest.mock('@react-native-firebase/storage', () => ({
  getStorage: jest.fn(),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
  });
});

describe('Accessibility Features', () => {
  it('should have proper accessibility structure', () => {
    // TODO: Add accessibility tests
    expect(true).toBe(true);
  });
});
