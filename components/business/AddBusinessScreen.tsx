/**
 * Add Business Screen
 * Allows admins and business owners to add new businesses
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { BusinessCategory } from '../../services/businessService';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { validators } from '../../utils/validators';

interface AddBusinessScreenProps {
  navigation: any;
}

export default function AddBusinessScreen({ navigation }: AddBusinessScreenProps) {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Business basic info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('other');
  
  // Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Contact
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  
  // LGBTQ+ Friendly
  const [lgbtqVerified, setLgbtqVerified] = useState(false);
  
  // Accessibility
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [brailleMenus, setBrailleMenus] = useState(false);
  const [signLanguageSupport, setSignLanguageSupport] = useState(false);
  const [quietSpaces, setQuietSpaces] = useState(false);
  const [accessibilityNotes, setAccessibilityNotes] = useState('');

  const categories: { value: BusinessCategory; label: string }[] = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'beauty', label: 'Beauty & Wellness' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'retail', label: 'Retail' },
    { value: 'professional_services', label: 'Professional Services' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'education', label: 'Education' },
    { value: 'nonprofit', label: 'Non-Profit' },
    { value: 'other', label: 'Other' },
  ];

  const validateForm = (): string | null => {
    if (!name.trim()) return 'Business name is required';
    if (!description.trim()) return 'Business description is required';
    if (!address.trim()) return 'Address is required';
    if (!city.trim()) return 'City is required';
    if (!state.trim()) return 'State is required';
    if (!zipCode.trim()) return 'ZIP code is required';
    
    if (email && !validators.email(email).isValid) {
      return validators.email(email).message;
    }
    
    if (phone && !validators.phone(phone).isValid) {
      return validators.phone(phone).message;
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setLoading(true);
    try {
      // Build contact object without undefined values
      const contactData: any = {};
      if (phone.trim()) contactData.phone = phone.trim();
      if (email.trim()) contactData.email = email.trim();
      if (website.trim()) contactData.website = website.trim();

      const businessData = {
        name: name.trim(),
        description: description.trim(),
        category,
        location: {
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
        },
        contact: contactData,
        accessibility: {
          wheelchairAccessible,
          brailleMenus,
          signLanguageSupport,
          quietSpaces,
          accessibilityNotes: accessibilityNotes.trim(),
        },
        lgbtqFriendly: {
          verified: lgbtqVerified,
          certifications: [],
          inclusivityFeatures: [],
        },
        hours: {},
        tags: [],
        images: [],
        featured: false,
        ownerId: userProfile?.uid || '',
        status: 'pending' as const,
      };

      if (!userProfile) {
        Alert.alert('Error', 'User profile not found');
        return;
      }

      // Create business document directly in Firestore
      const docRef = await addDoc(collection(db, 'businesses'), {
        ...businessData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        averageRating: 0,
        totalReviews: 0,
      });
      
      Alert.alert(
        'Success',
        'Business has been created successfully and is pending approval!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Business</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter business name"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your business"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    category === cat.value && styles.categoryButtonActive
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    category === cat.value && styles.categoryButtonTextActive
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Street address"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="City"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                placeholder="State"
                maxLength={2}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ZIP Code *</Text>
            <TextInput
              style={[styles.input, styles.zipInput]}
              value={zipCode}
              onChangeText={setZipCode}
              placeholder="ZIP Code"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={website}
              onChangeText={setWebsite}
              placeholder="https://..."
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* LGBTQ+ Friendly */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LGBTQ+ Friendly</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>LGBTQ+ Verified</Text>
            <Switch
              value={lgbtqVerified}
              onValueChange={setLgbtqVerified}
              trackColor={{ false: '#767577', true: '#6366f1' }}
              thumbColor={lgbtqVerified ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Accessibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility Features</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Wheelchair Accessible</Text>
            <Switch
              value={wheelchairAccessible}
              onValueChange={setWheelchairAccessible}
              trackColor={{ false: '#767577', true: '#6366f1' }}
              thumbColor={wheelchairAccessible ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Braille Menus</Text>
            <Switch
              value={brailleMenus}
              onValueChange={setBrailleMenus}
              trackColor={{ false: '#767577', true: '#6366f1' }}
              thumbColor={brailleMenus ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Sign Language Support</Text>
            <Switch
              value={signLanguageSupport}
              onValueChange={setSignLanguageSupport}
              trackColor={{ false: '#767577', true: '#6366f1' }}
              thumbColor={signLanguageSupport ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Quiet Spaces Available</Text>
            <Switch
              value={quietSpaces}
              onValueChange={setQuietSpaces}
              trackColor={{ false: '#767577', true: '#6366f1' }}
              thumbColor={quietSpaces ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Accessibility Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={accessibilityNotes}
              onChangeText={setAccessibilityNotes}
              placeholder="Additional accessibility information"
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating Business...' : 'Create Business'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 45,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  zipInput: {
    width: 120,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  categoryButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});
