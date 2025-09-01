/**
 * Sign Up Screen Component
 * User registration form with role selection
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
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSignUp } from '../../hooks/useSignUp';
import { useTheme } from '../../hooks/useTheme';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
  onSignUpSuccess: () => void;
}

// Memoized Sub-components
const Header: React.FC = React.memo(() => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <Text style={styles.title}>🏳️‍🌈 Join AccessLink!</Text>
      <Text style={styles.subtitle}>Create your account to get started</Text>
    </View>
  );
});

const SignUpForm: React.FC<{
  formData: any;
  loading: boolean;
  authError: string | null;
  updateFormData: (field: string, value: any) => void;
  handleSignUp: () => void;
  handleGoogleSignUp: () => void;
}> = React.memo(({ formData, loading, authError, updateFormData, handleSignUp, handleGoogleSignUp }) => {
  const { createStyles, colors } = useTheme();
  const styles = createStyles(localStyles);

  const renderInput = (field: string, placeholder: string, options: any = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{placeholder} *</Text>
      <TextInput
        style={styles.input}
        value={formData[field]}
        onChangeText={(value) => updateFormData(field, value)}
        placeholder={placeholder}
        editable={!loading}
        placeholderTextColor={colors.textSecondary}
        {...options}
      />
    </View>
  );

  return (
    <View style={styles.form}>
      {renderInput('email', 'Email Address', { keyboardType: 'email-address', autoCapitalize: 'none' })}
      {renderInput('displayName', 'Display Name', { autoCapitalize: 'words' })}
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          {renderInput('firstName', 'First Name', { autoCapitalize: 'words' })}
        </View>
        <View style={[styles.inputGroup, styles.halfWidth, styles.marginLeft]}>
          {renderInput('lastName', 'Last Name', { autoCapitalize: 'words' })}
        </View>
      </View>
      {renderInput('phoneNumber', 'Phone Number', { keyboardType: 'phone-pad' })}
      {renderInput('location', 'Location', { autoCapitalize: 'words' })}
      {renderInput('password', 'Password', { secureTextEntry: true, autoCapitalize: 'none' })}
      {renderInput('confirmPassword', 'Confirm Password', { secureTextEntry: true, autoCapitalize: 'none' })}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>I'm a business owner</Text>
        <Switch
          value={formData.isBusinessOwner}
          onValueChange={(value) => updateFormData('isBusinessOwner', value)}
          disabled={loading}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.card}
        />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>I agree to the Terms of Service *</Text>
        <Switch
          value={formData.agreeToTerms}
          onValueChange={(value) => updateFormData('agreeToTerms', value)}
          disabled={loading}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.card}
        />
      </View>

      {authError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{authError}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.signUpButton, loading && styles.disabledButton]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={colors.headerText} /> : <Text style={styles.signUpButtonText}>Create Account</Text>}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={[styles.googleButton, loading && styles.disabledButton]}
        onPress={handleGoogleSignUp}
        disabled={loading}
      >
        <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.googleIcon} />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
});

const Footer: React.FC<{ onSignIn: () => void; loading: boolean }> = React.memo(({ onSignIn, loading }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Already have an account?</Text>
      <TouchableOpacity onPress={onSignIn} disabled={loading}>
        <Text style={styles.loginText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
});

// Main Component
export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigateToLogin, onSignUpSuccess }) => {
  const { formData, loading, authError, updateFormData, handleSignUp, handleGoogleSignUp, clearForm } = useSignUp(onSignUpSuccess);
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);

  const handleNavigateLogin = () => {
    clearForm();
    onNavigateToLogin();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <SignUpForm
          formData={formData}
          loading={loading}
          authError={authError}
          updateFormData={updateFormData}
          handleSignUp={handleSignUp}
          handleGoogleSignUp={handleGoogleSignUp}
        />
        <Footer onSignIn={handleNavigateLogin} loading={loading} />
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
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
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
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
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  errorContainer: {
    backgroundColor: colors.notification + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderColor: colors.notification,
    borderWidth: 1,
  },
  errorText: {
    color: colors.notification,
    fontSize: 14,
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
  },
  signUpButtonText: {
    color: colors.headerText,
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
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  loginText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
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
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
