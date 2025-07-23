import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../services/auth/AuthProvider';
import { SafeAreaView } from '../components/AccessibleComponents';
import { LoginCredentials } from '../types/auth';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const credentials: LoginCredentials = { email, password };
      await signIn(credentials.email, credentials.password);
    } catch (err) {
      // Error is handled by AuthProvider
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        
        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          accessibilityLabel="Email input field"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          accessibilityLabel="Password input field"
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          accessibilityLabel="Login button"
        >
          Login
        </Button>

        <Button
          mode="text"
          onPress={() => {/* Navigate to registration */}}
          style={styles.link}
          accessibilityLabel="Create account button"
        >
          Create Account
        </Button>

        <Button
          mode="text"
          onPress={() => {/* Navigate to password reset */}}
          style={styles.link}
          accessibilityLabel="Forgot password button"
        >
          Forgot Password?
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  link: {
    marginVertical: 8,
  },
  error: {
    color: '#B00020',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default LoginScreen;
