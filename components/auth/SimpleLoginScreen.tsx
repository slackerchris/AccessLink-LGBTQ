/**
 * Simple Login Screen Component
 * Clean login form with backend-driven redirection
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
import { useAuth, useAuthActions } from '../../hooks/useWebAuth';
import { useTheme } from '../../hooks/useTheme';

interface SimpleLoginScreenProps {
  navigation: any;
}

export const SimpleLoginScreen: React.FC<SimpleLoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading } = useAuth();
  const { signIn } = useAuthActions();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await signIn(email.trim(), password);
      // Backend handles redirection based on user role
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  const quickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="heart" size={60} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>AccessLink LGBTQ+</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email or Username</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email or username"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              accessibilityLabel="Email or username"
              accessibilityHint="Enter your email address or username to sign in"
              textContentType="emailAddress"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              accessibilityLabel="Password"
              accessibilityHint="Enter your password to sign in"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            accessibilityHint="Tap to sign in to your account"
            accessibilityState={{ disabled: loading }}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16, // Increased for better touch target
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 48, // Ensure adequate touch target
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16, // Increased for better touch target
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 48, // Ensure adequate touch target
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signUpText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  credentialsInfo: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  credentialsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  credentialsText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 2,
  },
  demoSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  businessSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  demoButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  demoButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
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
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
