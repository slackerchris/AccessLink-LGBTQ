/**
 * Simple Test App - Bypasses Firebase for Expo Go Testing
 * This is a temporary test version to check if the Media Gallery works in Expo Go
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MediaGalleryTestScreen } from './components/business/MediaGalleryTestScreen';

const Stack = createStackNavigator();

// Simple Home Screen with navigation to Media Gallery
function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AccessLink Test App</Text>
      <Text style={styles.subtitle}>Testing Media Gallery without Firebase</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('MediaGallery')}
      >
        <Text style={styles.buttonText}>Go to Media Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

// Mock Auth Provider that provides test data
function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User'
  };

  const mockBusiness = {
    id: 'test-business-123',
    name: 'Test Business',
    category: 'restaurant',
    description: 'A test business for development'
  };

  // Mock the useAuth hook globally
  React.useEffect(() => {
    // This is a simple way to mock the hook for testing
    (global as any).mockAuthData = {
      user: mockUser,
      loading: false,
      signIn: () => Promise.resolve(),
      signOut: () => Promise.resolve(),
      signUp: () => Promise.resolve()
    };

    (global as any).mockBusinessData = {
      getMyBusinesses: () => Promise.resolve([mockBusiness])
    };
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <MockAuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Test App' }}
          />
          <Stack.Screen 
            name="MediaGallery" 
            component={MediaGalleryTestScreen} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </MockAuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
