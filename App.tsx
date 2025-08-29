import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Suppress known warnings from third-party libraries
import { suppressKnownWarnings } from './utils/suppressWarnings';

// Web Database initialization
// Using Firebase Firestore - no local database initialization needed

// Auth Components
import { LoginScreen } from './components/auth/LoginScreen';
import { SignUpScreen } from './components/auth/SignUpScreen';

// Home Screen Components
import { AdminHomeScreen } from './components/admin/AdminHomeScreen';
import { UserHomeScreen } from './components/user/UserHomeScreen';
import { SavedPlacesScreen } from './components/user/SavedPlacesScreen';
import { EventsScreen } from './components/user/EventsScreen';
import EventDetailsScreen from './components/user/EventDetailsScreen';
import PortalScreen from './components/user/PortalScreen';
import AccessibilityPreferencesScreen from './components/user/AccessibilityPreferencesScreen';
import MinimalAuthTestScreen from './components/user/MinimalAuthTestScreen';
import LGBTQIdentityScreen from './components/user/LGBTQIdentityScreen';
import ReviewHistoryScreen from './components/user/ReviewHistoryScreen';
import CreateReviewScreen from './components/user/CreateReviewScreen';
import BusinessHomeScreen from './components/business/BusinessHomeScreen';

// Business Components  
import OptimizedBusinessListScreen from './components/business/OptimizedBusinessListScreen';
import { BusinessProfileEditScreen } from './components/business/BusinessProfileEditScreen';
import { ServicesManagementScreen } from './components/business/ServicesManagementScreen';
import { MediaGalleryScreen } from './components/business/MediaGalleryScreen';
import { EventsManagementScreen } from './components/business/EventsManagementScreen';
import BusinessDetailsScreen from './components/business/BusinessDetailsScreen';
import AddBusinessScreen from './components/business/AddBusinessScreen';
import { BusinessPortalScreen } from './components/business/BusinessPortalScreen';
import ManageBusinessListScreen from './components/business/ManageBusinessListScreen';

// Common Components
import { EditProfileScreen } from './components/common/EditProfileScreen';
import { FeedbackScreen } from './components/common/FeedbackScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import PermissionsScreen from './components/common/PermissionsScreen';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import UserManagementScreen from './components/admin/UserManagementScreen';
import BusinessManagementScreen from './components/admin/BusinessManagementScreen';
import DebugDashboard from './components/admin/DebugDashboard';
import AdminPortalScreen from './components/admin/AdminPortalScreen';

// Hooks
import { useAuth } from './hooks/useFirebaseAuth';
import { AuthProvider } from './hooks/useFirebaseAuth';
import { ThemeProvider } from './hooks/useTheme';

// Profile Stack Navigator
const ProfileStack = createStackNavigator();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

// Business Stack Navigator
const BusinessStack = createStackNavigator();
function BusinessStackNavigator() {
  return (
    <BusinessStack.Navigator screenOptions={{ headerShown: false }}>
      <BusinessStack.Screen 
        name="BusinessList" 
        component={BusinessListWrapper}
      />
      <BusinessStack.Screen 
        name="BusinessDetails" 
        component={BusinessDetailsScreen}
      />
      <BusinessStack.Screen 
        name="AddBusiness" 
        component={AddBusinessScreen}
      />
      <BusinessStack.Screen 
        name="CreateReview" 
        component={CreateReviewScreen}
      />
      <BusinessStack.Screen 
        name="Feedback" 
        component={FeedbackScreen}
      />
    </BusinessStack.Navigator>
  );
}

// Business List Wrapper Component
function BusinessListWrapper({ navigation, route }: { navigation: any; route: any }) {
  const initialCategory = route.params?.initialCategory;
  
  return (
    <OptimizedBusinessListScreen />
  );
}

// Portal Stack Navigator
const PortalStack = createStackNavigator();
function PortalStackNavigator() {
  return (
    <PortalStack.Navigator screenOptions={{ headerShown: false }}>
      <PortalStack.Screen name="PortalMain" component={PortalScreen} />
      <PortalStack.Screen name="EditProfile" component={EditProfileScreen} />
      <PortalStack.Screen name="SavedPlaces" component={SavedPlacesScreen} />
      <PortalStack.Screen name="ReviewHistory" component={ReviewHistoryScreen} />
      <PortalStack.Screen name="CreateReview" component={CreateReviewScreen} />
      <PortalStack.Screen name="AccessibilityPreferences" component={AccessibilityPreferencesScreen} />
      <PortalStack.Screen name="LGBTQIdentity" component={LGBTQIdentityScreen} />
      <PortalStack.Screen name="MinimalAuthTest" component={MinimalAuthTestScreen} />
    </PortalStack.Navigator>
  );
}

