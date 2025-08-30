import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth as useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';
import { debouncedNavigate } from '../../utils/navigationHelpers';

interface PortalScreenProps {
  navigation: any;
}

export default function PortalScreen({ navigation }: { navigation: any }) {
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
            } catch (error: any) {
              Alert.alert('Sign Out Error', error.message);
            }
          }
        }
      ]
    );
  }, [logout]);

  const firstName = useMemo(() => 
    userProfile?.profile?.details.firstName || 
    userProfile?.displayName?.split(' ')[0] || 
    'Friend'
  , [userProfile]);

  // Memoized navigation handlers for better performance
  const navigationHandlers = useMemo(() => ({
    editProfile: () => {
      console.log('🚀 PortalScreen: Navigating to EditProfile');
      debouncedNavigate(navigation, 'EditProfile');
    },
    savedPlaces: () => {
      console.log('🚀 PortalScreen: Navigating to SavedPlaces');
      debouncedNavigate(navigation, 'SavedPlaces');
    },
    reviewHistory: () => {
      console.log('🚀 PortalScreen: Navigating to ReviewHistory');
      debouncedNavigate(navigation, 'ReviewHistory');
    },
    accessibility: () => {
      console.log('🚀 PortalScreen: Navigating to AccessibilityPreferences');
      debouncedNavigate(navigation, 'AccessibilityPreferences');
    },
    identity: () => {
      console.log('🚀 PortalScreen: Navigating to LGBTQIdentity');
      debouncedNavigate(navigation, 'LGBTQIdentity');
    }
  }), [navigation]);

  const dynamicStyles = useMemo(() => StyleSheet.create({
    portalCard: {
      ...styles.portalCard,
      ...shadows.button, // Use optimized shadows
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    portalIconContainer: {
      ...styles.portalIconContainer,
      ...shadows.card, // Use optimized shadows for icon container
      backgroundColor: colors.surface,
    },
    portalCardTitle: {
      ...styles.portalCardTitle,
      color: colors.text,
    },
    portalCardSubtitle: {
      ...styles.portalCardSubtitle,
      color: colors.textSecondary,
    },
    themeToggleLabel: {
      ...styles.themeToggleLabel,
      color: colors.textSecondary,
    },
    accountTitle: {
      ...styles.accountTitle,
      color: colors.text,
    },
    accountCard: {
      ...styles.accountCard,
      ...shadows.card, // Use optimized shadows
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    accountRow: {
      ...styles.accountRow,
      borderBottomColor: colors.border,
    },
    accountLabel: {
      ...styles.accountLabel,
      color: colors.textSecondary,
    },
    accountValue: {
      ...styles.accountValue,
      color: colors.text,
    },
  }), [colors, shadows]);

  // Memoized portal card component
  const PortalCard = React.memo(({ 
    onPress, 
    iconName, 
    iconColor, 
    title, 
    subtitle, 
    accessibilityLabel,
    accessibilityHint 
  }: {
    onPress: () => void;
    iconName: string;
    iconColor: string;
    title: string;
    subtitle: string;
    accessibilityLabel: string;
    accessibilityHint: string;
  }) => (
    <TouchableOpacity
      style={dynamicStyles.portalCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <View style={dynamicStyles.portalIconContainer}>
        <Ionicons name={iconName as any} size={28} color={iconColor} />
      </View>
      <Text style={dynamicStyles.portalCardTitle}>{title}</Text>
      <Text style={dynamicStyles.portalCardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  ));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.header }]}> 
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Portal</Text>
        <Text style={[styles.headerSubtitle, { color: colors.headerText + 'CC' }]}> 
          Welcome back, {firstName}! Manage your account and preferences
        </Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      > 
        <View style={styles.portalGrid}> 
          <PortalCard
            onPress={navigationHandlers.editProfile}
            iconName="person"
            iconColor="#8b5cf6"
            title="My Profile"
            subtitle="Edit personal details"
            accessibilityLabel="Edit Profile"
            accessibilityHint="Opens screen to edit your personal profile information"
          />

          <PortalCard
            onPress={navigationHandlers.savedPlaces}
            iconName="bookmark"
            iconColor="#6366f1"
            title="Saved Places"
            subtitle="Your saved businesses"
            accessibilityLabel="Saved Places"
            accessibilityHint="View and manage your saved businesses"
          />

          <PortalCard
            onPress={navigationHandlers.reviewHistory}
            iconName="star"
            iconColor="#f59e0b"
            title="My Reviews"
            subtitle="View your reviews"
            accessibilityLabel="My Reviews"
            accessibilityHint="View and manage your business reviews"
          />

          <PortalCard
            onPress={navigationHandlers.accessibility}
            iconName="accessibility"
            iconColor="#10b981"
            title="Accessibility"
            subtitle="Customize preferences"
            accessibilityLabel="Accessibility Settings"
            accessibilityHint="Configure your accessibility preferences and needs"
          />

          <PortalCard
            onPress={navigationHandlers.identity}
            iconName="heart"
            iconColor="#ec4899"
            title="Identity Settings"
            subtitle="LGBTQ+ identity preferences"
            accessibilityLabel="Identity Settings"
            accessibilityHint="Manage your LGBTQ+ identity and visibility preferences"
          />

          <View style={dynamicStyles.portalCard}>
            <View style={dynamicStyles.portalIconContainer}>
              <Ionicons name={theme === 'light' ? 'sunny' : 'moon'} size={28} color="#f59e0b" />
            </View>
            <Text style={dynamicStyles.portalCardTitle}>Theme</Text>
            <View style={styles.themeToggleContainer}>
              <Text style={dynamicStyles.themeToggleLabel}>
                {theme === 'light' ? 'Light' : 'Dark'} Mode
              </Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#e5e7eb', true: colors.primary }}
                thumbColor={theme === 'dark' ? '#ffffff' : '#ffffff'}
                accessibilityRole="switch"
                accessibilityLabel="Theme toggle"
                accessibilityHint={`Currently in ${theme} mode. Toggle to switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              />
            </View>
          </View>

          <TouchableOpacity
            style={dynamicStyles.portalCard}
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign Out"
            accessibilityHint="Sign out of your account"
          >
            <View style={dynamicStyles.portalIconContainer}>
              <Ionicons name="log-out" size={28} color="#ef4444" />
            </View>
            <Text style={dynamicStyles.portalCardTitle}>Sign Out</Text>
            <Text style={dynamicStyles.portalCardSubtitle}>Logout from app</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accountInfo}>
          <Text style={dynamicStyles.accountTitle}>Account Information</Text>
          <View style={dynamicStyles.accountCard}>
            <View style={dynamicStyles.accountRow}>
              <Text style={dynamicStyles.accountLabel}>Email</Text>
              <Text style={dynamicStyles.accountValue}>{userProfile?.email}</Text>
            </View>
            <View style={dynamicStyles.accountRow}>
              <Text style={dynamicStyles.accountLabel}>Account Type</Text>
              <Text style={dynamicStyles.accountValue}>
                {userProfile?.role === 'user' ? 'Community Member' : 
                 userProfile?.role === 'bizowner' ? 'Business Owner' : 
                 userProfile?.role === 'bizmanager' ? 'Business Manager' : 
             userProfile?.role === 'admin' ? 'Administrator' : 
             userProfile?.role === 'moderator' ? 'Community Moderator' : 
             '*Unknown*'}
          </Text>
            </View>
            <View style={dynamicStyles.accountRow}>
              <Text style={dynamicStyles.accountLabel}>Member Since</Text>
              <Text style={dynamicStyles.accountValue}>
                {userProfile?.createdAt
                      ? (userProfile.createdAt.toDate
                          ? userProfile.createdAt.toDate().toLocaleDateString()
                              : new Date(userProfile.createdAt).toLocaleDateString())
                                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  portalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    //gap: 16,
    marginBottom: 32,
  },
  portalCard: {
    borderRadius: 16,
    padding: 20,
    flexBasis: '48%',
    minHeight: 120, // Ensure adequate touch target height
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  portalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  portalCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 20, // Better line height for readability
  },
  portalCardSubtitle: {
    fontSize: 14, // Increased from 13px for better readability
    textAlign: 'center',
    lineHeight: 18,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  themeToggleLabel: {
    fontSize: 13,
    flex: 1,
    textAlign: 'left',
  },
  accountInfo: {
    marginBottom: 32,
  },
  accountTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  accountCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  accountLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
