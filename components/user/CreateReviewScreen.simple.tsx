import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth as useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';

interface CreateReviewScreenProps {
  navigation: any;
  route: {
    params: {
      businessId: string;
      businessName: string;
    };
  };
}

export default function CreateReviewScreenSimple({ navigation, route }: CreateReviewScreenProps) {
  const { businessName } = route.params;
  const { user } = useFirebaseAuth();
  const { colors } = useTheme();
  const [comment, setComment] = useState('');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>  
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Write a Review</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Business: {businessName}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>User: {user ? 'Logged in' : 'Not logged in'}</Text>
      </View>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
        placeholder="Write your review..."
        placeholderTextColor={colors.textSecondary}
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => Alert.alert('Review Submitted', comment)}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  input: {
    width: '100%',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
