/**
 * Login Screen Component
 * User authentication login form with demo accounts
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
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAuthActions } from '../../hooks/useFirebaseAuth';

// Using webAuth to connect to IndexedDB database

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { loading } = useAuth();
  const { signIn } = useAuthActions();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoginError(''); // Clear previous errors
    try {
      await signIn(email.trim(), password);
      // Navigation will be handled automatically by the App component
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setLoginError(errorMessage);
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const quickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="heart" size={60} color="#6366f1" />
          <Text style={styles.title}>🏳️‍🌈 AccessLink LGBTQ+</Text>
          <Text style={styles.subtitle}>Sign in to connect with inclusive businesses</Text>
        </View>

        {/* Demo Accounts Section */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Quick Demo Login:</Text>
          <View style={styles.demoButtons}>
            <TouchableOpacity 
              style={[styles.demoButton, styles.adminButton]} 
              onPress={() => quickLogin('admin', 'accesslink1234')}
            >
              <Text style={styles.demoButtonText}>👑 Admin Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.demoButton, styles.userButton]} 
              onPress={() => quickLogin('user@example.com', 'password123')}
            >
              <Text style={styles.demoButtonText}>👤 User Login</Text>
            </TouchableOpacity>
            
            {/* Business Login Section */}
            <Text style={styles.businessSectionTitle}>📋 Business Login Options:</Text>
            <TouchableOpacity 
              style={[styles.demoButton, styles.businessButton]} 
              onPress={() => quickLogin('business@example.com', 'password123')}
            >
              <Text style={styles.demoButtonText}>☕ Rainbow Café</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.demoButton, styles.businessButton]} 
              onPress={() => quickLogin('owner@pridehealth.com', 'password123')}
            >
              <Text style={styles.demoButtonText}>🏥 Pride Health</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.demoButton, styles.businessButton]} 
              onPress={() => quickLogin('owner@pridefitness.com', 'password123')}
            >
              <Text style={styles.demoButtonText}>💪 Pride Fitness</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.demoButton, styles.businessButton]} 
              onPress={() => quickLogin('hello@inclusivebooks.com', 'password123')}
            >
              <Text style={styles.demoButtonText}>📚 Inclusive Books</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Username</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email or username"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {loginError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{loginError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            disabled={loading}
          >
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Credentials Info */}
        <View style={styles.credentialsInfo}>
          <Text style={styles.credentialsTitle}>Demo Credentials:</Text>
          <Text style={styles.credentialsText}>Admin: admin / accesslink1234</Text>
          <Text style={styles.credentialsText}>Admin2: admin@accesslinklgbtq.app / admin123</Text>
          <Text style={styles.credentialsText}>User: user@example.com / password123</Text>
          <Text style={styles.credentialsText}>Business: business@example.com / password123</Text>
          <Text style={styles.credentialsText}>Health Center: owner@pridehealth.com / password123</Text>
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
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40, // Increased for mobile
    paddingTop: 20, // Safe area spacing
  },
  title: {
    fontSize: 32, // Larger for mobile impact
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20, // Increased spacing
    textAlign: 'center',
    lineHeight: 40, // Better line height
  },
  subtitle: {
    fontSize: 18, // Larger for mobile readability
    color: '#6b7280',
    marginTop: 12, // Increased spacing
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10, // Prevent text from touching edges
  },
  demoSection: {
    marginBottom: 30, // Increased spacing
  },
  demoTitle: {
    fontSize: 20, // Larger for mobile
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20, // Increased spacing
  },
  businessSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  demoButtons: {
    flexDirection: 'column', // Stack vertically on mobile for better touch targets
    gap: 12, // Vertical gap between buttons
  },
  demoButton: {
    paddingVertical: 16, // Larger touch target
    paddingHorizontal: 20,
    borderRadius: 12, // More rounded for modern feel
    alignItems: 'center',
    minHeight: 56, // Ensure good touch target
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  adminButton: {
    backgroundColor: '#6366f1',
  },
  userButton: {
    backgroundColor: '#10b981',
  },
  businessButton: {
    backgroundColor: '#f59e0b',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16, // Larger for mobile
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30, // Increased spacing
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    color: '#6b7280',
    paddingHorizontal: 20, // Increased padding
    fontSize: 16, // Larger for mobile
    fontWeight: '500',
  },
  form: {
    marginBottom: 40, // Increased spacing
  },
  inputGroup: {
    marginBottom: 24, // Increased spacing
  },
  label: {
    fontSize: 18, // Larger for mobile
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12, // Increased spacing
  },
  input: {
    borderWidth: 2, // Thicker border for better visibility
    borderColor: '#d1d5db',
    borderRadius: 12, // More rounded
    padding: 18, // Larger touch target
    fontSize: 17, // Better mobile font size
    backgroundColor: '#fff',
    color: '#1f2937',
    minHeight: 56, // Ensure good touch target
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12, // More rounded
    paddingVertical: 20, // Larger touch target
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20, // Increased spacing
    minHeight: 64, // Ensure excellent touch target
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0.1, // Reduced shadow when disabled
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18, // Larger for mobile
    fontWeight: '700', // Bolder text
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // Increased spacing
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 17, // Larger for mobile
    marginRight: 8, // Increased spacing
  },
  signUpText: {
    color: '#6366f1',
    fontSize: 17, // Larger for mobile
    fontWeight: '700', // Bolder text
    textDecorationLine: 'underline', // Visual cue for link
  },
  credentialsInfo: {
    backgroundColor: '#f8f9fa', // Slightly different color for better contrast
    padding: 20, // Increased padding
    borderRadius: 12, // More rounded
    marginTop: 20, // Increased spacing
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  credentialsTitle: {
    fontSize: 16, // Larger for mobile
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12, // Increased spacing
    textAlign: 'center',
  },
  credentialsText: {
    fontSize: 14, // Larger for mobile readability
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', // Better font handling
    marginBottom: 4, // Increased spacing
    lineHeight: 20, // Better line height
  },
});
