// Connection Status Manager for Skyway Suites
// Monitors internet connectivity and Supabase connection

import { getSupabaseClient, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from './supabase';

let isOnlineGlobal = navigator.onLine;
let isSupabaseConnected = true; // Start as true, will be updated by health checks
let connectionCheckInterval: NodeJS.Timeout | null = null;

// Initialize with default hard-coded credentials
let supabaseUrl: string | null = DEFAULT_SUPABASE_URL;
let supabaseKey: string | null = DEFAULT_SUPABASE_ANON_KEY;

/**
 * Initialize connection monitoring with Supabase credentials
 * This must be called before starting monitoring
 */
export function initializeConnectionMonitoring(url: string, key: string) {
  supabaseUrl = url;
  supabaseKey = key;
}

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
    // Can't check if credentials aren't set
    if (!supabaseUrl || !supabaseKey) {
      return false;
    }
    
    const supabase = getSupabaseClient(supabaseUrl, supabaseKey);
    if (!supabase) {
      return false;
    }
    
    // Try to query Supabase - simple health check
    const { error } = await supabase
      .from('skyway_settings')
      .select('setting_id')
      .limit(1);
    
    return !error;
  } catch (error) {
    // Silently handle - connection checks shouldn't spam console
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
  // Allow operations if browser reports online
  // Supabase operations will handle their own connection errors
  return isOnlineGlobal;
}

// Alias for checkConnection (used in other files)
export function checkConnection(): boolean {
  // Allow operations if browser reports online
  // Supabase operations will handle their own connection errors
  return isOnlineGlobal;
}

// Get Supabase client (for external use)
export function getConnectionSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return getSupabaseClient(supabaseUrl, supabaseKey);
}