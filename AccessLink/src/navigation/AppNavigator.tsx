import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList, MainTabParamList } from '../types';
import { useAccessibility } from '../accessibility/AccessibilityProvider';
import { colors } from '../theme/theme';

// Import screens (we'll create these next)
import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { EventsScreen } from '../screens/EventsScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import BusinessDetailScreen from '../screens/BusinessDetailScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  const { isScreenReaderEnabled } = useAccessibility();

  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Map':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'Events':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Discover':
              iconName = focused ? 'magnify' : 'magnify';
              break;
            case 'Favorites':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return (
            <Icon
              name={iconName}
              size={size}
              color={color}
              accessibilityLabel={`${route.name} tab${focused ? ', selected' : ''}`}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
          paddingBottom: 8,
          paddingTop: 8,
          height: isScreenReaderEnabled ? 80 : 60, // More space for screen reader users
        },
        tabBarLabelStyle: {
          fontSize: isScreenReaderEnabled ? 14 : 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.outline,
        },
        headerTitleStyle: {
          color: colors.onSurface,
          fontSize: 18,
          fontWeight: '600',
        },
        // Accessibility improvements
        tabBarAccessibilityLabel: `${route.name} tab`,
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: props.accessibilityState?.selected }}
            style={[
              props.style,
              {
                minHeight: 44, // Minimum touch target
                minWidth: 44,
              },
            ]}
          />
        ),
      })}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerTitle: 'AccessLink LGBTQ+',
        }}
      />
      <MainTab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Map',
          headerTitle: 'Nearby Businesses',
        }}
      />
      <MainTab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          title: 'Events',
          headerTitle: 'Community Events',
        }}
      />
      <MainTab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          title: 'Discover',
          headerTitle: 'Explore Categories',
        }}
      />
      <MainTab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favorites',
          headerTitle: 'Saved Places',
        }}
      />
    </MainTab.Navigator>
  );
}

export function AppNavigator() {
  const { announceForAccessibility } = useAccessibility();

  const handleNavigationStateChange = (state: any) => {
    // Announce navigation changes for screen reader users
    if (state?.routes) {
      const currentRoute = state.routes[state.index];
      if (currentRoute?.name) {
        announceForAccessibility(`Navigated to ${currentRoute.name} screen`);
      }
    }
  };

  return (
    <NavigationContainer
      onStateChange={handleNavigationStateChange}
      theme={{
        dark: false,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.onSurface,
          border: colors.outline,
          notification: colors.secondary,
        },
      }}
    >
      <RootStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.outline,
          },
          headerTitleStyle: {
            color: colors.onSurface,
            fontSize: 18,
            fontWeight: '600',
          },
          headerBackTitleVisible: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }),
        }}
      >
        <RootStack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ 
            headerShown: false,
            gestureEnabled: false, // Prevent swiping back during onboarding
          }}
        />
        <RootStack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="BusinessDetail"
          component={BusinessDetailScreen}
          options={{
            title: 'Business Details',
            headerBackAccessibilityLabel: 'Go back to previous screen',
          }}
        />
        <RootStack.Screen
          name="EventDetail"
          component={EventDetailScreen}
          options={{
            title: 'Event Details',
            headerBackAccessibilityLabel: 'Go back to previous screen',
          }}
        />
        <RootStack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'Search Results',
            headerBackAccessibilityLabel: 'Go back to previous screen',
          }}
        />
        <RootStack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Profile',
            headerBackAccessibilityLabel: 'Go back to previous screen',
          }}
        />
        <RootStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerBackAccessibilityLabel: 'Go back to previous screen',
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
