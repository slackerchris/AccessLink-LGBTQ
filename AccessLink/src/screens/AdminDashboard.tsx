import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from '../components/AccessibleComponents';
import { useAuth } from '../services/auth/AuthProvider';

export const AdminDashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Button mode="text" onPress={signOut}>
          Logout
        </Button>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.displayName || 'Admin'}
        </Text>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          <View style={styles.buttonGrid}>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => {/* Navigate to user management */}}
            >
              User Management
            </Button>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => {/* Navigate to business verification */}}
            >
              Business Verification
            </Button>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => {/* Navigate to reports */}}
            >
              Reports & Analytics
            </Button>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => {/* Navigate to settings */}}
            >
              System Settings
            </Button>
          </View>
        </View>

        <View style={styles.stats}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          {/* Add platform statistics components here */}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActions: {
    marginBottom: 32,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  stats: {
    // Add statistics styling
  },
});

export default AdminDashboard;
