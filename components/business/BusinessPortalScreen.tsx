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
import { useAuth as useFirebaseAuth } from '../../hooks/useFirebaseAuth';

interface BusinessPortalScreenProps {
  navigation: any;
}

export const BusinessPortalScreen: React.FC<BusinessPortalScreenProps> = ({ navigation }) => {
  const { user, logout } = useFirebaseAuth();

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Business Portal</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {firstName}! Manage your business and settings
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.portalGrid}>
          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => navigation.navigate('BusinessProfileEdit')}
            accessibilityRole="button"
            accessibilityLabel="Edit Business Profile"
            accessibilityHint="Opens screen to edit your business information"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#ede9fe' }]}>
              <Ionicons name="business" size={28} color="#8b5cf6" />
            </View>
            <Text style={styles.portalCardTitle}>Business Profile</Text>
            <Text style={styles.portalCardSubtitle}>Edit business details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => navigation.navigate('ServicesManagement')}
            accessibilityRole="button"
            accessibilityLabel="Manage Services"
            accessibilityHint="Add, edit, or remove your business services"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="list" size={28} color="#3b82f6" />
            </View>
            <Text style={styles.portalCardTitle}>Services</Text>
            <Text style={styles.portalCardSubtitle}>Manage offerings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => navigation.navigate('MediaGallery')}
            accessibilityRole="button"
            accessibilityLabel="Media Gallery"
            accessibilityHint="Manage photos and media for your business"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="images" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.portalCardTitle}>Media Gallery</Text>
            <Text style={styles.portalCardSubtitle}>Photos & videos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => navigation.navigate('EventsManagement')}
            accessibilityRole="button"
            accessibilityLabel="Events Management"
            accessibilityHint="Create and manage business events"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="calendar" size={28} color="#10b981" />
            </View>
            <Text style={styles.portalCardTitle}>Events</Text>
            <Text style={styles.portalCardSubtitle}>Manage events</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => Alert.alert('Support', 'Contact: support@accesslinklgbtq.app')}
            accessibilityRole="button"
            accessibilityLabel="Support"
            accessibilityHint="Get help with your business account"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#fed7d7' }]}>
              <Ionicons name="help-circle" size={28} color="#f56565" />
            </View>
            <Text style={styles.portalCardTitle}>Support</Text>
            <Text style={styles.portalCardSubtitle}>Get help</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalCard}
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign Out"
            accessibilityHint="Sign out of your business account"
          >
            <View style={[styles.portalIconContainer, { backgroundColor: '#fed7d7' }]}>
              <Ionicons name="log-out" size={28} color="#ef4444" />
            </View>
            <Text style={styles.portalCardTitle}>Sign Out</Text>
            <Text style={styles.portalCardSubtitle}>Logout from app</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accountInfo}>
          <Text style={styles.accountTitle}>Business Account</Text>
          <View style={styles.accountCard}>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue}>{user?.email}</Text>
            </View>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Account Type</Text>
              <Text style={styles.accountValue}>Business Owner</Text>
            </View>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Business Name</Text>
              <Text style={styles.accountValue}>
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
    marginBottom: 4,
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#e0e7ff',
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    color: '#1f2937',
  },
  portalCardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
    color: '#6b7280',
  },
  accountInfo: {
    marginTop: 16,
  },
  accountTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937',
  },
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    flex: 1,
    textAlign: 'right',
  },
});
