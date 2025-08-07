/**
 * Sign Up Screen Component
 * User registration form with role selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth as useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
  onSignUpSuccess: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onNavigateToLogin,
  onSignUpSuccess
}) => {
  const { colors } = useTheme();
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
    agreeToTerms: false
  });

  const { loading, register, loginWithGoogle, error } = useFirebaseAuth();

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    try {
      const role = formData.isBusinessOwner ? 'business_owner' : 'user';

      await register(
        formData.email.trim(),
        formData.password,
        formData.displayName.trim(),
        role
      );

      Alert.alert(
        'Registration Successful!',
        'Please check your email to verify your account. You can start using the app right away.',
        [{ text: 'OK', onPress: onSignUpSuccess }]
      );
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'An error occurred during registration');
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await loginWithGoogle();
      // User will be redirected based on their account type
      Alert.alert(
        'Welcome!',
        'Your account has been set up successfully with Google. You can complete your profile anytime.',
        [{ text: 'OK', onPress: onSignUpSuccess }]
      );
    } catch (error: any) {
      console.error('Google sign-up error:', error);
      Alert.alert('Google Sign-Up Failed', error.message || 'Failed to sign up with Google');
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
      agreeToTerms: false
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🏳️‍🌈 Join AccessLink!</Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.displayName}
              onChangeText={(value) => updateFormData('displayName', value)}
              placeholder="How you'd like to be known"
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="First name"
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth, styles.marginLeft]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Last name"
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              onChangeText={(value) => updateFormData('phoneNumber', value)}
              placeholder="Your phone number"
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(value) => updateFormData('location', value)}
              placeholder="City, State"
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Create a password (min 6 characters)"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="Confirm your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>I'm a business owner</Text>
            <Switch
              value={formData.isBusinessOwner}
              onValueChange={(value) => updateFormData('isBusinessOwner', value)}
              disabled={loading}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>I agree to the Terms of Service *</Text>
            <Switch
              value={formData.agreeToTerms}
              onValueChange={(value) => updateFormData('agreeToTerms', value)}
              disabled={loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Google Sign-Up Button */}
          <TouchableOpacity
            style={[styles.googleButton, loading && styles.disabledButton]}
            onPress={handleGoogleSignUp}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>
              {loading ? 'Signing Up...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => {
              clearForm();
              onNavigateToLogin();
            }}
            disabled={loading}
          >
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40, // Increased for mobile
    marginTop: 30, // Increased for safe area
  },
  title: {
    fontSize: 32, // Larger for mobile impact
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12, // Increased spacing
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18, // Larger for mobile readability
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  halfWidth: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    marginRight: 8,
  },
  loginText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    minHeight: 48,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dadce0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
  },
});
