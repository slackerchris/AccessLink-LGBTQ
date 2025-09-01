/**
 * Login Screen Component
 * User authentication login form with demo accounts
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLogin } from '../../hooks/useLogin';
import { useTheme } from '../../hooks/useTheme';

interface LoginScreenProps {
  navigation: any;
}

// Memoized Sub-components
const Header: React.FC = React.memo(() => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <Ionicons name="heart" size={60} color={colors.primary} />
      <Text style={styles.title}>🏳️‍🌈 AccessLink LGBTQ+</Text>
      <Text style={styles.subtitle}>Sign in to connect with inclusive businesses</Text>
    </View>
  );
});

const LoginForm: React.FC<{
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  authError: string | null;
  handleLogin: () => void;
}> = React.memo(({ email, setEmail, password, setPassword, loading, authError, handleLogin }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);
  return (
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
          placeholderTextColor={colors.textSecondary}
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
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {authError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{authError}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.loginButton, loading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.headerText} />
        ) : (
          <Text style={styles.loginButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

const Footer: React.FC<{ onSignUp: () => void; loading: boolean }> = React.memo(({ onSignUp, loading }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Don't have an account?</Text>
      <TouchableOpacity onPress={onSignUp} disabled={loading}>
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
});

// Main Component
export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { email, setEmail, password, setPassword, loading, authError, handleLogin } = useLogin();
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          authError={authError}
          handleLogin={handleLogin}
        />
        <Footer onSignUp={() => navigation.navigate('SignUp')} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const localStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 18,
    fontSize: 17,
    backgroundColor: colors.card,
    color: colors.text,
    minHeight: 56,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorContainer: {
    backgroundColor: colors.notification + '20',
    borderWidth: 1,
    borderColor: colors.notification,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: colors.notification,
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 64,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: colors.headerText,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 17,
    marginRight: 8,
  },
  signUpText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
