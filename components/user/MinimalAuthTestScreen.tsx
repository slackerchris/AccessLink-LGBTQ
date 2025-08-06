import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../../hooks/useFirebaseAuth';

export default function MinimalAuthTestScreen() {
  let user;
  try {
    user = useAuth().user;
  } catch (e) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 18 }}>AuthProvider context error:</Text>
        <Text style={{ color: 'red', marginTop: 8 }}>{String(e)}</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 18 }}>AuthProvider context OK</Text>
      <Text style={{ marginTop: 8 }}>User: {user ? JSON.stringify(user) : 'No user'}</Text>
    </View>
  );
}
