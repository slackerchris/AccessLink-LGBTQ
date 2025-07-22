// Accessible component wrappers to handle TypeScript issues
import React from 'react';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { Card as PaperCard, FAB as PaperFAB, Searchbar as PaperSearchbar, Chip as PaperChip } from 'react-native-paper';

// Export properly typed components
export const SafeAreaView: React.FC<React.ComponentProps<typeof RNSafeAreaView>> = (props) => {
  return <RNSafeAreaView {...props} />;
};

export const Card: React.FC<React.ComponentProps<typeof PaperCard>> = (props) => {
  return <PaperCard {...props} />;
};

export const FAB: React.FC<React.ComponentProps<typeof PaperFAB>> = (props) => {
  return <PaperFAB {...props} />;
};

export const Searchbar: React.FC<React.ComponentProps<typeof PaperSearchbar>> = (props) => {
  return <PaperSearchbar {...props} />;
};

export const Chip: React.FC<React.ComponentProps<typeof PaperChip>> = (props) => {
  return <PaperChip {...props} />;
};
