import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppNavigator } from './navigation/AppNavigator';
import { AccessibilityProvider } from './accessibility/AccessibilityProvider';
import { AuthProvider } from './services/auth/AuthProvider';
import { theme } from './theme/theme';
import { AccessibilityService } from './accessibility/AccessibilityService';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Initialize accessibility service
AccessibilityService.initialize();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={theme}>
            <AccessibilityProvider>
              <AuthProvider>
                <StatusBar style="auto" />
                <AppNavigator />
              </AuthProvider>
            </AccessibilityProvider>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
