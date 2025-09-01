import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useFirebaseAuth';
import { useBusinesses } from './useBusiness';
import { enhancedBusinessService } from '../services/enhancedBusinessService';
import { ServiceItem } from '../types/service';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type ServicesManagementScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ServicesManagement'
>;

export const useServicesManagement = (navigation: ServicesManagementScreenNavigationProp) => {
  const { user } = useAuth();
  const { businesses, refresh: refreshBusinesses } = useBusinesses();

  const userBusiness = useMemo(() => 
    businesses.find(b => b.ownerId === user?.uid)
  , [businesses, user]);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListLoading, setListLoading] = useState(true);
  const [formData, setFormData] = useState<Omit<ServiceItem, 'id'>>({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    available: true,
  });

  const loadServices = useCallback(async () => {
    if (userBusiness?.id) {
      setListLoading(true);
      const result = await enhancedBusinessService.getServices(userBusiness.id);
      if (result.success && result.data) {
        setServices(result.data);
      } else {
        console.error('Error loading services:', result.error);
        Alert.alert('Error', 'Could not load your services. Please try again.');
      }
      setListLoading(false);
    } else {
      setListLoading(false);
    }
  }, [userBusiness]);

  useEffect(() => {
    if (userBusiness) {
        loadServices();
    } else {
        setListLoading(false);
    }
  }, [userBusiness, loadServices]);

  const handleAddService = useCallback(() => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      available: true,
    });
    setIsModalVisible(true);
  }, []);

  const handleEditService = useCallback((service: ServiceItem) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price || '',
      duration: service.duration || '',
      category: service.category || '',
      available: service.available,
    });
    setIsModalVisible(true);
  }, []);

  const handleSaveService = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill in service name and description.');
      return;
    }

    if (!userBusiness?.id) {
      Alert.alert('Error', 'Business not found. Cannot save service.');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      const serviceData = {
        ...formData,
        price: formData.price || undefined,
        duration: formData.duration || undefined,
        category: formData.category || undefined,
      };

      if (editingService) {
        result = await enhancedBusinessService.updateService(userBusiness.id, editingService.id, serviceData);
      } else {
        result = await enhancedBusinessService.addService(userBusiness.id, serviceData);
      }

      if (result.success) {
        await loadServices();
        await refreshBusinesses();
        setIsModalVisible(false);
        Alert.alert('Success', `Service ${editingService ? 'updated' : 'added'} successfully!`);
      } else {
        throw result.error || new Error('Failed to save service.');
      }
    } catch (error: any) {
      console.error('Error saving service:', error);
      Alert.alert('Error', error.message || 'Failed to save service. Please try again.');
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
            const result = await enhancedBusinessService.deleteService(userBusiness.id, serviceId);
            setIsLoading(false);
            if (result.success) {
              await loadServices();
              await refreshBusinesses();
              Alert.alert('Success', 'Service deleted successfully!');
            } else {
              console.error('Error deleting service:', result.error);
              Alert.alert('Error', 'Failed to delete service. Please try again.');
            }
          },
        },
      ],
    );
  };

  const toggleServiceAvailability = async (service: ServiceItem) => {
    if (!userBusiness?.id) return;

    const optimisticServices = services.map(s => 
      s.id === service.id ? { ...s, available: !s.available } : s
    );
    setServices(optimisticServices);

    const result = await enhancedBusinessService.updateService(userBusiness.id, service.id, { available: !service.available });

    if (!result.success) {
      Alert.alert('Error', 'Failed to update service availability. Please try again.');
      console.error('Error updating service availability:', result.error);
      // Revert optimistic update on failure
      setServices(services);
    } else {
      await refreshBusinesses();
    }
  };

  return {
    navigation,
    userBusiness,
    services,
    isModalVisible,
    setIsModalVisible,
    editingService,
    isLoading,
    isListLoading,
    formData,
    setFormData,
    handleAddService,
    handleEditService,
    handleSaveService,
    handleDeleteService,
    toggleServiceAvailability,
  };
};
