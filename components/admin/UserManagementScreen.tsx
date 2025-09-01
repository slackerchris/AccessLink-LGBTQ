import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserManagement, useUserDetails, useUserActions } from '../../hooks/useUserManagement';
import { UserDetails } from '../../services/adminService';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useTheme } from '../../hooks/useTheme';
import { Modal } from '../common/FixedModal';

// Navigation Prop Type
type UserManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserManagement'>;

interface UserManagementScreenProps {
  navigation: UserManagementScreenNavigationProp;
}

// Helper function for status colors
const getStatusColor = (status: string, colors: any) => {
  switch (status) {
    case 'active': return colors.success;
    case 'inactive': return colors.warning;
    case 'suspended': return colors.notification;
    default: return colors.textSecondary;
  }
};

// Helper function for verification colors
const getVerificationColor = (level: string, colors: any) => {
  switch (level) {
    case 'full': return colors.success;
    case 'email': return colors.primary;
    case 'phone': return '#8b5cf6'; // No direct theme color, consider adding one
    case 'unverified': return colors.notification;
    default: return colors.textSecondary;
  }
};

// Memoized Sub-components
const Header: React.FC<{ onBack: () => void; totalCount: number }> = React.memo(({ onBack, totalCount }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSubtitle}>{totalCount} total users</Text>
      </View>
    </View>
  );
});

const SearchBar: React.FC<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}> = React.memo(({ searchQuery, setSearchQuery, onSearch }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users by name or email..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={onSearch}
        returnKeyType="search"
      />
      <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );
});

const UserCard: React.FC<{ item: UserDetails; onPress: () => void }> = React.memo(({ item, onPress }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <TouchableOpacity style={styles.userCard} onPress={onPress}>
      <View style={styles.userHeader}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.accountStatus, colors) }]}>
          <Text style={styles.statusText}>{item.accountStatus}</Text>
        </View>
      </View>
      <Text style={styles.userEmail}>{item.email}</Text>
      <View style={styles.userMeta}>
        <Text style={styles.userMetaText}>
          Joined: {item.registrationDate instanceof Date ? item.registrationDate.toLocaleDateString() : 'N/A'}
        </Text>
        <View style={[styles.verificationBadge, { backgroundColor: getVerificationColor(item.verificationLevel, colors) }]}>
          <Text style={styles.verificationText}>{item.verificationLevel}</Text>
        </View>
      </View>
      <View style={styles.userStats}>
        <Text style={styles.statText}>Reviews: {item.reviewCount}</Text>
        <Text style={styles.statText}>Businesses: {item.businessCount}</Text>
      </View>
    </TouchableOpacity>
  );
});

const UserDetailsModal: React.FC<{
  userId: string;
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ userId, visible, onClose, onUpdate }) => {
  const { user: selectedUser, loading, error, refresh } = useUserDetails(userId);
  const { updateUserStatus, addUserNote, loading: actionLoading } = useUserActions();
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);

  const handleUpdateStatus = async (newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      await updateUserStatus(userId, newStatus);
      Alert.alert('Success', 'User status updated successfully');
      onUpdate();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      Alert.alert('Error', message);
    }
  };

  const handleAddNote = () => {
    Alert.prompt('Add Admin Note', 'Enter a note for this user:', async (note) => {
      if (note && note.trim()) {
        try {
          await addUserNote(userId, note.trim());
          Alert.alert('Success', 'Note added successfully');
          refresh();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'An unknown error occurred.';
          Alert.alert('Error', message);
        }
      }
    });
  };

  const renderContent = () => {
    if (loading && !selectedUser) return <View style={styles.modalLoading}><ActivityIndicator size="large" /></View>;
    if (error) return <View style={styles.modalLoading}><Text style={{ color: 'red' }}>{error}</Text></View>;
    if (!selectedUser) return <View style={styles.modalLoading}><Text>User not found.</Text></View>;

    return (
      <>
        <ScrollView style={styles.modalContent}>
          <View style={styles.userDetailSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <DetailRow label="Display Name" value={selectedUser.displayName} />
            <DetailRow label="Email" value={selectedUser.email} />
            <DetailRow label="Role" value={selectedUser.role} />
          </View>
          <View style={styles.userDetailSection}>
            <Text style={styles.sectionTitle}>Account Status</Text>
            <DetailRow label="Status">
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedUser.accountStatus, colors) }]}>
                <Text style={styles.statusText}>{selectedUser.accountStatus}</Text>
              </View>
            </DetailRow>
            <DetailRow label="Verification">
              <View style={[styles.verificationBadge, { backgroundColor: getVerificationColor(selectedUser.verificationLevel, colors) }]}>
                <Text style={styles.verificationText}>{selectedUser.verificationLevel}</Text>
              </View>
            </DetailRow>
          </View>
          <View style={styles.userDetailSection}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <DetailRow label="Registration Date" value={selectedUser.registrationDate.toLocaleDateString()} />
            <DetailRow label="Last Login" value={selectedUser.lastLoginDate.toLocaleDateString()} />
            <DetailRow label="Reviews Written" value={selectedUser.reviewCount.toString()} />
            <DetailRow label="Business Accounts" value={selectedUser.businessCount.toString()} />
          </View>
          {selectedUser.adminNotes.length > 0 && (
            <View style={styles.userDetailSection}>
              <Text style={styles.sectionTitle}>Admin Notes</Text>
              {selectedUser.adminNotes.map((note, index) => (
                <View key={index} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteAdmin}>{note.adminName}</Text>
                    <Text style={styles.noteDate}>{note.timestamp.toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.noteText}>{note.note}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
        <View style={styles.modalActions}>
          <TouchableOpacity style={[styles.actionButton, styles.noteButton]} onPress={handleAddNote} disabled={actionLoading}>
            <Text style={styles.actionButtonText}>Add Note</Text>
          </TouchableOpacity>
          {selectedUser.accountStatus === 'active' ? (
            <TouchableOpacity style={[styles.actionButton, styles.suspendButton]} onPress={() => handleUpdateStatus('suspended')} disabled={actionLoading}>
              <Text style={styles.actionButtonText}>Suspend</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionButton, styles.activateButton]} onPress={() => handleUpdateStatus('active')} disabled={actionLoading}>
              <Text style={styles.actionButtonText}>Activate</Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>User Details</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        {renderContent()}
      </View>
    </Modal>
  );
};

const DetailRow: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => {
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      {value ? <Text style={styles.detailValue}>{value}</Text> : children}
    </View>
  );
};

// Main Component
const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ navigation }) => {
  const { users, loading, totalCount, searchQuery, setSearchQuery, refresh, loadMore } = useUserManagement();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { createStyles } = useTheme();
  const styles = createStyles(localStyles);

  return (
    <View style={styles.container}>
      <Header onBack={() => navigation.goBack()} totalCount={totalCount} />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={refresh} />
      <FlatList
        data={users}
        renderItem={({ item }) => <UserCard item={item} onPress={() => setSelectedUserId(item.uid)} />}
        keyExtractor={(item) => item.uid}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && users.length > 0 ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        ) : null}
      />
      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          visible={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdate={refresh}
        />
      )}
    </View>
  );
};

const localStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: colors.background,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: colors.card,
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userMetaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  verificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 14,
    color: colors.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.primary,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.card,
  },
  closeButton: {
    fontSize: 24,
    color: colors.card,
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  userDetailSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  noteCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteAdmin: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  noteDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  noteText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  noteButton: {
    backgroundColor: colors.primary,
  },
  suspendButton: {
    backgroundColor: colors.notification,
  },
  activateButton: {
    backgroundColor: colors.success,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default UserManagementScreen;
