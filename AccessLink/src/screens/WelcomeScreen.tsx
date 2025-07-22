import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const WelcomeScreen = ({ navigation }: any) => (
  <View style={styles.container}>
    <Text style={styles.title}>Welcome to AccessLink</Text>
    <Button mode="contained" onPress={() => navigation.navigate('Onboarding')}>
      Get Started
    </Button>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default WelcomeScreen;
