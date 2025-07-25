import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DOMAIN_CONFIG from './config/domain';

export default function App() {
  const handleOpenWebsite = async () => {
    try {
      await Linking.openURL(DOMAIN_CONFIG.BASE_URL);
    } catch (error) {
      console.error('Failed to open website:', error);
    }
  };

  const handleSupportEmail = async () => {
    try {
      await Linking.openURL(`mailto:${DOMAIN_CONFIG.SUPPORT_EMAIL}`);
    } catch (error) {
      console.error('Failed to open email:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🏳️‍🌈 AccessLink LGBTQ+ 🏳️‍⚧️</Text>
          <Text style={styles.subtitle}>Building Inclusive Communities</Text>
          <Text style={styles.domain}>{DOMAIN_CONFIG.BASE_URL}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.welcomeText}>
            Welcome to AccessLink! We're creating a platform that connects LGBTQ+ individuals 
            with inclusive, accessible businesses and services.
          </Text>

          <View style={styles.features}>
            <Text style={styles.sectionTitle}>✨ Features Coming Soon:</Text>
            <Text style={styles.feature}>🏪 LGBTQ+ Friendly Business Directory</Text>
            <Text style={styles.feature}>♿ Accessibility Information</Text>
            <Text style={styles.feature}>🤝 Community Reviews & Ratings</Text>
            <Text style={styles.feature}>📍 Location-Based Discovery</Text>
            <Text style={styles.feature}>🔒 Safe Space Verification</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={handleOpenWebsite}>
              <Text style={styles.buttonText}>Visit Website</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.buttonSecondary} onPress={handleSupportEmail}>
              <Text style={styles.buttonSecondaryText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This is a fresh start! The app is now running cleanly without technical debt.
            </Text>
            <Text style={styles.footerTextSmall}>
              Ready for accessibility-first development 🚀
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6b46c1',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 8,
  },
  domain: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 30,
  },
  features: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  feature: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
    paddingLeft: 10,
  },
  actions: {
    alignItems: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#6b46c1',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonSecondary: {
    borderWidth: 2,
    borderColor: '#6b46c1',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonSecondaryText: {
    color: '#6b46c1',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    marginBottom: 5,
  },
  footerTextSmall: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
