import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Auth Components
import { LoginScreen } from './components/auth/LoginScreen';
import { SignUpScreen } from './components/auth/SignUpScreen';

// Business Components  
import { BusinessListScreen } from './components/business/BusinessListScreen';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';

// Hooks
import { useAuth, useAuthActions } from './hooks/useAuth';

// Auth Stack Navigator
const AuthStack = createStackNavigator();
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

// Main Tab Navigator
const Tab = createBottomTabNavigator();
function MainTabNavigator() {
  const { userProfile } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          if (route.name === 'Businesses') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Businesses" 
        component={BusinessListScreen}
        options={{ title: 'LGBTQ+ Businesses' }}
      />
      
      {userProfile?.role === 'admin' && (
        <Tab.Screen 
          name="Admin" 
          component={AdminDashboard}
          options={{ title: 'Admin Dashboard' }}
        />
      )}
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Profile Screen Component
function ProfileScreen() {
  const { userProfile } = useAuth();
  const { signOut } = useAuthActions();
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Sign Out Error', error.message);
    }
  };
  
  const handleWebsite = () => {
    Alert.alert('Website', 'Opening https://accesslinklgbtq.app/');
  };
  
  const handleSupport = () => {
    Alert.alert('Support', 'Contact: support@accesslinklgbtq.app');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Ionicons name="person-circle" size={80} color="#6366f1" />
        <Text style={styles.profileName}>
          {userProfile?.displayName || userProfile?.email || 'User'}
        </Text>
        <Text style={styles.profileRole}>
          {userProfile?.role === 'admin' ? '👑 Admin' : 
           userProfile?.role === 'business_owner' ? '🏢 Business Owner' : '👤 User'}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleWebsite}>
          <Ionicons name="globe-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Visit Website</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleSupport}>
          <Ionicons name="mail-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footer}>
        AccessLink LGBTQ+ © 2025{'\n'}
        Connecting our community with inclusive businesses
      </Text>
    </View>
  );
}

// Main App Component
export default function App() {
  const { user, loading } = useAuth();
  
  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
        <Ionicons name="heart" size={60} color="#6366f1" />
        <Text style={styles.loadingText}>AccessLink LGBTQ+</Text>
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      {user ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f8fafc',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 15,
  },
  profileRole: {
    fontSize: 16,
    color: '#6366f1',
    marginTop: 5,
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 20,
    gap: 15,
  },
  button: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 10,
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 'auto',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
});
