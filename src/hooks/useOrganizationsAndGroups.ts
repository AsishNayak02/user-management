import { useState, useEffect } from 'react';
import { getAllOrganizations, getAllGroups } from '@/api/userListing';
import { globalCache } from '@/lib/cache';

export const useOrganizationsAndGroups = () => {
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current cache data
    const cacheData = globalCache.getData();
    setOrganizations(cacheData.organizations);
    setGroups(cacheData.groups);
    setLoading(cacheData.loading);

    // Subscribe to cache updates
    const unsubscribe = globalCache.subscribe(() => {
      const updatedData = globalCache.getData();
      setOrganizations(updatedData.organizations);
      setGroups(updatedData.groups);
      setLoading(updatedData.loading);
    });

    // If data is not loaded and not currently loading, fetch it
    if (!cacheData.loaded && !cacheData.loading) {
      globalCache.setData({ loading: true });
      
      const fetchData = async () => {
        try {
          const [orgsResponse, groupsResponse] = await Promise.all([
            getAllOrganizations(),
            getAllGroups()
          ]);
          
          // Store as simple string arrays
          const orgs = orgsResponse.data.map((org: any) => org.displayName || org.name);
          const grps = groupsResponse.data.map((group: any) => group.name);
          
          globalCache.setData({
            organizations: orgs,
            groups: grps,
            loaded: true,
            loading: false
          });
        } catch (error) {
          console.error("❌ Error fetching organizations/groups:", error);
          globalCache.setData({
            loaded: false,
            loading: false
          });
        }
      };

      fetchData();
    } else if (cacheData.loaded) {
    } else if (cacheData.loading) {
    }

    return unsubscribe;
  }, []);

  return { organizations, groups, loading };
};
