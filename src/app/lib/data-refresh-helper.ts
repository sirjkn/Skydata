/**
 * Data Refresh Helper
 * 
 * Utility functions to ensure components always have the latest data
 * after any CRUD operation.
 */

/**
 * Force refresh all data across the application
 * Call this after any operation that modifies data
 */
export const forceDataRefresh = (): void => {
  // Dispatch both storage and custom events to trigger all listeners
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('dataUpdated'));
  
  // Also dispatch specific events for different data types
  window.dispatchEvent(new CustomEvent('propertiesUpdated'));
  window.dispatchEvent(new CustomEvent('bookingsUpdated'));
  window.dispatchEvent(new CustomEvent('paymentsUpdated'));
  window.dispatchEvent(new CustomEvent('customersUpdated'));
};

/**
 * Get fresh data from localStorage
 * Always use this instead of direct localStorage.getItem to ensure consistency
 */
export const getFreshData = <T = any>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Save data to localStorage and trigger refresh
 */
export const saveDataWithRefresh = (key: string, data: any): void => {
  localStorage.setItem(key, JSON.stringify(data));
  forceDataRefresh();
};

/**
 * Hook-style helper for components to reload data when updates occur
 */
export const createDataReloader = (reloadFunction: () => void): (() => void) => {
  const handleUpdate = () => {
    reloadFunction();
  };
  
  // Add listeners
  window.addEventListener('storage', handleUpdate);
  window.addEventListener('dataUpdated', handleUpdate);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleUpdate);
    window.removeEventListener('dataUpdated', handleUpdate);
  };
};

/**
 * Wait for next data update event
 * Useful when you need to ensure data is refreshed before proceeding
 */
export const waitForDataUpdate = (timeoutMs: number = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Data update timeout'));
    }, timeoutMs);
    
    const handleUpdate = () => {
      cleanup();
      resolve();
    };
    
    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('dataUpdated', handleUpdate);
    };
    
    window.addEventListener('dataUpdated', handleUpdate);
  });
};

/**
 * Batch multiple operations and refresh once at the end
 */
export class DataBatchOperation {
  private operations: Array<() => void | Promise<void>> = [];
  
  add(operation: () => void | Promise<void>): this {
    this.operations.push(operation);
    return this;
  }
  
  async execute(): Promise<void> {
    try {
      // Execute all operations
      for (const operation of this.operations) {
        await operation();
      }
      
      // Refresh once at the end
      forceDataRefresh();
      
      console.log(`✅ Batch operation completed: ${this.operations.length} operations`);
    } catch (error) {
      console.error('Batch operation failed:', error);
      throw error;
    }
  }
}

/**
 * Create a new batch operation
 */
export const createBatchOperation = (): DataBatchOperation => {
  return new DataBatchOperation();
};
