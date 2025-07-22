import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export interface AccessibilityPreferences {
  // Physical accessibility needs
  wheelchairUser: boolean;
  mobilityAid: boolean;
  accessibleParking: boolean;
  
  // Sensory needs
  lowVision: boolean;
  blindness: boolean;
  hardOfHearing: boolean;
  deaf: boolean;
  sensoryProcessing: boolean;
  
  // Cognitive/Neurological needs
  neurodivergent: boolean;
  cognitiveSupport: boolean;
  quietEnvironment: boolean;
  
  // App-specific preferences
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReaderEnabled: boolean;
  voiceControl: boolean;
}

export interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreferences: (updates: Partial<AccessibilityPreferences>) => void;
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  announceForAccessibility: (message: string) => void;
}

const defaultPreferences: AccessibilityPreferences = {
  wheelchairUser: false,
  mobilityAid: false,
  accessibleParking: false,
  lowVision: false,
  blindness: false,
  hardOfHearing: false,
  deaf: false,
  sensoryProcessing: false,
  neurodivergent: false,
  cognitiveSupport: false,
  quietEnvironment: false,
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  screenReaderEnabled: false,
  voiceControl: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  useEffect(() => {
    // Check initial accessibility settings
    const checkAccessibilitySettings = async () => {
      try {
        const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        
        setIsScreenReaderEnabled(screenReaderEnabled);
        setIsReduceMotionEnabled(reduceMotionEnabled);
        
        // Update preferences based on system settings
        setPreferences(prev => ({
          ...prev,
          screenReaderEnabled,
          reduceMotion: reduceMotionEnabled,
        }));
      } catch (error) {
        console.warn('Error checking accessibility settings:', error);
      }
    };

    checkAccessibilitySettings();

    // Listen for changes in accessibility settings
    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled
    );

    return () => {
      screenReaderSubscription?.remove();
      reduceMotionSubscription?.remove();
    };
  }, []);

  const updatePreferences = (updates: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const announceForAccessibility = (message: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  const value: AccessibilityContextType = {
    preferences,
    updatePreferences,
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    announceForAccessibility,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
