/**
 * Admin Portal Screen
 * Centralized admin settings and preferences
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Switch,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

// Navigation Prop Type
type AdminPortalScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AdminDashboard'
>;

// Prop Interfaces
interface AdminPortalScreenProps {
  navigation: AdminPortalScreenNavigationProp;
}

interface PortalHeaderProps {
  firstName: string;
  onThemeToggle: () => void;
}

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

interface PortalItem {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
}

interface PortalSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: PortalItem[];
}

// Memoized Sub-components
const PortalHeader: React.FC<PortalHeaderProps> = React.memo(
  ({ firstName, onThemeToggle }) => {
    const { colors, theme, createStyles } = useTheme();
    const styles = createStyles(localStyles);
    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back, {firstName}! 👑</Text>
            <Text style={styles.subtitle}>System Administrator Portal</Text>
          </View>
          <TouchableOpacity
            style={styles.themeButton}
            onPress={onThemeToggle}
          >
            <Ionicons
              name={theme === 'light' ? 'moon-outline' : 'sunny-outline'}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const ThemeToggle: React.FC<ThemeToggleProps> = React.memo(
  ({ isDarkMode, onToggle }) => {
    const { colors, createStyles } = useTheme();
    const styles = createStyles(localStyles);
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons
            name="color-palette-outline"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.sectionTitle}>Appearance</Text>
        </View>
        <View style={styles.themeToggleContainer}>
          <View style={styles.themeToggleLeft}>
            <Text style={styles.themeToggleTitle}>Dark Mode</Text>
            <Text style={styles.themeToggleSubtitle}>
              Switch between light and dark themes
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={onToggle}
            trackColor={{ false: '#e5e7eb', true: colors.primary }}
            thumbColor="#ffffff"
            ios_backgroundColor="#e5e7eb"
          />
        </View>
      </View>
    );
  }
);

const PortalSection: React.FC<PortalSectionProps> = React.memo(
  ({ title, icon, items }) => {
    const { colors, createStyles } = useTheme();
    const styles = createStyles(localStyles);
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name={icon} size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {items.map((item, itemIndex) => (
          <TouchableOpacity
            key={itemIndex}
            style={[
              styles.portalItem,
              itemIndex === items.length - 1 && { borderBottomWidth: 0 },
            ]}
            onPress={item.onPress}
          >
            <View
              style={[
                styles.portalItemIcon,
                { backgroundColor: item.color },
              ]}
            >
              <Ionicons name={item.icon} size={24} color="white" />
            </View>
            <View style={styles.portalItemContent}>
              <Text style={styles.portalItemTitle}>{item.title}</Text>
              <Text style={styles.portalItemSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }
);

const SignOutButton: React.FC<{ onSignOut: () => void }> = React.memo(
  ({ onSignOut }) => {
    const { createStyles } = useTheme();
    const styles = createStyles(localStyles);
    return (
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutItem} onPress={onSignOut}>
          <View
            style={[styles.portalItemIcon, { backgroundColor: '#ef4444' }]}
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
          </View>
          <View style={styles.portalItemContent}>
            <Text style={styles.signOutTitle}>Sign Out</Text>
            <Text style={styles.portalItemSubtitle}>
              Exit administrator session
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
);

const VersionInfo: React.FC = React.memo(() => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.versionContainer}>
      <Text style={styles.versionText}>
        AccessLink LGBTQ+ Admin Portal v1.0.0
      </Text>
      <Text style={styles.versionText}>© 2025 AccessLink Team</Text>
    </View>
  );
});

// Main Component
export const AdminPortalScreen: React.FC<AdminPortalScreenProps> = ({
  navigation,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  const handleSignOut = () => {
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
              const message =
                error instanceof Error
                  ? error.message
                  : 'An unknown error occurred.';
              Alert.alert('Sign Out Error', message);
            }
          },
        },
      ]
    );
  };

  const handleThemeToggle = () => {
    toggleTheme();
    Alert.alert(
      'Theme Changed',
      `Switched to ${theme === 'light' ? 'dark' : 'light'} mode`
    );
  };

  const firstName = user?.displayName?.split(' ')[0] || 'Administrator';

  const portalSections: PortalSectionProps[] = [
    {
      title: 'Platform Management',
      icon: 'settings-outline',
      items: [
        {
          title: 'User Management',
          subtitle: 'Manage user accounts and permissions',
          icon: 'people-outline',
          onPress: () => navigation.navigate('UserManagement'),
          color: '#3b82f6',
        },
        {
          title: 'Business Management',
          subtitle: 'Review and manage business listings',
          icon: 'storefront-outline',
          onPress: () => navigation.navigate('BusinessManagement'),
          color: '#10b981',
        },
        {
          title: 'System Analytics',
          subtitle: 'Platform usage and performance metrics',
          icon: 'analytics-outline',
          onPress: () => navigation.navigate('ComingSoon', { featureName: 'System Analytics' }),
          color: '#8b5cf6',
        },
      ],
    },
    {
      title: 'Developer Tools',
      icon: 'code-slash-outline',
      items: [
        {
          title: 'Debug Dashboard',
          subtitle: 'System monitoring and debugging tools',
          icon: 'bug-outline',
          onPress: () => navigation.navigate('DebugDashboard'),
          color: '#f59e0b',
        },
        {
          title: 'Database Tools',
          subtitle: 'Direct database management and queries',
          icon: 'server-outline',
          onPress: () => navigation.navigate('ComingSoon', { featureName: 'Database Tools' }),
          color: '#ef4444',
        },
        {
          title: 'API Monitoring',
          subtitle: 'Monitor API performance and usage',
          icon: 'pulse-outline',
          onPress: () => navigation.navigate('ComingSoon', { featureName: 'API Monitoring' }),
          color: '#06b6d4',
        },
      ],
    },
    {
      title: 'System Configuration',
      icon: 'construct-outline',
      items: [
        {
          title: 'Platform Settings',
          subtitle: 'Configure global platform preferences',
          icon: 'cog-outline',
          onPress: () => navigation.navigate('ComingSoon', { featureName: 'Platform Settings' }),
          color: '#6b7280',
        },
        {
          title: 'Notification Center',
          subtitle: 'Manage system alerts and notifications',
          icon: 'notifications-outline',
          onPress: () => navigation.navigate('ComingSoon', { featureName: 'Notification Center' }),
          color: '#f97316',
        },
        {
          title: 'Backup & Recovery',
          subtitle: 'Data backup and system recovery tools',
          icon: 'cloud-download-outline',
          onPress: () => navigation.navigate('ComingSoon', { featureName: 'Backup & Recovery' }),
          color: '#84cc16',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PortalHeader
          firstName={firstName}
          onThemeToggle={handleThemeToggle}
        />
        <ThemeToggle isDarkMode={theme === 'dark'} onToggle={handleThemeToggle} />
        {portalSections.map((section, index) => (
          <PortalSection key={index} {...section} />
        ))}
        <SignOutButton onSignOut={handleSignOut} />
        <VersionInfo />
      </ScrollView>
    </SafeAreaView>
  );
};

// Theme-aware Styles
const localStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 30,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      marginBottom: 20,
      backgroundColor: colors.header,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
      color: colors.headerText,
    },
    subtitle: {
      fontSize: 16,
      opacity: 0.9,
      color: colors.headerText,
    },
    themeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    section: {
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 16,
      paddingVertical: 20,
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 12,
      color: colors.text,
    },
    themeToggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    themeToggleLeft: {
      flex: 1,
    },
    themeToggleTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 2,
      color: colors.text,
    },
    themeToggleSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    portalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    portalItemIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    portalItemContent: {
      flex: 1,
    },
    portalItemTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 2,
      color: colors.text,
    },
    portalItemSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    signOutItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderWidth: 1,
      borderRadius: 12,
      marginHorizontal: 20,
      borderColor: '#ef4444',
    },
    signOutTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
      color: '#ef4444',
    },
    versionContainer: {
      paddingHorizontal: 20,
      paddingVertical: 30,
      alignItems: 'center',
    },
    versionText: {
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 4,
      color: colors.textSecondary,
    },
  });

export default AdminPortalScreen;
