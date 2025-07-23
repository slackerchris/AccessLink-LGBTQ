import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  // Mock data for featured resources
  const featuredResources = [
    {
      id: '1',
      title: 'Local Support Groups',
      description: 'Find supportive communities near you',
      icon: '👥',
    },
    {
      id: '2',
      title: 'Healthcare Resources',
      description: 'LGBTQ+ friendly healthcare providers',
      icon: '🏥',
    },
    {
      id: '3',
      title: 'Upcoming Events',
      description: 'Pride events and community gatherings',
      icon: '🎉',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to AccessLink</Text>
          <Text style={styles.subtitle}>Supporting the LGBTQ+ Community</Text>
        </View>
        
        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Find Safe Spaces &amp; Resources</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Explore Now</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Featured Resources</Text>
          
          {featuredResources.map((resource) => (
            <TouchableOpacity key={resource.id} style={styles.resourceCard}>
              <Text style={styles.resourceIcon}>{resource.icon}</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDescription}>{resource.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Crisis Support</Text>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>24/7 Crisis Hotline</Text>
          </TouchableOpacity>
          <Text style={styles.supportText}>
            If you're in crisis, help is available 24/7. Tap above to connect with trained counselors.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  bannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  banner: {
    backgroundColor: '#6a0dad', // Purple color for LGBTQ+ theme
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  bannerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  bannerButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  bannerButtonText: {
    color: '#6a0dad',
    fontWeight: 'bold',
  },
  sectionContainer: {
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resourceCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#6a0dad',
  },
  resourceIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666',
  },
  supportButton: {
    backgroundColor: '#e74c3c', // Red for emergency
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  supportButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
