import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, ProgressBar } from 'react-native-paper';
import { useAuth } from '../services/auth/AuthProvider';
import { SafeAreaView } from '../components/AccessibleComponents';
import { RegistrationData } from '../types/auth';
import { validatePassword, getPasswordStrengthColor } from '../utils/passwordValidation';

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
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
    isStrong: false
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });
  const { signUp, error: authError } = useAuth();

  useEffect(() => {
    if (formData.password) {
      const strength = validatePassword(formData.password);
      setPasswordStrength(strength);
    }
  }, [formData.password]);

  const validateForm = (): boolean => {
    const errors = {
      email: '',
      password: '',
      confirmPassword: '',
      general: ''
    };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (!passwordStrength.isStrong) {
      errors.password = 'Password does not meet strength requirements';
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Terms acceptance
    if (!formData.acceptedTerms) {
      errors.general = 'You must accept the terms and conditions';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleRegistration = async () => {
    if (!validateForm()) {
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
      await signUp(registrationData.email, registrationData.password, registrationData.displayName);
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
        
        {authError && <Text style={styles.error}>{authError}</Text>}
        {formErrors.general && <Text style={styles.error}>{formErrors.general}</Text>}

        <TextInput 
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          error={!!formErrors.email}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {formErrors.email && <Text style={styles.error}>{formErrors.email}</Text>}

        <TextInput
          label="Password"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
          error={!!formErrors.password}
        />
        
        <View style={styles.passwordStrength}>
          <ProgressBar
            progress={passwordStrength.score / 5}
            color={getPasswordStrengthColor(passwordStrength.score)}
            style={styles.strengthBar}
          />
          <Text style={styles.strengthText}>
            Password Strength: {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength.score]}
          </Text>
        </View>
        
        {passwordStrength.feedback.map((feedback, index) => (
          <Text key={index} style={styles.feedback}>{feedback}</Text>
        ))}
        
        {formErrors.password && <Text style={styles.error}>{formErrors.password}</Text>}

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
  button: {
    marginBottom: 10,
    marginTop: 10,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    padding: 20,
  },
  error: {
    color: '#f13a59',
    fontSize: 12,
    marginBottom: 10,
  },
  feedback: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    marginBottom: 15,
  },
  link: {
    color: '#2196F3',
    marginTop: 15,
    textAlign: 'center',
  },
  passwordStrength: {
    marginVertical: 8,
  },
  strengthBar: {
    borderRadius: 2,
    height: 4,
  },
  strengthText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default RegistrationScreen;
