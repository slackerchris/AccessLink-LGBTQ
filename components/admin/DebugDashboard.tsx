/**
 * Debug Dashboard Component
 * Provides debugging tools and system monitoring for administrators
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Modal } from '../common/FixedModal';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../hooks/useTheme';
import {
  debugService,
  SystemInfo,
  DatabaseStats,
  LogEntry,
} from '../../services/debugService';

// Prop Interfaces
interface DebugDashboardProps {
  navigation: any;
}

// Memoized Sub-components
const Header: React.FC<{ onBack: () => void; onRefresh: () => void }> =
  React.memo(({ onBack, onRefresh }) => {
    const { colors, createStyles } = useTheme();
    const styles = createStyles(localStyles);
    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Debug Dashboard</Text>
        <TouchableOpacity style={styles.refreshIcon} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    );
  });

const TabBar: React.FC<{
  activeTab: string;
  onTabPress: (tab: any) => void;
}> = React.memo(({ activeTab, onTabPress }) => {
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const renderTabButton = (tab: string, label: string, icon: any) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
      onPress={() => onTabPress(tab)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={activeTab === tab ? colors.headerText : colors.textSecondary}
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.tabContainer}>
      {renderTabButton('overview', 'Overview', 'analytics')}
      {renderTabButton('logs', 'Logs', 'list')}
      {renderTabButton('database', 'Database', 'server')}
      {renderTabButton('performance', 'Performance', 'speedometer')}
      {renderTabButton('tools', 'Tools', 'build')}
    </View>
  );
});

// Main Component
const DebugDashboard: React.FC<DebugDashboardProps> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { colors, createStyles } = useTheme();
  const styles = createStyles(localStyles);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'logs' | 'database' | 'performance' | 'tools'
  >('overview');

  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(
    null
  );
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [performanceResults, setPerformanceResults] = useState<any>(null);

  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryText, setQueryText] = useState('SELECT * FROM users');
  const [queryResults, setQueryResults] = useState<any>(null);

  const [logLevel, setLogLevel] = useState<string>('all');
  const [logCategory, setLogCategory] = useState<string>('');

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const [sysInfo, dbStats] = await Promise.all([
        debugService.getSystemInfo(),
        debugService.getDatabaseStats(),
      ]);

      setSystemInfo(sysInfo);
      setDatabaseStats(dbStats);
      setLogs(debugService.getLogs({ limit: 100 }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load debug data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const runPerformanceTest = async () => {
    setLoading(true);
    try {
      const results = await debugService.runPerformanceTest();
      setPerformanceResults(results);
      debugService.info('Debug Dashboard', 'Performance test completed');
    } catch (error) {
      console.error('Performance test failed:', error);
      Alert.alert('Error', 'Performance test failed');
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!queryText.trim()) {
      Alert.alert('Error', 'Please enter a query');
      return;
    }

    setLoading(true);
    try {
      const results = await debugService.executeQuery(queryText);
      setQueryResults(results);
    } catch (error) {
      console.error('Query failed:', error);
      Alert.alert(
        'Query Error',
        error instanceof Error ? error.message : 'Query execution failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const exportDebugData = async () => {
    setLoading(true);
    try {
      const data = await debugService.exportData();
      console.log('Debug data exported:', data);
      Alert.alert(
        'Success',
        'Debug data exported to console. In production, this would download a file.'
      );
      debugService.info('Debug Dashboard', 'Debug data exported');
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Error', 'Failed to export debug data');
    } finally {
      setLoading(false);
    }
  };

  const importSampleData = async () => {
    Alert.alert(
      'Import Sample Data',
      'This will add test users to the database. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            setLoading(true);
            try {
              await debugService.importSampleData();
              await loadDashboardData();
              Alert.alert('Success', 'Sample data imported successfully');
            } catch (error) {
              console.error('Import failed:', error);
              Alert.alert('Error', 'Failed to import sample data');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const clearLogs = () => {
    Alert.alert('Clear Logs', 'This will clear all application logs. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          debugService.clearLogs();
          setLogs([]);
          Alert.alert('Success', 'Logs cleared');
        },
      },
    ]);
  };

  const getFilteredLogs = () => {
    let filtered = logs;

    if (logLevel !== 'all') {
      filtered = filtered.filter((log) => log.level === logLevel);
    }

    if (logCategory.trim()) {
      filtered = filtered.filter((log) =>
        log.category.toLowerCase().includes(logCategory.toLowerCase())
      );
    }

    return filtered;
  };

  const renderOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>System Overview</Text>
      {systemInfo && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>System Information</Text>
          <Text style={styles.infoText}>Platform: {systemInfo.platform}</Text>
          <Text style={styles.infoText}>
            IndexedDB Support: {systemInfo.indexedDBSupport ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.infoText}>
            Databases: {systemInfo.databases.join(', ')}
          </Text>
          <Text style={styles.infoText}>
            Timestamp: {new Date(systemInfo.timestamp).toLocaleString()}
          </Text>
        </View>
      )}
      {databaseStats && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Database Statistics</Text>
          <Text style={styles.infoText}>
            Total Users: {databaseStats.totalUsers}
          </Text>
          <Text style={styles.infoText}>
            Total Businesses: {databaseStats.totalBusinesses}
          </Text>
          <Text style={styles.infoText}>
            Total Reviews: {databaseStats.totalReviews}
          </Text>
          <Text style={styles.subTitle}>Users by Type:</Text>
          {Object.entries(databaseStats.usersByType).map(([type, count]) => (
            <Text key={type} style={styles.infoText}>
              {'  '}
              {type}: {count}
            </Text>
          ))}
          <Text style={styles.subTitle}>Businesses by Category:</Text>
          {Object.entries(databaseStats.businessesByCategory).map(
            ([category, count]) => (
              <Text key={category} style={styles.infoText}>
                {'  '}
                {category}: {count}
              </Text>
            )
          )}
        </View>
      )}
    </View>
  );

  const renderLogs = () => (
    <View style={styles.section}>
      <View style={styles.filterContainer}>
        <Text style={styles.sectionTitle}>Application Logs</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
          <Ionicons name="trash" size={16} color={colors.notification} />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.logFilters}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Level:</Text>
          {['all', 'error', 'warn', 'info', 'debug'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.filterChip,
                logLevel === level && styles.activeFilterChip,
              ]}
              onPress={() => setLogLevel(level)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  logLevel === level && styles.activeFilterChipText,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.categoryFilter}
          placeholder="Filter by category..."
          value={logCategory}
          onChangeText={setLogCategory}
          placeholderTextColor={colors.textSecondary}
        />
      </View>
      <ScrollView style={styles.logsContainer}>
        {getFilteredLogs().map((log) => (
          <View
            key={log.id}
            style={[
              styles.logEntry,
              styles[
                `log${
                  log.level.charAt(0).toUpperCase() + log.level.slice(1)
                }` as any
              ],
            }}
          >
            <View style={styles.logHeader}>
              <Text style={styles.logLevel}>{log.level.toUpperCase()}</Text>
              <Text style={styles.logCategory}>[{log.category}]</Text>
              <Text style={styles.logTime}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={styles.logMessage}>{log.message}</Text>
            {log.data && (
              <Text style={styles.logData}>
                {JSON.stringify(log.data, null, 2)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderDatabase = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Database Operations</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setShowQueryModal(true)}
      >
        <Ionicons name="code" size={20} color="#fff" />
        <Text style={styles.actionButtonText}>Execute Query</Text>
      </TouchableOpacity>
      {databaseStats && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Recent Users ({databaseStats.recentUsers.length})
          </Text>
          {databaseStats.recentUsers.slice(0, 5).map((user) => (
            <Text key={user.id} style={styles.infoText}>
              {user.displayName} ({user.userType}) - {user.email}
            </Text>
          ))}
        </View>
      )}
      {databaseStats && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Recent Businesses ({databaseStats.recentBusinesses.length})
          </Text>
          {databaseStats.recentBusinesses.slice(0, 5).map((business) => (
            <Text key={business.id} style={styles.infoText}>
              {business.name} - {business.category}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderPerformance = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Performance Monitoring</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={runPerformanceTest}
      >
        <Ionicons name="speedometer" size={20} color="#fff" />
        <Text style={styles.actionButtonText}>Run Performance Test</Text>
      </TouchableOpacity>
      {performanceResults && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Latest Performance Results</Text>
          <Text style={styles.infoText}>
            Database Read: {performanceResults.dbReadTime.toFixed(2)}ms
          </Text>
          <Text style={styles.infoText}>
            Database Write: {performanceResults.dbWriteTime.toFixed(2)}ms
          </Text>
          <Text style={styles.infoText}>
            Auth Check: {performanceResults.authTime.toFixed(2)}ms
          </Text>
          <Text style={styles.infoText}>
            Tested: {new Date(performanceResults.timestamp).toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );

  const renderTools = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Debug Tools</Text>
      <TouchableOpacity style={styles.actionButton} onPress={exportDebugData}>
        <Ionicons name="download" size={20} color="#fff" />
        <Text style={styles.actionButtonText}>Export Debug Data</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.warningButton]}
        onPress={importSampleData}
      >
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.actionButtonText}>Import Sample Data</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.actionButtonText}>Refresh All Data</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color="#ff4444" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            Only administrators can access the debug dashboard.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onBack={() => navigation.goBack()} onRefresh={onRefresh} />
      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'logs' && renderLogs()}
        {activeTab === 'database' && renderDatabase()}
        {activeTab === 'performance' && renderPerformance()}
        {activeTab === 'tools' && renderTools()}
      </ScrollView>
      <Modal
        visible={showQueryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Execute Database Query</Text>
            <TouchableOpacity onPress={() => setShowQueryModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.queryInput}
            value={queryText}
            onChangeText={setQueryText}
            placeholder="Enter your query..."
            multiline
            numberOfLines={4}
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity
            style={styles.executeButton}
            onPress={executeQuery}
          >
            <Text style={styles.executeButtonText}>Execute Query</Text>
          </TouchableOpacity>
          {queryResults && (
            <ScrollView style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Results:</Text>
              <Text style={styles.resultsText}>
                {JSON.stringify(queryResults, null, 2)}
              </Text>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const localStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backIcon: {
      padding: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    refreshIcon: {
      padding: 8,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      paddingHorizontal: 8,
    },
    tabButton: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      padding: 12,
      marginHorizontal: 4,
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    activeTabText: {
      color: '#fff',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginTop: 8,
      marginBottom: 4,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    warningButton: {
      backgroundColor: '#ff9500',
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
    },
    clearButtonText: {
      color: '#ff4444',
      marginLeft: 4,
      fontSize: 14,
    },
    logFilters: {
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginRight: 8,
      minWidth: 50,
      color: colors.text,
    },
    filterChip: {
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginHorizontal: 4,
    },
    activeFilterChip: {
      backgroundColor: colors.primary,
    },
    filterChipText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    activeFilterChipText: {
      color: '#fff',
    },
    categoryFilter: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 8,
      fontSize: 14,
      color: colors.text,
    },
    logsContainer: {
      maxHeight: 400,
      backgroundColor: colors.card,
      borderRadius: 8,
    },
    logEntry: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    logError: {
      backgroundColor: isDarkMode ? '#5a2d2d' : '#fff5f5',
      borderLeftWidth: 4,
      borderLeftColor: '#ff4444',
    },
    logWarn: {
      backgroundColor: isDarkMode ? '#5a4d2d' : '#fffbf0',
      borderLeftWidth: 4,
      borderLeftColor: '#ff9500',
    },
    logInfo: {
      backgroundColor: isDarkMode ? '#2d4a5a' : '#f0f8ff',
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    logDebug: {
      backgroundColor: isDarkMode ? '#3d3d3d' : '#f8f8f8',
      borderLeftWidth: 4,
      borderLeftColor: '#666',
    },
    logHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    logLevel: {
      fontSize: 10,
      fontWeight: 'bold',
      marginRight: 8,
      minWidth: 40,
      color: colors.text,
    },
    logCategory: {
      fontSize: 12,
      color: colors.textSecondary,
      marginRight: 8,
    },
    logTime: {
      fontSize: 10,
      color: colors.textSecondary,
      marginLeft: 'auto',
    },
    logMessage: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 4,
    },
    logData: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'monospace',
      backgroundColor: colors.background,
      padding: 8,
      borderRadius: 4,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    queryInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      fontFamily: 'monospace',
      marginBottom: 16,
      textAlignVertical: 'top',
      color: colors.text,
    },
    executeButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    executeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    resultsContainer: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
    },
    resultsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.text,
    },
    resultsText: {
      fontSize: 12,
      fontFamily: 'monospace',
      color: colors.text,
    },
    accessDenied: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      backgroundColor: colors.background,
    },
    accessDeniedTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ff4444',
      marginTop: 16,
      marginBottom: 8,
    },
    accessDeniedText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    backButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    backButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default DebugDashboard;
