import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

// Simple tab icons
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <Text style={{ 
    color: focused ? '#6200ee' : '#8e8e8e', 
    fontSize: 12, 
    fontWeight: focused ? 'bold' : 'normal',
  }}>
    {name}
  </Text>
);

const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator 
          screenOptions={{
            tabBarActiveTintColor: '#6200ee',
            tabBarInactiveTintColor: '#8e8e8e',
            tabBarStyle: {
              paddingBottom: 5,
              height: 60,
            }
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{
              tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} />,
            }}
          />
          <Tab.Screen 
            name="Discover" 
            component={DiscoverScreen} 
            options={{
              tabBarIcon: ({ focused }) => <TabIcon name="🔍" focused={focused} />,
            }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{
              tabBarIcon: ({ focused }) => <TabIcon name="👤" focused={focused} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
