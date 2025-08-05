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
import { useAuth } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';

interface AccessibilityPreference {
  key: string;
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

export default function AccessibilityPreferencesScreen({ navigation }: { navigation: any }) {
  const { userProfile } = useAuth();
  const { colors, highVisibility, toggleHighVisibility } = useTheme();
  const [saving, setSaving] = useState(false);
  
  const currentPreferences = {
    wheelchairAccess: false,
    visualImpairment: false,
    hearingImpairment: false,
    cognitiveSupport: false,
    mobilitySupport: false,
    sensoryFriendly: false
  };

  const [preferences, setPreferences] = useState(currentPreferences);

  const handleTogglePreference = useCallback((key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      // TODO: Implement save functionality with Firebase
      console.log('Saving preferences:', preferences);
      Alert.alert('Success', 'Your accessibility preferences have been updated!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [preferences, navigation]);

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
    <View key={item.key} style={[styles.preferenceItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.preferenceIcon}>
        <Ionicons name={item.icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.preferenceContent}>
        <Text style={[styles.preferenceTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>{item.description}</Text>
      </View>
      <Switch
        value={preferences[item.key]}
        onValueChange={() => handleTogglePreference(item.key)}
        trackColor={{ false: colors.border, true: colors.primary + '40' }}
        thumbColor={preferences[item.key] ? colors.primary : colors.textSecondary}
        ios_backgroundColor={colors.border}
      />
    </View>
  );

  const hasChanges = JSON.stringify(preferences) !== JSON.stringify(currentPreferences);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      paddingTop: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    headerTitle: {
      flex: 1,
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 40,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    infoCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      alignItems: 'flex-start',
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: colors.primary,
      lineHeight: 20,
      marginLeft: 12,
    },
    preferencesSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    preferenceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    preferenceIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
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
      color: colors.text,
      marginBottom: 2,
    },
    preferenceDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      padding: 20,
      paddingBottom: 30,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    resetButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    resetButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    saveButton: {
      flex: 2,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveButtonDisabled: {
      backgroundColor: colors.surface,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    saveButtonTextDisabled: {
      color: colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Accessibility Preferences</Text>
        <View style={styles.headerSpacer} />
        <Text style={[styles.headerSubtitle, { color: colors.headerText }]}>
          Customize your accessibility needs to find businesses that work best for you
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            These preferences help us show you businesses that meet your accessibility needs.
            Your preferences are private and only used to improve your search results.
          </Text>
        </View>

        {/* High Visibility Settings */}
        <View style={styles.preferencesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Display Settings</Text>
          <View style={[styles.preferenceItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.preferenceIcon}>
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
              thumbColor={highVisibility ? colors.primary : colors.textSecondary}
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
