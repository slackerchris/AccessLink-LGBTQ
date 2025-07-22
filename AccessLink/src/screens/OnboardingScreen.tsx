import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const OnboardingScreen = ({ navigation }: any) => (
  <View style={styles.container}>
    <Text style={styles.title}>Onboarding</Text>
    <Button mode="contained" onPress={() => navigation.navigate('Main')}>
      <Text>Finish</Text>
    </Button>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default OnboardingScreen;
