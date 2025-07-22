import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const OnboardingScreen = ({ navigation }: any) => (
  <View style={styles.container}>
    <Text style={styles.title}>Onboarding</Text>
    <Button mode="contained" onPress={() => navigation.navigate('Main')}>
      Finish
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

export default OnboardingScreen;
