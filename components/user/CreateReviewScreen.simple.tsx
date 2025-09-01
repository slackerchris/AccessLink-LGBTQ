import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { addReview as submitReview } from '../../services/reviewService';
import { getAuth } from 'firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useTheme, ThemeColors } from '../../hooks/useTheme';

type CreateReviewScreenSimpleNavigationProp = StackNavigationProp<RootStackParamList, 'CreateReview'>;
type CreateReviewScreenSimpleRouteProp = RouteProp<RootStackParamList, 'CreateReview'>;

interface CreateReviewScreenProps {
  navigation: CreateReviewScreenSimpleNavigationProp;
  route: CreateReviewScreenSimpleRouteProp;
}

const CreateReviewScreen: React.FC<CreateReviewScreenProps> = ({ navigation, route }) => {
  const { businessId, businessName } = route.params;
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  useEffect(() => {
    navigation.setOptions({ 
      title: `Review for ${businessName}`,
      headerStyle: { backgroundColor: colors.card },
      headerTintColor: colors.text,
      headerTitleStyle: { color: colors.text },
    });
  }, [businessName, navigation, colors]);

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to submit a review.");
      return;
    }

    if (rating === 0) {
      Alert.alert("Error", "Please select a rating.");
      return;
    }

    if (reviewText.trim() === '') {
      Alert.alert("Error", "Please enter your review.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview({
        businessId,
        rating,
        comment: reviewText,
        userId: user.uid,
        businessName,
      });
      Alert.alert("Success", "Your review has been submitted!");
      navigation.goBack();
    } catch (error) {
      console.error("Failed to submit review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate your experience at {businessName}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => handleRating(star)}>
            <FontAwesome
              name={star <= rating ? 'star' : 'star-o'}
              size={32}
              color={star <= rating ? colors.warning : colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Write your review..."
        value={reviewText}
        onChangeText={setReviewText}
        multiline
        placeholderTextColor={colors.textSecondary}
      />
      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.headerText} />
        ) : (
          <Text style={styles.buttonText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    width: '100%',
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.headerText,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CreateReviewScreen;
