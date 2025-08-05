/**
 * Simple Admin Debug Dashboard
 * Provides basic admin tools using Firebase
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, usePermissions } from '../../hooks/useFirebaseAuth';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface AdminDebugDashboardProps {
  navigation: any;
}

interface UserSummary {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  createdAt: any;
}

const AdminDebugDashboard: React.FC<AdminDebugDashboardProps> = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const { isAdmin } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Statistics
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [recentUsers, setRecentUsers] = useState<UserSummary[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserSummary[]>([]);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setLoadingStatus('Loading dashboard data...');
    
    try {
      // Load users
      setLoadingStatus('Loading users...');
      console.log('👥 Loading users...');
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const allUsers: UserSummary[] = [];
      const admins: UserSummary[] = [];
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data() as UserSummary;
        userData.uid = doc.id;
        allUsers.push(userData);
        
        if (userData.role === 'admin') {
          admins.push(userData);
        }
      });
      
      console.log('👥 Users loaded:', allUsers.length);
      setTotalUsers(allUsers.length);
      setRecentUsers(allUsers.slice(-10).reverse());
      setAdminUsers(admins);
      
      // Load businesses with timeout
      setLoadingStatus('Loading businesses...');
      try {
        console.log('🏢 Loading businesses...');
        const businessesRef = collection(db, 'businesses');
        
        // Add a timeout to prevent hanging
        const businessesPromise = getDocs(businessesRef);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 10000)
        );
        
        const businessesSnapshot = await Promise.race([businessesPromise, timeoutPromise]) as any;
        console.log('🏢 Businesses loaded:', businessesSnapshot.size);
        setTotalBusinesses(businessesSnapshot.size);
      } catch (error) {
        console.log('⚠️ Error loading businesses:', error);
        console.log('This is normal if no businesses have been created yet');
        setTotalBusinesses(0);
      }
      
      setLastUpdated(new Date());
      setLoadingStatus('');
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load debug data');
      setLoadingStatus('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const showSystemInfo = () => {
    const info = `
Platform: React Native
Environment: ${__DEV__ ? 'Development' : 'Production'}
Firebase Project: acceslink-lgbtq
Current User: ${user?.email}
User Role: ${userProfile?.role}
App Version: 1.0.0
    `.trim();
    
    Alert.alert('System Information', info);
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear app cache and may log you out. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache would be cleared (simulated)');
          }
        }
      ]
    );
  };

  const exportData = () => {
    const exportInfo = {
      timestamp: new Date().toISOString(),
      totalUsers,
      totalBusinesses,
      adminUsers: adminUsers.length,
      currentUser: user?.email,
    };
    
    console.log('Debug Export:', JSON.stringify(exportInfo, null, 2));
    Alert.alert(
      'Data Exported', 
      'Debug data has been logged to console. In production, this would download a file.'
    );
  };

  const createSampleData = () => {
    Alert.alert(
      'Create Sample Data',
      'This will create sample businesses and data for testing. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            try {
              setLoadingStatus('Creating sample data...');
              
              // Create a few sample businesses directly
              const sampleBusiness = {
                name: 'Test LGBTQ+ Café',
                description: 'A sample coffee shop for testing',
                category: 'restaurant',
                location: {
                  address: '123 Test Street',
                  city: 'Test City',
                  state: 'TS',
                  zipCode: '12345'
                },
                contact: {
                  phone: '(555) 123-4567',
                  email: 'test@example.com'
                },
                hours: {
                  monday: { open: '08:00', close: '18:00', closed: false }
                },
                lgbtqFriendly: {
                  verified: true,
                  certifications: [],
                  inclusivityFeatures: ['Safe space policy']
                },
                accessibility: {
                  wheelchairAccessible: true,
                  brailleMenus: false,
                  signLanguageSupport: false,
                  quietSpaces: true,
                  accessibilityNotes: 'Test accessibility notes'
                },
                ownerId: user?.uid || 'test-owner',
                status: 'approved',
                featured: false,
                images: [],
                tags: ['test', 'sample'],
                averageRating: 4.5,
                totalReviews: 10,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              };

              const businessesRef = collection(db, 'businesses');
              await addDoc(businessesRef, sampleBusiness);
              
              setLoadingStatus('');
              Alert.alert('Success', 'Sample business created! Refresh to see the updated count.');
            } catch (error) {
              console.error('Error creating sample data:', error);
              Alert.alert('Error', 'Failed to create sample data');
              setLoadingStatus('');
            }
          }
        }
      ]
    );
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color="#ff4444" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            Only administrators can access the debug dashboard.
          </Text>
          <Text style={styles.roleInfo}>
            Your role: {userProfile?.role || 'unknown'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Debug Dashboard</Text>
        <TouchableOpacity style={styles.refreshIcon} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Loading Status */}
        {(loading || loadingStatus) && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {loadingStatus || 'Loading...'}
            </Text>
          </View>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <View style={styles.lastUpdatedContainer}>
            <Text style={styles.lastUpdatedText}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          </View>
        )}

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalBusinesses}</Text>
            <Text style={styles.statLabel}>Businesses</Text>
            {totalBusinesses === 0 && (
              <Text style={styles.statHint}>No businesses yet</Text>
            )}
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{adminUsers.length}</Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
        </View>

        {/* Debug Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Tools</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={showSystemInfo}>
            <Ionicons name="information-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>System Information</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={exportData}>
            <Ionicons name="download" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Export Debug Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.successButton]} onPress={createSampleData}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Create Sample Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.warningButton]} onPress={clearCache}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>

        {/* Current Admins */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Administrators</Text>
          <View style={styles.card}>
            {adminUsers.length === 0 ? (
              <Text style={styles.emptyText}>No admin users found</Text>
            ) : (
              adminUsers.map(admin => (
                <View key={admin.uid} style={styles.userItem}>
                  <View>
                    <Text style={styles.userName}>{admin.displayName}</Text>
                    <Text style={styles.userEmail}>{admin.email}</Text>
                  </View>
                  <Text style={styles.adminBadge}>👑 ADMIN</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Recent Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Users</Text>
          <View style={styles.card}>
            {recentUsers.slice(0, 5).map(user => (
              <View key={user.uid} style={styles.userItem}>
                <View>
                  <Text style={styles.userName}>{user.displayName}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <Text style={styles.roleText}>{user.role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Firebase Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Firebase Status</Text>
          <View style={styles.card}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Project ID:</Text>
              <Text style={styles.statusValue}>acceslink-lgbtq</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Auth Status:</Text>
              <Text style={[styles.statusValue, { color: user ? '#10b981' : '#ef4444' }]}>
                {user ? '✅ Connected' : '❌ Not Connected'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Database:</Text>
              <Text style={[styles.statusValue, { color: '#10b981' }]}>✅ Firestore</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshIcon: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningButton: {
    backgroundColor: '#ef4444',
  },
  successButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  adminBadge: {
    fontSize: 12,
    backgroundColor: '#fbbf24',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: 'bold',
  },
  roleText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4444',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  roleInfo: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  lastUpdatedContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#666',
  },
  statHint: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default AdminDebugDashboard;
