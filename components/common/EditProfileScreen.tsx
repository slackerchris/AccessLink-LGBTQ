import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import PhotoUploadComponent from './PhotoUploadComponent';
import { useEditProfile } from '../../hooks/useEditProfile';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

interface EditProfileScreenProps {
  navigation: EditProfileScreenNavigationProp;
}

const commonInterests = [
  'Arts & Culture', 'Music', 'Sports', 'Food & Dining', 'Nightlife',
  'Shopping', 'Health & Wellness', 'Education', 'Community Events',
  'Travel', 'Technology', 'Books', 'Movies', 'Volunteering'
];

const ScreenHeader = React.memo(({ navigation, onSave, loading }: { navigation: EditProfileScreenNavigationProp, onSave: () => void, loading: boolean }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Edit Profile</Text>
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.disabledButton]}
        onPress={onSave}
        disabled={loading}
      >
        {loading ? <ActivityIndicator size="small" color={colors.headerText} /> : <Text style={styles.saveButtonText}>Save</Text>}
      </TouchableOpacity>
    </View>
  );
});

const ProfilePhotoSection = React.memo(({ userId, profilePhoto, onUpload, onRemove, loading }: { userId?: string, profilePhoto?: string, onUpload: (url: string) => void, onRemove: () => void, loading: boolean }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.profilePhotoSection}>
      <PhotoUploadComponent
        uploadType="user-profile"
        userId={userId}
        currentPhotoURL={profilePhoto}
        onPhotoUploaded={onUpload}
        onPhotoRemoved={onRemove}
        disabled={loading}
      />
    </View>
  );
});

const InfoSection = React.memo(({ formData, setFormData }: { formData: any, setFormData: any }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Display Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.displayName}
          onChangeText={(text) => setFormData((p: any) => ({ ...p, displayName: text }))}
          placeholder="How you'd like to be shown"
          placeholderTextColor={colors.textSecondary}
        />
      </View>
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) => setFormData((p: any) => ({ ...p, firstName: text }))}
            placeholder="First name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) => setFormData((p: any) => ({ ...p, lastName: text }))}
            placeholder="Last name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.bio}
          onChangeText={(text) => setFormData((p: any) => ({ ...p, bio: text }))}
          placeholder="Tell us a bit about yourself..."
          placeholderTextColor={colors.textSecondary}
          multiline
        />
      </View>
    </View>
  );
});

const InterestsSection = React.memo(({ interests, onToggle }: { interests: string[], onToggle: (interest: string) => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Interests</Text>
      <Text style={styles.sectionDescription}>
        Select topics you're interested in to help us recommend relevant businesses
      </Text>
      <View style={styles.tagContainer}>
        {commonInterests.map((interest) => (
          <TouchableOpacity
            key={interest}
            style={[styles.tag, interests.includes(interest) && styles.selectedTag]}
            onPress={() => onToggle(interest)}
          >
            <Text style={[styles.tagText, interests.includes(interest) && styles.selectedTagText]}>
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

export function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const {
    user,
    formData,
    setFormData,
    interests,
    toggleInterest,
    loading,
    handleSave,
    handlePhotoUpload,
    handlePhotoRemove,
  } = useEditProfile(navigation);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScreenHeader navigation={navigation} onSave={handleSave} loading={loading} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProfilePhotoSection
          userId={user?.uid}
          profilePhoto={(user as any)?.profilePhoto}
          onUpload={handlePhotoUpload}
          onRemove={handlePhotoRemove}
          loading={loading}
        />
        <InfoSection formData={formData} setFormData={setFormData} />
        <InterestsSection interests={interests} onToggle={toggleInterest} />
        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.headerText,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.headerText,
    fontWeight: '600',
    fontSize: 16,
  },
  profilePhotoSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
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
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 48,
    backgroundColor: colors.card,
    borderColor: colors.border,
    color: colors.text,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  selectedTag: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  selectedTagText: {
    color: colors.headerText,
  },
  bottomPadding: {
    height: 50,
  },
});

export default EditProfileScreen;
