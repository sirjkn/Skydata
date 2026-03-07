/**
 * Cache Status Component
 * Shows cache information and provides controls to clear cache
 * For admin/development use
 */

import { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Database, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { getCacheStats, clearAllCache, refreshCache } from '../../lib/cachedSupabaseData';
import { Badge } from './ui/badge';

export function CacheStatus() {
  const [stats, setStats] = useState({ totalItems: 0, totalSize: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadStats = () => {
    const cacheStats = getCacheStats();
    setStats(cacheStats);
  };

  useEffect(() => {
    loadStats();
    // Refresh stats every 5 seconds
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all cache? This will reload data from the database on next access.')) {
      clearAllCache();
      loadStats();
      setLastRefresh(new Date());
      alert('✅ All cache cleared successfully');
    }
  };

  const handleRefresh = async (type: 'properties' | 'categories' | 'settings' | 'all') => {
    setIsRefreshing(true);
    try {
      await refreshCache(type);
      loadStats();
      setLastRefresh(new Date());
      alert(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} cache refreshed successfully`);
    } catch (error) {
      console.error('Failed to refresh cache:', error);
      alert('❌ Failed to refresh cache');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-blue-100 rounded-full p-2">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-blue-900">Cache Status</h4>
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                  Smart Caching Enabled
                </Badge>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <div className="flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  <span>
                    <strong>{stats.totalItems}</strong> cached items · <strong>{formatSize(stats.totalSize)}</strong> total size
                  </span>
                </div>
                {lastRefresh && (
                  <div className="text-xs text-blue-600">
                    Last refresh: {lastRefresh.toLocaleTimeString()}
                  </div>
                )}
                <div className="text-xs text-blue-600 mt-2">
                  📦 Static content (images, categories, settings) cached for faster loading<br />
                  🌐 Real-time data (bookings, payments, customers) always from database
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRefresh('all')}
              disabled={isRefreshing}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearAll}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear Cache
            </Button>
          </div>
        </div>

        {/* Quick Refresh Buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-blue-200">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRefresh('properties')}
            disabled={isRefreshing}
            className="text-xs text-blue-600 hover:bg-blue-100"
          >
            Refresh Properties
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRefresh('categories')}
            disabled={isRefreshing}
            className="text-xs text-blue-600 hover:bg-blue-100"
          >
            Refresh Categories
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRefresh('settings')}
            disabled={isRefreshing}
            className="text-xs text-blue-600 hover:bg-blue-100"
          >
            Refresh Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
