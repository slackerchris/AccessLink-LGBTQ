import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth as useFirebaseAuth, useAuthActions as useFirebaseAuthActions } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';

interface AccessibilityPreference {
  key: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface PreferenceState {
  [key: string]: boolean;
  wheelchairAccess: boolean;
  aslInterpretation: boolean;
  brailleMenus: boolean;
  largePrint: boolean;
  audioAssistance: boolean;
  serviceAnimalFriendly: boolean;
  quietSpaces: boolean;
  genderNeutralRestrooms: boolean;
  sensoryAccommodations: boolean;
}

const accessibilityOptions: AccessibilityPreference[] = [
  {
    key: 'wheelchairAccess',
    title: 'Wheelchair Accessible',
    description: 'Prioritize businesses with wheelchair accessibility',
    icon: 'accessibility'
  },
  {
    key: 'aslInterpretation',
    title: 'ASL Interpretation',
    description: 'Find businesses offering sign language interpretation',
    icon: 'hand-left'
  },
  {
    key: 'brailleMenus',
    title: 'Braille Menus',
    description: 'Show businesses that offer braille menus',
    icon: 'document-text'
  },
  {
    key: 'largePrint',
    title: 'Large Print',
    description: 'Places with large print materials available',
    icon: 'text'
  },
  {
    key: 'audioAssistance',
    title: 'Audio Assistance',
    description: 'Businesses with audio assistance options',
    icon: 'volume-high'
  },
  {
    key: 'serviceAnimalFriendly',
    title: 'Service Animal Friendly',
    description: 'Places that welcome service animals',
    icon: 'paw'
  },
  {
    key: 'quietSpaces',
    title: 'Quiet Spaces',
    description: 'Businesses with quiet areas or accommodations',
    icon: 'volume-mute'
  },
  {
    key: 'genderNeutralRestrooms',
    title: 'Gender Neutral Restrooms',
    description: 'Places with inclusive restroom facilities',
    icon: 'transgender'
  },
  {
    key: 'sensoryAccommodations',
    title: 'Sensory Accommodations',
    description: 'Businesses with sensory-friendly environments',
    icon: 'flower'
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  preferencesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  saveButtonDisabled: {
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  saveButtonTextDisabled: {
    // Color will be set dynamically
  },
});

export default function AccessibilityPreferencesScreen({ navigation }: { navigation: any }) {
  const { userProfile } = useFirebaseAuth();
  const { updateProfile } = useFirebaseAuthActions();
  const { colors, highVisibility, toggleHighVisibility } = useTheme();
  const [saving, setSaving] = useState(false);
  
  // Initialize preferences from user profile if available
  // Adjusted: accessibilityPreferences now expected under userProfile?.profile?.details?.accessibilityPreferences
  const accessPrefs = userProfile?.profile?.accessibilityPreferences? || {
    wheelchairAccess: false,
    visualImpairment: false,
    hearingImpairment: false,
    cognitiveSupport: false,
    mobilitySupport: false,
    sensoryFriendly: false
  };
  
  // Map existing preferences to our UI options
  const currentPreferences: PreferenceState = {
    wheelchairAccess: accessPrefs.wheelchairAccess || false,
    aslInterpretation: accessPrefs.hearingImpairment || false,
    brailleMenus: accessPrefs.visualImpairment || false,
    largePrint: accessPrefs.visualImpairment || false,
    audioAssistance: accessPrefs.hearingImpairment || false,
    serviceAnimalFriendly: accessPrefs.mobilitySupport || false,
    quietSpaces: accessPrefs.sensoryFriendly || false,
    genderNeutralRestrooms: false, // Not in original schema
    sensoryAccommodations: accessPrefs.sensoryFriendly || false
  };

  const [preferences, setPreferences] = useState<PreferenceState>(currentPreferences);

  // Sync preferences with userProfile changes
  React.useEffect(() => {
    setPreferences(currentPreferences);
  }, [userProfile]);

  const handleTogglePreference = useCallback((key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof PreferenceState]
    }));
  }, []);

  // Helper to safely merge accessibility preferences with existing profile fields
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      // Map UI preferences to backend structure
      const accessibilityPreferences = {
        wheelchairAccess: preferences.wheelchairAccess,
        visualImpairment: preferences.brailleMenus || preferences.largePrint,
        hearingImpairment: preferences.aslInterpretation || preferences.audioAssistance,
        cognitiveSupport: preferences.quietSpaces,
        mobilitySupport: preferences.serviceAnimalFriendly,
        sensoryFriendly: preferences.sensoryAccommodations || preferences.quietSpaces
      };
      // Merge with existing profile fields to avoid overwriting other fields
      await updateProfile({
        profile: {
          ...userProfile?.profile,
          accessibilityPreferences: {
        ...userProfile?.profile?.accessibilityPreferences,
        ...accessibilityPreferences
          }
        }
      });
      Alert.alert('Success', 'Your accessibility preferences have been updated!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [preferences, navigation, updateProfile, userProfile]);

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
            const resetPreferences: PreferenceState = {
              wheelchairAccess: false,
              aslInterpretation: false,
              brailleMenus: false,
              largePrint: false,
              audioAssistance: false,
              serviceAnimalFriendly: false,
              quietSpaces: false,
              genderNeutralRestrooms: false,
              sensoryAccommodations: false
            };
            setPreferences(resetPreferences);
          }
        }
      ]
    );
  }, []);

  const renderPreferenceItem = ({ item }: { item: AccessibilityPreference }) => (
    <View key={item.key} style={[styles.preferenceItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.preferenceIcon, { backgroundColor: colors.surface }]}>
        <Ionicons name={item.icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.preferenceContent}>
        <Text style={[styles.preferenceTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>{item.description}</Text>
      </View>
      <Switch
        value={preferences[item.key as keyof PreferenceState]}
        onValueChange={() => handleTogglePreference(item.key)}
        trackColor={{ false: colors.border, true: colors.primary + '40' }}
        thumbColor={preferences[item.key as keyof PreferenceState] ? colors.primary : '#9ca3af'}
        ios_backgroundColor={colors.border}
      />
    </View>
  );

  const hasChanges = JSON.stringify(preferences) !== JSON.stringify(currentPreferences);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>Accessibility Preferences</Text>
          <Text style={[styles.headerSubtitle, { color: colors.headerText }]}>
            Customize your accessibility needs to find businesses that work best for you
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            These preferences help us show you businesses that meet your accessibility needs.
            Your preferences are private and only used to improve your search results.
          </Text>
        </View>

        {/* High Visibility Settings */}
        <View style={styles.preferencesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Display Settings</Text>
          <View style={[styles.preferenceItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.preferenceIcon, { backgroundColor: colors.surface }]}>
              <Ionicons name="eye" size={24} color={colors.primary} />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>High Visibility Mode</Text>
              <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                Enhanced contrast and larger text for better readability
              </Text>
            </View>
            <Switch
              value={highVisibility}
              onValueChange={toggleHighVisibility}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={highVisibility ? colors.primary : '#9ca3af'}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        <View style={styles.preferencesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Your Accessibility Needs</Text>
          {accessibilityOptions.map(item => renderPreferenceItem({ item }))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleReset}
          disabled={saving}
        >
          <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.primary },
            !hasChanges && [styles.saveButtonDisabled, { backgroundColor: '#9ca3af' }]
          ]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
        >
          <Text style={[
            styles.saveButtonText,
            !hasChanges && [styles.saveButtonTextDisabled, { color: colors.surface }]
          ]}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
