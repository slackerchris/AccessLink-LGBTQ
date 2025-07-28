/**
 * Events Management Screen
 * Allows business owners to create, edit, and manage their events
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { businessService } from '../../services/mockBusinessService';
import EventDeleteConfirmationScreen from './EventDeleteConfirmationScreen';

export interface BusinessEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  isAccessible: boolean;
  accessibilityFeatures: string[];
  maxAttendees?: number;
  currentAttendees: number;
  isPublic: boolean;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  ticketPrice?: number;
  contactEmail?: string;
  contactPhone?: string;
  imageUri?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventCategory = 
  | 'social' 
  | 'educational' 
  | 'health' 
  | 'advocacy' 
  | 'entertainment' 
  | 'support' 
  | 'community' 
  | 'fundraising'
  | 'other';

interface EventsManagementScreenProps {
  navigation: any;
}

export const EventsManagementScreen: React.FC<EventsManagementScreenProps> = ({ navigation }) => {
  const { userProfile } = useAuth();
  
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BusinessEvent | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'past' | 'draft'>('upcoming');
  const [isLoading, setIsLoading] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [userBusiness, setUserBusiness] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRegistrationDeadlinePicker, setShowRegistrationDeadlinePicker] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<BusinessEvent | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    category: 'community' as EventCategory,
    isAccessible: true,
    accessibilityFeatures: [] as string[],
    maxAttendees: undefined as number | undefined,
    isPublic: true,
    registrationRequired: false,
    registrationDeadline: undefined as Date | undefined,
    ticketPrice: undefined as number | undefined,
    contactEmail: '',
    contactPhone: '',
    tags: [] as string[]
  });

  const categories: Array<{ key: EventCategory; label: string; icon: string }> = [
    { key: 'social', label: 'Social Gathering', icon: '🎉' },
    { key: 'educational', label: 'Educational', icon: '📚' },
    { key: 'health', label: 'Health & Wellness', icon: '🏥' },
    { key: 'advocacy', label: 'Advocacy', icon: '✊' },
    { key: 'entertainment', label: 'Entertainment', icon: '🎭' },
    { key: 'support', label: 'Support Group', icon: '🤝' },
    { key: 'community', label: 'Community Event', icon: '🏳️‍🌈' },
    { key: 'fundraising', label: 'Fundraising', icon: '💰' },
    { key: 'other', label: 'Other', icon: '📅' }
  ];

  const accessibilityFeatureOptions = [
    'Wheelchair Accessible',
    'Sign Language Interpreter',
    'Audio Description',
    'Large Print Materials',
    'Sensory-Friendly Environment',
    'Service Animal Friendly',
    'Accessible Parking',
    'Gender-Neutral Restrooms',
    'Quiet Space Available',
    'Live Captioning'
  ];

  useEffect(() => {
    loadUserBusiness();
  }, [userProfile]);

  useEffect(() => {
    loadEvents();
  }, [userBusiness]);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('🔍 Component state updated:', {
      eventsCount: events.length,
      isLoading: isLoading,
      isModalVisible: isModalVisible,
      deletingEventId: deletingEventId,
      hasUserBusiness: !!userBusiness,
      businessId: userBusiness?.id
    });
  }, [events, isLoading, isModalVisible, deletingEventId, userBusiness]);

  const loadUserBusiness = async () => {
    if (userProfile?.businessId) {
      try {
        const result = await businessService.getBusinesses();
        const business = result.businesses.find(b => b.id === userProfile.businessId);
        setUserBusiness(business);
      } catch (error) {
        console.error('Error loading business:', error);
      }
    }
  };

  const loadEvents = async () => {
    if (userBusiness?.id) {
      try {
        const businessEvents = await businessService.getBusinessEvents(userBusiness.id);
        setEvents(businessEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    }
  };

  const getFilteredEvents = () => {
    const now = new Date();
    switch (viewMode) {
      case 'upcoming':
        return events.filter(event => event.date >= now);
      case 'past':
        return events.filter(event => event.date < now);
      case 'draft':
        return events.filter(event => !event.isPublic);
      default:
        return events;
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Default to tomorrow to ensure it's not in the past
    
    setFormData({
      title: '',
      description: '',
      date: tomorrow,
      startTime: '09:00',
      endTime: '17:00',
      location: userBusiness?.address || '',
      category: 'community',
      isAccessible: true,
      accessibilityFeatures: [],
      maxAttendees: undefined,
      isPublic: true,
      registrationRequired: false,
      registrationDeadline: undefined,
      ticketPrice: undefined,
      contactEmail: userBusiness?.email || '',
      contactPhone: userBusiness?.phone || '',
      tags: []
    });
    setIsModalVisible(true);
  };

  const handleEditEvent = (event: BusinessEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      category: event.category,
      isAccessible: event.isAccessible,
      accessibilityFeatures: event.accessibilityFeatures,
      maxAttendees: event.maxAttendees,
      isPublic: event.isPublic,
      registrationRequired: event.registrationRequired,
      registrationDeadline: event.registrationDeadline,
      ticketPrice: event.ticketPrice,
      contactEmail: event.contactEmail || '',
      contactPhone: event.contactPhone || '',
      tags: event.tags
    });
    setIsModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please provide a title for this event');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please provide a description for this event');
      return;
    }

    // Validate event date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const eventDate = new Date(formData.date);
    eventDate.setHours(0, 0, 0, 0); // Set to start of event date
    
    if (eventDate < today) {
      Alert.alert('Error', 'Event date cannot be in the past. Please select a future date.');
      return;
    }

    // Validate start time is before end time
    if (formData.startTime >= formData.endTime) {
      Alert.alert('Error', 'Start time must be before end time');
      return;
    }

    // Validate registration deadline if registration is required
    if (formData.registrationRequired && formData.registrationDeadline) {
      const deadlineDate = new Date(formData.registrationDeadline);
      deadlineDate.setHours(0, 0, 0, 0);
      
      if (deadlineDate > eventDate) {
        Alert.alert('Error', 'Registration deadline cannot be after the event date');
        return;
      }
      
      if (deadlineDate < today) {
        Alert.alert('Error', 'Registration deadline cannot be in the past');
        return;
      }
    }

    if (!userBusiness?.id) return;

    setIsLoading(true);
    try {
      if (editingEvent) {
        // Update existing event
        const updates = {
          title: formData.title,
          description: formData.description,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          location: formData.location,
          category: formData.category,
          isAccessible: formData.isAccessible,
          accessibilityFeatures: formData.accessibilityFeatures,
          maxAttendees: formData.maxAttendees,
          isPublic: formData.isPublic,
          registrationRequired: formData.registrationRequired,
          registrationDeadline: formData.registrationDeadline,
          ticketPrice: formData.ticketPrice,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          tags: formData.tags
        };

        await businessService.updateBusinessEvent(userBusiness.id, editingEvent.id, updates);
        
        // Update local state
        setEvents(prev => prev.map(event => 
          event.id === editingEvent.id 
            ? { ...event, ...updates, updatedAt: new Date() }
            : event
        ));
      } else {
        // Create new event
        const newEvent: BusinessEvent = {
          id: `event-${Date.now()}`,
          title: formData.title,
          description: formData.description,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          location: formData.location,
          category: formData.category,
          isAccessible: formData.isAccessible,
          accessibilityFeatures: formData.accessibilityFeatures,
          maxAttendees: formData.maxAttendees,
          currentAttendees: 0,
          isPublic: formData.isPublic,
          registrationRequired: formData.registrationRequired,
          registrationDeadline: formData.registrationDeadline,
          ticketPrice: formData.ticketPrice,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          tags: formData.tags,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await businessService.addBusinessEvent(userBusiness.id, newEvent);
        setEvents(prev => [newEvent, ...prev]);
      }

      setIsModalVisible(false);
      Alert.alert('Success', `Event ${editingEvent ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setEventToDelete(event);
      setShowDeleteConfirmation(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete || !userBusiness?.id) return;

    try {
      // Update local state immediately
      setEvents(prev => prev.filter(event => event.id !== eventToDelete.id));
      
      // Close the edit modal if we were editing this event
      if (editingEvent?.id === eventToDelete.id) {
        setIsModalVisible(false);
        setEditingEvent(null);
      }
      
      // Reload events from server to ensure sync
      await loadEvents();
      
    } catch (error) {
      console.error('Error in handleConfirmDelete:', error);
      // Reload events to restore state if there was an error
      await loadEvents();
    } finally {
      setEventToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };

  const toggleAccessibilityFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      accessibilityFeatures: prev.accessibilityFeatures.includes(feature)
        ? prev.accessibilityFeatures.filter(f => f !== feature)
        : [...prev.accessibilityFeatures, feature]
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderEventItem = ({ item }: { item: BusinessEvent }) => {
    const category = categories.find(cat => cat.key === item.category);
    const isUpcoming = item.date >= new Date();

    return (
      <View style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleRow}>
            <Text style={styles.eventCategory}>{category?.icon} {category?.label}</Text>
            <View style={styles.eventActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditEvent(item)}
              >
                <Ionicons name="pencil" size={18} color="#6366f1" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.eventTitle}>{item.title}</Text>
        </View>

        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Ionicons name="calendar" size={16} color="#6b7280" />
            <Text style={styles.eventDetailText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Ionicons name="time" size={16} color="#6b7280" />
            <Text style={styles.eventDetailText}>{item.startTime} - {item.endTime}</Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text style={styles.eventDetailText}>{item.location}</Text>
          </View>
          {item.maxAttendees && (
            <View style={styles.eventDetailRow}>
              <Ionicons name="people" size={16} color="#6b7280" />
              <Text style={styles.eventDetailText}>
                {item.currentAttendees}/{item.maxAttendees} attendees
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.eventTags}>
          {item.isAccessible && (
            <View style={[styles.tag, styles.accessibilityTag]}>
              <Ionicons name="accessibility" size={12} color="#059669" />
              <Text style={styles.accessibilityTagText}>Accessible</Text>
            </View>
          )}
          {!item.isPublic && (
            <View style={[styles.tag, styles.draftTag]}>
              <Text style={styles.draftTagText}>Draft</Text>
            </View>
          )}
          {item.registrationRequired && (
            <View style={[styles.tag, styles.registrationTag]}>
              <Text style={styles.registrationTagText}>Registration Required</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const filteredEvents = getFilteredEvents();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Events Management</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateEvent}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterTabs}>
        {(['upcoming', 'past', 'draft'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.filterTab,
              viewMode === mode && styles.activeFilterTab
            ]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[
              styles.filterTabText,
              viewMode === mode && styles.activeFilterTabText
            ]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No Events Found</Text>
            <Text style={styles.emptyStateText}>
              {viewMode === 'upcoming' && "You don't have any upcoming events."}
              {viewMode === 'past' && "You don't have any past events."}
              {viewMode === 'draft' && "You don't have any draft events."}
            </Text>
            <TouchableOpacity
              style={styles.createEventButton}
              onPress={handleCreateEvent}
            >
              <Text style={styles.createEventButtonText}>Create Your First Event</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create/Edit Event Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </Text>
            <View style={styles.modalHeaderActions}>
              <TouchableOpacity
                style={[styles.modalSaveButton, isLoading && styles.disabledButton]}
                onPress={handleSaveEvent}
                disabled={isLoading}
              >
                <Text style={styles.modalSaveButtonText}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Event Title *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                  placeholder="Enter event title"
                  maxLength={100}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Describe your event"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryList}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.key}
                        style={[
                          styles.categoryOption,
                          formData.category === category.key && styles.selectedCategory
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, category: category.key }))}
                      >
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                        <Text style={[
                          styles.categoryLabel,
                          formData.category === category.key && styles.selectedCategoryLabel
                        ]}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* Date & Time */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Date & Time</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Event Date *</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    // For now, we'll show the date in a simple format
                    // In a real app, you'd use a proper date picker
                    Alert.alert(
                      'Date Selection',
                      `Currently selected: ${formData.date.toLocaleDateString()}\n\nNote: In a production app, this would open a date picker. For demo purposes, the date is set to today or later.`,
                      [
                        {
                          text: 'Set to Today',
                          onPress: () => setFormData(prev => ({ ...prev, date: new Date() }))
                        },
                        {
                          text: 'Set to Next Week',
                          onPress: () => {
                            const nextWeek = new Date();
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            setFormData(prev => ({ ...prev, date: nextWeek }));
                          }
                        },
                        {
                          text: 'Set to Next Month',
                          onPress: () => {
                            const nextMonth = new Date();
                            nextMonth.setMonth(nextMonth.getMonth() + 1);
                            setFormData(prev => ({ ...prev, date: nextMonth }));
                          }
                        },
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  }}
                >
                  <Ionicons name="calendar" size={20} color="#6b7280" />
                  <Text style={styles.dateButtonText}>
                    {formData.date.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Event date must be today or in the future
                </Text>
              </View>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Start Time *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.startTime}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, startTime: text }))}
                    placeholder="09:00"
                  />
                </View>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>End Time *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.endTime}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, endTime: text }))}
                    placeholder="17:00"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                  placeholder="Event location"
                />
              </View>
            </View>

            {/* Accessibility */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Accessibility</Text>
              
              <View style={styles.switchGroup}>
                <Text style={styles.switchLabel}>This event is accessible</Text>
                <Switch
                  value={formData.isAccessible}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isAccessible: value }))}
                />
              </View>

              {formData.isAccessible && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Accessibility Features</Text>
                  <View style={styles.checkboxList}>
                    {accessibilityFeatureOptions.map((feature) => (
                      <TouchableOpacity
                        key={feature}
                        style={styles.checkboxItem}
                        onPress={() => toggleAccessibilityFeature(feature)}
                      >
                        <Ionicons
                          name={formData.accessibilityFeatures.includes(feature) ? 'checkbox' : 'square-outline'}
                          size={20}
                          color={formData.accessibilityFeatures.includes(feature) ? '#6366f1' : '#9ca3af'}
                        />
                        <Text style={styles.checkboxLabel}>{feature}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Registration & Pricing */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Registration & Pricing</Text>
              
              <View style={styles.switchGroup}>
                <Text style={styles.switchLabel}>Registration required</Text>
                <Switch
                  value={formData.registrationRequired}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, registrationRequired: value }))}
                />
              </View>

              {formData.registrationRequired && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Registration Deadline</Text>
                  {showRegistrationDeadlinePicker ? (
                    <View style={styles.datePickerContainer}>
                      <View style={styles.datePickerHeader}>
                        <Text style={styles.datePickerTitle}>Select Registration Deadline</Text>
                        <TouchableOpacity
                          onPress={() => setShowRegistrationDeadlinePicker(false)}
                          style={styles.datePickerClose}
                        >
                          <Text style={styles.datePickerCloseText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.datePickerContent}>
                        <Text style={styles.datePickerNote}>
                          Current: {formData.registrationDeadline ? formatDate(formData.registrationDeadline) : 'None selected'}
                        </Text>
                        
                        <View style={styles.datePickerOptions}>
                          <TouchableOpacity
                            style={styles.dateOption}
                            onPress={() => {
                              const today = new Date();
                              setFormData(prev => ({...prev, registrationDeadline: today}));
                              setShowRegistrationDeadlinePicker(false);
                            }}
                          >
                            <Text style={styles.dateOptionText}>Today</Text>
                            <Text style={styles.dateOptionSubtext}>{formatDate(new Date())}</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={styles.dateOption}
                            onPress={() => {
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              setFormData(prev => ({...prev, registrationDeadline: tomorrow}));
                              setShowRegistrationDeadlinePicker(false);
                            }}
                          >
                            <Text style={styles.dateOptionText}>Tomorrow</Text>
                            <Text style={styles.dateOptionSubtext}>{formatDate(new Date(Date.now() + 86400000))}</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={styles.dateOption}
                            onPress={() => {
                              const dayBeforeEvent = new Date(formData.date);
                              dayBeforeEvent.setDate(dayBeforeEvent.getDate() - 1);
                              setFormData(prev => ({...prev, registrationDeadline: dayBeforeEvent}));
                              setShowRegistrationDeadlinePicker(false);
                            }}
                          >
                            <Text style={styles.dateOptionText}>Day Before Event</Text>
                            <Text style={styles.dateOptionSubtext}>
                              {(() => {
                                const dayBefore = new Date(formData.date);
                                dayBefore.setDate(dayBefore.getDate() - 1);
                                return formatDate(dayBefore);
                              })()}
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={styles.dateOption}
                            onPress={() => {
                              const nextWeek = new Date();
                              nextWeek.setDate(nextWeek.getDate() + 7);
                              setFormData(prev => ({...prev, registrationDeadline: nextWeek}));
                              setShowRegistrationDeadlinePicker(false);
                            }}
                          >
                            <Text style={styles.dateOptionText}>Next Week</Text>
                            <Text style={styles.dateOptionSubtext}>{formatDate(new Date(Date.now() + 7 * 86400000))}</Text>
                          </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.helperText}>
                          💡 Tip: Set deadline 1-2 days before event for better planning
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowRegistrationDeadlinePicker(true)}
                    >
                      <Text style={styles.dateIcon}>📅</Text>
                      <Text style={styles.dateButtonText}>
                        {formData.registrationDeadline ? 
                          formatDate(formData.registrationDeadline) : 
                          'Select deadline'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Max Attendees (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.maxAttendees?.toString() || ''}
                    onChangeText={(text) => setFormData(prev => ({ 
                      ...prev, 
                      maxAttendees: text ? parseInt(text) : undefined 
                    }))}
                    placeholder="No limit"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Ticket Price (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.ticketPrice?.toString() || ''}
                    onChangeText={(text) => setFormData(prev => ({ 
                      ...prev, 
                      ticketPrice: text ? parseFloat(text) : undefined 
                    }))}
                    placeholder="Free"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Contact Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.contactEmail}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, contactEmail: text }))}
                  placeholder="contact@business.com"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Phone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.contactPhone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, contactPhone: text }))}
                  placeholder="(555) 123-4567"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Visibility */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Visibility</Text>
              
              <View style={styles.switchGroup}>
                <Text style={styles.switchLabel}>Make event public</Text>
                <Switch
                  value={formData.isPublic}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isPublic: value }))}
                />
              </View>
              
              {!formData.isPublic && (
                <Text style={styles.helperText}>
                  Draft events are only visible to you and won't appear in public listings.
                </Text>
              )}
            </View>

            {/* Big Delete Button - Only show when editing */}
            {editingEvent && (
              <View style={styles.deleteSection}>
                <View style={styles.deleteSeparator} />
                <TouchableOpacity
                  style={styles.bigDeleteButton}
                  onPress={() => handleDeleteEvent(editingEvent.id)}
                >
                  <Ionicons name="trash" size={24} color="#fff" />
                  <Text style={styles.bigDeleteButtonText}>Delete Event Permanently</Text>
                </TouchableOpacity>
                <Text style={styles.deleteWarningText}>
                  ⚠️ This action cannot be undone. Deleting this event will permanently remove it and all associated data.
                </Text>
              </View>
            )}
            
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Confirmation Screen */}
      <Modal
        visible={showDeleteConfirmation}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <EventDeleteConfirmationScreen
          visible={showDeleteConfirmation}
          event={eventToDelete}
          onClose={() => {
            setShowDeleteConfirmation(false);
            setEventToDelete(null);
          }}
          onConfirmDelete={handleConfirmDelete}
          businessId={userBusiness?.id || ''}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22, // Larger for mobile
    fontWeight: '700',
    color: '#111827',
    flex: 1, // Take available space
  },
  createButton: {
    backgroundColor: '#6366f1',
    width: 48, // Larger touch target
    height: 48, // Larger touch target
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterTab: {
    backgroundColor: '#6366f1',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  eventHeader: {
    marginBottom: 15,
  },
  eventTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventCategory: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  eventActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  disabledActionButton: {
    opacity: 0.5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  eventDetails: {
    marginBottom: 15,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 15,
  },
  eventTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  accessibilityTag: {
    backgroundColor: '#d1fae5',
  },
  accessibilityTagText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginLeft: 4,
  },
  draftTag: {
    backgroundColor: '#fef3c7',
  },
  draftTagText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '500',
  },
  registrationTag: {
    backgroundColor: '#dbeafe',
  },
  registrationTagText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  createEventButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createEventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    padding: 12, // Larger touch target
    minWidth: 44, // iOS minimum touch target
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20, // Larger for mobile
    fontWeight: '700',
    color: '#111827',
    flex: 1, // Take available space
    textAlign: 'center', // Center the title
  },
  modalSaveButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20, // Larger touch target
    paddingVertical: 12, // Larger touch target
    borderRadius: 10,
    minHeight: 44, // iOS minimum touch target
    minWidth: 80, // Ensure good width
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 16, // Larger for mobile
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
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
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  flex1: {
    flex: 1,
  },
  categoryList: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  categoryOption: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 10,
    minWidth: 100,
  },
  selectedCategory: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  selectedCategoryLabel: {
    color: '#fff',
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  checkboxList: {
    marginTop: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 5,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dateIcon: {
    fontSize: 18,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  disabledInput: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  disabledText: {
    color: '#9ca3af',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    margin: 16,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  datePickerClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerCloseText: {
    fontSize: 18,
    color: '#6b7280',
  },
  datePickerContent: {
    padding: 16,
  },
  datePickerNote: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  datePickerOptions: {
    gap: 8,
  },
  dateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  dateOptionSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalDeleteButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteSection: {
    marginTop: 40,
    paddingTop: 30,
    paddingHorizontal: 4, // Better mobile margins
    paddingBottom: 20, // Extra bottom padding
  },
  deleteSeparator: {
    height: 2, // Thicker for better visibility
    backgroundColor: '#e5e7eb',
    marginBottom: 30,
    marginHorizontal: 20,
  },
  bigDeleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16, // More rounded for modern mobile feel
    paddingVertical: 20, // Larger touch target
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20, // More space before warning
    marginHorizontal: 20, // Side margins
    minHeight: 64, // Ensure excellent touch target
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 4, // Stronger shadow
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8, // Higher elevation for prominence
  },
  bigDeleteButtonText: {
    fontSize: 19, // Larger for mobile
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5, // Better letter spacing
  },
  deleteWarningText: {
    fontSize: 14, // Larger for mobile readability
    color: '#ef4444',
    textAlign: 'center',
    lineHeight: 20, // Better line spacing
    paddingHorizontal: 32, // More padding for readability
    fontStyle: 'italic',
    marginBottom: 20, // Bottom margin for scroll area
  },
});
