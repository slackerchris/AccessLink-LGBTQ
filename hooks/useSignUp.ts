import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useFirebaseAuth';

export const useSignUp = (onSignUpSuccess: () => void) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    location: '',
    isBusinessOwner: false,
    agreeToTerms: false,
  });

  const { loading, signUp, signInWithGoogle, error: authError, clearError } = useAuth();

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.displayName.trim()) return 'Display name is required';
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.agreeToTerms) return 'You must agree to the terms of service';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';

    return null;
  };

  const handleSignUp = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    clearError();
    try {
      const role = formData.isBusinessOwner ? 'business_owner' : 'user';
      await signUp(
        formData.email.trim(),
        formData.password,
        formData.displayName.trim(),
        role
      );
      Alert.alert(
        'Registration Successful!',
        'Please check your email to verify your account.',
        [{ text: 'OK', onPress: onSignUpSuccess }]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during registration';
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  const handleGoogleSignUp = async () => {
    clearError();
    try {
      await signInWithGoogle();
      Alert.alert(
        'Welcome!',
        'Your account has been set up successfully with Google.',
        [{ text: 'OK', onPress: onSignUpSuccess }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up with Google';
      Alert.alert('Google Sign-Up Failed', errorMessage);
    }
  };

  const clearForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      location: '',
      isBusinessOwner: false,
      agreeToTerms: false,
    });
  };

  return {
    formData,
    loading,
    authError,
    updateFormData,
    handleSignUp,
    handleGoogleSignUp,
    clearForm,
  };
};
