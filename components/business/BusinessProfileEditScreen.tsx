/**
 * Business Profile Edit Screen
 * Allows business owners to edit their business profile information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useBusinesses } from '../../hooks/useBusiness';

interface BusinessProfileEditScreenProps {
  navigation: any;
}

export const BusinessProfileEditScreen: React.FC<BusinessProfileEditScreenProps> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { businesses } = useBusinesses();
  
  // Find the current user's business
  const userBusiness = businesses.find(b => b.id === (userProfile as any)?.businessId);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    // Hours
    mondayHours: '',
    tuesdayHours: '',
    wednesdayHours: '',
    thursdayHours: '',
    fridayHours: '',
    saturdayHours: '',
    sundayHours: '',
    // Accessibility features
    wheelchairAccessible: false,
    brailleMenus: false,
    signLanguage: false,
    hearingLoop: false,
    accessibleParking: false,
    accessibleRestrooms: false,
    lowCounters: false,
    quietSpaces: false,
    largeprint: false,
    sensoryFriendly: false
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load business data on component mount
  useEffect(() => {
    if (userBusiness) {
      setFormData({
        name: userBusiness.name || '',
        description: userBusiness.description || '',
        category: userBusiness.category || '',
        phone: userBusiness.contact?.phone || '',
        email: userBusiness.contact?.email || '',
        website: userBusiness.contact?.website || '',
        address: userBusiness.location?.address || '',
        city: userBusiness.location?.city || '',
        state: userBusiness.location?.state || '',
        zipCode: userBusiness.location?.zipCode || '',
        // Default hours
        mondayHours: '9:00 AM - 5:00 PM',
        tuesdayHours: '9:00 AM - 5:00 PM',
        wednesdayHours: '9:00 AM - 5:00 PM',
        thursdayHours: '9:00 AM - 5:00 PM',
        fridayHours: '9:00 AM - 5:00 PM',
        saturdayHours: '10:00 AM - 4:00 PM',
        sundayHours: 'Closed',
        // Accessibility features
        wheelchairAccessible: userBusiness.accessibility?.wheelchairAccessible || false,
        brailleMenus: userBusiness.accessibility?.visuallyImpairedFriendly || false,
        signLanguage: userBusiness.accessibility?.hearingImpairedFriendly || false,
        hearingLoop: userBusiness.accessibility?.hearingImpairedFriendly || false,
        accessibleParking: false, // Not in current interface, defaulting to false
        accessibleRestrooms: false, // Not in current interface, defaulting to false
        lowCounters: false, // Not in current interface, defaulting to false
        quietSpaces: false, // Not in current interface, defaulting to false
        largeprint: userBusiness.accessibility?.visuallyImpairedFriendly || false,
        sensoryFriendly: false // Not in current interface, defaulting to false
      });
    }
  }, [userBusiness]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Build accessibility object
      const accessibility = {
        wheelchairAccessible: formData.wheelchairAccessible,
        visuallyImpairedFriendly: formData.brailleMenus || formData.largeprint,
        hearingImpairedFriendly: formData.signLanguage || formData.hearingLoop,
        notes: 'Updated accessibility features'
      };

      // Build hours object
      const hours = {
        monday: { open: formData.mondayHours.split(' - ')[0] || '9:00 AM', close: formData.mondayHours.split(' - ')[1] || '5:00 PM', closed: formData.mondayHours === 'Closed' },
        tuesday: { open: formData.tuesdayHours.split(' - ')[0] || '9:00 AM', close: formData.tuesdayHours.split(' - ')[1] || '5:00 PM', closed: formData.tuesdayHours === 'Closed' },
        wednesday: { open: formData.wednesdayHours.split(' - ')[0] || '9:00 AM', close: formData.wednesdayHours.split(' - ')[1] || '5:00 PM', closed: formData.wednesdayHours === 'Closed' },
        thursday: { open: formData.thursdayHours.split(' - ')[0] || '9:00 AM', close: formData.thursdayHours.split(' - ')[1] || '5:00 PM', closed: formData.thursdayHours === 'Closed' },
        friday: { open: formData.fridayHours.split(' - ')[0] || '9:00 AM', close: formData.fridayHours.split(' - ')[1] || '5:00 PM', closed: formData.fridayHours === 'Closed' },
        saturday: { open: formData.saturdayHours.split(' - ')[0] || '10:00 AM', close: formData.saturdayHours.split(' - ')[1] || '4:00 PM', closed: formData.saturdayHours === 'Closed' },
        sunday: { open: formData.sundayHours.split(' - ')[0] || '10:00 AM', close: formData.sundayHours.split(' - ')[1] || '4:00 PM', closed: formData.sundayHours === 'Closed' }
      };

      const updatedBusiness = {
        ...userBusiness,
        name: formData.name,
        description: formData.description,
        category: formData.category as any,
        contact: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website
        },
        location: {
          ...userBusiness?.location,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        hours,
        accessibility,
        updatedAt: new Date()
      };

      // In a real app, this would save to Firebase
      console.log('Updated business profile:', updatedBusiness);
      
      Alert.alert(
        'Success',
        'Your business profile has been updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'Restaurant', 'Cafe', 'Bar/Club', 'Retail', 'Healthcare', 'Fitness', 
    'Beauty & Spa', 'Professional Services', 'Education', 'Entertainment', 'Other'
  ];

  if (!userBusiness) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>No Business Found</Text>
          <Text style={styles.errorText}>
            You don't have a business profile associated with your account.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Business Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              placeholder="Enter business name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              placeholder="Describe your business and what makes it LGBTQ+ friendly"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    formData.category === category && styles.selectedCategory
                  ]}
                  onPress={() => setFormData({...formData, category})}
                >
                  <Text style={[
                    styles.categoryText,
                    formData.category === category && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              placeholder="contact@business.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.textInput}
              value={formData.website}
              onChangeText={(text) => setFormData({...formData, website: text})}
              placeholder="https://www.business.com"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: text})}
              placeholder="123 Main Street"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.city}
                onChangeText={(text) => setFormData({...formData, city: text})}
                placeholder="City"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.state}
                onChangeText={(text) => setFormData({...formData, state: text})}
                placeholder="State"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>ZIP Code *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.zipCode}
                onChangeText={(text) => setFormData({...formData, zipCode: text})}
                placeholder="12345"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          
          {[
            { day: 'Monday', key: 'mondayHours' },
            { day: 'Tuesday', key: 'tuesdayHours' },
            { day: 'Wednesday', key: 'wednesdayHours' },
            { day: 'Thursday', key: 'thursdayHours' },
            { day: 'Friday', key: 'fridayHours' },
            { day: 'Saturday', key: 'saturdayHours' },
            { day: 'Sunday', key: 'sundayHours' }
          ].map(({ day, key }) => (
            <View key={day} style={styles.hoursRow}>
              <Text style={styles.dayLabel}>{day}</Text>
              <TextInput
                style={styles.hoursInput}
                value={formData[key as keyof typeof formData] as string}
                onChangeText={(text) => setFormData({...formData, [key]: text})}
                placeholder="9:00 AM - 5:00 PM or Closed"
              />
            </View>
          ))}
        </View>

        {/* Accessibility Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility Features</Text>
          <Text style={styles.sectionSubtitle}>
            Select all accessibility features available at your business
          </Text>
          
          {[
            { key: 'wheelchairAccessible', label: 'Wheelchair Accessible', icon: 'accessibility' },
            { key: 'accessibleParking', label: 'Accessible Parking', icon: 'car' },
            { key: 'accessibleRestrooms', label: 'Accessible Restrooms', icon: 'home' },
            { key: 'brailleMenus', label: 'Braille Menus', icon: 'book' },
            { key: 'largeprint', label: 'Large Print Materials', icon: 'text' },
            { key: 'signLanguage', label: 'Sign Language Support', icon: 'hand-left' },
            { key: 'hearingLoop', label: 'Hearing Loop System', icon: 'ear' },
            { key: 'lowCounters', label: 'Low Service Counters', icon: 'resize' },
            { key: 'quietSpaces', label: 'Quiet Spaces Available', icon: 'volume-mute' },
            { key: 'sensoryFriendly', label: 'Sensory-Friendly Environment', icon: 'sparkles' }
          ].map(({ key, label, icon }) => (
            <View key={key} style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Ionicons name={icon as any} size={20} color="#6366f1" />
                <Text style={styles.switchText}>{label}</Text>
              </View>
              <Switch
                value={formData[key as keyof typeof formData] as boolean}
                onValueChange={(value) => setFormData({...formData, [key]: value})}
                trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
                thumbColor={formData[key as keyof typeof formData] ? '#6366f1' : '#f3f4f6'}
              />
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  saveButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  selectedCategory: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  hoursInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomPadding: {
    height: 40,
  },
});
