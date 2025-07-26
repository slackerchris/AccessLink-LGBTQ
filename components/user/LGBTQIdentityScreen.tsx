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

export default function LGBTQIdentityScreen() {
  const { userProfile } = useAuth();
  const { updateProfile } = useAuthActions();
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LGBTQ+ Identity Settings</Text>
        <Text style={styles.headerSubtitle}>
          Share your identity to connect with affirming businesses and community
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Control */}
        <View style={styles.privacySection}>
          <View style={styles.privacyHeader}>
            <View style={styles.privacyIconContainer}>
              <Ionicons name="shield-checkmark" size={24} color="#16a34a" />
            </View>
            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>Identity Visibility</Text>
              <Text style={styles.privacyDescription}>
                Control whether your identity information is visible to businesses and other users
              </Text>
            </View>
            <Switch
              value={identity.visible}
              onValueChange={handleToggleVisibility}
              trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
              thumbColor={identity.visible ? '#16a34a' : '#9ca3af'}
              ios_backgroundColor="#f3f4f6"
            />
          </View>
          <View style={styles.privacyNote}>
            <Ionicons name="lock-closed" size={16} color="#6b7280" />
            <Text style={styles.privacyNoteText}>
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
              <Ionicons name="add" size={20} color={customPronoun.trim() ? '#fff' : '#9ca3af'} />
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
                  <Ionicons name="checkmark" size={16} color="#fff" style={styles.checkmark} />
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
              <Ionicons name="add" size={20} color={customIdentity.trim() ? '#fff' : '#9ca3af'} />
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
  privacySection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    backgroundColor: '#dcfce7',
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
    color: '#1f2937',
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 52,
  },
  privacyNoteText: {
    fontSize: 12,
    color: '#6b7280',
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
    color: '#1f2937',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
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
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  optionChipSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  optionChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  optionChipTextSelected: {
    color: '#fff',
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
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#e5e7eb',
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
