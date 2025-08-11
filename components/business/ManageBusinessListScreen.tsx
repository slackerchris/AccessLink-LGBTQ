import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth as useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useBusinesses } from '../../hooks/useBusiness';
import { useTheme } from '../../hooks/useTheme';

interface ManageBusinessListScreenProps {
  navigation?: any;
}

export const ManageBusinessListScreen: React.FC<ManageBusinessListScreenProps> = ({ navigation }) => {
  const { user, userProfile } = useFirebaseAuth();
  const { businesses, loading: businessesLoading } = useBusinesses({}, 50); // Load up to 50 businesses
  const { colors } = useTheme();
  
  // State to prevent flickering on subsequent loads
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Filter businesses owned by the current user
  const myBusinesses = businesses?.filter(business => 
    business.ownerId === userProfile?.uid || 
    business.ownerId === user?.uid ||
    business.contact?.email === user?.email
  ) || [];

  // Track when data has loaded for the first time
  useEffect(() => {
    if (!businessesLoading && businesses && isFirstLoad) {
      setHasInitiallyLoaded(true);
      setIsFirstLoad(false);
    }
  }, [businessesLoading, businesses, isFirstLoad]);

  const handleBusinessPress = (business: any) => {
    // Navigate directly to edit screen instead of showing popup
    if (navigation) {
      navigation.navigate('BusinessProfileEdit', { businessId: business.id });
    } else {
      console.warn('Navigation not available for business edit');
    }
  };

  const handleAddBusiness = () => {
    // Navigate to a business creation screen or show a simple message
    if (navigation) {
      // For now, navigate to business profile edit with no ID (create new)
      navigation.navigate('BusinessProfileEdit');
    } else {
      console.warn('Navigation not available for adding business');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  // Only show loading screen on initial load, not on subsequent refreshes
  if (businessesLoading && isFirstLoad && !hasInitiallyLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="business" size={48} color={colors.primary || '#6366f1'} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading your businesses...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary || '#6366f1' }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>My Businesses</Text>
            <View style={styles.subtitleContainer}>
              <Text style={styles.headerSubtitle}>{myBusinesses.length} business{myBusinesses.length !== 1 ? 'es' : ''}</Text>
              {businessesLoading && hasInitiallyLoaded && (
                <View style={styles.refreshIndicator}>
                  <Text style={styles.refreshText}>•</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddBusiness}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {myBusinesses.length === 0 ? (
          /* No Businesses State */
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={64} color="#9ca3af" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Businesses Found</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              You don't have any businesses registered yet.
            </Text>
            <TouchableOpacity 
              style={[styles.addBusinessButton, { backgroundColor: colors.primary || '#6366f1' }]}
              onPress={handleAddBusiness}
            >
              <Ionicons name="add" size={20} color="#fff" style={styles.addButtonIcon} />
              <Text style={styles.addBusinessText}>Add Your First Business</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Business List */
          <View style={styles.businessList}>
            {myBusinesses.map((business, index) => (
              <TouchableOpacity
                key={business.id || index}
                style={[styles.businessCard, { backgroundColor: colors.card || '#fff' }]}
                onPress={() => handleBusinessPress(business)}
              >
                <View style={styles.businessHeader}>
                  <View style={styles.businessIconContainer}>
                    <Ionicons name="storefront" size={24} color={colors.primary || '#6366f1'} />
                  </View>
                  <View style={styles.businessInfo}>
                    <Text style={[styles.businessName, { color: colors.text }]}>
                      {business.name || 'Unnamed Business'}
                    </Text>
                    <Text style={[styles.businessCategory, { color: colors.textSecondary }]}>
                      {business.category || 'Category not set'}
                    </Text>
                    <Text style={[styles.businessAddress, { color: colors.textSecondary }]}>
                      {business.location?.address || 'Address not set'}
                    </Text>
                  </View>
                  <View style={styles.businessStatus}>
                    <Ionicons 
                      name={getStatusIcon(business.status) as any} 
                      size={20} 
                      color={getStatusColor(business.status)} 
                    />
                    <Ionicons 
                      name="chevron-forward" 
                      size={16} 
                      color={colors.textSecondary || '#9ca3af'} 
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </View>
                
                <View style={styles.businessFooter}>
                  <View style={styles.businessStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="star" size={14} color="#f59e0b" />
                      <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        {business.averageRating?.toFixed(1) || '0.0'}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="chatbubble-ellipses" size={14} color="#10b981" />
                      <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        {business.totalReviews || 0} reviews
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rightFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(business.status)}20` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(business.status) }]}>
                        {business.status || 'unknown'}
                      </Text>
                    </View>
                    <Text style={[styles.tapHint, { color: colors.textSecondary }]}>Tap to edit</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#c7d2fe',
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  addBusinessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addBusinessText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  businessList: {
    padding: 20,
  },
  businessCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f0ff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  businessAddress: {
    fontSize: 12,
  },
  businessStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshIndicator: {
    marginLeft: 8,
    opacity: 0.7,
  },
  refreshText: {
    color: '#c7d2fe',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rightFooter: {
    alignItems: 'flex-end',
  },
  tapHint: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
    opacity: 0.7,
  },
});

export default ManageBusinessListScreen;
