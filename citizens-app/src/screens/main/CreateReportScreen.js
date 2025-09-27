import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Input from '../../components/common/Input';
import AddressInput from '../../components/common/AddressInput';
import Button from '../../components/common/Button';
import CategoryPicker from '../../components/reports/CategoryPicker';
import DuplicateReportModal from '../../components/reports/DuplicateReportModal';
import { useLocation } from '../../hooks/useLocation';
import reportService from '../../services/reportService';
import { findDuplicateReports } from '../../utils/distanceUtils';

const CreateReportScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    photo_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [duplicateReports, setDuplicateReports] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const { getCurrentLocation, reverseGeocode } = useLocation();

  useEffect(() => {
    getLocationData();
    
    // Cleanup on unmount
    return () => {
      reportService.cancelAllRequests();
    };
  }, []);

  const getLocationData = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      const address = await reverseGeocode(location.latitude, location.longitude);
      
      setLocationData({
        lat: location.latitude,
        lng: location.longitude,
        address,
      });
    } catch (error) {
      Alert.alert(
        'Location Error',
        'Unable to get your location. Please ensure location permissions are enabled.',
        [
          { text: 'Cancel', onPress: () => navigation.goBack() },
          { text: 'Retry', onPress: getLocationData },
        ]
      );
    }
  }, [getCurrentLocation, reverseGeocode, navigation]);

  const handleAddressChange = useCallback((address) => {
    setLocationData(prev => prev ? { ...prev, address } : { address });
  }, []);

  const handleLocationChange = useCallback((location) => {
    setLocationData(prev => ({
      ...prev,
      lat: location.latitude,
      lng: location.longitude,
    }));
  }, []);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to add photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateFormData('photo_url', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  }, [updateFormData]);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateFormData('photo_url', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  }, [updateFormData]);

  const showImagePicker = useCallback(() => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [takePhoto, pickImage]);

  const removePhoto = useCallback(() => {
    updateFormData('photo_url', '');
  }, [updateFormData]);

  const validateForm = useCallback(() => {
    const { title, description, category } = formData;

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }

    if (title.trim().length < 5) {
      Alert.alert('Error', 'Title must be at least 5 characters long');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }

    if (description.trim().length < 10) {
      Alert.alert('Error', 'Description must be at least 10 characters long');
      return false;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }

    if (!locationData) {
      Alert.alert('Error', 'Location data is required');
      return false;
    }

    return true;
  }, [formData, locationData]);

  const checkForDuplicates = useCallback(async () => {
    if (!locationData || !formData.category) {
      return false; // No duplicates if no location or category
    }

    try {
      setCheckingDuplicates(true);
      
      // Fetch limited nearby reports for duplicate detection
      const nearbyReports = await reportService.getNearbyReports(
        locationData.lat,
        locationData.lng,
        formData.category,
        5 // Limit to 5 reports for performance
      );

      const duplicates = findDuplicateReports(
        nearbyReports,
        {
          lat: locationData.lat,
          lng: locationData.lng,
          category: formData.category,
        },
        100 // 100 meter radius
      );

      if (duplicates.length > 0) {
        setDuplicateReports(duplicates);
        setShowDuplicateModal(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false; // Continue with submission if check fails
    } finally {
      setCheckingDuplicates(false);
    }
  }, [locationData, formData.category]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    // Check for duplicate reports first
    const hasDuplicates = await checkForDuplicates();
    if (hasDuplicates) {
      return; // Show duplicate modal, don't submit yet
    }

    await submitReport();
  }, [validateForm, checkForDuplicates]);

  const submitReport = useCallback(async () => {
    try {
      setLoading(true);

      const reportData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        lat: locationData.lat,
        lng: locationData.lng,
        address: locationData.address,
        photo_url: formData.photo_url || undefined,
      };

      await reportService.createReport(reportData);

      Alert.alert(
        'Success',
        'Your report has been submitted successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [formData, locationData, navigation]);

  const handleUpvoteExisting = useCallback(async (reportId) => {
    try {
      await reportService.upvoteReport(reportId);
      setShowDuplicateModal(false);
      navigation.goBack();
    } catch (error) {
      throw error;
    }
  }, [navigation]);

  const handleSubmitNew = useCallback(() => {
    setShowDuplicateModal(false);
    submitReport();
  }, [submitReport]);

  const photoComponent = useMemo(() => {
    if (formData.photo_url) {
      return (
        <View style={styles.photoPreview}>
          <Image source={{ uri: formData.photo_url }} style={styles.photo} />
          <TouchableOpacity style={styles.removePhotoButton} onPress={removePhoto}>
            <Ionicons name="close-circle" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.addPhotoButton} onPress={showImagePicker}>
        <Ionicons name="camera-outline" size={32} color="#666" />
        <Text style={styles.addPhotoText}>Add Photo</Text>
      </TouchableOpacity>
    );
  }, [formData.photo_url, removePhoto, showImagePicker]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Report</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Input
          label="Title"
          value={formData.title}
          onChangeText={(value) => updateFormData('title', value)}
          placeholder="Brief description of the issue"
        />

        <Input
          label="Description"
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          placeholder="Provide detailed information about the issue"
          multiline
          numberOfLines={4}
        />

        <CategoryPicker
          selectedCategory={formData.category}
          onSelectCategory={(category) => updateFormData('category', category)}
        />

        <AddressInput
          label="Location"
          value={locationData?.address || ''}
          onAddressChange={handleAddressChange}
          onLocationChange={handleLocationChange}
          placeholder="Enter address or use current location"
        />

        <View style={styles.photoContainer}>
          <Text style={styles.label}>Photo (Optional)</Text>
          {photoComponent}
        </View>

        <Button
          title="Submit Report"
          onPress={handleSubmit}
          loading={loading || checkingDuplicates}
          disabled={!locationData}
          style={styles.submitButton}
        />
      </ScrollView>

      <DuplicateReportModal
        visible={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        duplicateReports={duplicateReports}
        onUpvoteExisting={handleUpvoteExisting}
        onSubmitNew={handleSubmitNew}
        loading={loading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  photoContainer: {
    marginBottom: 24,
  },
  addPhotoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  photoPreview: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default CreateReportScreen;