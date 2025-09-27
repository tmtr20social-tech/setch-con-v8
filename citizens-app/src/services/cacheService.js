import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_DURATION } from '../config/api';

class CacheService {
  constructor() {
    this.memoryCache = new Map();
  }

  // Generate cache key
  generateKey(prefix, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}${paramString ? `_${paramString}` : ''}`;
  }

  // Memory cache operations
  setMemoryCache(key, data, duration = CACHE_DURATION.SHORT) {
    this.memoryCache.set(key, {
      data,
      expiry: Date.now() + duration,
    });
  }

  getMemoryCache(key) {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Persistent cache operations
  async setPersistentCache(key, data, duration = CACHE_DURATION.MEDIUM) {
    try {
      const cacheItem = {
        data,
        expiry: Date.now() + duration,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to set persistent cache:', error);
    }
  }

  async getPersistentCache(key) {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      if (Date.now() > cacheItem.expiry) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to get persistent cache:', error);
      return null;
    }
  }

  // Combined cache strategy (memory first, then persistent)
  async get(key) {
    // Try memory cache first
    const memoryData = this.getMemoryCache(key);
    if (memoryData) return memoryData;

    // Try persistent cache
    const persistentData = await this.getPersistentCache(key);
    if (persistentData) {
      // Restore to memory cache
      this.setMemoryCache(key, persistentData);
      return persistentData;
    }

    return null;
  }

  async set(key, data, duration = CACHE_DURATION.MEDIUM) {
    // Set in memory cache
    this.setMemoryCache(key, data, duration);
    
    // Set in persistent cache for longer duration
    await this.setPersistentCache(key, data, duration);
  }

  // Clear cache
  async clear(pattern) {
    // Clear memory cache
    if (pattern) {
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) {
          this.memoryCache.delete(key);
        }
      }
    } else {
      this.memoryCache.clear();
    }

    // Clear persistent cache
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith('cache_') && (!pattern || key.includes(pattern))
      );
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Failed to clear persistent cache:', error);
    }
  }

  // Cleanup expired cache entries
  async cleanup() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const cacheItem = JSON.parse(cached);
          if (Date.now() > cacheItem.expiry) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }
}

export default new CacheService();