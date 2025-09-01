import React, { useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme, ThemeColors } from '../../hooks/useTheme';
import { RootStackParamList } from '../../types/navigation';
import { useServicesManagement } from '../../hooks/useServicesManagement';
import { ServiceItem } from '../../types/service';

type ServicesManagementScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ServicesManagement'
>;

interface ServicesManagementScreenProps {
  navigation: ServicesManagementScreenNavigationProp;
}

const Header = memo(({ navigation, onAdd }: { navigation: ServicesManagementScreenNavigationProp, onAdd: () => void }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Manage Services</Text>
      <TouchableOpacity style={styles.headerButton} onPress={onAdd}>
        <Ionicons name="add" size={28} color={colors.headerText} />
      </TouchableOpacity>
    </View>
  );
});

const ServiceListItem = memo(({ service, onEdit, onDelete, onToggleAvailability }: { service: ServiceItem, onEdit: (service: ServiceItem) => void, onDelete: (id: string) => void, onToggleAvailability: (service: ServiceItem) => void }) => {
  const { colors, isDarkMode, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          {service.category && (
            <Text style={styles.serviceCategory}>{service.category}</Text>
          )}
        </View>
        <View style={styles.serviceActions}>
          <Switch
            value={service.available}
            onValueChange={() => onToggleAvailability(service)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={isDarkMode ? colors.card : '#ffffff'}
            ios_backgroundColor={colors.border}
          />
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(service)}>
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(service.id)}>
            <Ionicons name="trash" size={20} color={colors.notification} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.serviceDescription}>{service.description}</Text>
      
      <View style={styles.serviceDetails}>
        {service.price && (
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color={colors.text} />
            <Text style={styles.detailText}>{service.price}</Text>
          </View>
        )}
        {service.duration && (
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={colors.text} />
            <Text style={styles.detailText}>{service.duration}</Text>
          </View>
        )}
      </View>
      
      <View style={[
        styles.serviceStatus,
        { backgroundColor: service.available ? colors.primary : colors.notification, opacity: 0.8 }
      ]}>
        <Text style={styles.statusText}>
          {service.available ? 'Available' : 'Unavailable'}
        </Text>
      </View>
    </View>
  );
});

const EmptyState = memo(({ onAdd, title, subtitle, icon }: { onAdd?: () => void, title: string, subtitle: string, icon: any }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={64} color={colors.text} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {onAdd && (
        <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
          <Text style={styles.emptyButtonText}>Add Service</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const ServiceFormModal = memo(({ isVisible, onClose, onSave, editingService, formData, setFormData, isLoading }: { isVisible: boolean, onClose: () => void, onSave: () => void, editingService: ServiceItem | null, formData: Partial<ServiceItem>, setFormData: React.Dispatch<React.SetStateAction<Partial<ServiceItem>>>, isLoading: boolean }) => {
  const { colors, isDarkMode, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'Add Service'}</Text>
          <TouchableOpacity style={[styles.modalButton, isLoading && styles.modalButtonDisabled]} onPress={onSave} disabled={isLoading}>
            <Text style={[styles.modalButtonText, styles.saveButton]}>{isLoading ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formGroup}>
            <Text style={styles.label}>Service Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="e.g., Hair Cut, Consultation"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Describe what this service includes..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
              placeholder="e.g., $50, $25-$40, Starting at $100"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Duration</Text>
            <TextInput
              style={styles.input}
              value={formData.duration}
              onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
              placeholder="e.g., 30 minutes, 1-2 hours"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
              placeholder="e.g., Beauty, Medical, Consultation"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Available for Booking</Text>
              <Switch
                value={!!formData.available}
                onValueChange={(value) => setFormData(prev => ({ ...prev, available: value }))}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDarkMode ? colors.card : '#ffffff'}
              />
            </View>
            <Text style={styles.helpText}>
              Toggle to make this service available or unavailable to customers.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
});

export const ServicesManagementScreen: React.FC<ServicesManagementScreenProps> = ({ navigation }) => {
  const {
    userBusiness,
    services,
    isModalVisible,
    setIsModalVisible,
    editingService,
    isLoading,
    isListLoading,
    formData,
    setFormData,
    handleAddService,
    handleEditService,
    handleSaveService,
    handleDeleteService,
    toggleServiceAvailability,
  } = useServicesManagement(navigation);
  
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  if (isListLoading && !userBusiness) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Business Info...</Text>
      </View>
    );
  }

  const renderContent = () => {
    if (!userBusiness) {
      return <EmptyState title="No Business Found" subtitle="You need to be the owner of a business to manage services." icon="business-outline" />;
    }
    if (isListLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Services...</Text>
        </View>
      );
    }
    if (services.length === 0) {
      return <EmptyState onAdd={handleAddService} title="No services yet" subtitle="Add your first service to help customers understand what you offer." icon="pricetag-outline" />;
    }
    return (
      <>
        <Text style={styles.sectionTitle}>Your Services ({services.length})</Text>
        {services.map((service: ServiceItem) => (
          <ServiceListItem 
            key={service.id} 
            service={service} 
            onEdit={handleEditService}
            onDelete={handleDeleteService}
            onToggleAvailability={toggleServiceAvailability}
          />
        ))}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} onAdd={handleAddService} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      <ServiceFormModal 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveService}
        editingService={editingService}
        formData={formData}
        setFormData={setFormData}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
};

const localStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.headerText,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  serviceStatus: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    flex: 1,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: colors.headerText,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalButton: {
    padding: 8,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  saveButton: {
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
});

export default ServicesManagementScreen;