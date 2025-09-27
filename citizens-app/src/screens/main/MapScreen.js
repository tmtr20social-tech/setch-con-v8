import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useLocation } from '../../hooks/useLocation';
import municipalityService from '../../services/municipalityService';
import reportService from '../../services/reportService';
import { REPORT_CATEGORIES } from '../../config/api';
import cacheService from '../../services/cacheService';

const MapScreen = ({ navigation }) => {
  const [municipalities, setMunicipalities] = useState([]);
  const [reports, setReports] = useState([]);
  const [visibleReports, setVisibleReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  const { getCurrentLocation } = useLocation();
  const mapRef = useRef(null);
  const clusteredMarkers = useRef(new Map());

  useEffect(() => {
    loadMapData();
    
    // Cleanup on unmount
    return () => {
      reportService.cancelAllRequests();
    };
  }, []);

  const loadMapData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first
      const cachedMunicipalities = await cacheService.get('municipalities_geojson');
      const cachedReports = await cacheService.get('map_reports');

      if (cachedMunicipalities && cachedReports) {
        setMunicipalities(cachedMunicipalities);
        setReports(cachedReports);
        setLoading(false);
      }

      // Load municipalities with GeoJSON data
      const municipalitiesData = await municipalityService.getMunicipalities(true);
      setMunicipalities(municipalitiesData);
      await cacheService.set('municipalities_geojson', municipalitiesData, 24 * 60 * 60 * 1000); // 24 hours

      // Load reports
      const reportsData = await reportService.getReports({ limit: 100 });
      const reportsArray = reportsData.reports;
      setReports(reportsArray);
      await cacheService.set('map_reports', reportsArray, 10 * 60 * 1000); // 10 minutes

      // Try to get user's current location
      try {
        const location = await getCurrentLocation();
        setMapRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      } catch (locationError) {
        console.log('Could not get current location:', locationError.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getCurrentLocation]);

  const handleReportPress = useCallback((report) => {
    navigation.navigate('ReportDetail', { reportId: report.id });
  }, [navigation]);

  const getMarkerColor = useCallback((category) => {
    switch (category) {
      case 'water': return '#2196F3';
      case 'electricity': return '#FFC107';
      case 'roads': return '#FF5722';
      case 'waste': return '#4CAF50';
      case 'safety': return '#F44336';
      default: return '#9E9E9E';
    }
  }, []);

  // Cluster nearby markers for better performance
  const clusterReports = useCallback((reports, region) => {
    const clustered = new Map();
    const clusterRadius = 0.01; // Adjust based on zoom level
    
    reports.forEach(report => {
      // Only include reports in visible region
      if (
        report.lat >= region.latitude - region.latitudeDelta / 2 &&
        report.lat <= region.latitude + region.latitudeDelta / 2 &&
        report.lng >= region.longitude - region.longitudeDelta / 2 &&
        report.lng <= region.longitude + region.longitudeDelta / 2
      ) {
        const clusterKey = `${Math.round(report.lat / clusterRadius)}_${Math.round(report.lng / clusterRadius)}`;
        
        if (!clustered.has(clusterKey)) {
          clustered.set(clusterKey, []);
        }
        clustered.get(clusterKey).push(report);
      }
    });
    
    return Array.from(clustered.values());
  }, []);

  // Update visible reports when region changes
  const handleRegionChangeComplete = useCallback((region) => {
    setMapRegion(region);
    
    // Cluster reports for current region
    const clusters = clusterReports(reports, region);
    const visibleReportsArray = clusters.map(cluster => {
      if (cluster.length === 1) {
        return cluster[0];
      } else {
        // Create cluster marker
        const avgLat = cluster.reduce((sum, r) => sum + r.lat, 0) / cluster.length;
        const avgLng = cluster.reduce((sum, r) => sum + r.lng, 0) / cluster.length;
        return {
          id: `cluster_${cluster.map(r => r.id).join('_')}`,
          lat: avgLat,
          lng: avgLng,
          title: `${cluster.length} Reports`,
          description: `Multiple reports in this area`,
          category: 'cluster',
          isCluster: true,
          reports: cluster,
        };
      }
    });
    
    setVisibleReports(visibleReportsArray);
  }, [reports, clusterReports]);

  const renderMunicipalityPolygons = useMemo(() => {
    return municipalities.map((municipality) => {
      if (!municipality.bounds || !municipality.bounds.coordinates) {
        return null;
      }

      try {
        const coordinates = municipality.bounds.coordinates[0].map(coord => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        return (
          <Polygon
            key={municipality.id}
            coordinates={coordinates}
            strokeColor="#2196F3"
            strokeWidth={2}
            fillColor="rgba(33, 150, 243, 0.1)"
          />
        );
      } catch (error) {
        console.log('Error rendering polygon for municipality:', municipality.name);
        return null;
      }
    });
  }, [municipalities]);

  const renderReportMarkers = useMemo(() => {
    return visibleReports.map((report) => (
      <Marker
        key={report.id}
        coordinate={{
          latitude: report.lat,
          longitude: report.lng,
        }}
        title={report.title}
        description={report.description}
        pinColor={getMarkerColor(report.category)}
        onCalloutPress={() => {
          if (report.isCluster) {
            // Zoom into cluster
            mapRef.current?.animateToRegion({
              latitude: report.lat,
              longitude: report.lng,
              latitudeDelta: mapRegion.latitudeDelta / 3,
              longitudeDelta: mapRegion.longitudeDelta / 3,
            });
          } else {
            handleReportPress(report);
          }
        }}
      />
    ));
  }, [visibleReports, getMarkerColor, handleReportPress, mapRegion]);

  if (loading) {
    return <LoadingSpinner message="Loading map data..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadMapData}
        retryText="Retry"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Map</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadMapData}
        >
          <Ionicons name="refresh" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={true}
        loadingEnabled={true}
        maxZoomLevel={18}
        minZoomLevel={8}
      >
        {renderMunicipalityPolygons()}
        {renderReportMarkers()}
      </MapView>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Report Categories</Text>
        <View style={styles.legendItems}>
          {REPORT_CATEGORIES.slice(0, 3).map((category) => (
            <View key={category.value} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { backgroundColor: getMarkerColor(category.value) }
                ]} 
              />
              <Text style={styles.legendText}>{category.label}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.viewAllText}>View All Reports</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  viewAllButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MapScreen;