import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth as useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface SimpleBusinessHomeScreenProps {
  navigation?: any;
}

export const SimpleBusinessHomeScreen: React.FC<SimpleBusinessHomeScreenProps> = ({ navigation }) => {
  const { user, userProfile } = useFirebaseAuth();
  const { colors } = useTheme();
  
  // State for business data
  const [realBusinessStats, setRealBusinessStats] = useState({
    totalBusinesses: 0,
    totalViews: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  const firstName = user?.displayName?.split(' ')[0] || 'Business Owner';
  
  // Check if user has business owner/manager role
  const isBizUser = userProfile?.role === 'bizowner' || userProfile?.role === 'bizmanager';

  // Fetch real business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!userProfile?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Query businesses owned by current user
        const businessesQuery = query(
          collection(db, 'businesses'),
          where('ownerId', '==', userProfile.uid)
        );
        
        const querySnapshot = await getDocs(businessesQuery);
        let totalViews = 0;
        let totalRating = 0;
        let totalReviews = 0;
        let businessCount = 0;

        querySnapshot.forEach((doc) => {
          const business = doc.data();
          businessCount++;
          
          // Sum up stats from all businesses
          totalViews += business.views || 0;
          totalReviews += business.totalReviews || 0;
          if (business.averageRating && business.totalReviews > 0) {
            totalRating += business.averageRating * business.totalReviews;
          }
        });

        // Calculate overall average rating
        const overallRating = totalReviews > 0 ? totalRating / totalReviews : 0;

        setRealBusinessStats({
          totalBusinesses: businessCount,
          totalViews,
          averageRating: overallRating,
          totalReviews,
        });
      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isBizUser) {
      fetchBusinessData();
    } else {
      setLoading(false);
    }
  }, [userProfile?.uid, isBizUser]);

  // Simple loading state while auth is loading
  if (!userProfile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContent}>
          <Ionicons name="business" size={48} color={colors.primary || '#6366f1'} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Show access denied for non-business users
  if (!isBizUser) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.accessDeniedCard}>
          <Ionicons name="business-outline" size={64} color="#ef4444" />
          <Text style={styles.accessDeniedTitle}>Business Access Required</Text>
          <Text style={styles.accessDeniedText}>
            This section is only available to business owners and managers.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton} 
            onPress={() => Alert.alert('Business Registration', 'Contact support to register your business:\n\nbusiness-support@accesslinklgbtq.app')}
          >
            <Text style={styles.contactButtonText}>Register Business</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Business stats data - using real data
  const businessStats = [
    {
      icon: 'business',
      title: 'Businesses',
      value: realBusinessStats.totalBusinesses.toString(),
      color: '#3b82f6',
    },
    {
      icon: 'star',
      title: 'Rating',
      value: realBusinessStats.averageRating > 0 ? realBusinessStats.averageRating.toFixed(1) : '0.0',
      color: '#f59e0b',
    },
    {
      icon: 'chatbubble-ellipses',
      title: 'Reviews',
      value: realBusinessStats.totalReviews.toString(),
      color: '#10b981',
    },
    {
      icon: 'eye',
      title: 'Views',
      value: realBusinessStats.totalViews.toString(),
      color: '#8b5cf6',
    }
  ];

  // Quick actions
  const quickActions = [
    {
      icon: 'business',
      title: 'My Businesses',
      subtitle: 'View all your businesses',
      onPress: () => {
        if (navigation) {
          navigation.navigate('BusinessProfilesList');
        } else {
          console.warn('Navigation not available for My Businesses');
        }
      },
    },
    {
      icon: 'camera',
      title: 'Add Photos',
      subtitle: 'Upload new images',
      onPress: () => {
        if (navigation) {
          navigation.navigate('MediaGallery');
        } else {
          console.warn('Navigation not available for Media Gallery');
        }
      },
    },
    {
      icon: 'calendar',
      title: 'Create Event',
      subtitle: 'Add new event',
      onPress: () => {
        if (navigation) {
          navigation.navigate('EventsManagement');
        } else {
          console.warn('Navigation not available for Events Management');
        }
      },
    },
    {
      icon: 'pricetag',
      title: 'Manage Services',
      subtitle: 'Update offerings',
      onPress: () => {
        if (navigation) {
          navigation.navigate('ServicesManagement');
        } else {
          console.warn('Navigation not available for Services Management');
        }
      },
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colors.primary || '#6366f1' }]}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Welcome back, {firstName}!</Text>
          <Text style={styles.subtitle}>Business Dashboard</Text>
        </View>
      </View>

      {/* Business Welcome Card */}
      <View style={[styles.businessCard, { backgroundColor: colors.card || '#fff' }]}>
        <View style={styles.businessHeader}>
          <View style={styles.businessIcon}>
            <Ionicons name="storefront" size={24} color={colors.primary || '#6366f1'} />
          </View>
          <View style={styles.businessInfo}>
            <Text style={[styles.businessTitle, { color: colors.text }]}>Business Portal</Text>
            <Text style={[styles.businessCategory, { color: colors.textSecondary || '#6b7280' }]}>
              Role: {userProfile?.role === 'bizowner' ? 'Business Owner' : 'Business Manager'}
            </Text>
            <Text style={styles.businessStatus}>
              ✅ Access Granted
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Performance</Text>
        <View style={styles.statsGrid}>
          {loading ? (
            // Loading placeholders
            Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={[styles.statCard, { backgroundColor: colors.card || '#fff' }]}>
                <View style={[styles.statIcon, { backgroundColor: '#f3f4f6' }]}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
                </View>
                <Text style={[styles.statValue, { color: '#9ca3af' }]}>--</Text>
                <Text style={[styles.statTitle, { color: colors.textSecondary || '#6b7280' }]}>Loading...</Text>
              </View>
            ))
          ) : (
            // Real data
            businessStats.map((stat, index) => (
              <View key={index} style={[styles.statCard, { backgroundColor: colors.card || '#fff' }]}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statTitle, { color: colors.textSecondary || '#6b7280' }]}>{stat.title}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionCard, { backgroundColor: colors.card || '#fff' }]}
            onPress={action.onPress}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name={action.icon as any} size={20} color="#6366f1" />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary || '#6b7280' }]}>{action.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#c7d2fe',
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
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 4,
  },
  businessStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  noBusinessCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noBusiness: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  noBusinessHelp: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  addBusinessButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addBusinessText: {
    color: '#fff',
    fontWeight: '600',
  },
  debugInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    padding: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
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
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  accessDeniedCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 60,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  contactButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default SimpleBusinessHomeScreen;
