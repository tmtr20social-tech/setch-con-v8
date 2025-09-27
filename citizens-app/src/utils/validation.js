// Password validation utilities
export const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isValid = Object.values(requirements).every(req => req);
  
  return {
    isValid,
    requirements,
  };
};

export const getPasswordStrength = (password) => {
  const { requirements } = validatePassword(password);
  const score = Object.values(requirements).filter(Boolean).length;
  
  if (score === 0) return { strength: 'none', color: '#ccc', text: '' };
  if (score === 1) return { strength: 'weak', color: '#F44336', text: 'Weak' };
  if (score === 2) return { strength: 'fair', color: '#FF9800', text: 'Fair' };
  if (score === 3) return { strength: 'good', color: '#2196F3', text: 'Good' };
  if (score === 4) return { strength: 'strong', color: '#4CAF50', text: 'Strong' };
  
  return { strength: 'none', color: '#ccc', text: '' };
};

// Distance calculation utilities
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

export const findNearbyReports = (reports, targetLat, targetLng, radiusMeters = 100) => {
  return reports
    .map(report => ({
      ...report,
      distance: calculateDistance(targetLat, targetLng, report.lat, report.lng)
    }))
    .filter(report => report.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);
};

export const findDuplicateReports = (reports, newReport, radiusMeters = 100) => {
  return findNearbyReports(reports, newReport.lat, newReport.lng, radiusMeters)
    .filter(report => report.category === newReport.category)
    .slice(0, 3); // Return top 3 closest matches
};