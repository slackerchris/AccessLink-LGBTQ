import { useState } from 'react';
import { Alert } from 'react-native';
import { useBusiness } from './useFirebaseAuth';
import { BusinessCategory } from '../services/businessService';
import { validators } from '../utils/validators';
import { BusinessListing } from '../types/business';

type FormData = Partial<Omit<BusinessListing, 'id' | 'averageRating' | 'totalReviews' | 'createdAt' | 'updatedAt'>>;

const initialFormData: FormData = {
  name: '',
  description: '',
  category: 'other',
  location: {
    address: '',
    city: '',
    state: '',
    zipCode: '',
  },
  contact: {
    phone: '',
    email: '',
    website: '',
  },
  accessibility: {
    wheelchairAccessible: false,
    brailleMenus: false,
    signLanguageSupport: false,
    quietSpaces: false,
    accessibilityNotes: '',
  },
  lgbtqFriendly: {
    verified: false,
    certifications: [],
    inclusivityFeatures: [],
  },
};

export const useAddBusiness = (onSuccess: () => void) => {
  const { createBusiness, loading: businessLoading } = useBusiness();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (section: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value,
      },
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name?.trim()) return 'Business name is required';
    if (!formData.description?.trim()) return 'Business description is required';
    if (!formData.location?.address?.trim()) return 'Address is required';
    if (!formData.location?.city?.trim()) return 'City is required';
    if (!formData.location?.state?.trim()) return 'State is required';
    if (!formData.location?.zipCode?.trim()) return 'ZIP code is required';
    
    if (formData.contact?.email && !validators.email(formData.contact.email).isValid) {
      return validators.email(formData.contact.email).message;
    }
    
    if (formData.contact?.phone && !validators.phone(formData.contact.phone).isValid) {
      return validators.phone(formData.contact.phone).message;
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      await createBusiness(formData);
      Alert.alert(
        'Success',
        'Business has been created successfully and is pending approval!',
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      Alert.alert('Error', `Failed to create business: ${message}`);
    }
  };

  return {
    formData,
    businessLoading,
    handleInputChange,
    handleNestedInputChange,
    handleSubmit,
  };
};