// Business Portal Stack Navigator (Business-focused)
const BusinessPortalStack = createStackNavigator();
function BusinessPortalStackNavigator() {
  return (
    <BusinessPortalStack.Navigator screenOptions={{ headerShown: false }}>
      <BusinessPortalStack.Screen name="BusinessPortalMain" component={BusinessPortalScreen} />
      <BusinessPortalStack.Screen name="ManageBusinessList" component={ManageBusinessListScreen} />
      <BusinessPortalStack.Screen name="BusinessProfileEdit" component={BusinessProfileEditScreen} />
      <BusinessPortalStack.Screen name="ServicesManagement" component={ServicesManagementScreen} />
      <BusinessPortalStack.Screen name="MediaGallery" component={MediaGalleryScreen} />
      <BusinessPortalStack.Screen name="EventsManagement" component={EventsManagementScreen} />
    </BusinessPortalStack.Navigator>
  );
}

// Admin Stack Navigator
const AdminStack = createStackNavigator();
function AdminStackNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminMain" component={AdminHomeScreen} />
      <AdminStack.Screen name="UserManagement" component={UserManagementScreen} />
      <AdminStack.Screen name="BusinessManagement" component={BusinessManagementScreen} />
      <AdminStack.Screen name="AddBusiness" component={AddBusinessScreen} />
      <AdminStack.Screen name="Admin" component={AdminDashboard} />
      <AdminStack.Screen name="DebugDashboard" component={DebugDashboard} />
      <AdminStack.Screen name="AdminPortal" component={AdminPortalScreen} />
    </AdminStack.Navigator>
  );
}

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

// Admin Tab Navigator
const AdminTab = createBottomTabNavigator();
function AdminTabNavigator() {
  return (
    <AdminTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Businesses') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Manage') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Portal') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
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
      <AdminTab.Screen 
        name="Dashboard" 
        component={AdminStackNavigator}
        options={{ 
          title: 'Admin Dashboard',
          headerShown: false
        }}
      />
      
      <AdminTab.Screen 
        name="Businesses" 
        component={BusinessStackNavigator}
        options={{ title: 'Directory' }}
      />
      
      <AdminTab.Screen 
        name="Manage" 
        component={AdminDashboard}
        options={{ title: 'Manage' }}
      />
      
      <AdminTab.Screen 
        name="Portal" 
        component={AdminPortalScreen}
        options={{ title: 'Portal' }}
      />
    </AdminTab.Navigator>
  );
}

// User Tab Navigator
const UserTab = createBottomTabNavigator();
function UserTabNavigator() {
  return (
    <UserTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Directory') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Saved') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Portal') {
            iconName = focused ? 'grid' : 'grid-outline';
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
      <UserTab.Screen 
        name="Home" 
        component={UserHomeScreen}
        options={{ 
          title: 'Home',
          headerShown: false
        }}
      />
      
      <UserTab.Screen 
        name="Directory" 
        component={BusinessStackNavigator}
        options={{ title: 'Directory' }}
      />
      
      <UserTab.Screen 
        name="Saved" 
        component={SavedPlacesScreen}
        options={{ title: 'Saved Places' }}
      />
      
      <UserTab.Screen 
        name="Events" 
        component={EventsStackNavigator}
        options={{ title: 'Events', headerShown: false }}
      />
      
      <UserTab.Screen 
        name="Portal" 
        component={PortalStackNavigator}
        options={{ 
          title: 'Portal',
          headerShown: false
        }}
      />
    </UserTab.Navigator>
  );
}

// Events stack to support Event Details
const EventsStack = createStackNavigator();
function EventsStackNavigator() {
  return (
    <EventsStack.Navigator>
      <EventsStack.Screen name="EventsHome" component={EventsScreen} options={{ headerShown: false }} />
      <EventsStack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
    </EventsStack.Navigator>
  );
}

