import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAuthActions } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';

export function EditProfileScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { updateProfile } = useAuthActions();
  const { colors } = useTheme();
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    firstName: '',  // TODO: Implement detailed profile fields
    lastName: '',
    phone: '',
    bio: '',
    preferredPronouns: '',
  });

  const [interests, setInterests] = useState<string[]>([]);

  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        displayName: formData.displayName,
        // TODO: Implement detailed profile fields in web auth service
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
          preferredPronouns: formData.preferredPronouns,
          interests,
          accessibilityNeeds,
        }
      });
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleAccessibilityNeed = (need: string) => {
    setAccessibilityNeeds(prev => 
      prev.includes(need) 
        ? prev.filter(n => n !== need)
        : [...prev, need]
    );
  };

  const commonInterests = [
    'Arts & Culture', 'Music', 'Sports', 'Food & Dining', 'Nightlife',
    'Shopping', 'Health & Wellness', 'Education', 'Community Events',
    'Travel', 'Technology', 'Books', 'Movies', 'Volunteering'
  ];

  const commonAccessibilityNeeds = [
    'Wheelchair Accessible', 'ASL Interpretation', 'Braille Menus',
    'Large Print', 'Audio Assistance', 'Service Animal Friendly',
    'Quiet Spaces', 'Gender Neutral Restrooms', 'Sensory Accommodations'
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.header }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>Edit Profile</Text>
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Save profile"
            accessibilityHint="Saves your profile changes"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileIcon}>
          <Ionicons name="person-circle" size={100} color={colors.primary} />
          <TouchableOpacity 
            style={[styles.editIconButton, { backgroundColor: colors.primary }]}
            onPress={() => Alert.alert('Profile Photo', 'Photo upload will be available in the next app update. For now, your profile uses a default icon.')}
          >
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Display Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={formData.displayName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
              placeholder="How you'd like to be shown"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Display name"
              accessibilityHint="Enter the name you want others to see"
              returnKeyType="next"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={formData.firstName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                placeholder="First name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={formData.lastName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                placeholder="Last name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Preferred Pronouns</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={formData.preferredPronouns}
              onChangeText={(text) => setFormData(prev => ({ ...prev, preferredPronouns: text }))}
              placeholder="e.g., they/them, she/her, he/him"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="(555) 123-4567"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us a bit about yourself..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Interests</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Select topics you're interested in to help us recommend relevant businesses
          </Text>
          <View style={styles.tagContainer}>
            {commonInterests.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.tag,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  interests.includes(interest) && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => toggleInterest(interest)}
                accessibilityRole="button"
                accessibilityLabel={`${interest} interest`}
                accessibilityHint={`${interests.includes(interest) ? 'Remove' : 'Add'} ${interest} from your interests`}
                accessibilityState={{ selected: interests.includes(interest) }}
              >
                <Text style={[
                  styles.tagText,
                  { color: colors.text },
                  interests.includes(interest) && { color: '#ffffff' }
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Accessibility Needs</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Help us find businesses that meet your accessibility requirements
          </Text>
          <View style={styles.tagContainer}>
            {commonAccessibilityNeeds.map((need) => (
              <TouchableOpacity
                key={need}
                style={[
                  styles.tag,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  accessibilityNeeds.includes(need) && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => toggleAccessibilityNeed(need)}
              >
                <Text style={[
                  styles.tagText,
                  { color: colors.text },
                  accessibilityNeeds.includes(need) && { color: '#ffffff' }
                ]}>
                  {need}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 12, // Increased for better touch target
    minWidth: 44, // Ensure minimum touch target
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20, // Increased for better readability
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20, // Increased for better touch
    paddingVertical: 12, // Increased for better touch
    borderRadius: 8,
    minHeight: 44, // Ensure minimum touch target
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16, // Added explicit font size
  },
  profileIcon: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  editIconButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#6366f1',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16, // Increased for better touch and readability
    fontSize: 16,
    backgroundColor: '#fafafa',
    minHeight: 48, // Ensure adequate touch target
  },
  textArea: {
    height: 120, // Increased for better usability
    textAlignVertical: 'top',
    paddingTop: 16, // Ensure proper padding at top
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16, // Increased for better touch
    paddingVertical: 12, // Increased for better touch
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 44, // Ensure adequate touch target
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTag: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500', // Added for better readability
  },
  selectedTagText: {
    color: '#fff',
  },
  bottomPadding: {
    height: 50,
  },
});
