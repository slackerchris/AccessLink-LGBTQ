/**
 * Admin Portal Screen
 * Centralized admin settings and preferences
 */

import React from 'react';
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
import { useAuth, useAuthActions } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';

interface AdminPortalScreenProps {
  navigation: any;
}

export const AdminPortalScreen: React.FC<AdminPortalScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { signOut } = useAuthActions();
  const { theme, toggleTheme, colors } = useTheme();

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
              await signOut();
            } catch (error: any) {
              Alert.alert('Sign Out Error', error.message);
            }
          }
        }
      ]
    );
  };

  const firstName = user?.displayName?.split(' ')[0] || 'Administrator';

  const handleThemeToggle = () => {
    toggleTheme();
    Alert.alert(
      'Theme Changed', 
      `Switched to ${theme === 'light' ? 'dark' : 'light'} mode`
    );
  };

  const portalSections = [
    {
      title: 'Platform Management',
      icon: 'settings-outline',
      items: [
        {
          title: 'User Management',
          subtitle: 'Manage user accounts and permissions',
          icon: 'people-outline',
          onPress: () => navigation.navigate('UserManagement'),
          color: '#3b82f6'
        },
        {
          title: 'Business Management',
          subtitle: 'Review and manage business listings',
          icon: 'storefront-outline',
          onPress: () => navigation.navigate('BusinessManagement'),
          color: '#10b981'
        },
        {
          title: 'System Analytics',
          subtitle: 'Platform usage and performance metrics',
          icon: 'analytics-outline',
          onPress: () => Alert.alert('Analytics', 'Advanced analytics dashboard coming soon!'),
          color: '#8b5cf6'
        }
      ]
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
          color: '#f59e0b'
        },
        {
          title: 'Database Tools',
          subtitle: 'Direct database management and queries',
          icon: 'server-outline',
          onPress: () => navigation.navigate('DebugDashboard'),
          color: '#ef4444'
        },
        {
          title: 'API Monitoring',
          subtitle: 'Monitor API performance and usage',
          icon: 'pulse-outline',
          onPress: () => Alert.alert('API Monitor', 'API monitoring dashboard coming soon!'),
          color: '#06b6d4'
        }
      ]
    },
    {
      title: 'System Configuration',
      icon: 'construct-outline',
      items: [
        {
          title: 'Platform Settings',
          subtitle: 'Configure global platform preferences',
          icon: 'cog-outline',
          onPress: () => Alert.alert('Settings', 'Advanced platform settings coming soon!'),
          color: '#6b7280'
        },
        {
          title: 'Notification Center',
          subtitle: 'Manage system alerts and notifications',
          icon: 'notifications-outline',
          onPress: () => Alert.alert('Notifications', 'No new system notifications'),
          color: '#f97316'
        },
        {
          title: 'Backup & Recovery',
          subtitle: 'Data backup and system recovery tools',
          icon: 'cloud-download-outline',
          onPress: () => Alert.alert('Backup', 'Backup management tools coming soon!'),
          color: '#84cc16'
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.header }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greeting, { color: colors.headerText }]}>
                Welcome back, {firstName}! 👑
              </Text>
              <Text style={[styles.subtitle, { color: colors.headerText }]}>
                System Administrator Portal
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.themeButton, { backgroundColor: colors.card }]}
              onPress={handleThemeToggle}
            >
              <Ionicons 
                name={theme === 'light' ? 'moon-outline' : 'sunny-outline'} 
                size={20} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Toggle Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          </View>
          <View style={styles.themeToggleContainer}>
            <View style={styles.themeToggleLeft}>
              <Text style={[styles.themeToggleTitle, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.themeToggleSubtitle, { color: colors.textSecondary }]}>
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={handleThemeToggle}
              trackColor={{ false: '#e5e7eb', true: colors.primary }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e5e7eb"
            />
          </View>
        </View>

        {/* Portal Sections */}
        {portalSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon as any} size={24} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {section.title}
              </Text>
            </View>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.portalItem, 
                  { borderBottomColor: colors.border },
                  itemIndex === section.items.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={item.onPress}
              >
                <View style={[styles.portalItemIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={24} color="white" />
                </View>
                <View style={styles.portalItemContent}>
                  <Text style={[styles.portalItemTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.portalItemSubtitle, { color: colors.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Sign Out Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.signOutItem, { borderColor: '#ef4444' }]}
            onPress={handleSignOut}
          >
            <View style={[styles.portalItemIcon, { backgroundColor: '#ef4444' }]}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </View>
            <View style={styles.portalItemContent}>
              <Text style={[styles.signOutTitle, { color: '#ef4444' }]}>
                Sign Out
              </Text>
              <Text style={[styles.portalItemSubtitle, { color: colors.textSecondary }]}>
                Exit administrator session
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            AccessLink LGBTQ+ Admin Portal v1.0.0
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            © 2025 AccessLink Team
          </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
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
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
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
    shadowColor: '#000',
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
  },
  themeToggleSubtitle: {
    fontSize: 14,
  },
  portalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
  },
  portalItemSubtitle: {
    fontSize: 14,
  },
  signOutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  signOutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
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
  },
});

export default AdminPortalScreen;
