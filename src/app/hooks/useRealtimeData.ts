/**
 * useRealtimeData Hook
 * 
 * Provides real-time data operations that automatically sync with Supabase
 * when cloud mode is enabled, or use localStorage when in local mode.
 * 
 * Usage:
 * const { properties, saveProperty, refreshProperties } = useRealtimeData();
 */

import { useState, useEffect, useCallback } from 'react';
import * as realtimeDataManager from '../lib/realtime-data-manager';

export const useRealtimeData = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        freshProperties,
        freshBookings,
        freshPayments,
        freshCustomers,
        freshCategories,
        freshFeatures,
        freshSettings,
        freshLogs
      ] = await Promise.all([
        realtimeDataManager.getFreshProperties(),
        realtimeDataManager.getFreshBookings(),
        realtimeDataManager.getFreshPayments(),
        realtimeDataManager.getFreshCustomers(),
        realtimeDataManager.getFreshCategories(),
        realtimeDataManager.getFreshFeatures(),
        realtimeDataManager.getFreshSettings(),
        realtimeDataManager.getFreshActivityLogs()
      ]);
      
      setProperties(freshProperties);
      setBookings(freshBookings);
      setPayments(freshPayments);
      setCustomers(freshCustomers);
      setCategories(freshCategories);
      setFeatures(freshFeatures);
      setSettings(freshSettings);
      setActivityLogs(freshLogs);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Refresh functions
  const refreshProperties = useCallback(async () => {
    const fresh = await realtimeDataManager.getFreshProperties();
    setProperties(fresh);
  }, []);

  const refreshBookings = useCallback(async () => {
    const fresh = await realtimeDataManager.getFreshBookings();
    setBookings(fresh);
  }, []);

  const refreshPayments = useCallback(async () => {
    const fresh = await realtimeDataManager.getFreshPayments();
    setPayments(fresh);
  }, []);

  const refreshCustomers = useCallback(async () => {
    const fresh = await realtimeDataManager.getFreshCustomers();
    setCustomers(fresh);
  }, []);

  const refreshCategories = useCallback(async () => {
    const fresh = await realtimeDataManager.getFreshCategories();
    setCategories(fresh);
  }, []);

  const refreshFeatures = useCallback(async () => {
    const fresh = await realtimeDataManager.getFreshFeatures();
    setFeatures(fresh);
  }, []);

  const refreshSettings = useCallback(async () => {
    const fresh = await realtimeDataManager.getFreshSettings();
    setSettings(fresh);
  }, []);

  const refreshActivityLogs = useCallback(async () => {
    const fresh = await realtimeDataManager.getFreshActivityLogs();
    setActivityLogs(fresh);
  }, []);

  // Save functions with auto-refresh
  const saveProperty = useCallback(async (property: any) => {
    await realtimeDataManager.savePropertyRealtime(property);
    await refreshProperties();
  }, [refreshProperties]);

  const deleteProperty = useCallback(async (id: string | number) => {
    await realtimeDataManager.deletePropertyRealtime(id);
    await refreshProperties();
  }, [refreshProperties]);

  const saveBooking = useCallback(async (booking: any) => {
    await realtimeDataManager.saveBookingRealtime(booking);
    await refreshBookings();
  }, [refreshBookings]);

  const deleteBooking = useCallback(async (id: string | number) => {
    await realtimeDataManager.deleteBookingRealtime(id);
    await refreshBookings();
  }, [refreshBookings]);

  const savePayment = useCallback(async (payment: any) => {
    await realtimeDataManager.savePaymentRealtime(payment);
    await refreshPayments();
  }, [refreshPayments]);

  const deletePayment = useCallback(async (id: string | number) => {
    await realtimeDataManager.deletePaymentRealtime(id);
    await refreshPayments();
  }, [refreshPayments]);

  const saveCustomer = useCallback(async (customer: any) => {
    await realtimeDataManager.saveCustomerRealtime(customer);
    await refreshCustomers();
  }, [refreshCustomers]);

  const deleteCustomer = useCallback(async (id: string | number) => {
    await realtimeDataManager.deleteCustomerRealtime(id);
    await refreshCustomers();
  }, [refreshCustomers]);

  const saveCategories = useCallback(async (cats: string[]) => {
    await realtimeDataManager.saveCategoriesRealtime(cats);
    await refreshCategories();
  }, [refreshCategories]);

  const saveFeatures = useCallback(async (feats: string[]) => {
    await realtimeDataManager.saveFeaturesRealtime(feats);
    await refreshFeatures();
  }, [refreshFeatures]);

  const saveSettings = useCallback(async (settings: any) => {
    await realtimeDataManager.saveSettingsRealtime(settings);
    await refreshSettings();
  }, [refreshSettings]);

  const saveActivityLog = useCallback(async (log: any) => {
    await realtimeDataManager.saveActivityLogRealtime(log);
    await refreshActivityLogs();
  }, [refreshActivityLogs]);

  return {
    // Data
    properties,
    bookings,
    payments,
    customers,
    categories,
    features,
    settings,
    activityLogs,
    
    // Status
    loading,
    error,
    
    // Refresh functions
    refreshProperties,
    refreshBookings,
    refreshPayments,
    refreshCustomers,
    refreshCategories,
    refreshFeatures,
    refreshSettings,
    refreshActivityLogs,
    refreshAll: loadAllData,
    
    // Save functions (with auto-refresh)
    saveProperty,
    deleteProperty,
    saveBooking,
    deleteBooking,
    savePayment,
    deletePayment,
    saveCustomer,
    deleteCustomer,
    saveCategories,
    saveFeatures,
    saveSettings,
    saveActivityLog
  };
};
