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
import { useAuth, useAuthActions } from '../../hooks/useAuth';

export function EditProfileScreen({ navigation }: { navigation: any }) {
  const { userProfile } = useAuth();
  const { updateProfile } = useAuthActions();
  
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    firstName: userProfile?.profile?.firstName || '',
    lastName: userProfile?.profile?.lastName || '',
    phone: userProfile?.profile?.phone || '',
    bio: userProfile?.profile?.bio || '',
    preferredPronouns: userProfile?.profile?.preferredPronouns || '',
  });

  const [interests, setInterests] = useState<string[]>(
    userProfile?.profile?.interests || []
  );

  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>(
    userProfile?.profile?.accessibilityNeeds || []
  );

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
        profile: {
          ...userProfile?.profile,
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
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#6366f1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileIcon}>
          <Ionicons name="person-circle" size={100} color="#6366f1" />
          <TouchableOpacity style={styles.editIconButton}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.displayName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
              placeholder="How you'd like to be shown"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                placeholder="First name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                placeholder="Last name"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Pronouns</Text>
            <TextInput
              style={styles.input}
              value={formData.preferredPronouns}
              onChangeText={(text) => setFormData(prev => ({ ...prev, preferredPronouns: text }))}
              placeholder="e.g., they/them, she/her, he/him"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="(555) 123-4567"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us a bit about yourself..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <Text style={styles.sectionDescription}>
            Select topics you're interested in to help us recommend relevant businesses
          </Text>
          <View style={styles.tagContainer}>
            {commonInterests.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.tag,
                  interests.includes(interest) && styles.selectedTag
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.tagText,
                  interests.includes(interest) && styles.selectedTagText
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility Needs</Text>
          <Text style={styles.sectionDescription}>
            Help us find businesses that meet your accessibility requirements
          </Text>
          <View style={styles.tagContainer}>
            {commonAccessibilityNeeds.map((need) => (
              <TouchableOpacity
                key={need}
                style={[
                  styles.tag,
                  accessibilityNeeds.includes(need) && styles.selectedTag
                ]}
                onPress={() => toggleAccessibilityNeed(need)}
              >
                <Text style={[
                  styles.tagText,
                  accessibilityNeeds.includes(need) && styles.selectedTagText
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
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
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedTag: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedTagText: {
    color: '#fff',
  },
  bottomPadding: {
    height: 50,
  },
});
