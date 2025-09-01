/**
 * Events Management Screen
 * Allows business owners to create, edit, and manage their events
 */
import React, { useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { useEventsManagement } from '../../hooks/useEventsManagement';
import { BusinessEvent, EventCategory } from '../../types/event';
import { formatTimestamp } from '../../utils/dateUtils';
import EventDeleteConfirmationScreen from './EventDeleteConfirmationScreen';
import EventFormModal from './EventFormModal';

type EventsManagementScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EventsManagement'
>;

interface EventsManagementScreenProps {
  navigation: EventsManagementScreenNavigationProp;
}

const Header = memo(({ navigation, onAdd }: { navigation: EventsManagementScreenNavigationProp, onAdd: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <Text style={styles.title}>Events Management</Text>
      <TouchableOpacity style={styles.createButton} onPress={onAdd}>
        <Ionicons name="add" size={24} color={colors.headerText} />
      </TouchableOpacity>
    </View>
  );
});

const FilterTabs = memo(({ viewMode, setViewMode }: { viewMode: string, setViewMode: (mode: 'upcoming' | 'past' | 'draft') => void }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.filterTabs}>
      {(['upcoming', 'past', 'draft'] as const).map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[styles.filterTab, viewMode === mode && styles.activeFilterTab]}
          onPress={() => setViewMode(mode)}
        >
          <Text style={[styles.filterTabText, viewMode === mode && styles.activeFilterTabText]}>
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const EventItem = memo(({ item, onEdit, categories }: { item: BusinessEvent, onEdit: (item: BusinessEvent) => void, categories: Array<{ key: EventCategory; label: string; icon: string }> }) => {
  const { colors, shadows, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const category = categories.find(cat => cat.key === item.category);

  return (
    <View style={[styles.eventCard, { backgroundColor: colors.card, ...shadows.card }]}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleRow}>
          <Text style={[styles.eventCategory, { color: colors.textSecondary }]}>{category?.icon} {category?.label}</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(item)}>
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.eventTitle, { color: colors.text }]}>{item.title}</Text>
      </View>

      <View style={styles.eventDetails}>
        <View style={styles.eventDetailRow}>
          <Ionicons name="calendar" size={16} color={colors.textSecondary} />
          <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>{item.date ? formatTimestamp(item.date) : 'No date'}</Text>
        </View>
        <View style={styles.eventDetailRow}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>{item.startTime} - {item.endTime}</Text>
        </View>
      </View>
      <Text style={[styles.eventDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>
    </View>
  );
});

const EventList = memo(({ events, onEdit, onRefresh, refreshing, onAdd, categories }: { events: BusinessEvent[], onEdit: (item: BusinessEvent) => void, onRefresh: () => void, refreshing: boolean, onAdd: () => void, categories: Array<{ key: EventCategory; label: string; icon: string }> }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  if (refreshing && !events.length) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading Events...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      renderItem={({ item }) => <EventItem item={item} onEdit={onEdit} categories={categories} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.eventsList}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateTitle}>No Events Found</Text>
          <TouchableOpacity style={styles.createEventButton} onPress={onAdd}>
            <Text style={styles.createEventButtonText}>Create Your First Event</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
});


export const EventsManagementScreen: React.FC<EventsManagementScreenProps> = ({
  navigation,
}) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  
  const {
    eventsLoading,
    filteredEvents,
    isModalVisible,
    setIsModalVisible,
    editingEvent,
    formData,
    setFormData,
    viewMode,
    setViewMode,
    showDeleteConfirmation,
    setShowDeleteConfirmation,
    eventToDelete,
    handleCreateEvent,
    handleEditEvent,
    handleSaveEvent,
    handleConfirmDelete,
    toggleAccessibilityFeature,
    refreshEvents,
    categories,
    accessibilityFeatureOptions,
    handleDeletePress,
  } = useEventsManagement(navigation);

  return (
    <View style={styles.container}>
      <Header navigation={navigation} onAdd={handleCreateEvent} />
      <FilterTabs viewMode={viewMode} setViewMode={setViewMode} />
      <EventList 
        events={filteredEvents}
        onEdit={handleEditEvent}
        onRefresh={refreshEvents}
        refreshing={eventsLoading}
        onAdd={handleCreateEvent}
        categories={categories}
      />

      <EventFormModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeletePress}
        formData={formData}
        setFormData={setFormData}
        editingEvent={editingEvent}
        categories={categories}
        accessibilityFeatureOptions={accessibilityFeatureOptions}
        toggleAccessibilityFeature={toggleAccessibilityFeature}
      />

      <Modal visible={showDeleteConfirmation} transparent animationType="fade">
        <EventDeleteConfirmationScreen
          visible={showDeleteConfirmation}
          event={eventToDelete}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirmDelete={handleConfirmDelete}
        />
      </Modal>
    </View>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.header,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.headerText,
    flex: 1,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeFilterTabText: {
    color: colors.headerText,
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  eventCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
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
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    marginLeft: 8,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: colors.text,
  },
  createEventButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createEventButtonText: {
    color: colors.headerText,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventsManagementScreen;
