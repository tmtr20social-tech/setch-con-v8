import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import { useLocation } from '../../hooks/useLocation';
import { debounce } from '../../utils/debounce';

const AddressInput = ({
  label = "Address",
  value,
  onAddressChange,
  onLocationChange,
  placeholder = "Enter address or use current location",
  style,
  ...props
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { getCurrentLocation, reverseGeocode } = useLocation();
  const abortControllerRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      await searchAddresses(query);
    }, 500),
    []
  );

  // Effect for debounced search
  useEffect(() => {
    debouncedSearch(value);
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [value, debouncedSearch]);

  const searchAddresses = useCallback(async (query) => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      setLoading(true);
      
      // Mock implementation - in production, use Google Places API or similar
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      const mockSuggestions = [
        {
          id: '1',
          description: `${query}, Johannesburg, South Africa`,
          lat: -26.2041 + (Math.random() - 0.5) * 0.01,
          lng: 28.0473 + (Math.random() - 0.5) * 0.01,
        },
        {
          id: '2',
          description: `${query}, Cape Town, South Africa`,
          lat: -33.9249 + (Math.random() - 0.5) * 0.01,
          lng: 18.4241 + (Math.random() - 0.5) * 0.01,
        },
        {
          id: '3',
          description: `${query}, Pretoria, South Africa`,
          lat: -25.7479 + (Math.random() - 0.5) * 0.01,
          lng: 28.2293 + (Math.random() - 0.5) * 0.01,
        },
      ];

      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Address search error:', error);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const handleSuggestionSelect = useCallback((suggestion) => {
    onAddressChange(suggestion.description);
    if (onLocationChange) {
      onLocationChange({
        latitude: suggestion.lat,
        longitude: suggestion.lng,
      });
    }
    setShowSuggestions(false);
    setSuggestions([]);
  }, [onAddressChange, onLocationChange]);

  const handleUseCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      const address = await reverseGeocode(location.latitude, location.longitude);
      
      onAddressChange(address);
      if (onLocationChange) {
        onLocationChange(location);
      }
    } catch (error) {
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please ensure location permissions are enabled.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }, [getCurrentLocation, reverseGeocode, onAddressChange, onLocationChange]);

  const renderSuggestion = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <Ionicons name="location-outline" size={16} color="#666" />
      <Text style={styles.suggestionText}>{item.description}</Text>
    </TouchableOpacity>
  ), [handleSuggestionSelect]);

  const keyExtractor = useCallback((item) => item.id, []);

  const locationButton = useMemo(() => (
    <TouchableOpacity
      style={styles.locationButton}
      onPress={handleUseCurrentLocation}
      disabled={loading}
    >
      {loading ? (
        <LoadingSpinner size="small" />
      ) : (
        <>
          <Ionicons name="location" size={16} color="#2196F3" />
          <Text style={styles.locationButtonText}>Use My Location</Text>
        </>
      )}
    </TouchableOpacity>
  ), [loading, handleUseCurrentLocation]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <Input
          label={label}
          value={value}
          onChangeText={onAddressChange}
          placeholder={placeholder}
          onFocus={() => value && value.length >= 3 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          {...props}
        />
        
        {locationButton}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={keyExtractor}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            initialNumToRender={5}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#fff',
  },
  locationButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});

export default AddressInput;