/**
 * Business Profiles List Screen
 * Shows all businesses owned by the current user for management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { BusinessListing } from '../../services/businessService';

interface BusinessProfilesListScreenProps {
  navigation: any;
}

export default function BusinessProfilesListScreen({ navigation }: BusinessProfilesListScreenProps) {
  const { userProfile } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserBusinesses();
  }, [userProfile]);

  const loadUserBusinesses = async () => {
    if (!userProfile?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Query businesses owned by current user
      const businessesQuery = query(
        collection(db, 'businesses'),
        where('ownerId', '==', userProfile.uid)
      );
      
      const querySnapshot = await getDocs(businessesQuery);
      const businessList: BusinessListing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        businessList.push({
          id: doc.id,
          ...data,
        } as BusinessListing);
      });
      
      setBusinesses(businessList);
    } catch (error) {
      console.error('Error loading businesses:', error);
      setBusinesses([]);
      Alert.alert('Error', 'Failed to load your businesses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBusiness = (business: BusinessListing) => {
    navigation.navigate('BusinessProfileEdit', { businessId: business.id });
  };

  const handleAddBusiness = () => {
    navigation.navigate('AddBusiness');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'suspended': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Active';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      case 'suspended': return 'Suspended';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Profiles</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddBusiness}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading your businesses...</Text>
          </View>
        ) : businesses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="business-outline" size={64} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>No Businesses Found</Text>
            <Text style={styles.emptySubtitle}>
              You haven't created any business profiles yet. Get started by adding your first business!
            </Text>
            <TouchableOpacity
              style={styles.addBusinessButton}
              onPress={handleAddBusiness}
            >
              <Ionicons name="add-circle" size={20} color="#ffffff" />
              <Text style={styles.addBusinessButtonText}>Add Your First Business</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Your Businesses ({businesses.length})
            </Text>
            
            {businesses.map((business) => (
              <TouchableOpacity
                key={business.id}
                style={styles.businessCard}
                onPress={() => handleEditBusiness(business)}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${business.name}`}
                accessibilityHint="Opens business profile editor"
              >
                <View style={styles.businessInfo}>
                  <View style={styles.businessHeader}>
                    <Text style={styles.businessName}>{business.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(business.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(business.status)}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.businessCategory}>
                    {business.category.charAt(0).toUpperCase() + business.category.slice(1).replace('_', ' ')}
                  </Text>
                  
                  <Text style={styles.businessAddress}>
                    {business.location.address}, {business.location.city}, {business.location.state}
                  </Text>
                  
                  {business.description && (
                    <Text style={styles.businessDescription} numberOfLines={2}>
                      {business.description}
                    </Text>
                  )}
                  
                  <View style={styles.businessMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="star" size={16} color="#f59e0b" />
                      <Text style={styles.metaText}>
                        {business.averageRating?.toFixed(1) || '0.0'} ({business.totalReviews || 0} reviews)
                      </Text>
                    </View>
                    
                    {business.lgbtqFriendly?.verified && (
                      <View style={styles.metaItem}>
                        <Ionicons name="heart" size={16} color="#ec4899" />
                        <Text style={styles.metaText}>LGBTQ+ Verified</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.arrowContainer}>
                  <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Add Another Business Button */}
            <TouchableOpacity
              style={styles.addAnotherButton}
              onPress={handleAddBusiness}
            >
              <Ionicons name="add-circle-outline" size={24} color="#6366f1" />
              <Text style={styles.addAnotherButtonText}>Add Another Business</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 45,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  addBusinessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addBusinessButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  businessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  businessInfo: {
    flex: 1,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  businessCategory: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  businessDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  businessMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  addAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
  },
  addAnotherButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
