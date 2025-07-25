import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';

export default function App() {
  const handlePress = () => {
    Alert.alert('Success!', 'AccessLink LGBTQ+ app is working!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🏳️‍🌈 AccessLink LGBTQ+</Text>
      <Text style={styles.subtitle}>Demo Version - Available Accounts</Text>
      
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Test Button</Text>
      </TouchableOpacity>
      
      <View style={styles.accountsContainer}>
        <Text style={styles.accountsTitle}>Demo Login Accounts:</Text>
        
        <View style={styles.accountCard}>
          <Text style={styles.accountRole}>👑 PRIMARY ADMIN</Text>
          <Text style={styles.accountEmail}>Username: admin</Text>
          <Text style={styles.accountPassword}>Password: accesslink1234</Text>
          <Text style={styles.accountDesc}>Full admin access to all features</Text>
        </View>

        <View style={styles.accountCard}>
          <Text style={styles.accountRole}>👑 ADMIN</Text>
          <Text style={styles.accountEmail}>Email: admin@accesslinklgbtq.app</Text>
          <Text style={styles.accountPassword}>Password: admin123</Text>
          <Text style={styles.accountDesc}>System administrator account</Text>
        </View>

        <View style={styles.accountCard}>
          <Text style={styles.accountRole}>👤 USER</Text>
          <Text style={styles.accountEmail}>Email: user@example.com</Text>
          <Text style={styles.accountPassword}>Password: password123</Text>
          <Text style={styles.accountDesc}>Regular community member</Text>
        </View>
      </View>
      
      <Text style={styles.info}>
        This is a basic test to ensure the app loads properly.{'\n'}
        If you can see this, React Native is working!{'\n\n'}
        Ready to implement the full authentication system with these accounts.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  accountsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  accountCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    width: '100%',
  },
  accountRole: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 5,
  },
  accountEmail: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
    marginBottom: 3,
  },
  accountPassword: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  accountDesc: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  info: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
