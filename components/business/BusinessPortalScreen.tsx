import React, { useState, useEffect } from 'react';
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
import { useAuth as useFirebaseAuth, useBusinessActions } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';

interface BusinessPortalScreenProps {
  navigation: any;
}

export const BusinessPortalScreen: React.FC<BusinessPortalScreenProps> = ({ navigation }) => {
  const { user, logout } = useFirebaseAuth();
  const { getMyBusinesses } = useBusinessActions();
  const { theme, toggleTheme, colors } = useTheme();
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      const businesses = await getMyBusinesses();
      if (businesses.length > 0) {
        setBusiness(businesses[0]);
      }
    } catch (error) {
      console.error('Error loading business:', error);
    }
  };

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
            } catch (error: any) {
              Alert.alert('Sign Out Error', error.message);
            }
          }
        }
      ]
    );
  };

  const firstName = user?.displayName?.split(' ')[0] || 'Business Owner';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Business Portal</Text>
        <Text style={[styles.headerSubtitle, { color: colors.headerText }]}>
          Welcome back, {firstName}! Manage your business and settings
        </Text>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.portalGrid}>
          <TouchableOpacity
            style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('BusinessProfilesList')}
            accessibilityRole="button"
            accessibilityLabel="Manage Business Profiles"
            accessibilityHint="View and edit your business profiles"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#ede9fe' }]}>
              <Ionicons name="business" size={28} color="#8b5cf6" />
            </View>
            <Text style={[styles.portalCardTitle, { color: colors.text }]}>Business Profiles</Text>
            <Text style={[styles.portalCardSubtitle, { color: colors.textSecondary }]}>Manage your businesses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ServicesManagement')}
            accessibilityRole="button"
            accessibilityLabel="Manage Services"
            accessibilityHint="Add, edit, or remove your business services"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="list" size={28} color="#3b82f6" />
            </View>
            <Text style={[styles.portalCardTitle, { color: colors.text }]}>Services</Text>
            <Text style={[styles.portalCardSubtitle, { color: colors.textSecondary }]}>Manage offerings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Reviews')}
            accessibilityRole="button"
            accessibilityLabel="Manage Reviews"
            accessibilityHint="View and manage customer reviews"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#fef2e5' }]}>
              <Ionicons name="star" size={28} color="#f59e0b" />
            </View>
            <Text style={[styles.portalCardTitle, { color: colors.text }]}>Reviews</Text>
            <Text style={[styles.portalCardSubtitle, { color: colors.textSecondary }]}>Customer feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('MediaGallery')}
            accessibilityRole="button"
            accessibilityLabel="Media Gallery"
            accessibilityHint="Manage photos and media for your business"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="images" size={28} color="#f59e0b" />
            </View>
            <Text style={[styles.portalCardTitle, { color: colors.text }]}>Media Gallery</Text>
            <Text style={[styles.portalCardSubtitle, { color: colors.textSecondary }]}>Photos & videos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('AddBusiness')}
            accessibilityRole="button"
            accessibilityLabel="Add New Business"
            accessibilityHint="Register another business to your account"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#e0f2fe' }]}>
              <Ionicons name="add-circle" size={28} color="#0284c7" />
            </View>
            <Text style={[styles.portalCardTitle, { color: colors.text }]}>Add Business</Text>
            <Text style={[styles.portalCardSubtitle, { color: colors.textSecondary }]}>Register new location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('EventsManagement')}
            accessibilityRole="button"
            accessibilityLabel="Events Management"
            accessibilityHint="Create and manage business events"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="calendar" size={28} color="#10b981" />
            </View>
            <Text style={[styles.portalCardTitle, { color: colors.text }]}>Events</Text>
            <Text style={[styles.portalCardSubtitle, { color: colors.textSecondary }]}>Manage events</Text>
          </TouchableOpacity>

          {/* Theme Toggle Card */}
          <View
            style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            accessibilityRole="switch"
            accessibilityLabel="Theme toggle"
            accessibilityHint={`Currently in ${theme} mode. Toggle to switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <View style={[styles.portalIconContainer, { backgroundColor: theme === 'light' ? '#fef3c7' : '#374151' }]}>
              <Ionicons 
                name={theme === 'light' ? 'sunny' : 'moon'} 
                size={28} 
                color={theme === 'light' ? '#f59e0b' : '#fbbf24'} 
              />
            </View>
            <Text style={[styles.portalCardTitle, { color: colors.text }]}>Theme</Text>
            <View style={styles.themeToggleContainer}>
              <Text style={[styles.themeToggleLabel, { color: colors.textSecondary }]}>
                {theme === 'light' ? 'Light' : 'Dark'} Mode
              </Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#e5e7eb', true: colors.primary }}
                thumbColor="#ffffff"
                ios_backgroundColor="#e5e7eb"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Alert.alert('Support', 'Contact: support@accesslinklgbtq.app')}
            accessibilityRole="button"
            accessibilityLabel="Support"
            accessibilityHint="Get help with your business account"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#fed7d7' }]}>
              <Ionicons name="help-circle" size={28} color="#f56565" />
            </View>
            <Text style={[styles.portalCardTitle, { color: colors.text }]}>Support</Text>
            <Text style={[styles.portalCardSubtitle, { color: colors.textSecondary }]}>Get help</Text>
          </TouchableOpacity>

        </View>

        {/* Sign Out Button - Separate from main grid */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign Out"
            accessibilityHint="Sign out of your business account"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#fed7d7' }]}>
              <Ionicons name="log-out" size={28} color="#ef4444" />
            </View>
            <Text style={[styles.portalCardTitle, { color: colors.text }]}>Sign Out</Text>
            <Text style={[styles.portalCardSubtitle, { color: colors.textSecondary }]}>Logout from app</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accountInfo}>
          <Text style={[styles.accountTitle, { color: colors.text }]}>Business Account</Text>
          <View style={[styles.accountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.accountRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.accountLabel, { color: colors.textSecondary }]}>Email</Text>
              <Text style={[styles.accountValue, { color: colors.text }]}>{user?.email}</Text>
            </View>
            <View style={[styles.accountRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.accountLabel, { color: colors.textSecondary }]}>Account Type</Text>
              <Text style={[styles.accountValue, { color: colors.text }]}>Business Owner</Text>
            </View>
            <View style={styles.accountRow}>
              <Text style={[styles.accountLabel, { color: colors.textSecondary }]}>Business Name</Text>
              <Text style={[styles.accountValue, { color: colors.text }]}>
                {business?.name || 'Not Set'}
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
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  portalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  signOutSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  portalCard: {
    borderRadius: 16,
    padding: 20,
    flexBasis: '31%',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    lineHeight: 20,
  },
  portalCardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  accountInfo: {
    marginTop: 16,
  },
  accountTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  accountCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    flex: 1,
    textAlign: 'right',
  },
  themeToggleContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  themeToggleLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
});
