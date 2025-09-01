import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '../../utils/logger';
import { useTheme, ThemeColors } from '../../hooks/useTheme';

const logError = (error: Error, info: { componentStack: string }) => {
  const errorId = Math.random().toString(36).substring(2, 9);
  logger.error('Uncaught error in ErrorBoundary', {
    errorId,
    error: error.toString(),
    componentStack: info.componentStack,
  });
};

const ErrorFallbackComponent: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.notification} />
      <Text style={styles.title}>Oops! Something went wrong.</Text>
      <Text style={styles.message}>
        An unexpected error occurred. Please try again or restart the application.
      </Text>
      
      {__DEV__ && (
        <View style={styles.errorDetails}>
          <Text style={styles.errorName}>{error.name}</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={resetErrorBoundary}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallbackComponent}
      onError={logError}
    >
      {children}
    </ReactErrorBoundary>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  errorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.notification,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.headerText,
  },
});

export default ErrorBoundary;
