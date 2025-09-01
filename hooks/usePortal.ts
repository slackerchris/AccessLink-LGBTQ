import { useMemo, useCallback } from 'react';
import { Alert, Switch } from 'react-native';
import { useAuth as useFirebaseAuth } from './useFirebaseAuth';
import { useTheme } from './useTheme';
import { debouncedNavigate } from '../utils/navigationHelpers';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type PortalScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Portal'>;

export const usePortal = (navigation: PortalScreenNavigationProp) => {
  const { user, userProfile, logout } = useFirebaseAuth();
  const { theme, toggleTheme, colors, shadows } = useTheme();

  const handleSignOut = useCallback(async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              const message = error instanceof Error ? error.message : 'An unknown error occurred.';
              Alert.alert('Sign Out Error', message);
            }
          },
        },
      ],
    );
  }, [logout]);

  const firstName = useMemo(() => {
    const details = userProfile?.profile?.details;
    if (details && typeof details === 'object' && 'firstName' in details && typeof details.firstName === 'string') {
      return details.firstName;
    }
    return userProfile?.displayName?.split(' ')[0] || 'Friend';
  }, [userProfile]);

  const navigationHandlers = useMemo(() => ({
    editProfile: () => debouncedNavigate(navigation, 'EditProfile'),
    savedPlaces: () => debouncedNavigate(navigation, 'SavedPlaces'),
    reviewHistory: () => debouncedNavigate(navigation, 'ReviewHistory'),
    accessibility: () => debouncedNavigate(navigation, 'AccessibilityPreferences'),
    identity: () => debouncedNavigate(navigation, 'LGBTQIdentity'),
  }), [navigation]);

  return {
    userProfile,
    theme,
    toggleTheme,
    handleSignOut,
    firstName,
    navigationHandlers,
  };
};