// Business Owner Tab Navigator
const BusinessOwnerStack = createStackNavigator();
function BusinessDashboardStackNavigator() {
  return (
    <BusinessOwnerStack.Navigator>
      <BusinessOwnerStack.Screen 
        name="BusinessHome" 
        component={BusinessHomeScreen} 
        options={{ headerShown: false }}
      />
      <BusinessOwnerStack.Screen 
        name="ManageBusinessList" 
        component={ManageBusinessListScreen} 
        options={{ headerShown: false }}
      />
      <BusinessOwnerStack.Screen 
        name="BusinessProfileEdit" 
        component={BusinessProfileEditScreen} 
        options={{ headerShown: false }}
      />
      <BusinessOwnerStack.Screen 
        name="ServicesManagement" 
        component={ServicesManagementScreen} 
        options={{ headerShown: false }}
      />
      <BusinessOwnerStack.Screen 
        name="MediaGallery" 
        component={MediaGalleryScreen} 
        options={{ headerShown: false }}
      />
      <BusinessOwnerStack.Screen 
        name="EventsManagement" 
        component={EventsManagementScreen} 
        options={{ headerShown: false }}
      />
    </BusinessOwnerStack.Navigator>
  );
}

const BusinessTab = createBottomTabNavigator();
function BusinessTabNavigator() {
  return (
    <BusinessTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Directory') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Reviews') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Portal') {
            iconName = focused ? 'apps' : 'apps-outline';
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
      <BusinessTab.Screen 
        name="Dashboard" 
        component={BusinessDashboardStackNavigator}
        options={{ 
          title: 'My Business',
          headerShown: false
        }}
      />
      
      <BusinessTab.Screen 
        name="Directory" 
        component={BusinessStackNavigator}
        options={{ title: 'Directory' }}
      />
      
      <BusinessTab.Screen 
        name="Reviews" 
        component={BusinessHomeScreen}
        options={{ title: 'Reviews' }}
      />
      
      <BusinessTab.Screen 
        name="Portal" 
        component={BusinessPortalStackNavigator}
        options={{ 
          title: 'Portal',
          headerShown: false
        }}
      />
    </BusinessTab.Navigator>
  );
}

// Profile Screen Component
function ProfileScreen({ navigation }: { navigation: any }) {
  const { userProfile } = useAuth();
  const { logout } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error: any) {
      Alert.alert('Sign Out Error', error.message);
    }
  };
  
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
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
           userProfile?.role === 'bizowner' ? '🏢 Business Owner' : '👤 User'}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        
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

// AppNavigator to select the correct UI based on user role
function AppNavigator({ userType }: { userType: 'user' | 'business_owner' | 'admin' | undefined }) {
  if (userType === 'admin') {
    return <AdminTabNavigator />;
  }
  if (userType === 'business_owner') {
    return <BusinessTabNavigator />;
  }
  return <UserTabNavigator />;
}

// AppContent component to manage auth state and navigation
function AppContent() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [showPermGate, setShowPermGate] = useState<boolean | null>(null);
  const { user, userProfile, loading } = useAuth();
  // Map userProfile role to AppNavigator expected format
  const userType: 'user' | 'admin' | 'business_owner' | undefined =
    userProfile?.role === 'bizowner' || userProfile?.role === 'bizmanager'
      ? 'business_owner'
      : userProfile?.role === 'admin'
      ? 'admin'
      : userProfile?.role === 'user'
      ? 'user'
      : undefined;

  // Suppress known warnings from third-party libraries
  useEffect(() => {
    suppressKnownWarnings();
  }, []);

  // Firebase Firestore is ready to use - no initialization needed
  useEffect(() => {
    // Firebase Firestore is cloud-based and ready immediately
    setDbInitialized(true);
  }, []);

  // One-time permission gate (first launch)
  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('onboard.permissions.v1');
        setShowPermGate(seen ? false : true);
      } catch {
        setShowPermGate(false);
      }
    })();
  }, []);

  const handlePermsDone = async () => {
    try {
      await AsyncStorage.setItem('onboard.permissions.v1', '1');
    } catch {}
    setShowPermGate(false);
  };

  // Show loading screen while database initializes
  if (!dbInitialized) {
    return (
      <View style={[styles.centered, { flex: 1 }]}>
        <Ionicons name="server-outline" size={48} color="#6366f1" />
        <Text style={[styles.loadingText, { marginTop: 16 }]}>Setting up database...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Show permissions screen once, before main app
  if (showPermGate === null) {
    return (
      <View style={[styles.centered, { flex: 1 }]}> 
        <Text>Loading…</Text>
      </View>
    );
  }

  if (showPermGate) {
    return <PermissionsScreen onDone={handlePermsDone} />;
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator userType={userType} /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// Main App Component
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
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
  pronouns: {
    fontSize: 14,
    color: '#8b5cf6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  bio: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
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
