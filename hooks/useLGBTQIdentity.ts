import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useFirebaseAuth';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { UserProfile } from '../types/user';

type LGBTQIdentityScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LGBTQIdentity'>;

interface IdentityState {
  visible: boolean;
  pronouns: string;
  identities: string[];
  preferredName: string;
}

export const useLGBTQIdentity = (navigation: LGBTQIdentityScreenNavigationProp) => {
  const { userProfile, updateUserProfile } = useAuth();

  const getInitialState = useCallback((): IdentityState => {
    const identityData = userProfile?.profile?.identity || {};
    return {
      visible: identityData.visible ?? false,
      pronouns: identityData.pronouns ?? '',
      identities: identityData.identities ?? [],
      preferredName: identityData.preferredName ?? '',
    };
  }, [userProfile]);

  const [identity, setIdentity] = useState<IdentityState>(getInitialState);
  const [customPronoun, setCustomPronoun] = useState('');
  const [customIdentity, setCustomIdentity] = useState('');
  const [saving, setSaving] = useState(false);

  const hasChanges = useMemo(() => {
    const initialState = getInitialState();
    return JSON.stringify(identity) !== JSON.stringify(initialState);
  }, [identity, getInitialState]);

  const handleToggleVisibility = useCallback(() => {
    setIdentity(prev => ({ ...prev, visible: !prev.visible }));
  }, []);

  const handlePronounSelect = useCallback((pronoun: string) => {
    setIdentity(prev => ({
      ...prev,
      pronouns: prev.pronouns === pronoun ? '' : pronoun,
    }));
  }, []);

  const handleIdentityToggle = useCallback((identityOption: string) => {
    setIdentity(prev => ({
      ...prev,
      identities: prev.identities.includes(identityOption)
        ? prev.identities.filter(id => id !== identityOption)
        : [...prev.identities, identityOption],
    }));
  }, []);

  const handleAddCustomPronoun = useCallback(() => {
    if (customPronoun.trim()) {
      setIdentity(prev => ({ ...prev, pronouns: customPronoun.trim() }));
      setCustomPronoun('');
    }
  }, [customPronoun]);

  const handleAddCustomIdentity = useCallback(() => {
    const trimmedIdentity = customIdentity.trim();
    if (trimmedIdentity && !identity.identities.includes(trimmedIdentity)) {
      setIdentity(prev => ({
        ...prev,
        identities: [...prev.identities, trimmedIdentity],
      }));
      setCustomIdentity('');
    }
  }, [customIdentity, identity.identities]);

  const handlePreferredNameChange = useCallback((name: string) => {
    setIdentity(prev => ({ ...prev, preferredName: name }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const updatedProfile: Partial<UserProfile> = {
        profile: {
          ...userProfile?.profile,
          identity: {
            ...userProfile?.profile?.identity,
            ...identity,
          },
        },
      };
      await updateUserProfile(updatedProfile);
      Alert.alert('Success', 'Identity settings saved!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving identity settings:', error);
      Alert.alert('Error', 'Failed to save identity settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [identity, userProfile, updateUserProfile, navigation]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Identity Settings',
      'Are you sure you want to reset all identity settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setIdentity({
              visible: false,
              pronouns: '',
              identities: [],
              preferredName: '',
            });
          },
        },
      ]
    );
  }, []);

  return {
    identity,
    customPronoun,
    setCustomPronoun,
    customIdentity,
    setCustomIdentity,
    saving,
    hasChanges,
    handleToggleVisibility,
    handlePronounSelect,
    handleIdentityToggle,
    handleAddCustomPronoun,
    handleAddCustomIdentity,
    handlePreferredNameChange,
    handleSave,
    handleReset,
  };
};
