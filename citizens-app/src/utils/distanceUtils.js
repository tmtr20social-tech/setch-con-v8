import { InteractionManager } from 'react-native';

// Optimized distance calculation using Haversine formula
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
};

// Optimized function to find nearby reports with limited results
export const findNearbyReports = (reports, targetLat, targetLng, radiusMeters = 100) => {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      try {
        const nearbyReports = reports
          .map(report => {
            const distance = calculateDistance(targetLat, targetLng, report.lat, report.lng);
            return { ...report, distance };
          })
          .filter(report => report.distance <= radiusMeters)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3); // Limit to 3 closest reports
        
        resolve(nearbyReports);
      } catch (error) {
        console.error('Error finding nearby reports:', error);
        resolve([]);
      }
    });
  });
};

// Optimized duplicate detection with category matching
export const findDuplicateReports = async (reports, newReport, radiusMeters = 100) => {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(async () => {
      try {
        const nearbyReports = await findNearbyReports(
          reports, 
          newReport.lat, 
          newReport.lng, 
          radiusMeters
        );
        
        const duplicates = nearbyReports
          .filter(report => report.category === newReport.category)
          .slice(0, 3); // Limit to top 3 matches
        
        resolve(duplicates);
      } catch (error) {
        console.error('Error finding duplicate reports:', error);
        resolve([]);
      }
    });
  });
};

// Batch distance calculation for multiple points
export const calculateDistanceBatch = (points, targetLat, targetLng) => {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      try {
        const results = points.map(point => ({
          ...point,
          distance: calculateDistance(targetLat, targetLng, point.lat, point.lng)
        }));
        resolve(results);
      } catch (error) {
        console.error('Error calculating batch distances:', error);
        resolve(points.map(point => ({ ...point, distance: 0 })));
      }
    });
  });
};