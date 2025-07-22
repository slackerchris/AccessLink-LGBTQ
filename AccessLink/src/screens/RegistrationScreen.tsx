import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../services/auth/AuthProvider';
import { SafeAreaView } from '../components/AccessibleComponents';
import { RegistrationData } from '../types/auth';

export const RegistrationScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'user' as const,
    acceptedTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register, error } = useAuth();

  const handleRegistration = async () => {
    if (formData.password !== formData.confirmPassword) {
      // Handle password mismatch
      return;
    }

    setIsLoading(true);
    try {
      const registrationData: RegistrationData = {
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        role: formData.role,
        acceptedTerms: formData.acceptedTerms,
      };
      await register(registrationData);
    } catch (err) {
      // Error is handled by AuthProvider
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        
        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          label="Display Name"
          value={formData.displayName}
          onChangeText={(text) => setFormData({ ...formData, displayName: text })}
          style={styles.input}
          accessibilityLabel="Display name input field"
        />

        <TextInput
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          accessibilityLabel="Email input field"
        />

        <TextInput
          label="Password"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
          style={styles.input}
          accessibilityLabel="Password input field"
        />

        <TextInput
          label="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry
          style={styles.input}
          accessibilityLabel="Confirm password input field"
        />

        <Button
          mode="contained"
          onPress={handleRegistration}
          loading={isLoading}
          disabled={isLoading || !formData.acceptedTerms}
          style={styles.button}
          accessibilityLabel="Register button"
        >
          Register
        </Button>

        <Button
          mode="text"
          onPress={() => {/* Navigate to login */}}
          style={styles.link}
          accessibilityLabel="Back to login button"
        >
          Already have an account? Login
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

export default RegistrationScreen;
