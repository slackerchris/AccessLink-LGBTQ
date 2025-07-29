import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = Math.random().toString(36).substring(2, 9);
    this.setState({ errorId });

    logger.error('Uncaught error in ErrorBoundary', {
      errorId,
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    // This is a simple reset. In a real app, you might want to navigate
    // the user away or try to reload resources.
    this.setState({ hasError: false, errorId: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong.</Text>
          <Text style={styles.message}>
            An unexpected error occurred. Please try again.
          </Text>
          {this.state.errorId && (
            <Text style={styles.errorId}>Error ID: {this.state.errorId}</Text>
          )}
          <Button title="Try Again" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fef2f2',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#b91c1c',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#dc2626',
    marginBottom: 20,
  },
  errorId: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 20,
  },
});

export default ErrorBoundary;
