import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DiscoverScreen = () => (
  <View style={styles.container}>
    <Text>Discover Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default DiscoverScreen;
