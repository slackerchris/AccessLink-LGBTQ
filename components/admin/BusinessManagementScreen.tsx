/**
 * Business Management Screen
 * Admin interface for managing all businesses in the platform
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { businessService, BusinessListing, BusinessCategory } from '../../services/mockBusinessService';
import { useAuth } from '../../hooks/useWebAuth';

interface BusinessManagementScreenProps {
  navigation: any;
}

type FilterStatus = 'all' | 'approved' | 'pending' | 'featured';

export default function BusinessManagementScreen({ navigation }: BusinessManagementScreenProps) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessListing | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchQuery, filterStatus]);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      // Load all businesses (we'll need to modify the service to get all businesses)
      const result = await businessService.getAllBusinesses();
      setBusinesses(result.businesses);
    } catch (error) {
      console.error('Error loading businesses:', error);
      Alert.alert('Error', 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBusinesses();
    setRefreshing(false);
  };

  const filterBusinesses = useCallback(() => {
    let filtered = [...businesses];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(business => {
        switch (filterStatus) {
          case 'approved':
            return business.approved;
          case 'pending':
            return !business.approved;
          case 'featured':
            return business.featured;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(query) ||
        business.description.toLowerCase().includes(query) ||
        business.location.city.toLowerCase().includes(query)
      );
    }

    setFilteredBusinesses(filtered);
  }, [businesses, searchQuery, filterStatus]);

  const handleBusinessAction = (business: BusinessListing) => {
    setSelectedBusiness(business);
    setActionModalVisible(true);
  };

  const handleApproveBusiness = async (businessId: string) => {
    try {
      // We'll need to add this method to the business service
      await businessService.approveBusiness(businessId);
      await loadBusinesses();
      setActionModalVisible(false);
      Alert.alert('Success', 'Business approved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve business');
    }
  };

  const handleRejectBusiness = async (businessId: string) => {
    Alert.alert(
      'Reject Business',
      'Are you sure you want to reject this business? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await businessService.rejectBusiness(businessId);
              await loadBusinesses();
              setActionModalVisible(false);
              Alert.alert('Success', 'Business rejected');
            } catch (error) {
              Alert.alert('Error', 'Failed to reject business');
            }
          },
        },
      ]
    );
  };

  const handleToggleFeature = async (businessId: string, featured: boolean) => {
    try {
      await businessService.toggleBusinessFeature(businessId, !featured);
      await loadBusinesses();
      setActionModalVisible(false);
      Alert.alert('Success', `Business ${!featured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update business feature status');
    }
  };

  const handleDeleteBusiness = async (businessId: string) => {
    Alert.alert(
      'Delete Business',
      'Are you sure you want to delete this business? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await businessService.deleteBusiness(businessId);
              await loadBusinesses();
              setActionModalVisible(false);
              Alert.alert('Success', 'Business deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete business');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (approved: boolean, featured: boolean) => {
    if (featured) return '#f59e0b';
    if (approved) return '#10b981';
    return '#ef4444';
  };

  const getStatusText = (approved: boolean, featured: boolean) => {
    if (featured) return 'Featured';
    if (approved) return 'Approved';
    return 'Pending';
  };

  const renderFilterButton = (status: FilterStatus, label: string, count: number) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterStatus === status && styles.filterButtonActive
      ]}
      onPress={() => setFilterStatus(status)}
    >
      <Text style={[
        styles.filterButtonText,
        filterStatus === status && styles.filterButtonTextActive
      ]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderBusinessItem = (business: BusinessListing) => (
    <TouchableOpacity
      key={business.id}
      style={styles.businessCard}
      onPress={() => handleBusinessAction(business)}
    >
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{business.name}</Text>
          <Text style={styles.businessLocation}>
            {business.location.city}, {business.location.state}
          </Text>
          <Text style={styles.businessCategory}>
            {business.category.charAt(0).toUpperCase() + business.category.slice(1)}
          </Text>
        </View>
        <View style={styles.businessStatus}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(business.approved, business.featured) }
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(business.approved, business.featured)}
            </Text>
          </View>
          <Text style={styles.businessRating}>
            ⭐ {business.averageRating.toFixed(1)} ({business.reviewCount})
          </Text>
        </View>
      </View>
      
      <Text style={styles.businessDescription} numberOfLines={2}>
        {business.description}
      </Text>
      
      <View style={styles.businessFooter}>
        <Text style={styles.businessDate}>
          Created: {business.createdAt.toLocaleDateString()}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  const filterCounts = {
    all: businesses.length,
    approved: businesses.filter(b => b.approved).length,
    pending: businesses.filter(b => !b.approved).length,
    featured: businesses.filter(b => b.featured).length,
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
        <Text style={styles.headerTitle}>Business Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddBusiness')}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('all', 'All', filterCounts.all)}
          {renderFilterButton('pending', 'Pending', filterCounts.pending)}
          {renderFilterButton('approved', 'Approved', filterCounts.approved)}
          {renderFilterButton('featured', 'Featured', filterCounts.featured)}
        </ScrollView>
      </View>

      {/* Business List */}
      <ScrollView
        style={styles.businessList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading businesses...</Text>
          </View>
        ) : filteredBusinesses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No businesses found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Businesses will appear here'}
            </Text>
          </View>
        ) : (
          filteredBusinesses.map(renderBusinessItem)
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedBusiness?.name}</Text>
            <Text style={styles.modalSubtitle}>Choose an action</Text>

            <View style={styles.modalActions}>
              {!selectedBusiness?.approved && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.approveButton]}
                  onPress={() => selectedBusiness && handleApproveBusiness(selectedBusiness.id!)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  <Text style={styles.modalButtonText}>Approve</Text>
                </TouchableOpacity>
              )}

              {!selectedBusiness?.approved && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.rejectButton]}
                  onPress={() => selectedBusiness && handleRejectBusiness(selectedBusiness.id!)}
                >
                  <Ionicons name="close-circle" size={20} color="#ffffff" />
                  <Text style={styles.modalButtonText}>Reject</Text>
                </TouchableOpacity>
              )}

              {selectedBusiness?.approved && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.featureButton]}
                  onPress={() => selectedBusiness && handleToggleFeature(selectedBusiness.id!, selectedBusiness.featured)}
                >
                  <Ionicons 
                    name={selectedBusiness?.featured ? "star" : "star-outline"} 
                    size={20} 
                    color="#ffffff" 
                  />
                  <Text style={styles.modalButtonText}>
                    {selectedBusiness?.featured ? 'Unfeature' : 'Feature'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.modalButton, styles.editButton]}
                onPress={() => {
                  setActionModalVisible(false);
                  // Navigate to edit screen (we'd need to create this)
                  Alert.alert('Edit Business', 'Edit functionality coming soon!');
                }}
              >
                <Ionicons name="pencil" size={20} color="#ffffff" />
                <Text style={styles.modalButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => selectedBusiness && handleDeleteBusiness(selectedBusiness.id!)}
              >
                <Ionicons name="trash" size={20} color="#ffffff" />
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setActionModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#374151' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  businessList: {
    flex: 1,
  },
  businessCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  businessLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  businessCategory: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  businessStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  businessRating: {
    fontSize: 12,
    color: '#6b7280',
  },
  businessDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  modalActions: {
    gap: 12,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  featureButton: {
    backgroundColor: '#f59e0b',
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
