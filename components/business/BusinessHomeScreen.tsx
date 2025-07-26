/**
 * Business Home Screen
 * Dashboard for business owners to manage their business profile
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAuthActions } from '../../hooks/useAuth';
import { useBusinesses } from '../../hooks/useBusiness';

interface BusinessHomeScreenProps {
  navigation: any;
}

export const BusinessHomeScreen: React.FC<BusinessHomeScreenProps> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { signOut } = useAuthActions();
  const { businesses } = useBusinesses({}, 1); // Get just the business owner's business
  
  // Find the business owned by this user
  const myBusiness = businesses.find(b => b.id === (userProfile as any)?.businessId);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  const businessStats = [
    {
      icon: 'eye',
      title: 'Profile Views',
      value: '347',
      color: '#3b82f6',
      onPress: () => Alert.alert('Analytics', 'View detailed analytics coming soon!')
    },
    {
      icon: 'star',
      title: 'Average Rating',
      value: myBusiness?.averageRating?.toFixed(1) || '4.5',
      color: '#f59e0b',
      onPress: () => navigation.navigate('Reviews')
    },
    {
      icon: 'chatbubble-ellipses',
      title: 'Reviews',
      value: myBusiness?.reviewCount?.toString() || '23',
      color: '#10b981',
      onPress: () => navigation.navigate('Reviews')
    },
    {
      icon: 'people',
      title: 'Followers',
      value: '156',
      color: '#8b5cf6',
      onPress: () => Alert.alert('Followers', 'Follower management coming soon!')
    }
  ];

  const quickActions = [
    {
      icon: 'create',
      title: 'Edit Business Profile',
      subtitle: 'Update your business information',
      onPress: () => Alert.alert('Edit Profile', 'Profile editing coming soon!')
    },
    {
      icon: 'camera',
      title: 'Update Photos',
      subtitle: 'Add or change business photos',
      onPress: () => Alert.alert('Photos', 'Photo management coming soon!')
    },
    {
      icon: 'time',
      title: 'Update Hours',
      subtitle: 'Modify operating hours',
      onPress: () => Alert.alert('Hours', 'Hours management coming soon!')
    },
    {
      icon: 'pricetag',
      title: 'Manage Services',
      subtitle: 'Update services and pricing',
      onPress: () => Alert.alert('Services', 'Service management coming soon!')
    },
    {
      icon: 'megaphone',
      title: 'Post Update',
      subtitle: 'Share news with your community',
      onPress: () => Alert.alert('Updates', 'Community updates coming soon!')
    },
    {
      icon: 'analytics',
      title: 'View Analytics',
      subtitle: 'Track your business performance',
      onPress: () => Alert.alert('Analytics', 'Detailed analytics coming soon!')
    }
  ];

  const firstName = userProfile?.profile?.firstName || userProfile?.displayName?.split(' ')[0] || 'Business Owner';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.businessName}>{firstName}! 🏢</Text>
            <Text style={styles.subtitle}>Manage your business profile</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.profileButton}>
            <Ionicons name="business" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Business Summary Card */}
      {myBusiness && (
        <View style={styles.businessCard}>
          <View style={styles.businessHeader}>
            <View style={styles.businessIcon}>
              <Ionicons name="storefront" size={24} color="#6366f1" />
            </View>
            <View style={styles.businessInfo}>
              <Text style={styles.businessTitle}>{myBusiness.name}</Text>
              <Text style={styles.businessCategory}>{myBusiness.category}</Text>
              <Text style={styles.businessStatus}>
                ✅ {myBusiness.approved ? 'Approved & Live' : 'Pending Approval'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color="#6366f1" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Business Performance</Text>
        <View style={styles.statsGrid}>
          {businessStats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              onPress={stat.onPress}
            >
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={action.onPress}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name={action.icon as any} size={20} color="#6366f1" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Support Section */}
      <View style={styles.supportContainer}>
        <Text style={styles.sectionTitle}>Need Help?</Text>
        <TouchableOpacity 
          style={styles.supportCard}
          onPress={() => Alert.alert('Support', 'Contact: business-support@accesslinklgbtq.app')}
        >
          <Ionicons name="help-circle" size={24} color="#6366f1" />
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>Business Support</Text>
            <Text style={styles.supportSubtitle}>Get help managing your profile</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#c7d2fe',
    marginTop: 5,
  },
  profileButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#f0f0ff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  businessInfo: {
    flex: 1,
  },
  businessTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  businessCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  businessStatus: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 5,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 5,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  actionCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f0ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  supportContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  supportCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  supportContent: {
    marginLeft: 15,
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});
