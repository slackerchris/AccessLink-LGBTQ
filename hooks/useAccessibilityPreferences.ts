import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useFirebaseAuth';
import { useTheme } from './useTheme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { UserProfile } from '../types/user';

type AccessibilityPreferencesNavigationProp = StackNavigationProp<RootStackParamList, 'AccessibilityPreferences'>;

// Represents the state of the toggles in the UI
export interface AccessibilityPreferenceToggles {
  wheelchairAccess: boolean;
  aslInterpretation: boolean;
  brailleMenus: boolean;
  largePrint: boolean;
  audioAssistance: boolean;
  serviceAnimalFriendly: boolean;
  quietSpaces: boolean;
  genderNeutralRestrooms: boolean;
  sensoryAccommodations: boolean;
  [key: string]: boolean;
}

// Maps UI toggles to the backend UserProfile accessibility fields
const preferenceMapping: { [K in keyof AccessibilityPreferenceToggles]?: (keyof UserProfile['profile']['accessibilityPreferences'])[] } = {
  wheelchairAccess: ['wheelchairAccess'],
  aslInterpretation: ['hearingImpairment'],
  brailleMenus: ['visualImpairment'],
  largePrint: ['visualImpairment'],
  audioAssistance: ['hearingImpairment'],
  serviceAnimalFriendly: ['mobilitySupport'],
  quietSpaces: ['sensoryFriendly', 'cognitiveSupport'],
  genderNeutralRestrooms: ['genderNeutralRestrooms'],
  sensoryAccommodations: ['sensoryFriendly'],
};

export const useAccessibilityPreferences = (navigation: AccessibilityPreferencesNavigationProp) => {
  const { userProfile, updateUserProfile } = useAuth();
  const { highVisibility, toggleHighVisibility } = useTheme();
  const [saving, setSaving] = useState(false);

  // Derives the initial state of UI toggles from the user profile
  const getInitialToggles = useCallback((): AccessibilityPreferenceToggles => {
    const backendPrefs = userProfile?.profile?.accessibilityPreferences || {};
    const initialToggles: AccessibilityPreferenceToggles = {
      wheelchairAccess: false, aslInterpretation: false, brailleMenus: false,
      largePrint: false, audioAssistance: false, serviceAnimalFriendly: false,
      quietSpaces: false, genderNeutralRestrooms: false, sensoryAccommodations: false,
    };

    for (const toggleKey in preferenceMapping) {
      const backendKeys = preferenceMapping[toggleKey as keyof AccessibilityPreferenceToggles];
      if (backendKeys) {
        // A toggle is on if ANY of its corresponding backend fields are true
        const isSet = backendKeys.some(backendKey => backendPrefs[backendKey]);
        initialToggles[toggleKey] = isSet;
      }
    }
    return initialToggles;
  }, [userProfile]);

  const [toggles, setToggles] = useState<AccessibilityPreferenceToggles>(getInitialToggles);

  // Resets the local state if the user profile changes (e.g., after a remote update)
  useEffect(() => {
    setToggles(getInitialToggles());
  }, [userProfile, getInitialToggles]);

  const handleTogglePreference = useCallback((key: string) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Memoized value to check if there are any unsaved changes
  const hasChanges = useMemo(() => {
    const initialToggles = getInitialToggles();
    return JSON.stringify(toggles) !== JSON.stringify(initialToggles);
  }, [toggles, getInitialToggles]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      // Convert UI toggle state back to the backend data structure
      const newBackendPrefs: UserProfile['profile']['accessibilityPreferences'] = {
        wheelchairAccess: false, visualImpairment: false, hearingImpairment: false,
        cognitiveSupport: false, mobilitySupport: false, sensoryFriendly: false,
        genderNeutralRestrooms: false,
      };

      for (const toggleKey in toggles) {
        if (toggles[toggleKey]) {
          const backendKeys = preferenceMapping[toggleKey as keyof AccessibilityPreferenceToggles];
          backendKeys?.forEach(backendKey => {
            newBackendPrefs[backendKey] = true;
          });
        }
      }

      await updateUserProfile({
        profile: {
          ...userProfile?.profile,
          accessibilityPreferences: newBackendPrefs,
        },
      });

      Alert.alert('Success', 'Your accessibility preferences have been updated!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [toggles, userProfile, updateUserProfile, navigation]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Preferences',
      'Are you sure you want to reset all accessibility preferences?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setToggles({
              wheelchairAccess: false, aslInterpretation: false, brailleMenus: false,
              largePrint: false, audioAssistance: false, serviceAnimalFriendly: false,
              quietSpaces: false, genderNeutralRestrooms: false, sensoryAccommodations: false,
            });
          },
        },
      ]
    );
  }, []);

  return {
    preferences: toggles, // Keep 'preferences' name for component compatibility
    saving,
    hasChanges,
    highVisibility,
    toggleHighVisibility,
    handleTogglePreference,
    handleSave,
    handleReset,
  };
};
