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
import { useAuth, useAuthActions } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface PortalScreenProps {
  navigation: any;
}

export const PortalScreen: React.FC<PortalScreenProps> = ({ navigation }) => {
  const { userProfile } = useAuth();
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

  const firstName = userProfile?.profile?.firstName || userProfile?.displayName?.split(' ')[0] || 'Friend';

  const dynamicStyles = StyleSheet.create({
    portalCard: {
      ...styles.portalCard,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    portalIconContainer: {
      ...styles.portalIconContainer,
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
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Portal</Text>
        <Text style={[styles.headerSubtitle, { color: colors.headerText + 'CC' }]}>
          Welcome back, {firstName}! Manage your account and preferences
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.portalGrid}>
          <TouchableOpacity
            style={dynamicStyles.portalCard}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={dynamicStyles.portalIconContainer}>
              <Ionicons name="person" size={28} color="#8b5cf6" />
            </View>
            <Text style={dynamicStyles.portalCardTitle}>My Profile</Text>
            <Text style={dynamicStyles.portalCardSubtitle}>Edit personal details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.portalCard}
            onPress={() => navigation.navigate('SavedPlaces')}
          >
            <View style={dynamicStyles.portalIconContainer}>
              <Ionicons name="bookmark" size={28} color="#6366f1" />
            </View>
            <Text style={dynamicStyles.portalCardTitle}>Saved Places</Text>
            <Text style={dynamicStyles.portalCardSubtitle}>
              {userProfile?.profile?.savedBusinesses?.length || 0} saved businesses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.portalCard}
            onPress={() => navigation.navigate('ReviewHistory')}
          >
            <View style={dynamicStyles.portalIconContainer}>
              <Ionicons name="star" size={28} color="#f59e0b" />
            </View>
            <Text style={dynamicStyles.portalCardTitle}>My Reviews</Text>
            <Text style={dynamicStyles.portalCardSubtitle}>
              {userProfile?.profile?.reviews?.length || 0} reviews written
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.portalCard}
            onPress={() => navigation.navigate('AccessibilityPreferences')}
          >
            <View style={dynamicStyles.portalIconContainer}>
              <Ionicons name="accessibility" size={28} color="#10b981" />
            </View>
            <Text style={dynamicStyles.portalCardTitle}>Accessibility</Text>
            <Text style={dynamicStyles.portalCardSubtitle}>Customize preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.portalCard}
            onPress={() => navigation.navigate('LGBTQIdentity')}
          >
            <View style={dynamicStyles.portalIconContainer}>
              <Ionicons name="heart" size={28} color="#ec4899" />
            </View>
            <Text style={dynamicStyles.portalCardTitle}>Identity Settings</Text>
            <Text style={dynamicStyles.portalCardSubtitle}>
              {userProfile?.profile?.lgbtqIdentity?.visible ? 'Public profile' : 'Private profile'}
            </Text>
          </TouchableOpacity>

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
              />
            </View>
          </View>

          <TouchableOpacity
            style={dynamicStyles.portalCard}
            onPress={handleSignOut}
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
                 userProfile?.role === 'business_owner' ? 'Business Owner' : 
                 'Administrator'}
              </Text>
            </View>
            <View style={dynamicStyles.accountRow}>
              <Text style={dynamicStyles.accountLabel}>Member Since</Text>
              <Text style={dynamicStyles.accountValue}>
                {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
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
    gap: 16,
    marginBottom: 32,
  },
  portalCard: {
    borderRadius: 16,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
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
  },
  portalCardSubtitle: {
    fontSize: 13,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  },
});
