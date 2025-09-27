import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ReportCard from '../../components/reports/ReportCard';
import OptimizedFlatList from '../../components/common/OptimizedFlatList';
import { useMyReports } from '../../hooks/useReports';

const MyReportsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { reports, loading, error, refreshMyReports } = useMyReports();

  useFocusEffect(
    useCallback(() => {
      refreshMyReports();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMyReports();
    setRefreshing(false);
  };

  const handleReportPress = (report) => {
    navigation.navigate('ReportDetail', { reportId: report.id });
  };

  const navigateToCreateReport = () => {
    navigation.navigate('CreateReport');
  };

  const renderReport = useCallback(({ item }) => (
    <ReportCard
      report={item}
      onPress={handleReportPress}
      showUpvote={false}
    />
  ), [handleReportPress]);

  const keyExtractor = useCallback((item) => item.id, []);

  const emptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Reports Yet</Text>
      <Text style={styles.emptySubtitle}>
        You haven't created any reports yet. Start by reporting an issue in your community.
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={navigateToCreateReport}
      >
        <Text style={styles.createButtonText}>Create Your First Report</Text>
      </TouchableOpacity>
    </View>
  ), [navigateToCreateReport]);

  const statsComponent = useMemo(() => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{reports.length}</Text>
        <Text style={styles.statLabel}>Total Reports</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {reports.filter(r => r.status === 'resolved').length}
        </Text>
        <Text style={styles.statLabel}>Resolved</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {reports.filter(r => r.status === 'pending').length}
        </Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>
    </View>
  ), [reports]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>My Reports</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={navigateToCreateReport}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {statsComponent}

      <OptimizedFlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={keyExtractor}
        loading={loading && !refreshing}
        error={error && !refreshing ? error : null}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyComponent={emptyComponent}
        estimatedItemSize={180}
        style={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyReportsScreen;