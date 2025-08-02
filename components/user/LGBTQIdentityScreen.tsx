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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAuthActions } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

const lgbtqIdentityOptions = [
  'Lesbian',
  'Gay',
  'Bisexual',
  'Transgender',
  'Queer',
  'Questioning',
  'Intersex',
  'Asexual',
  'Pansexual',
  'Non-binary',
  'Genderfluid',
  'Demisexual',
  'Two-Spirit',
  'Ally',
  'Other'
];

const pronounOptions = [
  'she/her',
  'he/him',
  'they/them',
  'ze/zir',
  'xe/xem',
  'it/its',
  'any pronouns',
  'ask me',
  'prefer not to say'
];

export default function LGBTQIdentityScreen({ navigation }: { navigation: any }) {
  const { userProfile } = useAuth();
  const { updateProfile } = useAuthActions();
  const { colors } = useTheme();
  const [saving, setSaving] = useState(false);
  
  const currentIdentity = userProfile?.profile?.lgbtqIdentity || {
    visible: false,
    pronouns: '',
    identities: [],
    preferredName: ''
  };

  const [identity, setIdentity] = useState(currentIdentity);
  const [customPronoun, setCustomPronoun] = useState('');
  const [customIdentity, setCustomIdentity] = useState('');

  const handleToggleVisibility = useCallback(() => {
    setIdentity(prev => ({
      ...prev,
      visible: !prev.visible
    }));
  }, []);

  const handlePronounSelect = useCallback((pronoun: string) => {
    setIdentity(prev => ({
      ...prev,
      pronouns: prev.pronouns === pronoun ? '' : pronoun
    }));
  }, []);

  const handleIdentityToggle = useCallback((identityOption: string) => {
    setIdentity(prev => ({
      ...prev,
      identities: prev.identities.includes(identityOption)
        ? prev.identities.filter(id => id !== identityOption)
        : [...prev.identities, identityOption]
    }));
  }, []);

  const handleAddCustomPronoun = useCallback(() => {
    if (customPronoun.trim()) {
      setIdentity(prev => ({
        ...prev,
        pronouns: customPronoun.trim()
      }));
      setCustomPronoun('');
    }
  }, [customPronoun]);

  const handleAddCustomIdentity = useCallback(() => {
    if (customIdentity.trim() && !identity.identities.includes(customIdentity.trim())) {
      setIdentity(prev => ({
        ...prev,
        identities: [...prev.identities, customIdentity.trim()]
      }));
      setCustomIdentity('');
    }
  }, [customIdentity, identity.identities]);

  const handlePreferredNameChange = useCallback((name: string) => {
    setIdentity(prev => ({
      ...prev,
      preferredName: name
    }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      await updateProfile({
        profile: {
          ...userProfile?.profile,
          lgbtqIdentity: identity
        }
      });
      Alert.alert('Success', 'Your LGBTQ+ identity settings have been updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save identity settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [identity, updateProfile, userProfile]);

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
              preferredName: ''
            });
          }
        }
      ]
    );
  }, []);

  const hasChanges = JSON.stringify(identity) !== JSON.stringify(currentIdentity);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
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
      marginTop: 4,
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
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
    privacySection: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    privacyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    privacyIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    privacyContent: {
      flex: 1,
    },
    privacyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    privacyDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    privacyNote: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 52,
    },
    privacyNoteText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 6,
      flex: 1,
      lineHeight: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.card,
      color: colors.text,
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    optionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    optionChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionChipText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    optionChipTextSelected: {
      color: '#FFFFFF',
    },
    checkmark: {
      marginLeft: 6,
    },
    customInputContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    customInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      backgroundColor: colors.card,
      color: colors.text,
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonDisabled: {
      backgroundColor: colors.surface,
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
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>LGBTQ+ Identity Settings</Text>
          <Text style={[styles.headerSubtitle, { color: colors.headerText }]}>
            Share your identity to connect with affirming businesses and community
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Control */}
        <View style={[styles.privacySection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.privacyHeader}>
            <View style={styles.privacyIconContainer}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            </View>
            <View style={styles.privacyContent}>
              <Text style={[styles.privacyTitle, { color: colors.text }]}>Identity Visibility</Text>
              <Text style={[styles.privacyDescription, { color: colors.textSecondary }]}>
                Control whether your identity information is visible to businesses and other users
              </Text>
            </View>
            <Switch
              value={identity.visible}
              onValueChange={handleToggleVisibility}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={identity.visible ? colors.primary : colors.textSecondary}
              ios_backgroundColor={colors.border}
            />
          </View>
          <View style={styles.privacyNote}>
            <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
            <Text style={[styles.privacyNoteText, { color: colors.textSecondary }]}>
              {identity.visible ? 
                'Your identity information will be visible to help you find affirming spaces' :
                'Your identity information is private and only used for personalized recommendations'
              }
            </Text>
          </View>
        </View>

        {/* Preferred Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your preferred name (optional)"
            value={identity.preferredName}
            onChangeText={handlePreferredNameChange}
            maxLength={50}
          />
        </View>

        {/* Pronouns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pronouns</Text>
          <View style={styles.optionsGrid}>
            {pronounOptions.map((pronoun) => (
              <TouchableOpacity
                key={pronoun}
                style={[
                  styles.optionChip,
                  identity.pronouns === pronoun && styles.optionChipSelected
                ]}
                onPress={() => handlePronounSelect(pronoun)}
              >
                <Text style={[
                  styles.optionChipText,
                  identity.pronouns === pronoun && styles.optionChipTextSelected
                ]}>
                  {pronoun}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="Custom pronouns"
              value={customPronoun}
              onChangeText={setCustomPronoun}
              maxLength={20}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                !customPronoun.trim() && styles.addButtonDisabled
              ]}
              onPress={handleAddCustomPronoun}
              disabled={!customPronoun.trim()}
            >
              <Ionicons name="add" size={20} color={customPronoun.trim() ? '#FFFFFF' : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Identity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identity (Select all that apply)</Text>
          <View style={styles.optionsGrid}>
            {lgbtqIdentityOptions.map((identityOption) => (
              <TouchableOpacity
                key={identityOption}
                style={[
                  styles.optionChip,
                  identity.identities.includes(identityOption) && styles.optionChipSelected
                ]}
                onPress={() => handleIdentityToggle(identityOption)}
              >
                <Text style={[
                  styles.optionChipText,
                  identity.identities.includes(identityOption) && styles.optionChipTextSelected
                ]}>
                  {identityOption}
                </Text>
                {identity.identities.includes(identityOption) && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" style={styles.checkmark} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="Custom identity"
              value={customIdentity}
              onChangeText={setCustomIdentity}
              maxLength={30}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                !customIdentity.trim() && styles.addButtonDisabled
              ]}
              onPress={handleAddCustomIdentity}
              disabled={!customIdentity.trim()}
            >
              <Ionicons name="add" size={20} color={customIdentity.trim() ? '#FFFFFF' : colors.textSecondary} />
            </TouchableOpacity>
          </View>
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
            {saving ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
