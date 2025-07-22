import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../services/auth/AuthProvider';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';

// User Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Business Screens
import BusinessDashboard from '../screens/BusinessDashboard';
import BusinessProfileEdit from '../screens/BusinessProfileEdit';

// Admin Screens
import AdminDashboard from '../screens/AdminDashboard';
import UserManagement from '../screens/UserManagement';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegistrationScreen} />
          </>
        ) : user.role === 'business' ? (
          // Business Stack
          <>
            <Stack.Screen name="BusinessDashboard" component={BusinessDashboard} />
            <Stack.Screen name="BusinessProfileEdit" component={BusinessProfileEdit} />
          </>
        ) : user.role === 'admin' ? (
          // Admin Stack
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="UserManagement" component={UserManagement} />
          </>
        ) : (
          // User Stack
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
