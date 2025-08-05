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
import { Ionicons } from '@expo/vector-icons';
import { adminService, UserDetails, UserFilters } from '../../services/adminService';
import { useAuth, usePermissions } from '../../hooks/useFirebaseAuth';

interface UserManagementScreenProps {
  navigation: any;
}

const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ navigation }) => {
  const { makeUserAdmin, removeAdminRole } = useAuth();
  const { isAdmin } = usePermissions();
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
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

  const handleMakeAdmin = async (userEmail: string) => {
    Alert.alert(
      'Make Admin',
      `Are you sure you want to make ${userEmail} an admin? This will give them full administrative privileges.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Make Admin',
          style: 'destructive',
          onPress: async () => {
            try {
              await makeUserAdmin(userEmail);
              Alert.alert('Success', `${userEmail} is now an admin`);
              loadUsers(true);
              setShowUserModal(false);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to make user admin');
            }
          }
        }
      ]
    );
  };

  const handleRemoveAdmin = async (userEmail: string) => {
    Alert.alert(
      'Remove Admin',
      `Are you sure you want to remove admin privileges from ${userEmail}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Admin',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAdminRole(userEmail);
              Alert.alert('Success', `Removed admin privileges from ${userEmail}`);
              loadUsers(true);
              setShowUserModal(false);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove admin role');
            }
          }
        }
      ]
    );
  };

  const showMakeAdminPrompt = () => {
    setShowAdminPrompt(true);
  };

  const handleMakeAdminFromPrompt = async () => {
    if (!adminEmailInput.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      await makeUserAdmin(adminEmailInput.trim());
      Alert.alert('Success', `${adminEmailInput.trim()} is now an admin`);
      setAdminEmailInput('');
      setShowAdminPrompt(false);
      loadUsers(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to make user admin');
    }
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
                <View style={styles.roleContainer}>
                  <Text style={[styles.detailValue, { color: selectedUser.role === 'admin' ? '#ef4444' : '#1f2937' }]}>
                    {selectedUser.role}
                  </Text>
                  {selectedUser.role === 'admin' && (
                    <Text style={styles.adminBadge}>👑</Text>
                  )}
                </View>
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
            
            {selectedUser.role !== 'admin' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.adminButton]}
                onPress={() => handleMakeAdmin(selectedUser.email)}
              >
                <Text style={styles.actionButtonText}>Make Admin</Text>
              </TouchableOpacity>
            )}
            
            {selectedUser.role === 'admin' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.removeAdminButton]}
                onPress={() => handleRemoveAdmin(selectedUser.email)}
              >
                <Text style={styles.actionButtonText}>Remove Admin</Text>
              </TouchableOpacity>
            )}
            
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>{totalCount} total users</Text>
        </View>
        <TouchableOpacity
          style={styles.adminButton}
          onPress={showMakeAdminPrompt}
        >
          <Text style={styles.adminButtonText}>👑 Make Admin</Text>
        </TouchableOpacity>
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
      
      {/* Make Admin Prompt Modal */}
      <Modal
        visible={showAdminPrompt}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.promptOverlay}>
          <View style={styles.promptContainer}>
            <Text style={styles.promptTitle}>Make User Admin</Text>
            <Text style={styles.promptSubtitle}>
              Enter the email address of the user you want to make an admin:
            </Text>
            
            <TextInput
              style={styles.promptInput}
              placeholder="user@example.com"
              value={adminEmailInput}
              onChangeText={setAdminEmailInput}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <View style={styles.promptActions}>
              <TouchableOpacity
                style={[styles.promptButton, styles.promptCancelButton]}
                onPress={() => {
                  setShowAdminPrompt(false);
                  setAdminEmailInput('');
                }}
              >
                <Text style={styles.promptCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.promptButton, styles.promptConfirmButton]}
                onPress={handleMakeAdminFromPrompt}
              >
                <Text style={styles.promptConfirmText}>👑 Make Admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  // Admin-specific styles
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  adminBadge: {
    marginLeft: 8,
    fontSize: 16,
  },
  adminButton: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  adminButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeAdminButton: {
    backgroundColor: '#f59e0b',
  },
  // Prompt modal styles
  promptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  promptContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  promptSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  promptActions: {
    flexDirection: 'row',
    gap: 12,
  },
  promptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  promptCancelButton: {
    backgroundColor: '#f3f4f6',
  },
  promptConfirmButton: {
    backgroundColor: '#fbbf24',
  },
  promptCancelText: {
    color: '#374151',
    fontWeight: 'bold',
  },
  promptConfirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default UserManagementScreen;
