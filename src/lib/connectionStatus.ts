// Connection Status Manager for Skyway Suites
// Monitors internet connectivity and Supabase connection

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

let isOnlineGlobal = navigator.onLine;
let isSupabaseConnected = false;
let connectionCheckInterval: NodeJS.Timeout | null = null;

// Create Supabase client
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Connection status listeners
const listeners = new Set<(status: ConnectionStatus) => void>();

export interface ConnectionStatus {
  isOnline: boolean;
  isSupabaseConnected: boolean;
  lastChecked: Date;
  error?: string;
}

// Subscribe to connection status changes
export function subscribeToConnectionStatus(
  callback: (status: ConnectionStatus) => void
): () => void {
  listeners.add(callback);
  
  // Immediately notify with current status
  callback(getConnectionStatus());
  
  // Return unsubscribe function
  return () => {
    listeners.delete(callback);
  };
}

// Get current connection status
export function getConnectionStatus(): ConnectionStatus {
  return {
    isOnline: isOnlineGlobal,
    isSupabaseConnected,
    lastChecked: new Date()
  };
}

// Notify all listeners
function notifyListeners(status: ConnectionStatus) {
  listeners.forEach(listener => listener(status));
}

// Check Supabase connection
async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Try to query Supabase - simple health check
    const { error } = await supabase
      .from('skyway_settings')
      .select('setting_id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

// Update connection status
async function updateConnectionStatus() {
  const wasOnline = isOnlineGlobal;
  const wasSupabaseConnected = isSupabaseConnected;
  
  isOnlineGlobal = navigator.onLine;
  
  if (isOnlineGlobal) {
    isSupabaseConnected = await checkSupabaseConnection();
  } else {
    isSupabaseConnected = false;
  }
  
  // Only notify if status changed
  if (wasOnline !== isOnlineGlobal || wasSupabaseConnected !== isSupabaseConnected) {
    notifyListeners(getConnectionStatus());
  }
}

// Start monitoring connection
export function startConnectionMonitoring() {
  // Stop existing monitoring if any
  stopConnectionMonitoring();
  
  // Add event listeners for online/offline
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
  
  // Check Supabase connection every 30 seconds
  connectionCheckInterval = setInterval(updateConnectionStatus, 30000);
  
  // Initial check
  updateConnectionStatus();
}

// Stop monitoring connection
export function stopConnectionMonitoring() {
  window.removeEventListener('online', updateConnectionStatus);
  window.removeEventListener('offline', updateConnectionStatus);
  
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
    connectionCheckInterval = null;
  }
}

// Check if operations should be allowed
export function canPerformOperations(): boolean {
  return isOnlineGlobal && isSupabaseConnected;
}

// Get Supabase client
export function getSupabaseClient() {
  return supabase;
}
