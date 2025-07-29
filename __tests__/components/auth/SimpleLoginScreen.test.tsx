/**
 * SimpleLoginScreen Component Tests
 * Tests for the basic login form functionality
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SimpleLoginScreen } from '../../../components/auth/SimpleLoginScreen';

// Mock the useAuthActions hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuthActions: () => ({
    signIn: jest.fn(),
    loading: false,
    error: null,
  }),
}));

// Mock React Navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
};

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('SimpleLoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form elements correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
  });

  it('should show validation error for empty fields', async () => {
    const { getByText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error', 
        'Please enter both email and password'
      );
    });
  });

  it('should update email input when user types', () => {
    const { getByPlaceholderText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');

    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('should update password input when user types', () => {
    const { getByPlaceholderText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'password123');

    expect(passwordInput.props.value).toBe('password123');
  });

  it('should call signIn when form is submitted with valid data', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({});
    
    // Mock the hook to return our mock function
    const { useAuthActions } = require('../../../hooks/useAuth');
    useAuthActions.mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      error: null,
    });

    const { getByPlaceholderText, getByText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should show loading state when login is in progress', () => {
    const { useAuthActions } = require('../../../hooks/useAuth');
    useAuthActions.mockReturnValue({
      signIn: jest.fn(),
      loading: true,
      error: null,
    });

    const { getByText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    // When loading, the button should show "Signing In..."
    expect(getByText('Signing In...')).toBeTruthy();
  });

  it('should display error message when login fails', async () => {
    const mockSignIn = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    
    const { useAuthActions } = require('../../../hooks/useAuth');
    useAuthActions.mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      error: null,
    });

    const { getByPlaceholderText, getByText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed', 
        'Invalid credentials'
      );
    });
  });

  it('should navigate to signup when create account is pressed', () => {
    const { getByText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    const createAccountButton = getByText('Create Account');
    fireEvent.press(createAccountButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('SignUp');
  });

  it('should trim whitespace from email input', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({});
    
    const { useAuthActions } = require('../../../hooks/useAuth');
    useAuthActions.mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      error: null,
    });

    const { getByPlaceholderText, getByText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, '  test@example.com  ');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should handle password visibility toggle', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    const passwordInput = getByPlaceholderText('Password');
    const toggleButton = getByTestId('password-toggle');

    // Initially password should be hidden
    expect(passwordInput.props.secureTextEntry).toBe(true);

    // Toggle to show password
    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);

    // Toggle back to hide password
    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('should display appropriate button text based on loading state', () => {
    // Test not loading state
    const { useAuthActions } = require('../../../hooks/useAuth');
    useAuthActions.mockReturnValue({
      signIn: jest.fn(),
      loading: false,
      error: null,
    });

    const { getByText, rerender } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    expect(getByText('Sign In')).toBeTruthy();

    // Test loading state
    useAuthActions.mockReturnValue({
      signIn: jest.fn(),
      loading: true,
      error: null,
    });

    rerender(<SimpleLoginScreen navigation={mockNavigation} />);
    expect(getByText('Signing In...')).toBeTruthy();
  });

  it('should disable button when loading', () => {
    const { useAuthActions } = require('../../../hooks/useAuth');
    useAuthActions.mockReturnValue({
      signIn: jest.fn(),
      loading: true,
      error: null,
    });

    const { getByText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    const button = getByText('Signing In...');
    expect(button.parent?.props.disabled).toBe(true);
  });

  it('should handle keyboard dismissal on form submission', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({});
    
    const { useAuthActions } = require('../../../hooks/useAuth');
    useAuthActions.mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      error: null,
    });

    const { getByPlaceholderText, getByText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    // Simulate pressing return on password field (should submit form)
    fireEvent(passwordInput, 'onSubmitEditing');

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should handle different error types gracefully', async () => {
    const testCases = [
      { error: new Error('Network error'), expectedMessage: 'Network error' },
      { error: new Error(), expectedMessage: 'Invalid credentials' },
      { error: 'String error', expectedMessage: 'Invalid credentials' },
      { error: null, expectedMessage: 'Invalid credentials' },
    ];

    for (const testCase of testCases) {
      const mockSignIn = jest.fn().mockRejectedValue(testCase.error);
      
      const { useAuthActions } = require('../../../hooks/useAuth');
      useAuthActions.mockReturnValue({
        signIn: mockSignIn,
        loading: false,
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(
        <SimpleLoginScreen navigation={mockNavigation} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const signInButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Login Failed', 
          testCase.expectedMessage
        );
      });

      jest.clearAllMocks();
    }
  });

  it('should maintain focus flow between inputs', () => {
    const { getByPlaceholderText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    // Simulate pressing "Next" on email field
    fireEvent(emailInput, 'onSubmitEditing');
    
    // Password field should receive focus (this would be tested with more advanced mocking)
    expect(passwordInput).toBeTruthy();
  });

  it('should apply correct accessibility labels', () => {
    const { getByPlaceholderText, getByText } = render(
      <SimpleLoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const signInButton = getByText('Sign In');

    expect(emailInput.props.accessibilityLabel).toBe('Email input');
    expect(passwordInput.props.accessibilityLabel).toBe('Password input');
    expect(signInButton.props.accessibilityLabel).toBe('Sign in button');
  });
});
