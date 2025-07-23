import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { APP_INFO } from './src/utils/constants';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial app loading/bootstrapping
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Simple splash screen while loading
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#6a0dad', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Text style={{ 
          fontSize: 32, 
          fontWeight: 'bold', 
          color: 'white' 
        }}>
          {APP_INFO.NAME}
        </Text>
        <Text style={{ 
          marginTop: 10, 
          color: 'white', 
          opacity: 0.8 
        }}>
          {APP_INFO.DESCRIPTION}
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
