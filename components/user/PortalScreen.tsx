import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAuthActions } from '../../hooks/useAuth';

interface PortalScreenProps {
  navigation: any;
}

export const PortalScreen: React.FC<PortalScreenProps> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { signOut } = useAuthActions();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portal</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {firstName}! Manage your account and preferences
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.portalGrid}>
          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.portalIconContainer}>
              <Ionicons name="person" size={28} color="#8b5cf6" />
            </View>
            <Text style={styles.portalCardTitle}>My Profile</Text>
            <Text style={styles.portalCardSubtitle}>Edit personal details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => navigation.navigate('SavedPlaces')}
          >
            <View style={styles.portalIconContainer}>
              <Ionicons name="bookmark" size={28} color="#6366f1" />
            </View>
            <Text style={styles.portalCardTitle}>Saved Places</Text>
            <Text style={styles.portalCardSubtitle}>
              {userProfile?.profile?.savedBusinesses?.length || 0} saved businesses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => navigation.navigate('ReviewHistory')}
          >
            <View style={styles.portalIconContainer}>
              <Ionicons name="star" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.portalCardTitle}>My Reviews</Text>
            <Text style={styles.portalCardSubtitle}>
              {userProfile?.profile?.reviews?.length || 0} reviews written
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => navigation.navigate('AccessibilityPreferences')}
          >
            <View style={styles.portalIconContainer}>
              <Ionicons name="accessibility" size={28} color="#10b981" />
            </View>
            <Text style={styles.portalCardTitle}>Accessibility</Text>
            <Text style={styles.portalCardSubtitle}>Customize preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => navigation.navigate('LGBTQIdentity')}
          >
            <View style={styles.portalIconContainer}>
              <Ionicons name="heart" size={28} color="#ec4899" />
            </View>
            <Text style={styles.portalCardTitle}>Identity Settings</Text>
            <Text style={styles.portalCardSubtitle}>
              {userProfile?.profile?.lgbtqIdentity?.visible ? 'Public profile' : 'Private profile'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalCard}
            onPress={handleSignOut}
          >
            <View style={styles.portalIconContainer}>
              <Ionicons name="log-out" size={28} color="#ef4444" />
            </View>
            <Text style={styles.portalCardTitle}>Sign Out</Text>
            <Text style={styles.portalCardSubtitle}>Logout from app</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accountInfo}>
          <Text style={styles.accountTitle}>Account Information</Text>
          <View style={styles.accountCard}>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue}>{userProfile?.email}</Text>
            </View>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Account Type</Text>
              <Text style={styles.accountValue}>
                {userProfile?.role === 'user' ? 'Community Member' : 
                 userProfile?.role === 'business_owner' ? 'Business Owner' : 
                 'Administrator'}
              </Text>
            </View>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Member Since</Text>
              <Text style={styles.accountValue}>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
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
    backgroundColor: '#fff',
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
    borderColor: '#f1f5f9',
  },
  portalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  portalCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  portalCardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  accountInfo: {
    marginBottom: 32,
  },
  accountTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  accountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
});
