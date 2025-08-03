/**
 * Feedback Screen
 * Allows users to provide feedback about businesses or the app
 */

import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useWebAuth';
import { useTheme } from '../../hooks/useTheme';

interface FeedbackScreenProps {
  navigation: any;
  route: {
    params: {
      businessId?: string;
      businessName?: string;
      feedbackType?: 'business' | 'app';
    };
  };
}

export function FeedbackScreen({ navigation, route }: FeedbackScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { businessId, businessName, feedbackType = 'business' } = route.params || {};

  const [selectedType, setSelectedType] = useState<'general' | 'complaint' | 'suggestion' | 'compliment'>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { key: 'general', label: 'General Feedback', icon: 'chatbubble-outline' },
    { key: 'complaint', label: 'Complaint', icon: 'warning-outline' },
    { key: 'suggestion', label: 'Suggestion', icon: 'bulb-outline' },
    { key: 'compliment', label: 'Compliment', icon: 'heart-outline' },
  ];

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
      // Create feedback object
      const feedback = {
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName,
        businessId: businessId || null,
        businessName: businessName || null,
        feedbackType: selectedType,
        subject: subject.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      // For now, we'll store feedback in localStorage (in production, send to server)
      const existingFeedback = localStorage.getItem('app_feedback');
      const feedbackList = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbackList.push(feedback);
      localStorage.setItem('app_feedback', JSON.stringify(feedbackList));

      // Also log to console for development
      console.log('📧 Feedback submitted:', feedback);

      Alert.alert(
        'Feedback Submitted',
        'Thank you for your feedback! We appreciate your input and will review it shortly.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {feedbackType === 'app' ? 'App Feedback' : `Feedback: ${businessName || 'Business'}`}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Feedback Type Selection */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Feedback Type</Text>
            <View style={styles.typeGrid}>
              {feedbackTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    { 
                      backgroundColor: selectedType === type.key ? colors.primary : colors.background,
                      borderColor: colors.border 
                    }
                  ]}
                  onPress={() => setSelectedType(type.key as any)}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={24} 
                    color={selectedType === type.key ? '#ffffff' : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    { color: selectedType === type.key ? '#ffffff' : colors.text }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Subject Input */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Subject</Text>
            <TextInput
              style={[styles.subjectInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Brief summary of your feedback"
              placeholderTextColor={colors.textSecondary}
              value={subject}
              onChangeText={setSubject}
              maxLength={100}
            />
            <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
              {subject.length}/100 characters
            </Text>
          </View>

          {/* Message Input */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Message</Text>
            <TextInput
              style={[styles.messageInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder={`Please share your ${selectedType === 'complaint' ? 'concerns' : selectedType === 'suggestion' ? 'ideas' : selectedType === 'compliment' ? 'positive experience' : 'feedback'} in detail...`}
              placeholderTextColor={colors.textSecondary}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
              {message.length}/1000 characters
            </Text>
          </View>

          {/* User Info Display */}
          {user && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
              <Text style={[styles.userInfo, { color: colors.textSecondary }]}>
                Submitted as: {user.displayName} ({user.email})
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              { 
                backgroundColor: isSubmitting ? colors.textSecondary : colors.primary,
                opacity: isSubmitting ? 0.7 : 1 
              }
            ]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
    minWidth: '45%',
    gap: 8,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subjectInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  userInfo: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
