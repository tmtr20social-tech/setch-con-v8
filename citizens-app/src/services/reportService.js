import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { supabase } from '../config/supabase';
import cacheService from './cacheService';
import { InteractionManager } from 'react-native';

class ReportService {
  constructor() {
    this.abortControllers = new Map();
  }

  // Create abort controller for request cancellation
  createAbortController(key) {
    // Cancel previous request if exists
    if (this.abortControllers.has(key)) {
      this.abortControllers.get(key).abort();
    }
    
    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller;
  }

  // Clean up abort controller
  cleanupAbortController(key) {
    this.abortControllers.delete(key);
  }

  async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    };
  }

  async createReport(reportData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REPORTS}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reportData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create report');
      }

      // Clear reports cache after creating new report
      await cacheService.clear('reports');
      return data.data.report;
    } catch (error) {
      throw error;
    }
  }

  async getReports(filters = {}) {
    try {
      const cacheKey = cacheService.generateKey('reports', filters);
      
      // Try cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const controller = this.createAbortController('getReports');
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}${API_ENDPOINTS.REPORTS}${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reports');
      }

      const result = {
        reports: data.data.reports,
        total: data.data.total,
        limit: data.data.limit,
        offset: data.data.offset,
      };

      // Cache the result
      await cacheService.set(cacheKey, result);
      this.cleanupAbortController('getReports');
      
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return { reports: [], total: 0, limit: 50, offset: 0 };
      }
      this.cleanupAbortController('getReports');
      throw error;
    }
  }

  async getMyReports(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const cacheKey = cacheService.generateKey('myReports', filters);
      
      // Try cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const controller = this.createAbortController('getMyReports');
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}${API_ENDPOINTS.MY_REPORTS}${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch your reports');
      }

      const result = {
        reports: data.data.reports,
        total: data.data.total,
        limit: data.data.limit,
        offset: data.data.offset,
      };

      // Cache the result
      await cacheService.set(cacheKey, result);
      this.cleanupAbortController('getMyReports');
      
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return { reports: [], total: 0, limit: 50, offset: 0 };
      }
      this.cleanupAbortController('getMyReports');
      throw error;
    }
  }

  async getReportById(reportId) {
    try {
      const headers = await this.getAuthHeaders();
      const cacheKey = cacheService.generateKey('report', { id: reportId });
      
      // Try cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REPORTS}/${reportId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch report');
      }

      const result = data.data.report;
      
      // Cache the result
      await cacheService.set(cacheKey, result);
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Optimized method for duplicate detection with limited results
  async getNearbyReports(lat, lng, category, limit = 5) {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        try {
          const cacheKey = cacheService.generateKey('nearbyReports', { 
            lat: lat.toFixed(4), 
            lng: lng.toFixed(4), 
            category 
          });
          
          // Try cache first
          const cachedData = await cacheService.get(cacheKey);
          if (cachedData) {
            resolve(cachedData);
            return;
          }

          const controller = this.createAbortController('getNearbyReports');
          
          // Fetch limited reports for duplicate detection
          const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REPORTS}?limit=${limit}&category=${category}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });

          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch nearby reports');
          }

          const result = data.data.reports || [];
          
          // Cache the result for short duration
          await cacheService.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes
          this.cleanupAbortController('getNearbyReports');
          
          resolve(result);
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('Nearby reports request was cancelled');
            resolve([]);
            return;
          }
          this.cleanupAbortController('getNearbyReports');
          console.error('Error fetching nearby reports:', error);
          resolve([]);
        }
      });
    });
  }
  async upvoteReport(reportId) {
    try {
      const headers = await this.getAuthHeaders();
      const url = API_ENDPOINTS.REPORT_UPVOTE.replace('{id}', reportId);
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upvote report');
      }

      // Clear related caches
      await cacheService.clear('reports');
      await cacheService.clear('myReports');
      await cacheService.clear(`report_${reportId}`);
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async removeUpvote(reportId) {
    try {
      const headers = await this.getAuthHeaders();
      const url = API_ENDPOINTS.REPORT_UPVOTE.replace('{id}', reportId);
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove upvote');
      }

      // Clear related caches
      await cacheService.clear('reports');
      await cacheService.clear('myReports');
      await cacheService.clear(`report_${reportId}`);
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateReport(reportId, updates) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REPORTS}/${reportId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update report');
      }

      // Clear related caches
      await cacheService.clear('reports');
      await cacheService.clear('myReports');
      await cacheService.clear(`report_${reportId}`);
      return data.data.report;
    } catch (error) {
      throw error;
    }
  }

  async getStatusUpdates(reportId) {
    try {
      const cacheKey = cacheService.generateKey('statusUpdates', { reportId });
      
      // Try cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const url = API_ENDPOINTS.STATUS_UPDATES.replace('{reportId}', reportId);
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch status updates');
      }

      const result = data.data.status_updates;
      
      // Cache the result
      await cacheService.set(cacheKey, result);
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Cancel all pending requests
  cancelAllRequests() {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
  }
}

export default new ReportService();