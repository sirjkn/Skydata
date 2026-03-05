/**
 * Real-Time Data Manager
 * 
 * This module provides real-time data operations that automatically
 * save to Supabase when cloud mode is enabled, with localStorage fallback.
 * 
 * All operations happen immediately and sync in real-time.
 * 
 * AGGRESSIVE SYNC MODE:
 * - Every operation triggers immediate bidirectional sync
 * - Background sync runs every 5 seconds
 * - Data is always synchronized with cloud
 */

import * as dataService from './data-service';
import { syncAfterOperation } from './aggressive-sync-manager';

// Re-export all data service functions for convenience
export * from './data-service';

/**
 * Save property with real-time sync
 */
export const savePropertyRealtime = async (property: any): Promise<void> => {
  await dataService.saveProperty(property);
  await syncAfterOperation(); // Trigger sync after operation
};

/**
 * Delete property with real-time sync
 */
export const deletePropertyRealtime = async (id: string | number): Promise<void> => {
  await dataService.deleteProperty(id);
  await syncAfterOperation(); // Trigger sync after operation
};

/**
 * Save booking with real-time sync
 */
export const saveBookingRealtime = async (booking: any): Promise<void> => {
  await dataService.saveBooking(booking);
  await syncAfterOperation(); // Trigger sync after operation
};

/**
 * Delete booking with real-time sync
 */
export const deleteBookingRealtime = async (id: string | number): Promise<void> => {
  await dataService.deleteBooking(id);
  await syncAfterOperation(); // Trigger sync after operation
};

/**
 * Save payment with real-time sync
 */
export const savePaymentRealtime = async (payment: any): Promise<void> => {
  await dataService.savePayment(payment);
  await syncAfterOperation(); // Trigger sync after operation
};

/**
 * Delete payment with real-time sync
 */
export const deletePaymentRealtime = async (id: string | number): Promise<void> => {
  await dataService.deletePayment(id);
  await syncAfterOperation(); // Trigger sync after operation
};

/**
 * Save customer with real-time sync
 */
export const saveCustomerRealtime = async (customer: any): Promise<void> => {
  await dataService.saveCustomer(customer);
  await syncAfterOperation(); // Trigger sync after operation
};

/**
 * Delete customer with real-time sync
 */
export const deleteCustomerRealtime = async (id: string | number): Promise<void> => {
  await dataService.deleteCustomer(id);
  await syncAfterOperation(); // Trigger sync after operation
};

/**
 * Save categories with real-time sync
 */
export const saveCategoriesRealtime = async (categories: string[]): Promise<void> => {
  await dataService.setCategories(categories);
  await syncAfterOperation(); // Trigger sync after operation
};

/**
 * Save features with real-time sync
 */
export const saveFeaturesRealtime = async (features: string[]): Promise<void> => {
  await dataService.setFeatures(features);
  await syncAfterOperation(); // Trigger sync after operation
};

/**
 * Save settings with real-time sync
 */
export const saveSettingsRealtime = async (settings: any): Promise<void> => {
  await dataService.saveSettings(settings);
  await syncAfterOperation(); // Trigger sync after operation
};

/**
 * Save activity log with real-time sync
 */
export const saveActivityLogRealtime = async (log: any): Promise<void> => {
  await dataService.saveActivityLog(log);
  await syncAfterOperation(); // Trigger sync after operation
};

/**
 * Get fresh data from the active source (Supabase or localStorage)
 */
export const getFreshProperties = async (): Promise<any[]> => {
  return await dataService.getProperties();
};

export const getFreshBookings = async (): Promise<any[]> => {
  return await dataService.getBookings();
};

export const getFreshPayments = async (): Promise<any[]> => {
  return await dataService.getPayments();
};

export const getFreshCustomers = async (): Promise<any[]> => {
  return await dataService.getCustomers();
};

export const getFreshCategories = async (): Promise<string[]> => {
  return await dataService.getCategories();
};

export const getFreshFeatures = async (): Promise<string[]> => {
  return await dataService.getFeatures();
};

export const getFreshSettings = async (): Promise<any> => {
  return await dataService.getSettings();
};

export const getFreshActivityLogs = async (): Promise<any[]> => {
  return await dataService.getActivityLogs();
};
