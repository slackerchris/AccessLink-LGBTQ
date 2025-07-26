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
import { useAuth, useAuthActions } from '../../hooks/useAuth';

interface AccessibilityPreference {
  key: keyof NonNullable<NonNullable<ReturnType<typeof useAuth>['userProfile']>['profile']['accessibilityPreferences']>;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const accessibilityOptions: AccessibilityPreference[] = [
  {
    key: 'wheelchairAccess',
    title: 'Wheelchair Access',
    description: 'Prioritize businesses with wheelchair accessibility',
    icon: 'accessibility'
  },
  {
    key: 'visualImpairment',
    title: 'Visual Impairment Support',
    description: 'Show businesses with visual accessibility features',
    icon: 'eye-off'
  },
  {
    key: 'hearingImpairment',
    title: 'Hearing Impairment Support',
    description: 'Highlight businesses with hearing accessibility',
    icon: 'ear'
  },
  {
    key: 'cognitiveSupport',
    title: 'Cognitive Support',
    description: 'Find businesses with cognitive accessibility features',
    icon: 'bulb'
  },
  {
    key: 'mobilitySupport',
    title: 'Mobility Support',
    description: 'Show businesses with mobility assistance',
    icon: 'walk'
  },
  {
    key: 'sensoryFriendly',
    title: 'Sensory Friendly',
    description: 'Prioritize sensory-friendly environments',
    icon: 'flower'
  }
];

export default function AccessibilityPreferencesScreen() {
  const { userProfile } = useAuth();
  const { updateProfile } = useAuthActions();
  const [saving, setSaving] = useState(false);
  
  const currentPreferences = userProfile?.profile?.accessibilityPreferences || {
    wheelchairAccess: false,
    visualImpairment: false,
    hearingImpairment: false,
    cognitiveSupport: false,
    mobilitySupport: false,
    sensoryFriendly: false
  };

  const [preferences, setPreferences] = useState(currentPreferences);

  const handleTogglePreference = useCallback((key: AccessibilityPreference['key']) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      await updateProfile({
        profile: {
          ...userProfile?.profile,
          accessibilityPreferences: preferences
        }
      });
      Alert.alert('Success', 'Your accessibility preferences have been updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [preferences, updateProfile, userProfile]);

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
            const resetPreferences = {
              wheelchairAccess: false,
              visualImpairment: false,
              hearingImpairment: false,
              cognitiveSupport: false,
              mobilitySupport: false,
              sensoryFriendly: false
            };
            setPreferences(resetPreferences);
          }
        }
      ]
    );
  }, []);

  const renderPreferenceItem = ({ item }: { item: AccessibilityPreference }) => (
    <View key={item.key} style={styles.preferenceItem}>
      <View style={styles.preferenceIcon}>
        <Ionicons name={item.icon} size={24} color="#6366f1" />
      </View>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{item.title}</Text>
        <Text style={styles.preferenceDescription}>{item.description}</Text>
      </View>
      <Switch
        value={preferences[item.key]}
        onValueChange={() => handleTogglePreference(item.key)}
        trackColor={{ false: '#f3f4f6', true: '#c7d2fe' }}
        thumbColor={preferences[item.key] ? '#6366f1' : '#9ca3af'}
        ios_backgroundColor="#f3f4f6"
      />
    </View>
  );

  const hasChanges = JSON.stringify(preferences) !== JSON.stringify(currentPreferences);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accessibility Preferences</Text>
        <Text style={styles.headerSubtitle}>
          Customize your accessibility needs to find businesses that work best for you
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            These preferences help us show you businesses that meet your accessibility needs.
            Your preferences are private and only used to improve your search results.
          </Text>
        </View>

        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Select Your Accessibility Needs</Text>
          {accessibilityOptions.map(item => renderPreferenceItem({ item }))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          disabled={saving}
        >
          <Text style={styles.resetButtonText}>Reset All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            !hasChanges && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
        >
          <Text style={[
            styles.saveButtonText,
            !hasChanges && styles.saveButtonTextDisabled
          ]}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    marginLeft: 12,
  },
  preferencesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
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
    color: '#1f2937',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  saveButtonTextDisabled: {
    color: '#9ca3af',
  },
});
