/**
 * Business Services Management Screen
 * Allows business owners to manage their services and pricing
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { useBusinesses } from '../../hooks/useBusiness';
import { ServiceItem, businessService } from '../../services/mockBusinessService';

interface ServicesManagementScreenProps {
  navigation: any;
}

export const ServicesManagementScreen: React.FC<ServicesManagementScreenProps> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { businesses, refresh } = useBusinesses();
  
  // Find the current user's business
  const userBusiness = businesses.find(b => b.id === (userProfile as any)?.businessId);
  
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    available: true
  });

  useEffect(() => {
    loadServices();
  }, [userBusiness]);

  const loadServices = async () => {
    if (userBusiness?.id) {
      try {
        const businessServices = await businessService.getBusinessServices(userBusiness.id);
        setServices(businessServices);
      } catch (error) {
        console.error('Error loading services:', error);
      }
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      available: true
    });
    setIsModalVisible(true);
  };

  const handleEditService = (service: ServiceItem) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price || '',
      duration: service.duration || '',
      category: service.category || '',
      available: service.available
    });
    setIsModalVisible(true);
  };

  const handleSaveService = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill in service name and description');
      return;
    }

    if (!userBusiness?.id) {
      Alert.alert('Error', 'Business not found');
      return;
    }

    setIsLoading(true);
    try {
      if (editingService) {
        // Update existing service
        await businessService.updateBusinessService(
          userBusiness.id,
          editingService.id,
          {
            name: formData.name,
            description: formData.description,
            price: formData.price || undefined,
            duration: formData.duration || undefined,
            category: formData.category || undefined,
            available: formData.available
          }
        );
      } else {
        // Add new service
        await businessService.addBusinessService(userBusiness.id, {
          name: formData.name,
          description: formData.description,
          price: formData.price || undefined,
          duration: formData.duration || undefined,
          category: formData.category || undefined,
          available: formData.available
        });
      }

      await loadServices();
      refresh(); // Refresh the businesses list
      setIsModalVisible(false);
      Alert.alert('Success', `Service ${editingService ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Error', 'Failed to save service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    if (!userBusiness?.id) return;

    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await businessService.deleteBusinessService(userBusiness.id, serviceId);
              await loadServices();
              refresh(); // Refresh the businesses list
              Alert.alert('Success', 'Service deleted successfully!');
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', 'Failed to delete service. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const toggleServiceAvailability = async (serviceId: string) => {
    if (!userBusiness?.id) return;

    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    setIsLoading(true);
    try {
      await businessService.updateBusinessService(
        userBusiness.id,
        serviceId,
        { available: !service.available }
      );
      await loadServices();
      refresh(); // Refresh the businesses list
    } catch (error) {
      console.error('Error updating service availability:', error);
      Alert.alert('Error', 'Failed to update service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Services</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddService}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No services yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first service to help customers understand what you offer
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddService}
            >
              <Text style={styles.emptyButtonText}>Add Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Your Services ({services.length})
            </Text>
            
            {services.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    {service.category && (
                      <Text style={styles.serviceCategory}>{service.category}</Text>
                    )}
                  </View>
                  <View style={styles.serviceActions}>
                    <Switch
                      value={service.available}
                      onValueChange={() => toggleServiceAvailability(service.id)}
                      trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                      thumbColor={service.available ? '#fff' : '#9ca3af'}
                    />
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditService(service)}
                    >
                      <Ionicons name="pencil" size={20} color="#6366f1" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteService(service.id)}
                    >
                      <Ionicons name="trash" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.serviceDescription}>{service.description}</Text>
                
                <View style={styles.serviceDetails}>
                  {service.price && (
                    <View style={styles.detailItem}>
                      <Ionicons name="cash-outline" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>{service.price}</Text>
                    </View>
                  )}
                  {service.duration && (
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>{service.duration}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.serviceStatus}>
                  <Text style={[
                    styles.statusText,
                    service.available ? styles.statusAvailable : styles.statusUnavailable
                  ]}>
                    {service.available ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Add/Edit Service Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingService ? 'Edit Service' : 'Add Service'}
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, isLoading && styles.modalButtonDisabled]}
              onPress={handleSaveService}
              disabled={isLoading}
            >
              <Text style={[styles.modalButtonText, styles.saveButton]}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Service Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="e.g., Hair Cut, Consultation"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Describe what this service includes..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="e.g., $50, $25-$40, Starting at $100"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Duration</Text>
              <TextInput
                style={styles.input}
                value={formData.duration}
                onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
                placeholder="e.g., 30 minutes, 1-2 hours"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
                placeholder="e.g., Beauty, Medical, Consultation"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Available</Text>
                <Switch
                  value={formData.available}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, available: value }))}
                  trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                  thumbColor={formData.available ? '#fff' : '#9ca3af'}
                />
              </View>
              <Text style={styles.helpText}>
                Toggle to make this service available or unavailable to customers
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  serviceStatus: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusAvailable: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusUnavailable: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',  
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#6366f1',
  },
  saveButton: {
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
});
