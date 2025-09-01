import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useFirebaseAuth';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, signIn, error: authError, clearError } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return false;
    }

    clearError();
    try {
      await signIn(email.trim(), password);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      Alert.alert('Login Failed', errorMessage);
      return false;
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    authError,
    handleLogin,
  };
};
