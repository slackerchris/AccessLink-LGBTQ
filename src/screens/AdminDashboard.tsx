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
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  quickActions: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stats: {
    // Add statistics styling
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 24,
  },
});

export default AdminDashboard;
