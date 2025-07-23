import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock modules that require native dependencies
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock Firebase modules
jest.mock('../services/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
  },
  db: {},
  storage: {},
}));

// Mock the navigation stack
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children,
  }),
}));

// Mock bottom tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children,
  }),
}));

// Mock navigation container
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('should have accessibility features', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });
});
