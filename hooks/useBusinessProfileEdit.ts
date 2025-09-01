import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth, useBusiness } from './useFirebaseAuth';
import { BusinessListing } from '../types/business';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const useBusinessProfileEdit = () => {
  const { user } = useAuth();
  const { getMyBusinesses, updateBusiness } = useBusiness();
  const navigation = useNavigation<NavigationProp>();

  const [userBusiness, setUserBusiness] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<BusinessListing>>({});

  useEffect(() => {
    const loadBusiness = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const businesses = await getMyBusinesses();
        if (businesses.length > 0) {
          const business = businesses[0];
          setUserBusiness(business);
          setFormData({
            name: business.name || '',
            description: business.description || '',
            category: business.category || 'other',
            contact: business.contact || {},
            location: business.location || { address: '' },
            hours: business.hours || {},
            accessibility: business.accessibility || {
              wheelchairAccessible: false,
              brailleMenus: false,
              signLanguageSupport: false,
              quietSpaces: false,
              accessibilityNotes: '',
            },
            profilePhoto: business.profilePhoto,
          });
        }
      } catch (error) {
        console.error('Error loading business:', error);
        Alert.alert('Error', 'Could not load your business profile.');
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [user, getMyBusinesses]);

  const handleFormChange = useCallback((field: keyof BusinessListing, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNestedChange = useCallback((field: keyof BusinessListing, nestedField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] as object),
        [nestedField]: value,
      },
    }));
  }, []);

  const handleHoursChange = useCallback((day: string, part: 'open' | 'close' | 'closed', value: any) => {
    setFormData(prev => {
      const dayHours = prev.hours?.[day] || { open: '', close: '', closed: false };
      return {
        ...prev,
        hours: {
          ...prev.hours,
          [day]: {
            ...dayHours,
            [part]: value,
          },
        },
      };
    });
  }, []);

  const onPhotoUploaded = useCallback((downloadURL: string) => {
    setUserBusiness(prev => prev ? { ...prev, profilePhoto: downloadURL } : null);
    handleFormChange('profilePhoto', downloadURL);
  }, [handleFormChange]);

  const onPhotoRemoved = useCallback(() => {
    setUserBusiness(prev => prev ? { ...prev, profilePhoto: null } : null);
    handleFormChange('profilePhoto', null);
  }, [handleFormChange]);

  const handleSave = async () => {
    if (!userBusiness) return;

    setIsSaving(true);
    try {
      const updatedBusiness: Partial<BusinessListing> = {
        ...formData,
        updatedAt: new Date(),
      };

      await updateBusiness(userBusiness.id, updatedBusiness);

      Alert.alert(
        'Success',
        'Your business profile has been updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    userBusiness,
    loading,
    isSaving,
    formData,
    handleSave,
    handleFormChange,
    handleNestedChange,
    handleHoursChange,
    onPhotoUploaded,
    onPhotoRemoved,
  };
};
