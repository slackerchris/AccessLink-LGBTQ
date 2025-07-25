import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Searchbar, Menu } from 'react-native-paper';
import { SafeAreaView } from '../components/AccessibleComponents';
import { useAuth } from '../services/auth/AuthProvider';
import { AuthUser } from '../types/auth';

export const UserManagement = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    // Fetch users from your database
    // This should be implemented in your API service
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement user search logic
  };

  const handleUserAction = (action: 'suspend' | 'delete' | 'resetPassword', user: AuthUser) => {
    // Implement user management actions
    setMenuVisible(false);
  };

  const renderUserItem = ({ item }: { item: AuthUser }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName || 'Unnamed User'}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>Role: {item.role}</Text>
      </View>
      <Menu
        visible={menuVisible && selectedUser?.uid === item.uid}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedUser(item);
              setMenuVisible(true);
            }}
          >
            Actions
          </Button>
        }
      >
        <Menu.Item
          onPress={() => handleUserAction('suspend', item)}
          title="Suspend Account"
        />
        <Menu.Item
          onPress={() => handleUserAction('resetPassword', item)}
          title="Reset Password"
        />
        <Menu.Item
          onPress={() => handleUserAction('delete', item)}
          title="Delete Account"
        />
      </Menu>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
      </View>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search users..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />

        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.list}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    padding: 16,
  },
  list: {
    paddingBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userItem: {
    alignItems: 'center',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default UserManagement;
