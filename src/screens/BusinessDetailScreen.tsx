

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { ApiService } from '../services/api/ApiService';
import { Business } from '../types';

const BusinessDetailScreen = () => {
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    ApiService.getBusinessById('1').then((data) => setBusiness(data));
  }, []);

  if (!business) {
    return (
      <View style={styles.container}>
        <Text>Loading business details...</Text>
      </View>
    );
  }

  const { name, description, contactInfo } = business;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.contactContainer}>
        <Text style={styles.contactTitle}>Contact Information:</Text>
        {contactInfo?.phone && (
          <Text style={styles.contactItem}>Phone: {contactInfo.phone}</Text>
        )}
        {contactInfo?.email && (
          <Text style={styles.contactItem}>Email: {contactInfo.email}</Text>
        )}
        {contactInfo?.website && (
          <Text
            style={[styles.contactItem, styles.link]}
            onPress={() => {
              if (contactInfo.website) {
                Linking.openURL(contactInfo.website);
              }
            }}
            accessibilityRole="link"
          >
            Website: {contactInfo.website}
          </Text>
        )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  contactContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactItem: {
    fontSize: 16,
    marginBottom: 4,
  },
  link: {
    color: '#6366F1',
    textDecorationLine: 'underline',
  },
});

export default BusinessDetailScreen;
