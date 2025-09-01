import { Alert } from 'react-native';
import { useAuth, useBusiness } from './useFirebaseAuth';
import { useTheme } from './useTheme';

export const useBusinessPortal = () => {
  const { user, logout } = useAuth();
  const { businesses, loading: businessLoading } = useBusiness();
  const { theme, toggleTheme, colors } = useTheme();

  const business = businesses && businesses.length > 0 ? businesses[0] : null;
  const firstName = user?.displayName?.split(' ')[0] || 'Business Owner';

  const handleSignOut = async () => {
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
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : 'An unknown error occurred.';
              Alert.alert('Sign Out Error', message);
            }
          },
        },
      ]
    );
  };

  return {
    user,
    business,
    businessLoading,
    firstName,
    theme,
    colors,
    toggleTheme,
    handleSignOut,
  };
};
