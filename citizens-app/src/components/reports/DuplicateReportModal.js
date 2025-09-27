import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { REPORT_CATEGORIES } from '../../config/api';
import Button from '../common/Button';

const DuplicateReportModal = ({
  visible,
  onClose,
  duplicateReports,
  onUpvoteExisting,
  onSubmitNew,
  loading,
}) => {
  const handleUpvote = async (reportId) => {
    try {
      await onUpvoteExisting(reportId);
      Alert.alert(
        'Success',
        'You have upvoted the existing report. Thank you for helping prioritize community issues!',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderDuplicateReport = ({ item }) => {
    const category = REPORT_CATEGORIES.find(cat => cat.value === item.category);
    const distance = item.distance ? `${Math.round(item.distance)}m away` : 'Nearby';

    return (
      <View style={styles.reportItem}>
        <View style={styles.reportHeader}>
          <View style={styles.categoryContainer}>
            <Ionicons 
              name={category?.icon || 'help-circle'} 
              size={16} 
              color="#2196F3" 
            />
            <Text style={styles.categoryText}>{category?.label || 'Other'}</Text>
          </View>
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
        
        <Text style={styles.reportTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={styles.reportAddress} numberOfLines={1}>
          📍 {item.address}
        </Text>
        
        <View style={styles.reportFooter}>
          <Text style={styles.upvoteCount}>
            ❤️ {item.upvote_count || 0} upvotes
          </Text>
          <TouchableOpacity
            style={styles.upvoteButton}
            onPress={() => handleUpvote(item.id)}
            disabled={loading}
          >
            <Ionicons name="heart-outline" size={16} color="#F44336" />
            <Text style={styles.upvoteButtonText}>Upvote This</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Similar Issue Found</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            A similar issue has already been reported nearby. Is this the same issue?
          </Text>

          <View style={styles.reportsContainer}>
            <FlatList
              data={duplicateReports}
              renderItem={renderDuplicateReport}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.reportsList}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Submit New Report"
              onPress={onSubmitNew}
              variant="outline"
              style={styles.submitButton}
              loading={loading}
            />
            <Text style={styles.orText}>or upvote an existing report above</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  reportsContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  reportsList: {
    flexGrow: 0,
  },
  reportItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 12,
    color: '#999',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  reportAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upvoteCount: {
    fontSize: 14,
    color: '#666',
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F44336',
    backgroundColor: '#fff',
  },
  upvoteButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    marginBottom: 12,
  },
  orText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default DuplicateReportModal;