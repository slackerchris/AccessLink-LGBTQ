import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth as useFirebaseAuth } from './useFirebaseAuth';
import { UserProfile } from '../types/user';

type ProfileFormData = {
  displayName: string;
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
};

export const useEditProfile = (navigation: any) => {
  const { user, userProfile, updateUserProfile } = useFirebaseAuth();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || user?.displayName || '',
        firstName: (userProfile.profile?.details as { firstName?: string })?.firstName ?? '',
        lastName: (userProfile.profile?.details as { lastName?: string })?.lastName ?? '',
        phone: (userProfile.profile?.details as { phoneNumber?: string })?.phoneNumber ?? '',
        bio: (userProfile.profile?.details as { bio?: string })?.bio ?? '',
      });
      setInterests((userProfile.profile?.details as { interests?: string[] })?.interests ?? []);
    }
  }, [userProfile, user]);

  const handleSave = useCallback(async () => {
    if (!formData.displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    setLoading(true);
    try {
      const updatedProfileData: Partial<UserProfile> = {
        displayName: formData.displayName,
        profile: {
          ...userProfile?.profile,
          details: {
            ...(userProfile?.profile?.details as object),
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phone,
            bio: formData.bio,
            interests,
          },
        },
      };

      await updateUserProfile(updatedProfileData);
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [formData, interests, userProfile, updateUserProfile, navigation]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handlePhotoUpload = (downloadURL: string) => {
    console.log('✅ Profile photo uploaded:', downloadURL);
    // The photoUploadService already updates the user document
    // We could trigger a profile refresh here if needed
  };

  const handlePhotoRemove = () => {
    console.log('🗑️ Profile photo removed');
    // Handle profile photo removal if needed
  };

  return {
    user,
    userProfile,
    formData,
    setFormData,
    interests,
    toggleInterest,
    loading,
    handleSave,
    handlePhotoUpload,
    handlePhotoRemove,
  };
};
