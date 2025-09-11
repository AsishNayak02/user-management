// Global cache for organizations and groups
interface CacheData {
  organizations: string[];
  groups: string[];
  loaded: boolean;
  loading: boolean;
}

class GlobalCache {
  private cache: CacheData = {
    organizations: [],
    groups: [],
    loaded: false,
    loading: false
  };

  private listeners: Set<() => void> = new Set();

  // Subscribe to cache updates
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of cache updates
  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Get current cache data
  getData(): CacheData {
    return { ...this.cache };
  }

  // Set cache data
  setData(data: Partial<CacheData>) {
    this.cache = { ...this.cache, ...data };
    this.notify();
  }

  // Check if data is loaded
  isLoaded(): boolean {
    return this.cache.loaded;
  }

  // Check if currently loading
  isLoading(): boolean {
    return this.cache.loading;
  }

  // Clear cache (useful for testing or logout)
  clear() {
    this.cache = {
      organizations: [],
      groups: [],
      loaded: false,
      loading: false
    };
    this.notify();
  }
}

// Export singleton instance
export const globalCache = new GlobalCache();

// Export convenience functions
export const clearOrganizationsAndGroupsCache = () => {
  globalCache.clear();
};
