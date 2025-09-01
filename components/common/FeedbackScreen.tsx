/**
 * Feedback Screen
 * Allows users to provide feedback about businesses or the app
 */

import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

type FeedbackScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>; // Adjust as needed

interface FeedbackScreenProps {
  navigation: FeedbackScreenNavigationProp;
  route: {
    params: {
      businessId?: string;
      businessName?: string;
      feedbackType?: 'business' | 'app';
    };
  };
}

const feedbackTypes = [
  { key: 'general', label: 'General', icon: 'chatbubble-outline' as const },
  { key: 'complaint', label: 'Complaint', icon: 'warning-outline' as const },
  { key: 'suggestion', label: 'Suggestion', icon: 'bulb-outline' as const },
  { key: 'compliment', label: 'Compliment', icon: 'heart-outline' as const },
];

const Header = memo(({ navigation, title }: { navigation: FeedbackScreenNavigationProp, title: string }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
});

const TypeSelector = memo(({ selectedType, onSelect }: { selectedType: string, onSelect: (type: string) => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Feedback Type</Text>
      <View style={styles.typeGrid}>
        {feedbackTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[styles.typeButton, selectedType === type.key && styles.typeButtonActive]}
            onPress={() => onSelect(type.key)}
          >
            <Ionicons name={type.icon} size={20} color={selectedType === type.key ? colors.headerText : colors.textSecondary} />
            <Text style={[styles.typeButtonText, selectedType === type.key && styles.typeButtonTextActive]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

const FormInput = memo(({ label, value, onChangeText, placeholder, maxLength, multiline = false, numberOfLines = 1 }: { label: string, value: string, onChangeText: (text: string) => void, placeholder: string, maxLength: number, multiline?: boolean, numberOfLines?: number }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      <Text style={styles.characterCount}>{value.length}/{maxLength}</Text>
    </View>
  );
});

const UserInfo = memo(({ user }: { user: any }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  if (!user) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contact Information</Text>
      <Text style={styles.userInfoText}>
        Submitted as: {user.displayName} ({user.email})
      </Text>
    </View>
  );
});

const SubmitButton = memo(({ onPress, isSubmitting }: { onPress: () => void, isSubmitting: boolean }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <TouchableOpacity
      style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
      onPress={onPress}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <ActivityIndicator color={colors.headerText} />
      ) : (
        <>
          <Ionicons name="send" size={20} color={colors.headerText} />
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
        </>
      )}
    </TouchableOpacity>
  );
});

export function FeedbackScreen({ navigation, route }: FeedbackScreenProps) {
  const { user } = useAuth();
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const { businessId, businessName, feedbackType = 'business' } = route.params || {};

  const [selectedType, setSelectedType] = useState<'general' | 'complaint' | 'suggestion' | 'compliment'>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing Information', 'Please fill in both subject and message fields.');
      return;
    }
    if (!user) {
      Alert.alert('Login Required', 'Please login to submit feedback.');
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, this would be a call to a service/API
      console.log('Submitting feedback:', {
        userId: user.uid,
        businessId,
        type: selectedType,
        subject,
        message,
      });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Feedback Submitted',
        'Thank you for your feedback! We appreciate your input.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const screenTitle = feedbackType === 'app' ? 'App Feedback' : `Feedback: ${businessName || 'Business'}`;

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} title={screenTitle} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <TypeSelector selectedType={selectedType} onSelect={(type) => setSelectedType(type as any)} />
          <FormInput
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief summary of your feedback"
            maxLength={100}
          />
          <FormInput
            label="Message"
            value={message}
            onChangeText={setMessage}
            placeholder={`Please share your ${selectedType} in detail...`}
            maxLength={1000}
            multiline
            numberOfLines={8}
          />
          <UserInfo user={user} />
          <SubmitButton onPress={handleSubmit} isSubmitting={isSubmitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexGrow: 1,
    minWidth: '45%',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  typeButtonTextActive: {
    color: colors.headerText,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text,
  },
  textArea: {
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    color: colors.textSecondary,
  },
  userInfoText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 8,
    margin: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.headerText,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeedbackScreen;
