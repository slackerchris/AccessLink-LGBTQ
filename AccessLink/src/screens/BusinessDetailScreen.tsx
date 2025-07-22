import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BusinessDetailScreen = () => (
  <View style={styles.container}>
    <Text>Business Detail Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default BusinessDetailScreen;
