import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
  FlatList
} from 'react-native';
import { adminService, UserDetails, UserFilters } from '../../services/adminService';

interface UserManagementScreenProps {
  navigation: any;
}

const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({});

  useEffect(() => {
    loadUsers();
  }, [currentPage, filters]);

  const loadUsers = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      }

      const result = await adminService.getUsers(
        reset ? 1 : currentPage,
        50,
        searchQuery,
        filters
      );
      
      if (reset) {
        setUsers(result.users);
      } else {
        setUsers(prev => [...prev, ...result.users]);
      }
      
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers(true);
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadUsers(true);
  };

  const handleUserPress = async (user: UserDetails) => {
    try {
      const userDetails = await adminService.getUserDetails(user.uid);
      setSelectedUser(userDetails);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      Alert.alert('Error', 'Failed to load user details');
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      Alert.alert('Success', 'User status updated successfully');
      loadUsers(true);
      setShowUserModal(false);
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleAddNote = (userId: string) => {
    Alert.prompt(
      'Add Admin Note',
      'Enter a note for this user:',
      async (note) => {
        if (note && note.trim()) {
          try {
            await adminService.addUserNote(userId, note.trim());
            Alert.alert('Success', 'Note added successfully');
            // Reload user details
            const userDetails = await adminService.getUserDetails(userId);
            setSelectedUser(userDetails);
          } catch (error) {
            console.error('Error adding note:', error);
            Alert.alert('Error', 'Failed to add note');
          }
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#f59e0b';
      case 'suspended': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getVerificationColor = (level: string) => {
    switch (level) {
      case 'full': return '#10b981';
      case 'email': return '#3b82f6';
      case 'phone': return '#8b5cf6';
      case 'unverified': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderUser = ({ item }: { item: UserDetails }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => handleUserPress(item)}>
      <View style={styles.userHeader}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.accountStatus) }]}>
          <Text style={styles.statusText}>{item.accountStatus}</Text>
        </View>
      </View>
      <Text style={styles.userEmail}>{item.email}</Text>
      <View style={styles.userMeta}>
        <Text style={styles.userMetaText}>
          Joined: {item.registrationDate.toLocaleDateString()}
        </Text>
        <View style={[styles.verificationBadge, { backgroundColor: getVerificationColor(item.verificationLevel) }]}>
          <Text style={styles.verificationText}>{item.verificationLevel}</Text>
        </View>
      </View>
      <View style={styles.userStats}>
        <Text style={styles.statText}>Reviews: {item.reviewCount}</Text>
        <Text style={styles.statText}>Businesses: {item.businessCount}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUserModal = () => {
    if (!selectedUser) return null;

    return (
      <Modal
        visible={showUserModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>User Details</Text>
            <TouchableOpacity onPress={() => setShowUserModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.userDetailSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Display Name:</Text>
                <Text style={styles.detailValue}>{selectedUser.displayName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{selectedUser.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Role:</Text>
                <Text style={styles.detailValue}>{selectedUser.role}</Text>
              </View>
            </View>

            <View style={styles.userDetailSection}>
              <Text style={styles.sectionTitle}>Account Status</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedUser.accountStatus) }]}>
                  <Text style={styles.statusText}>{selectedUser.accountStatus}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Verification:</Text>
                <View style={[styles.verificationBadge, { backgroundColor: getVerificationColor(selectedUser.verificationLevel) }]}>
                  <Text style={styles.verificationText}>{selectedUser.verificationLevel}</Text>
                </View>
              </View>
            </View>

            <View style={styles.userDetailSection}>
              <Text style={styles.sectionTitle}>Activity</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Registration Date:</Text>
                <Text style={styles.detailValue}>{selectedUser.registrationDate.toLocaleDateString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Login:</Text>
                <Text style={styles.detailValue}>{selectedUser.lastLoginDate.toLocaleDateString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reviews Written:</Text>
                <Text style={styles.detailValue}>{selectedUser.reviewCount}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Business Accounts:</Text>
                <Text style={styles.detailValue}>{selectedUser.businessCount}</Text>
              </View>
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
            <TouchableOpacity
              style={[styles.actionButton, styles.noteButton]}
              onPress={() => handleAddNote(selectedUser.uid)}
            >
              <Text style={styles.actionButtonText}>Add Note</Text>
            </TouchableOpacity>
            
            {selectedUser.accountStatus === 'active' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.suspendButton]}
                onPress={() => handleUpdateUserStatus(selectedUser.uid, 'suspended')}
              >
                <Text style={styles.actionButtonText}>Suspend</Text>
              </TouchableOpacity>
            )}
            
            {selectedUser.accountStatus === 'suspended' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.activateButton]}
                onPress={() => handleUpdateUserStatus(selectedUser.uid, 'active')}
              >
                <Text style={styles.actionButtonText}>Activate</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSubtitle}>{totalCount} total users</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.uid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        onEndReached={() => {
          if (!loading && users.length < totalCount) {
            setCurrentPage(prev => prev + 1);
          }
        }}
        onEndReachedThreshold={0.1}
      />

      {renderUserModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
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
    color: '#1f2937',
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
    color: '#6b7280',
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
    color: '#6b7280',
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
    color: '#374151',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1e293b',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    fontSize: 24,
    color: 'white',
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  userDetailSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
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
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  noteCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteAdmin: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  noteDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  noteText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  noteButton: {
    backgroundColor: '#6366f1',
  },
  suspendButton: {
    backgroundColor: '#ef4444',
  },
  activateButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserManagementScreen;
